import { projects } from "@/data/projects";
import { PERSON } from "@/lib/seo";
import { C, Canvas, OG_SIZE, OG_TYPE, PageHeader, PageTitle, avatarSrc, publicImage, renderCard } from "@/lib/og/kit";

export const alt = `Projects by ${PERSON.name}`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

const THUMB = { width: 341, height: 168 };

export default async function ProjectsImage() {
  const featured = projects.filter((p) => p.imageUrl).slice(0, 3);
  const [avatar, ...thumbs] = await Promise.all([
    avatarSrc(),
    ...featured.map((p) => publicImage(p.imageUrl!, THUMB.width, THUMB.height)),
  ]);
  return renderCard(
    <Canvas padding={64}>
      <PageHeader avatar={avatar} section="projects" />
      <div style={{ display: "flex", marginTop: 36 }}>
        <PageTitle title="Projects" description={`${projects.length} things I've built — production systems, AI tooling and side projects.`} />
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: "auto" }}>
        {featured.map((project, i) => (
          <div key={project.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", ...THUMB, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
              {thumbs[i] && <img src={thumbs[i]!} {...THUMB} style={{ objectFit: "cover" }} alt="" />}
            </div>
            <div style={{ display: "flex", fontSize: 21, fontWeight: 500, color: C.text }}>{project.title}</div>
          </div>
        ))}
      </div>
    </Canvas>,
  );
}
