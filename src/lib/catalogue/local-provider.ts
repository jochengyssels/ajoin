import { bundles, products, subscriptionPlans } from "../../../content/catalogue/products";
import type { CatalogueProvider } from "./types";

/** Catalogue backed by the typed config in content/catalogue. */
export const localProvider: CatalogueProvider = {
  async listProducts() {
    return products;
  },
  async getProduct(slug) {
    return products.find((p) => p.slug === slug);
  },
  async listBundles() {
    return bundles;
  },
  async getBundle(slug) {
    return bundles.find((b) => b.slug === slug);
  },
  async findVariant(sku) {
    for (const product of products) {
      const variant = product.variants.find((v) => v.sku === sku);
      if (variant) return { product, variant };
    }
    return undefined;
  },
  async subscriptionPlans() {
    return subscriptionPlans;
  },
};
