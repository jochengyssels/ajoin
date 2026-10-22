import { type Cart, type CartLine, MAX_QTY, lineKey } from "./types";

const clampQty = (n: number) => Math.max(0, Math.min(MAX_QTY, Math.floor(n)));

/** Adds a line, merging with an identical line (same item and same plan). */
export function addLine(cart: Cart, line: CartLine): Cart {
  const key = lineKey(line);
  const existing = cart.lines.find((l) => lineKey(l) === key);
  if (existing) {
    return setQty(cart, key, existing.qty + line.qty);
  }
  const qty = clampQty(line.qty);
  if (qty === 0) return cart;
  return { lines: [...cart.lines, { ...line, qty }] };
}

/** Sets a line's quantity; zero removes it. */
export function setQty(cart: Cart, key: string, qty: number): Cart {
  const q = clampQty(qty);
  return {
    lines: cart.lines
      .map((l) => (lineKey(l) === key ? { ...l, qty: q } : l))
      .filter((l) => l.qty > 0),
  };
}

export function removeLine(cart: Cart, key: string): Cart {
  return { lines: cart.lines.filter((l) => lineKey(l) !== key) };
}

export function itemCount(cart: Cart): number {
  return cart.lines.reduce((n, l) => n + l.qty, 0);
}

/** Parses untrusted input (localStorage, request body) into a valid cart. */
export function parseCart(input: unknown): Cart {
  if (!input || typeof input !== "object" || !Array.isArray((input as Cart).lines)) {
    return { lines: [] };
  }
  let cart: Cart = { lines: [] };
  for (const raw of (input as Cart).lines) {
    if (!raw || typeof raw !== "object") continue;
    const qty = Number((raw as CartLine).qty);
    if (!Number.isFinite(qty)) continue;
    if (raw.kind === "variant" && typeof raw.sku === "string") {
      const iw = raw.intervalWeeks;
      cart = addLine(cart, {
        kind: "variant",
        sku: raw.sku,
        qty,
        ...(typeof iw === "number" ? { intervalWeeks: iw } : {}),
      });
    } else if (raw.kind === "bundle" && typeof raw.slug === "string") {
      cart = addLine(cart, { kind: "bundle", slug: raw.slug, qty });
    }
  }
  return cart;
}
