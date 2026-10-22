/**
 * The "ajuinworp": at Aalst carnival, onions rain down on the Grote Markt.
 * Here a one-off shower of small onions and confetti falls once on page
 * load and settles. With reduced motion it is shown already settled.
 * Positions are deterministic so server and client markup match.
 */
const PIECES = 26;

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function Onion({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 24 28" className="h-full w-full">
      <path d="M12 2c1 3 2 4 4 6 3 3 5 6 5 10a9 9 0 0 1-18 0c0-4 2-7 5-10 2-2 3-3 4-6Z" fill={fill} />
      <path d="M12 9c-2 3-3 6-3 9s1 6 3 8M12 9c2 3 3 6 3 9s-1 6-3 8" fill="none" stroke="var(--color-onion-dark)" strokeOpacity=".35" />
      <path d="M12 2c-.5-1 .5-2 1-1.5" stroke="var(--color-skin-deep)" fill="none" strokeWidth="1.2" />
    </svg>
  );
}

export function Ajuinworp() {
  const pieces = Array.from({ length: PIECES }, (_, i) => {
    const kind = i % 3 === 0 ? "onion" : "confetti";
    return {
      i,
      kind,
      left: rand(i + 1) * 100,
      top: 8 + rand(i + 50) * 84,
      size: kind === "onion" ? 16 + rand(i + 7) * 14 : 6 + rand(i + 9) * 6,
      rotate: Math.round(rand(i + 3) * 360),
      delay: Math.round(rand(i + 11) * 900),
      duration: 1400 + Math.round(rand(i + 13) * 900),
      color: ["var(--color-skin)", "var(--color-paper)", "var(--color-blush)"][i % 3],
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.i}
          className="ajuinworp-piece absolute"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.kind === "onion" ? p.size * 1.15 : p.size * 0.5,
              "--r": `${p.rotate}deg`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
              opacity: p.kind === "onion" ? 0.9 : 0.75,
            } as React.CSSProperties
          }
        >
          {p.kind === "onion" ? (
            <Onion fill={p.color} />
          ) : (
            <span className="block h-full w-full rounded-[2px]" style={{ background: p.color }} />
          )}
        </span>
      ))}
    </div>
  );
}
