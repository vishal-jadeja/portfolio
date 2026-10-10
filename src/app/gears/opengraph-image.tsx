import { gearGroups } from "@/data/gears";
import { PERSON } from "@/lib/seo";
import { C, Canvas, OG_SIZE, OG_TYPE, PageHeader, PageTitle, avatarSrc, renderCard } from "@/lib/og/kit";

export const alt = `Gears — ${PERSON.name}'s everyday setup`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function GearsImage() {
  const avatar = await avatarSrc();
  return renderCard(
    <Canvas padding={64}>
      <PageHeader avatar={avatar} section="gears" />
      <div style={{ display: "flex", marginTop: 36 }}>
        <PageTitle title="Gears" description="My everyday setup — hardware, software, extensions, AI and music." />
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: "auto" }}>
        {gearGroups.slice(0, 3).map((group) => (
          <div key={group.id} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, padding: "20px 24px", gap: 10, borderRadius: 14, border: `1px solid ${C.border}`, background: C.card }}>
            <div style={{ display: "flex", fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: C.faint, fontFamily: "JetBrains Mono" }}>{group.title}</div>
            {group.items.slice(0, 3).map((item) => (
              <div key={item.name} style={{ display: "block", fontSize: 22, color: C.text, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.name}</div>
            ))}
          </div>
        ))}
      </div>
    </Canvas>,
  );
}
