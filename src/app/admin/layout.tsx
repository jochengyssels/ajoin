import type { Metadata } from "next";
import type { ReactNode } from "react";
import { figtree, gloock } from "../fonts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Orders | Ajoin & Shine admin",
  robots: { index: false, follow: false },
  metadataBase: new URL(site.url),
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${gloock.variable} ${figtree.variable}`}>
      <body className="min-h-dvh bg-flesh text-ink">{children}</body>
    </html>
  );
}
