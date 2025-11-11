"use client";

import clsx from "clsx";
import { Slide } from "react-slideshow-image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-slideshow-image/dist/styles.css";
import doitac1 from "@/assets/easyhome.png";
import doitac2 from "@/assets/hienhome.png";
import doitac3 from "@/assets/inhome.png";
import doitac4 from "@/assets/salahomes.png";
import doitac5 from "@/assets/vifahome.png";

export interface PartnerLogo {
  /** Nếu có ảnh thì dùng src; nếu không có ảnh, render label text */
  src?: string;
  alt?: string;
  label?: string;
}

interface PartnersCarouselProps {
  items: PartnerLogo[];
  perSlide?: number;          // số logo mỗi slide
  durationMs?: number;        // thời gian mỗi slide
  title?: string;             // tiêu đề khu vực đối tác
  className?: string;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function PartnersCarousel({
  items,
  perSlide = 6,
  durationMs = 2500,
  title = "Đối tác của chúng tôi",
  className,
}: PartnersCarouselProps) {
  const groups = chunk(items, perSlide);

  return (
    <section className={clsx("py-10", className)}>
      <div className="mx-auto max-w-screen-2xl rounded-3xl bg-[#087748] p-5 text-white md:p-8">
        <div className="mb-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
        </div>

        <Slide
          duration={durationMs}
          transitionDuration={500}
          autoplay
          infinite
          arrows
          prevArrow={
            <button
              aria-label="Slide trước"
              className="inline-flex items-center justify-center rounded-full bg-white/80 text-emerald-700 shadow ring-1 ring-emerald-200 hover:bg-white focus:outline-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          }
          nextArrow={
            <button
              aria-label="Slide tiếp"
              className="inline-flex items-center justify-center rounded-full bg-white/80 text-emerald-700 shadow ring-1 ring-emerald-200 hover:bg-white focus:outline-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          }
          indicators
          pauseOnHover
        >
          {groups.map((group, idx) => (
            <div key={idx} className="py-6">
              <div className="grid grid-cols-3 gap-6 place-items-center sm:grid-cols-6">
                {group.map((it, i) => {
                  const label = it.label || it.alt || "";
                  const initials = label
                    .split(/\s+/)
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <div key={i} className="flex w-full flex-col items-center text-white/90">
                      {it.src ? (
                        <img
                          src={it.src}
                          alt={it.alt || label || "partner"}
                          className="h-12 w-auto object-contain"
                        />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                          {initials || "--"}
                        </div>
                      )}
                      {label && (
                        <span className="mt-2 line-clamp-1 text-center text-sm">{label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Slide>
      </div>
    </section>
  );
}