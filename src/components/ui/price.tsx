import { formatPrice } from "@/lib/format";

export function Price({
  cents,
  locale,
  compareCents,
  className = "",
}: {
  cents: number;
  locale: string;
  /** Previous price; shown struck through when higher than `cents`. */
  compareCents?: number;
  className?: string;
}) {
  const showCompare = compareCents !== undefined && compareCents > cents;
  return (
    <span className={`tabular-nums ${className}`}>
      {showCompare && (
        <s className="mr-2 text-muted font-normal">{formatPrice(compareCents, locale)}</s>
      )}
      {formatPrice(cents, locale)}
    </span>
  );
}
