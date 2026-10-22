import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

export function SimplePage({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="max-w-3xl text-4xl md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 max-w-xl text-lg text-muted">{intro}</p>}
      {children && <div className="mt-10">{children}</div>}
    </Container>
  );
}
