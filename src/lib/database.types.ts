// Types for 202610060001_blog.sql. Regenerate from the provisioned Supabase project
// when changing the schema (see docs/blog-setup.md).
import type { Draft, Media, Publication } from "./blog/types";
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      blog_admins: Table<{ user_id: string }>;
      blog_posts: Table<Draft>;
      blog_media: Table<Media>;
      blog_publications: Table<Publication>;
      blog_publication_media: Table<{ post_id: string; media_id: string }>;
    };
    Views: {
      blog_public_media: {
        Row: {
          id: string;
          post_id: string;
          public_object_path: string;
          width: number;
          height: number;
          alt_text: string;
          caption: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_blog_admin: { Args: Record<string, never>; Returns: boolean };
      blog_create_draft: { Args: Record<string, never>; Returns: Draft[] };
      blog_save_draft: {
        Args: { p_id: string; p_version: number; p_fields: Json };
        Returns: Draft[];
      };
      blog_publish: {
        Args: {
          p_id: string;
          p_actor: string;
          p_version: number;
          p_media_ids: string[];
          p_reading: number;
          p_author: string;
        };
        Returns: Publication[];
      };
      blog_set_state: {
        Args: { p_id: string; p_state: string };
        Returns: string;
      };
      blog_reserve_media: {
        Args: {
          p_post: string;
          p_bytes: number;
          p_mime: string;
          p_alt: string;
          p_caption: string | null;
        };
        Returns: Media[];
      };
      blog_claim_expired_uploads: {
        Args: { p_ids: string[] };
        Returns: Media[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
