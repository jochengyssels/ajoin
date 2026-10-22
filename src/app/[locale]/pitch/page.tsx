import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/ui/container";
import { Harlequin } from "@/components/ui/harlequin";
import { OnionRings } from "@/components/ui/onion-rings";
import { pitch, type Slide } from "../../../../content/pitch";

// For investors only: not in the navigation, sitemap or search engines.
export const metadata: Metadata = { title: "Pitch", robots: { index: false, follow: false } };

const kindStyle: Record<Slide["kind"], string> = {
  fact: "bg-paper text-ink",
  plan: "bg-blush text-ink",
  open: "border border-ink/30 text-ink",
};

export default async function PitchPage({ params }: PageProps<"/[locale]/pitch">) {
  const { locale: l } = await params;
  const locale = l as Locale;
  setRequestLocale(locale);
  const p = pitch[locale] ?? pitch.en;
  const slides = p.ask ? [...p.slides, p.ask] : p.slides;
  const total = slides.length;

  return (
    <div lang={pitch[locale] ? locale : "en"}>
      {/* Cover */}
      <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_70%_30%,var(--color-onion)_0%,var(--color-onion-dark)_45%,var(--color-ink)_100%)] text-flesh">
        <Container className="grid min-h-[80vh] items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm text-paper">{p.date}</p>
            <h1 className="sign-type mt-4 text-5xl sm:text-6xl lg:text-7xl">{p.title}</h1>
            <p className="mt-5 max-w-md text-xl text-flesh/90">{p.subtitle}</p>
            <p className="mt-8 max-w-md border-l-4 border-skin pl-4 text-flesh/85">{p.honesty}</p>
          </div>
          <div className="relative mx-auto w-full max-w-[16rem] md:max-w-[26rem]">
            <OnionRings className="absolute inset-[-14%] h-[128%] w-[128%]" colors={["var(--color-skin)", "var(--color-paper)"]} opacity={[0.5, 0.18]} />
            <Image src="/brand/ajoin-badge-720.webp" alt="Ajoin & Shine" width={720} height={718} priority className="relative" />
          </div>
        </Container>
        <Harlequin />
      </section>

      {/* Slides: a real sequence, so they are numbered. */}
      <ol>
        {slides.map((s, i) => (
          <li key={s.title} className={i % 2 ? "bg-paper/50" : ""}>
            <Container className="grid min-h-[70vh] content-center gap-8 py-16 md:grid-cols-[1fr_1.6fr] md:gap-16">
              <div>
                <p className="font-display text-5xl text-skin-deep tabular-nums" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                  <span className="text-2xl text-muted">/{String(total).padStart(2, "0")}</span>
                </p>
                <p className={`mt-4 inline-block rounded-pill px-3 py-1 text-sm font-semibold ${kindStyle[s.kind]}`}>
                  {p.labels[s.kind]}
                </p>
                <h2 className="mt-3 text-4xl md:text-5xl">{s.title}</h2>
              </div>
              <div className="max-w-[62ch] text-lg leading-relaxed">
                {s.body && <p>{s.body}</p>}
                {s.points && (
                  <ul className="space-y-4">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex gap-3">
                        <span aria-hidden="true" className="mt-2 size-2 shrink-0 rotate-45 bg-skin" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.steps && (
                  <ol className="space-y-4">
                    {s.steps.map((st, n) => (
                      <li key={st} className="flex gap-4">
                        <span className="font-display text-2xl leading-none text-onion">{n + 1}</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {s.sources && (
                  <p className="mt-6 text-sm text-muted">
                    {p.labels.sources}:{" "}
                    {s.sources.map((src, n) => (
                      <span key={src.url}>
                        {n > 0 && ", "}
                        <a href={src.url} className="underline underline-offset-2" rel="noopener noreferrer" target="_blank">
                          {src.label}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </Container>
          </li>
        ))}
      </ol>

      <section className="bg-onion-dark text-flesh">
        <Container className="py-16">
          <h2 className="text-4xl">{p.labels.contact}</h2>
          <p className="mt-3 max-w-md text-flesh/85">{p.labels.contactBody}</p>
          <Link href="/contact" className="mt-6 inline-flex min-h-12 items-center rounded-pill bg-skin px-6 font-semibold text-ink hover:bg-paper">
            {p.labels.contact}
          </Link>
        </Container>
      </section>
    </div>
  );
}
