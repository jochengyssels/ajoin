"use client";

import { useEffect } from "react";
import { cartStore } from "./cart-store";

/** Empties the cart once an order has gone through. */
export function ClearCart() {
  useEffect(() => cartStore.set(() => ({ lines: [] })), []);
  return null;
}
