import Link from "next/link";
import "./globals.css";

// Requests outside any locale (rare, the proxy redirects most of them).
export default function RootNotFound() {
  return (
    <html lang="nl">
      <body style={{ fontFamily: "system-ui", padding: "4rem 1.5rem", background: "#fdf7ec", color: "#22061b" }}>
        <h1>404</h1>
        <p>
          <Link href="/">Ajoin &amp; Shine</Link>
        </p>
      </body>
    </html>
  );
}
