import type { ReactNode } from "react";
import "./globals.css";

// The <html> element lives in app/[locale]/layout.tsx and app/admin/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
