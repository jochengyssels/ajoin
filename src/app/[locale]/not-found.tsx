import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <Container className="grid items-center gap-8 py-16 md:grid-cols-[1fr_auto]">
      <div>
        <h1 className="text-4xl md:text-6xl">{t("notFoundTitle")}</h1>
        <p className="mt-4 text-lg text-muted">{t("notFoundBody")}</p>
        <ButtonLink href="/" className="mt-8">
          {t("backHome")}
        </ButtonLink>
      </div>
      <Image src="/brand/ajoin-badge-360.webp" alt="" width={240} height={239} className="-rotate-12 opacity-90" />
    </Container>
  );
}
