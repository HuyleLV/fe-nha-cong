"use client";

import clsx from "clsx";
import { Slide } from "react-slideshow-image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-slideshow-image/dist/styles.css";

export interface FaqItem {
  text: string;
}

interface FaqCarouselProps {
  items: FaqItem[];
  title?: string;
  durationMs?: number;
  className?: string;
}

export default function FaqCarousel({
  items,
  title = "Những câu hỏi thường gặp của sinh viên",
  durationMs = 3500,
  className,
}: FaqCarouselProps) {
  return (
    <section className={clsx("py-10", className)}>
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-emerald-900">
          {title}
        </h3>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4">
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
          {items.map((q, i) => (
            <div key={i} className="px-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
                {/* Card mờ trái */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 opacity-60">
                  <div className="text-emerald-600 text-4xl leading-none mb-2">“</div>
                  <p className="text-slate-600 text-sm">{q.text}</p>
                </div>

                {/* Card nổi bật giữa */}
                <div className="relative rounded-2xl bg-[#087748] text-white p-6 md:p-8 shadow-xl">
                  <div className="text-5xl leading-none opacity-80 mb-2">“</div>
                  <p className="text-sm md:text-base">{q.text}</p>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-emerald-700"></div>
                </div>

                {/* Card mờ phải */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5 opacity-60">
                  <div className="text-emerald-600 text-4xl leading-none mb-2">“</div>
                  <p className="text-slate-600 text-sm">{q.text}</p>
                </div>
              </div>
            </div>
          ))}
        </Slide>
      </div>
    </section>
  );
}