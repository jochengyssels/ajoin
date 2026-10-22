/** Typographic wordmark for header and footer, where the full badge is too detailed. */
export function Wordmark({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={`font-display text-xl leading-none whitespace-nowrap sm:text-2xl ${onDark ? "text-flesh" : "text-onion"} ${className}`}>
      Ajoin <span className={onDark ? "text-skin" : "text-skin-deep"}>&amp;</span> Shine
    </span>
  );
}
