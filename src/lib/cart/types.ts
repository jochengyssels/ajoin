export type CartLine =
  | { kind: "variant"; sku: string; qty: number; intervalWeeks?: number }
  | { kind: "bundle"; slug: string; qty: number };

export interface Cart {
  lines: CartLine[];
}

export const MAX_QTY = 10;

export function lineKey(line: CartLine): string {
  return line.kind === "bundle"
    ? `bundle:${line.slug}`
    : `variant:${line.sku}:${line.intervalWeeks ?? "once"}`;
}
