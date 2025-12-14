"use client";

import Image from "next/image";
import Link from "next/link";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import uudai from "@/assets/uu-dai.jpg";
import uudai2 from "@/assets/uu-dai-2.jpg";
import uudai3 from "@/assets/uu-dai-3.jpg";
import uudai4 from "@/assets/uu-dai-4.jpg";

export type PromoItem = {
  id: string | number;
  title?: string;
  subtitle?: string;
  image?: any; // Next Image import or URL string
  href?: string;
  badge?: string;
};

export default function PromoSection({
  title = "Ưu đãi / Chương trình",
  subtitle,
  items,
  perSlide = 2,
  autoplay = true,
}: {
  title?: string;
  subtitle?: string;
  items?: PromoItem[];
  perSlide?: number; // number of cards per slide (2 mặc định)
  autoplay?: boolean;
}) {
  // Mặc định hiển thị 4 ảnh ưu đãi đã import sẵn
  const defaultItems: PromoItem[] = [
    { id: 1, image: uudai },
    { id: 2, image: uudai2 },
    { id: 3, image: uudai3 },
    { id: 4, image: uudai4 },
  ];
  const list: PromoItem[] = (items && items.length ? items : defaultItems);

  // Chia nhóm theo perSlide
  const chunk = (arr: PromoItem[], size: number) => {
    const res: PromoItem[][] = [];
    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
    return res;
  };
  const groups = chunk(list, Math.max(1, perSlide));

  return (
    <section className="max-w-screen-2xl mx-auto px-4 md:px-0 mt-6 rounded-xl overflow-hidden">
      <div className=" bg-[#087748] text-white p-5 md:p-8 rounded-xl overflow-hidden">
        <div className="mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        </div>

        <Slide
          autoplay={autoplay}
          indicators
          arrows
          infinite
          duration={3500}
          transitionDuration={500}
          prevArrow={
            <button
              aria-label="Slide trước"
              className="inline-flex items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow ring-1 ring-emerald-200 hover:bg-white focus:outline-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          }
          nextArrow={
            <button
              aria-label="Slide tiếp"
              className="inline-flex items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow ring-1 ring-emerald-200 hover:bg-white focus:outline-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          }
        >
          {groups.map((g, idx) => (
            <div key={idx} className="px-1">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {g.map((p) => (
                  <Link
                    key={p.id}
                    href={p.href || "#"}
                    className="group relative overflow-hidden rounded-2xl h-56 sm:h-64 md:h-72 lg:h-80 ring-1 ring-emerald-100 bg-white"
                  >
                    {/* Image fill only (contain to avoid distortion) */}
                    {typeof p.image === "string" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt="Ưu đãi"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    ) : p.image ? (
                      <Image src={p.image} alt="Ưu đãi" fill className="object-contain" />
                    ) : (
                      <div className="absolute inset-0 bg-white" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </Slide>
      </div>
    </section>
  );
}
