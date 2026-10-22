"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <Container className="py-20">
      <h1 className="text-4xl">{t("genericTitle")}</h1>
      <p className="mt-4 text-muted">{t("genericBody")}</p>
      <Button onClick={reset} className="mt-8">
        {t("retry")}
      </Button>
    </Container>
  );
}
