import { describe, expect, it } from "vitest";
import { addLine, itemCount, parseCart, removeLine, setQty } from "@/lib/cart/cart";
import { lineKey, MAX_QTY } from "@/lib/cart/types";

describe("cart", () => {
  const empty = { lines: [] };

  it("merges identical lines and keeps subscription lines separate", () => {
    let c = addLine(empty, { kind: "variant", sku: "A", qty: 1 });
    c = addLine(c, { kind: "variant", sku: "A", qty: 2 });
    c = addLine(c, { kind: "variant", sku: "A", qty: 1, intervalWeeks: 4 });
    expect(c.lines).toHaveLength(2);
    expect(c.lines[0].qty).toBe(3);
    expect(itemCount(c)).toBe(4);
  });

  it("clamps quantity and removes lines set to zero", () => {
    let c = addLine(empty, { kind: "bundle", slug: "b", qty: 50 });
    expect(c.lines[0].qty).toBe(MAX_QTY);
    c = setQty(c, lineKey(c.lines[0]), 0);
    expect(c.lines).toHaveLength(0);
  });

  it("removes a line by key", () => {
    const c = addLine(empty, { kind: "variant", sku: "A", qty: 1 });
    expect(removeLine(c, "variant:A:once").lines).toHaveLength(0);
  });

  it("parses untrusted input defensively", () => {
    expect(parseCart(null)).toEqual(empty);
    expect(parseCart({ lines: "x" })).toEqual(empty);
    const c = parseCart({
      lines: [
        { kind: "variant", sku: "A", qty: "2" },
        { kind: "variant", sku: 5, qty: 1 },
        { kind: "bundle", slug: "b", qty: -3 },
        { kind: "evil", qty: 1 },
        { kind: "variant", sku: "A", qty: Infinity },
      ],
    });
    expect(c.lines).toEqual([{ kind: "variant", sku: "A", qty: 2 }]);
  });
});
