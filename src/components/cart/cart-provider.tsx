"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { addLine, itemCount, removeLine, setQty } from "@/lib/cart/cart";
import { cartStore, hydration } from "./cart-store";
import { priceCart, type CatalogueSnapshot, type PricedCart } from "@/lib/cart/pricing";
import type { Cart, CartLine } from "@/lib/cart/types";

interface CartContextValue {
  cart: Cart;
  priced: PricedCart;
  count: number;
  ready: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: CartLine) => void;
  update: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  snapshot: CatalogueSnapshot;
  freeShippingThresholdCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  snapshot,
  freeShippingThresholdCents,
}: {
  children: ReactNode;
  snapshot: CatalogueSnapshot;
  freeShippingThresholdCents: number;
}) {
  const cart = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const ready = useSyncExternalStore(hydration.subscribe, hydration.client, hydration.server);
  const [isOpen, setOpen] = useState(false);

  const priced = useMemo(() => priceCart(cart, snapshot), [cart, snapshot]);

  const add = useCallback((line: CartLine) => {
    cartStore.set((c) => addLine(c, line));
    setOpen(true);
  }, []);
  const update = useCallback((key: string, qty: number) => cartStore.set((c) => setQty(c, key, qty)), []);
  const remove = useCallback((key: string) => cartStore.set((c) => removeLine(c, key)), []);
  const clear = useCallback(() => cartStore.set(() => ({ lines: [] })), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      priced,
      count: itemCount(cart),
      ready,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      update,
      remove,
      clear,
      snapshot,
      freeShippingThresholdCents,
    }),
    [cart, priced, ready, isOpen, add, update, remove, clear, snapshot, freeShippingThresholdCents],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
