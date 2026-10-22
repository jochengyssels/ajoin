"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "./cart-provider";

export function OpenCartButton({ label }: { label: string }) {
  const { open } = useCart();
  return <Button onClick={open}>{label}</Button>;
}
