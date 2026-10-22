import { bundles, products } from "../../../content/catalogue/products";

/** Lists every placeholder still in the catalogue. Empty means ready to sell. */
export function catalogueTodos(): string[] {
  const todos: string[] = [];
  for (const p of products) {
    if (p.placeholder) todos.push(`product ${p.slug}: placeholder content`);
    if (p.inci.startsWith("TODO")) todos.push(`product ${p.slug}: INCI list`);
    for (const c of p.claims) if (!c.reviewed) todos.push(`product ${p.slug}: unreviewed claim`);
    for (const v of p.variants) if (v.pricePlaceholder) todos.push(`variant ${v.sku}: price`);
  }
  for (const b of bundles) if (b.pricePlaceholder) todos.push(`bundle ${b.slug}: price`);
  return todos;
}

export const catalogueHasPlaceholders = () => catalogueTodos().length > 0;
