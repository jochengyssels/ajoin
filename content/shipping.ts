/**
 * TODO_BRAND: placeholder shipping rates and free-shipping threshold.
 * Amounts are VAT-inclusive euro cents.
 */
export const shippingCountries = ["BE", "NL", "FR", "IT"] as const;
export type ShippingCountry = (typeof shippingCountries)[number];

export interface ShippingRate {
  country: ShippingCountry;
  carrier: string;
  amountCents: number;
  minDays: number;
  maxDays: number;
}

export const shippingRates: ShippingRate[] = [
  { country: "BE", carrier: "TODO_BRAND carrier", amountCents: 495, minDays: 1, maxDays: 3 },
  { country: "NL", carrier: "TODO_BRAND carrier", amountCents: 595, minDays: 2, maxDays: 4 },
  { country: "FR", carrier: "TODO_BRAND carrier", amountCents: 795, minDays: 3, maxDays: 5 },
  { country: "IT", carrier: "TODO_BRAND carrier", amountCents: 895, minDays: 3, maxDays: 6 },
];

export const freeShippingThresholdCents = 4000;
export const shippingPlaceholder = true;
