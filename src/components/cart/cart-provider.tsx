"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { addLine, itemCount, parseCart, removeLine, setQty } from "@/lib/cart/cart";
import { priceCart, type CatalogueSnapshot, type PricedCart } from "@/lib/cart/pricing";
import type { Cart, CartLine } from "@/lib/cart/types";

const STORAGE_KEY = "ajoin-cart-v1";

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

function readStored(): Cart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseCart(JSON.parse(raw)) : { lines: [] };
  } catch {
    return { lines: [] };
  }
}

function writeStored(cart: Cart) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage unavailable (private mode, blocked): the cart still works for this visit.
  }
}

export function CartProvider({
  children,
  snapshot,
  freeShippingThresholdCents,
}: {
  children: ReactNode;
  snapshot: CatalogueSnapshot;
  freeShippingThresholdCents: number;
}) {
  const [cart, setCart] = useState<Cart>({ lines: [] });
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    // Hydrate from storage after mount so server and client markup match.
    setCart(readStored());
    setReady(true);
    loaded.current = true;

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCart(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (loaded.current) writeStored(cart);
  }, [cart]);

  const priced = useMemo(() => priceCart(cart, snapshot), [cart, snapshot]);

  const add = useCallback((line: CartLine) => {
    setCart((c) => addLine(c, line));
    setOpen(true);
  }, []);
  const update = useCallback((key: string, qty: number) => setCart((c) => setQty(c, key, qty)), []);
  const remove = useCallback((key: string) => setCart((c) => removeLine(c, key)), []);
  const clear = useCallback(() => setCart({ lines: [] }), []);

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
