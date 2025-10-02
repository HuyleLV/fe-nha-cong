"use client";

import clsx from "clsx";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";

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
  className,
}: PartnersCarouselProps) {
  const groups = chunk(items, perSlide);

  return (
    <section className={clsx("py-10", className)}>
      <div className="max-w-screen-2xl mx-auto">
        <Slide
          duration={durationMs}
          transitionDuration={500}
          autoplay
          infinite
          arrows={false}
          indicators
          pauseOnHover
        >
          {groups.map((group, idx) => (
            <div key={idx} className="py-6">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 place-items-center text-slate-500">
                {group.map((it, i) =>
                  it.src ? (
                    <img
                      key={i}
                      src={it.src}
                      alt={it.alt || "partner"}
                      className="h-8 object-contain"
                    />
                  ) : (
                    <span
                      key={i}
                      className="text-4xl font-bold tracking-widest select-none"
                    >
                      {it.label}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </Slide>
      </div>
    </section>
  );
}