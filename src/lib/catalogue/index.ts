import { localProvider } from "./local-provider";
import type { CatalogueProvider } from "./types";

/** Swap this for a CMS- or Odoo-backed provider without touching the storefront. */
export const catalogue: CatalogueProvider = localProvider;

export * from "./types";
