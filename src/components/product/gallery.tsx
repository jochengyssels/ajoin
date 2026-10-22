"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function Gallery({ images }: { images: { src: string; alt: string; width: number; height: number }[] }) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const current = images[active];
  return (
    <section aria-label={t("gallery")}>
      <div className="overflow-hidden rounded-card bg-paper">
        <Image
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={t("showImage", { n: i + 1 })}
                aria-pressed={i === active}
                className={`block overflow-hidden rounded-soft border-2 ${i === active ? "border-onion" : "border-transparent"}`}
              >
                <Image src={img.src} alt="" width={72} height={90} className="h-[90px] w-[72px] object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
