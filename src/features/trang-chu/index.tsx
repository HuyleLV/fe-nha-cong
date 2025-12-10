// app/page.tsx (Trang chủ)
"use client";

import { useEffect, useMemo, useState } from "react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchBar from "@/components/searchBar";
import { useRouter } from "next/navigation";
import DistrictListingSection from "@/components/DistrictListingSection";
import banner1 from "@/assets/banner-01.jpg";
import banner2 from "@/assets/banner-02.jpg";
import banner3 from "@/assets/banner-03.jpg";
import banner4 from "@/assets/banner-04.jpg";
import PartnersCarousel, { PartnerLogo } from "@/components/partnersCarousel";
import FaqCarousel, { FaqItem } from "@/components/faqCarousel";
import { Apartment } from "@/type/apartment";
import { useDevice } from "@/hooks/useDevice";
import { apartmentService, ApiSectionHome, HomeSectionsResponse } from "@/services/apartmentService";
import img1 from "@/assets/img-03.png"
import PromoSection from "@/components/PromoSection";

const PARTNERS: PartnerLogo[] = [
  { label: "20AGAIN" }, { label: "LIIN" }, { label: "FPT" },
  { label: "OW" }, { label: "YOKO" }, { label: "URBAN" },
];

export default function TrangChu() {
  const { isMobile } = useDevice();
  const router = useRouter();
  const [mode, setMode] = useState<'phong'|'nha'|'mat-bang'|undefined>('phong');

  const [city, setCity] = useState<HomeSectionsResponse["city"] | null>(null);
  const [sections, setSections] = useState<ApiSectionHome[]>([]);
  const [popular, setPopular] = useState<Apartment[]>([]);
  const [discounted, setDiscounted] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
  const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const res = await apartmentService.getHomeSections({
          citySlug: "ha-noi",
          limitPerDistrict: 4
        });

        const rawCity = res?.city ?? null;
        const rawSections = (res?.sections ?? []) as ApiSectionHome[];

        const patchedSections: ApiSectionHome[] = rawSections.map((sec) => ({
          ...sec,
          apartments: (sec.apartments || []).map((a) => ({
            ...a,
            addressPath:
              a.addressPath || [sec.district.name, rawCity?.name].filter(Boolean).join(", "),
          })),
        }));

        setCity(rawCity);
        setSections(patchedSections);

        // Load popular apartments (most interested)
        const topRaw = await apartmentService.getMostInterested({ limit: 5, signal: controller.signal });
        // Enrich popular items with district/city so DistrictListingSection can derive a "district" label
        const top: Apartment[] = (topRaw || []).map((a) => {
          const secFound = patchedSections.find((sec) => sec.apartments?.some((x) => x.id === a.id));
          const districtName = secFound?.district?.name || a.location?.name || "";
          const cityName = rawCity?.name || "";
          const addressPath = a.addressPath || [districtName, cityName].filter(Boolean).join(", ");
          return { ...a, addressPath } as Apartment;
        });
        setPopular(top);

        // Load discounted apartments (highest discount first)
        try {
          const discRes = await apartmentService.getAll({
            status: 'published',
            hasDiscount: true,
            sort: 'discount_desc',
            page: 1,
            limit: 12,
          });
          const discountedItems = (discRes.items || []).map((a) => {
            const secFound = patchedSections.find((sec) => sec.apartments?.some((x) => x.id === a.id));
            const districtName = secFound?.district?.name || a.location?.name || "";
            const cityName = rawCity?.name || "";
            const addressPath = a.addressPath || [districtName, cityName].filter(Boolean).join(", ");
            return { ...a, addressPath } as Apartment;
          });
          setDiscounted(discountedItems);
        } catch (e) {
          // im lặng nếu lỗi phần ưu đãi
        }
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.message !== "canceled") {
          setErr(e?.message || "Không tải được dữ liệu");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // Gộp tất cả phòng để truyền vào component section
  const dataAll: (Apartment & { favorited?: boolean })[] = useMemo(() => {
    const out: (Apartment & { favorited?: boolean })[] = [];
    for (const sec of sections) {
      for (const a of sec.apartments) out.push(a);
    }
    return out;
  }, [sections]);

  // Thứ tự tabs theo quận
  const districtsOrder = useMemo(
    () => sections.map((s) => s.district.name),
    [sections]
  );

  return (
    <div className="w-full bg-emerald-50/30">
      <div className="w-full relative pt-2">
        <Slide
          autoplay
          indicators
          arrows
          infinite
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
          duration={3500}
          transitionDuration={600}
          pauseOnHover
        >
          {(() => {
            const images = [banner4.src, banner1.src, banner2.src, banner3.src];
            const chunkSize = isMobile ? 1 : 2;
            const slidesArr: string[][] = [];
            for (let i = 0; i < images.length; i += chunkSize) {
              slidesArr.push(images.slice(i, i + chunkSize));
            }
            // If last slide has fewer items and we're on desktop, pad it by repeating from start
            if (!isMobile && slidesArr.length) {
              const last = slidesArr[slidesArr.length - 1];
              if (last.length < chunkSize) {
                let idx = 0;
                while (last.length < chunkSize) {
                  last.push(images[idx % images.length]);
                  idx++;
                }
              }
            }

            return slidesArr.map((group, sidx) => (
              <div key={sidx} className="w-full">
                <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                  {group.map((src, idx) => (
                    <div key={idx} className={`w-full ${isMobile ? ("h-60") : ("h-80 md:w-1/2")} mx-2 rounded bg-center bg-cover overflow-hidden`} style={{ backgroundImage: `url(${src})` }}>
                      <div className="h-full w-full bg-black/8" />
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </Slide>

        {/* Overlay search card (Agoda-style) */}
        <div className=" flex justify-center px-4 md:px-6 mt-3">
          <div className="pointer-events-auto w-full max-w-5xl">
            <div className="rounded-2xl bg-white/95 backdrop-blur shadow-2xl ring-1 ring-black/5 p-3 md:p-4">
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                <button
                  type="button"
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${mode==='phong' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                  onClick={() => setMode('phong')}
                >
                  Thuê phòng
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${mode==='nha' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                  onClick={() => setMode('nha')}
                >
                  Thuê nhà
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${mode==='mat-bang' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                  onClick={() => setMode('mat-bang')}
                >
                  Thuê mặt bằng
                </button>
              </div>
              <SearchBar
                className="mt-3"
                mode={mode}
                onOpenLocation={() => console.log('open location picker')}
                onSearch={(q, opts) => {
                  const params = new URLSearchParams();
                  if (q) params.set('q', q);
                  if (opts?.guests !== undefined) params.set('guests', String(opts.guests));
                  if (opts?.beds !== undefined) params.set('beds', String(opts.beds));
                  if (opts?.type) {
                    params.set('type', opts.type);
                    params.set('q', q ? `${q} ${opts.type}` : opts.type);
                  }
                  if (opts?.locationSlug) params.set('locationSlug', opts.locationSlug);
                  if (opts?.priceMin !== undefined) params.set('minPrice', String(opts.priceMin));
                  if (opts?.priceMax !== undefined) params.set('maxPrice', String(opts.priceMax));
                  if (opts?.areaMin !== undefined) params.set('minArea', String(opts.areaMin));
                  if (opts?.areaMax !== undefined) params.set('maxArea', String(opts.areaMax));
                  router.push(`/tim-phong-quanh-day?${params.toString()}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to accommodate overlay */}
      <div className="h-12 md:h-16" />

      {/* ===== Ưu đãi giảm giá (trước PromoSection) ===== */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-0">
        {!loading && !err && discounted.length >= 0 && (
          <DistrictListingSection
            title="Các phòng đang có ưu đãi"
            subtitle="Các căn hộ giảm giá nhiều nhất"
            data={discounted}
            showTabs={false}
            variant="grid"
            onBook={(apt) => console.log("book:", apt)}
          />
        )}
      </div>

      {/* ===== Section nhiều quận (có tabs) ===== */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-0">
        {loading ? (
          <div className="h-40 bg-emerald-100 animate-pulse" />
        ) : err ? (
          <div className="bg-red-50 text-red-700 p-4">
            Không tải được dữ liệu: {err}
          </div>
        ) : (
          <DistrictListingSection
            data={dataAll}
            districtsOrder={districtsOrder}
            onBook={(apt) => console.log("book:", apt)}
            onSeeAll={(district) => console.log("see all:", district)}
          />
        )}
      </div>

      {/* ===== Intro Section ===== */}
      {/* <div className="max-w-screen-2xl mx-auto mt-6 px-4 md:px-0">
        <section className="w-full bg-[#087748] px-6 md:px-12 py-2 md:py-4 text-white my-10">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">Tìm kiếm dễ dàng</h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Hệ thống giúp bạn tìm phòng nhanh, chính xác và tiết kiệm thời gian nhất.
              </p>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Chúng tôi kết nối hàng nghìn phòng trọ uy tín tại Hà Nội, cập nhật mỗi ngày.
              </p>
            </div>

            <div className="relative w-full">
              <img
                src={img1.src}
                alt="Ngôi nhà"
                className="object-contain w-full h-80"
              />
            </div>
          </div>
        </section>
      </div> */}
      
      {/* ===== Section tái dùng (ẩn tabs) ===== */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-0">
        {!loading && !err && popular.length > 0 && (
          <DistrictListingSection
            title="Các phòng đang được quan tâm nhiều nhất"
            subtitle="Khám phá những căn hộ được yêu thích nhất"
            data={popular}
            showTabs={false}
            variant="scroll"
            onBook={(apt) => console.log("book:", apt)}
          />
        )}
      </div>

      {/* ===== Section tái dùng (ẩn tabs) ===== */}
      {/* <div className="max-w-screen-2xl mx-auto mt-6 px-4 md:px-0">
        {!loading && !err && (
          <DistrictListingSection
            title="Khu vực nổi bật"
            subtitle="Khám phá những căn hộ được yêu thích nhất"
            data={dataAll}
            onlyDistrict="Ba Đình"
            showTabs={false}
            variant="scroll"
            onBook={(apt) => console.log("book:", apt)}
          />
        )}
      </div> */}
      
      {/* ===== Đối tác & FAQ ===== */}
      {/* <PartnersCarousel items={PARTNERS} perSlide={6} /> */}

      {/* ===== Ưu đãi / Khuyến mãi (trước Partners & FAQ) ===== */}
      <PromoSection />

      {/* ===== FAQ ===== */}
      <FaqCarousel />

      {/* ===== Bản đồ ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-screen-2xl bg-[#087748] p-5 text-white md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold">Khám phá khu vực trên bản đồ</h3>
          <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div>
              <p className="text-white/90 text-sm md:text-base mb-4">
                Xem nhanh các khu vực nhà trọ và mức giá trung bình trên bản đồ Hà Nội.
              </p>
              <button className="inline-flex items-center rounded-full bg-white text-emerald-700 font-semibold px-6 py-2 hover:bg-emerald-50">
                Xem ngay
              </button>
            </div>

            <div className="relative h-150 overflow-hidden rounded-2xl bg-white">
              <iframe
                title="Bản đồ Hà Nội"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59615.428462975906!2d105.71369061023124!3d20.953949609279487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134532bef4bcdb7%3A0xbcc7a679fcba07f6!2zSMOgIMSQw7RuZywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1759043217443!5m2!1svi!2s"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
