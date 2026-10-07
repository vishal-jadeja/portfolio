-- Blog ownership, drafts, snapshots, media and restricted mutation contracts.
create table public.blog_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create function public.is_blog_admin() returns boolean language sql stable security definer
set search_path = '' as $$ select exists(select 1 from public.blog_admins where user_id = auth.uid()) $$;
revoke all on function public.is_blog_admin() from public;
grant execute on function public.is_blog_admin() to authenticated;

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references auth.users(id),
  slug text not null unique check (length(slug) between 1 and 120 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null default '' check(length(title)<=160), excerpt text not null default '' check(length(excerpt)<=300),
  body_markdown text not null default '' check(octet_length(body_markdown)<=500000),
  tags text[] not null default '{}' check(cardinality(tags)<=5), cover_media_id uuid,
  seo_title text check(length(seo_title)<=160), seo_description text check(length(seo_description)<=300),
  version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  archived_at timestamptz, first_published_at timestamptz
);
create table public.blog_media (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
  post_id uuid not null references public.blog_posts(id), private_object_path text not null unique,
  public_object_path text unique, mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp')),
  bytes integer not null check(bytes between 1 and 5242880), width integer, height integer,
  checksum text, alt_text text not null default '' check(length(alt_text)<=1000), caption text check(length(caption)<=1000),
  state text not null default 'pending' check(state in ('pending','ready','published','failed')),
  created_at timestamptz not null default now(), validated_at timestamptz
);
alter table public.blog_posts add constraint blog_cover_fk foreign key(cover_media_id) references public.blog_media(id);
create table public.blog_publications (
  post_id uuid primary key references public.blog_posts(id), slug text not null unique,
  title text not null, excerpt text not null, body_markdown text not null, tags text[] not null,
  cover_media_id uuid references public.blog_media(id), seo_title text, seo_description text,
  author_name text not null, published_at timestamptz not null, modified_at timestamptz not null,
  reading_minutes integer not null check(reading_minutes>0), source_version integer not null
);
create table public.blog_publication_media (
  post_id uuid references public.blog_publications(post_id) on delete cascade,
  media_id uuid references public.blog_media(id), primary key(post_id,media_id)
);
create index blog_publication_date on public.blog_publications(published_at desc,post_id desc);
create index blog_draft_date on public.blog_posts(author_id,updated_at desc);
create index blog_media_post on public.blog_media(post_id);
create index blog_tags on public.blog_publications using gin(tags);

alter table public.blog_admins enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_media enable row level security;
alter table public.blog_publications enable row level security;
alter table public.blog_publication_media enable row level security;
create policy own_membership on public.blog_admins for select to authenticated using(user_id=auth.uid());
create policy own_drafts on public.blog_posts for select to authenticated using(public.is_blog_admin() and author_id=auth.uid());
create policy own_media on public.blog_media for select to authenticated using(public.is_blog_admin() and owner_id=auth.uid());
-- Publish only safe media metadata through a view, never private paths/reservations.
create policy public_articles on public.blog_publications for select to anon,authenticated using(true);
create policy public_media_links on public.blog_publication_media for select to anon,authenticated using(true);
create view public.blog_public_media as
select m.id,m.public_object_path,m.width,m.height,m.alt_text,m.caption,pm.post_id
from public.blog_media m join public.blog_publication_media pm on pm.media_id=m.id;
revoke all on public.blog_admins,public.blog_posts,public.blog_media,public.blog_publications,public.blog_publication_media from anon,authenticated;
grant select on public.blog_publications,public.blog_publication_media,public.blog_public_media to anon,authenticated;
grant select on public.blog_admins,public.blog_posts,public.blog_media to authenticated;

create function public.blog_create_draft() returns public.blog_posts language plpgsql security definer set search_path='' as $$
declare p public.blog_posts;
begin
  if not public.is_blog_admin() then raise exception 'Unauthorized'; end if;
  insert into public.blog_posts(author_id,slug) values(auth.uid(),'draft-'||gen_random_uuid()::text) returning * into p;
  return p;
