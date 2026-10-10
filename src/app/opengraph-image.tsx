import { PERSON } from "@/lib/seo";
import { C, Canvas, DOMAIN, OG_SIZE, OG_TYPE, avatarSrc, renderCard } from "@/lib/og/kit";

export const alt = `${PERSON.name} — ${PERSON.jobTitle}`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

// Brand-tinted dot per chip; the card stays monochrome apart from these.
const STACK: [string, string][] = [
  ["TypeScript", "#3178C6"],
  ["Node.js", "#5FA04E"],
  ["React", "#61DAFB"],
  ["Next.js", "#ededed"],
  ["MongoDB", "#47A248"],
];

const words = (text: string) =>
  text.split(" ").map((word, i) => (
    <div key={`${word}-${i}`} style={{ display: "flex" }}>{word}</div>
  ));

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "4px 14px",
        borderRadius: 10,
        background: C.card,
        border: `1px solid ${C.border}`,
        color: C.text,
        fontWeight: 500,
      }}
    >
      <div style={{ display: "flex", width: 12, height: 12, borderRadius: 3, background: color }} />
      {label}
    </div>
  );
}

export default async function OpenGraphImage() {
  const avatar = await avatarSrc();
  return renderCard(
    <Canvas padding={80}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
        <img src={avatar} width={116} height={116} style={{ borderRadius: 999, border: `3px solid ${C.border}` }} alt="" />

        <div style={{ display: "flex", marginTop: 36, fontSize: 60, fontWeight: 700, letterSpacing: -2, lineHeight: 1.1 }}>
          <div style={{ display: "flex", color: C.text }}>Hi, I&apos;m Vishal —&nbsp;</div>
          <div style={{ display: "flex", color: C.faint }}>{PERSON.jobTitle}.</div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 8,
            rowGap: 12,
            marginTop: 26,
            fontSize: 29,
            color: C.muted,
            lineHeight: 1.4,
            maxWidth: 1000,
          }}
        >
          {words("I build scalable backends, real-time systems and AI products using")}
          {STACK.map(([label, color]) => <Chip key={label} label={label} color={color} />)}
          {words("and more.")}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, fontFamily: "JetBrains Mono", color: C.faint }}>
        <div style={{ display: "flex" }}>{DOMAIN}</div>
        <div style={{ display: "flex", width: 56, height: 5, background: C.accent, borderRadius: 3 }} />
      </div>
    </Canvas>,
  );
}
