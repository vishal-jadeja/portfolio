import { allTimeFavorites, movies } from "@/data/movies";
import { PERSON } from "@/lib/seo";
import { C, Canvas, OG_SIZE, OG_TYPE, PageHeader, PageTitle, avatarSrc, publicImage, renderCard } from "@/lib/og/kit";

export const alt = `Movies & series — ${PERSON.name}`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

const POSTER = { width: 139, height: 204 };

export default async function MoviesImage() {
  const picks = allTimeFavorites.filter((m) => m.poster).slice(0, 7);
  const [avatar, ...posters] = await Promise.all([
    avatarSrc(),
    ...picks.map((m) => publicImage(m.poster!, POSTER.width, POSTER.height)),
  ]);
  return renderCard(
    <Canvas padding={64}>
      <PageHeader avatar={avatar} section="movies" />
      <div style={{ display: "flex", marginTop: 36 }}>
        <PageTitle title="Movies & series" description={`Off the clock, on the screen — ${movies.length} titles logged, rated and ranked.`} />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: "auto" }}>
        {picks.map((movie, i) => (
          <div key={movie.id} style={{ display: "flex", ...POSTER, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
            {posters[i] && <img src={posters[i]!} {...POSTER} style={{ objectFit: "cover" }} alt="" />}
          </div>
        ))}
      </div>
    </Canvas>,
  );
}