end $$;
create function public.blog_save_draft(p_id uuid,p_version integer,p_fields jsonb) returns public.blog_posts
language plpgsql security definer set search_path='' as $$
declare p public.blog_posts; new_slug text;
begin
  if not public.is_blog_admin() then raise exception 'Unauthorized'; end if;
  select * into p from public.blog_posts where id=p_id and author_id=auth.uid() for update;
  if not found then raise exception 'Draft not found'; end if;
  if p.version<>p_version then raise exception 'Conflict: this draft changed in another tab. Reload before saving.'; end if;
  if p.archived_at is not null then raise exception 'Restore this article before editing'; end if;
  new_slug:=p_fields->>'slug';
  if p.first_published_at is not null and new_slug<>p.slug then raise exception 'Published slugs cannot change'; end if;
  if p_fields->>'cover_media_id' is not null and not exists(select 1 from public.blog_media where id=(p_fields->>'cover_media_id')::uuid and post_id=p_id and owner_id=auth.uid() and state in ('ready','published')) then raise exception 'Invalid cover'; end if;
  if exists(select 1 from jsonb_array_elements_text(p_fields->'tags') t where length(t)>30 or length(t)=0) then raise exception 'Invalid tags'; end if;
  update public.blog_posts set title=p_fields->>'title',slug=new_slug,excerpt=p_fields->>'excerpt',body_markdown=p_fields->>'body_markdown',
  tags=array(select jsonb_array_elements_text(p_fields->'tags')),cover_media_id=(p_fields->>'cover_media_id')::uuid,
  seo_title=p_fields->>'seo_title',seo_description=p_fields->>'seo_description',version=version+1,updated_at=now()
  where id=p_id returning * into p;
  return p;
end $$;
-- Only the verified Next.js server can publish: media has been validated/promoted there.
create function public.blog_publish(p_id uuid,p_actor uuid,p_version integer,p_media_ids uuid[],p_reading integer,p_author text)
returns public.blog_publications language plpgsql security definer set search_path='' as $$
declare p public.blog_posts; result public.blog_publications; first_date timestamptz;
begin
  if not exists(select 1 from public.blog_admins where user_id=p_actor) then raise exception 'Unauthorized'; end if;
  select * into p from public.blog_posts where id=p_id and author_id=p_actor for update;
  if not found then raise exception 'Draft not found'; end if;
  if p.version<>p_version then raise exception 'Conflict: draft changed before publishing'; end if;
  if p.archived_at is not null then raise exception 'Article is archived'; end if;
  if length(trim(p.title))=0 or length(trim(p.excerpt))=0 or length(trim(p.body_markdown))=0 or length(p.slug)<3 then raise exception 'Article is incomplete'; end if;
  if cardinality(p_media_ids)>50 then raise exception 'Maximum 50 images'; end if;
  if p.cover_media_id is not null and not (p.cover_media_id=any(p_media_ids)) then raise exception 'Cover must be included in publication media'; end if;
  if exists(select 1 from unnest(p_media_ids) m where not exists(select 1 from public.blog_media where id=m and post_id=p_id and owner_id=p_actor and state in ('ready','published') and public_object_path is not null and length(trim(alt_text))>0)) then raise exception 'Image is not ready'; end if;
  select * into result from public.blog_publications where post_id=p_id;
  if found and result.source_version=p_version then return result; end if;
  first_date:=coalesce(p.first_published_at,now());
  insert into public.blog_publications(post_id,slug,title,excerpt,body_markdown,tags,cover_media_id,seo_title,seo_description,author_name,published_at,modified_at,reading_minutes,source_version)
  values(p.id,p.slug,p.title,p.excerpt,p.body_markdown,p.tags,p.cover_media_id,p.seo_title,p.seo_description,p_author,first_date,now(),p_reading,p.version)
  on conflict(post_id) do update set title=excluded.title,excerpt=excluded.excerpt,body_markdown=excluded.body_markdown,tags=excluded.tags,cover_media_id=excluded.cover_media_id,seo_title=excluded.seo_title,seo_description=excluded.seo_description,modified_at=excluded.modified_at,reading_minutes=excluded.reading_minutes,source_version=excluded.source_version
  returning * into result;
  delete from public.blog_publication_media where post_id=p_id;
  insert into public.blog_publication_media(post_id,media_id) select p_id,m from unnest(p_media_ids) m;
  update public.blog_posts set first_published_at=first_date where id=p_id;
  update public.blog_media set state='published' where id=any(p_media_ids);
  return result;
