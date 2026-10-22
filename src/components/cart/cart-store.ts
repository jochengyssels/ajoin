"use client";

import { parseCart } from "@/lib/cart/cart";
import type { Cart } from "@/lib/cart/types";

/** A tiny external store for the cart, persisted to localStorage and synced across tabs. */
const STORAGE_KEY = "ajoin-cart-v1";
const EMPTY: Cart = { lines: [] };
let state: Cart | null = null;
const listeners = new Set<() => void>();

function readStored(): Cart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseCart(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const cartStore = {
  getSnapshot(): Cart {
    if (state === null) state = readStored();
    return state;
  },
  getServerSnapshot(): Cart {
    return EMPTY;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        state = readStored();
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  set(update: (c: Cart) => Cart) {
    state = update(cartStore.getSnapshot());
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private mode, blocked): the cart still works for this visit.
    }
    listeners.forEach((l) => l());
  },
};

const noop = () => () => {};
/** True after hydration; lets components avoid rendering client-only state on the server. */
export const hydration = {
  subscribe: noop,
  client: () => true,
  server: () => false,
};
