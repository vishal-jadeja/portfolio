/**
 * SectionDivider
 * A thin strip with a -45° diagonal line pattern, mimicking the
 * divider style used on divyanshudhruv.is-a.dev.
 *
 * Kept as a pure CSS solution — no images, no SVGs — so it works
 * at any width and in both light and dark mode.
 */
export default function SectionDivider() {
  return (
    <div
      className="relative w-full overflow-hidden border-y border-[#2323239e]"
      style={{ height: 20 }}
      aria-hidden="true"
    >
      {/* Diagonal stripe fill */}
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent calc(5.656px - 1px),
            var(--theme-text-main) calc(5.656px - 1px),
            var(--theme-text-main) 5.656px
          )`,
        }}
      />
    </div>
  );
}
