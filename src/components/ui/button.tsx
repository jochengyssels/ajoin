import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill px-6 min-h-12 text-base font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-onion text-flesh hover:bg-onion-dark",
  secondary: "border-2 border-onion text-onion hover:bg-onion hover:text-flesh",
  ghost: "text-onion underline underline-offset-4 decoration-2 hover:decoration-skin px-0 min-h-0",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
