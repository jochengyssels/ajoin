/**
 * Cross-section of an onion: concentric rings drifting toward the core.
 */
export function OnionRings({
  className = "",
  rings = 9,
  colors = ["var(--color-skin)", "var(--color-onion)"],
  opacity = [0.55, 0.28],
}: {
  className?: string;
  rings?: number;
  colors?: [string, string];
  opacity?: [number, number];
}) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      {Array.from({ length: rings }, (_, i) => {
        const r = 196 - i * (180 / rings);
        return (
          <ellipse
            key={i}
            cx={200}
            cy={200 + i * 4}
            rx={r}
            ry={r * 1.04}
            fill="none"
            stroke={colors[i % 2]}
            strokeOpacity={opacity[i % 2]}
            strokeWidth={i % 3 === 0 ? 2.5 : 1.25}
          />
        );
      })}
    </svg>
  );
}