end $$;
create function public.blog_set_state(p_id uuid,p_state text) returns text language plpgsql security definer set search_path='' as $$
declare p public.blog_posts;
begin
  if not public.is_blog_admin() then raise exception 'Unauthorized'; end if;
  select * into p from public.blog_posts where id=p_id and author_id=auth.uid() for update;
  if not found then raise exception 'Draft not found'; end if;
  if p_state not in ('unpublish','archive','restore') then raise exception 'Invalid state'; end if;
  if p_state in ('unpublish','archive') then delete from public.blog_publications where post_id=p_id; end if;
  update public.blog_posts set archived_at=case when p_state='archive' then now() when p_state='restore' then null else archived_at end,version=version+1,updated_at=now() where id=p_id;
  return p.slug;
end $$;
create function public.blog_reserve_media(p_post uuid,p_bytes integer,p_mime text,p_alt text,p_caption text)
returns public.blog_media language plpgsql security definer set search_path='' as $$
declare p public.blog_posts; result public.blog_media; media_id uuid:=gen_random_uuid();
begin
  if not public.is_blog_admin() then raise exception 'Unauthorized'; end if;
  select * into p from public.blog_posts where id=p_post and author_id=auth.uid() and archived_at is null for update;
  if not found then raise exception 'Draft not found'; end if;
  if (select count(*) from public.blog_media where post_id=p_post and state<>'failed')>=50 then raise exception 'Maximum 50 images per draft'; end if;
  if (select coalesce(sum(bytes),0) from public.blog_media where post_id=p_post and state<>'failed')+p_bytes>104857600 then raise exception 'Draft image quota exceeded'; end if;
  if (select count(*) from public.blog_media where owner_id=auth.uid() and created_at>now()-interval '1 minute')>=12 then raise exception 'Too many uploads; try again shortly'; end if;
  insert into public.blog_media(id,owner_id,post_id,private_object_path,bytes,mime_type,alt_text,caption)
  values(media_id,auth.uid(),p_post,auth.uid()::text||'/'||p_post::text||'/'||media_id::text,p_bytes,p_mime,p_alt,p_caption) returning * into result;
  return result;
end $$;
revoke all on function public.blog_create_draft(),public.blog_save_draft(uuid,integer,jsonb),public.blog_set_state(uuid,text),public.blog_reserve_media(uuid,integer,text,text,text) from public;
grant execute on function public.blog_create_draft(),public.blog_save_draft(uuid,integer,jsonb),public.blog_set_state(uuid,text),public.blog_reserve_media(uuid,integer,text,text,text) to authenticated;
revoke all on function public.blog_publish(uuid,uuid,integer,uuid[],integer,text) from public,anon,authenticated;
grant execute on function public.blog_publish(uuid,uuid,integer,uuid[],integer,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('blog-drafts','blog-drafts',false,5242880,array['image/jpeg','image/png','image/webp']),
('blog-public','blog-public',true,10485760,array['image/webp']) on conflict(id) do nothing;
-- Browser only receives a signed upload capability, never general write access.
-- Reads of private media use owner-authorized signed preview URLs. Service role handles all storage writes.

create function public.blog_claim_expired_uploads(p_ids uuid[]) returns setof public.blog_media
language sql security definer set search_path='' as $$
  update public.blog_media m set state='failed'
  where m.id in (
    select candidate.id from public.blog_media candidate
    where candidate.id=any(p_ids) and candidate.state in ('pending','failed')
      and candidate.created_at<now()-interval '7 days'
      and not exists(select 1 from public.blog_posts p where p.cover_media_id=candidate.id)
      and not exists(select 1 from public.blog_publication_media pm where pm.media_id=candidate.id)
    for update skip locked
  ) returning m.*;
$$;
revoke all on function public.blog_claim_expired_uploads(uuid[]) from public,anon,authenticated;
grant execute on function public.blog_claim_expired_uploads(uuid[]) to service_role;

-- Tell PostgREST to expose newly created RPCs immediately.
notify pgrst, 'reload schema';
