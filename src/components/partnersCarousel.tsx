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

// Default partners (use these five images + readable labels if no items prop provided)
const defaultPartners: PartnerLogo[] = [
  { src: (doitac1 as any)?.src || (doitac1 as any), alt: "EasyHome", label: "EasyHome" },
  { src: (doitac2 as any)?.src || (doitac2 as any), alt: "HienHome", label: "HienHome" },
  { src: (doitac3 as any)?.src || (doitac3 as any), alt: "InHome", label: "InHome" },
  { src: (doitac4 as any)?.src || (doitac4 as any), alt: "SalaHomes", label: "SalaHomes" },
  { src: (doitac5 as any)?.src || (doitac5 as any), alt: "VifaHome", label: "VifaHome" },
];

export interface PartnerLogo {
  /** Nếu có ảnh thì dùng src; nếu không có ảnh, render label text */
  src?: string;
  alt?: string;
  label?: string;
}

interface PartnersCarouselProps {
  items?: PartnerLogo[]; // optional; we now default to built-in partners
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
  perSlide = 5,
  durationMs = 2500,
  title = "Đối tác của chúng tôi",
  className,
}: PartnersCarouselProps) {
  // Luôn dùng danh sách đối tác mặc định để loại bỏ dữ liệu cũ được truyền từ ngoài
  const displayItems = defaultPartners;
  const groups = chunk(displayItems, perSlide);

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
              <div className="grid grid-cols-3 gap-6 place-items-center sm:grid-cols-5">
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
                      <div className="grid h-24 w-36 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
                        {it.src ? (
                          <img
                            src={it.src}
                            alt={it.alt || label || "partner"}
                            className="h-16 w-auto object-contain"
                          />
                        ) : (
                          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700 text-base font-semibold ring-1 ring-emerald-200">
                            {initials || "--"}
                          </div>
                        )}
                      </div>
                      {label && (
                        <span className="mt-2 line-clamp-1 text-center text-sm text-white/95">{label}</span>
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