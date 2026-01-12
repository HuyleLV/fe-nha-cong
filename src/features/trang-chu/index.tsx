// app/page.tsx (Trang chủ)
"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
// dynamically load the heavy carousel (client-only) to reduce initial bundle
const HeroCarousel = dynamic(() => import("@/components/HeroCarousel"), { ssr: false });
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
import ShortReviewInline from "@/features/short-review/inline";

const PARTNERS: PartnerLogo[] = [
  { label: "20AGAIN" }, { label: "LIIN" }, { label: "FPT" },
  { label: "OW" }, { label: "YOKO" }, { label: "URBAN" },
];

export default function TrangChu() {
  const { isMobile } = useDevice();
  const router = useRouter();

  const [city, setCity] = useState<HomeSectionsResponse["city"] | null>(null);
  const [sections, setSections] = useState<ApiSectionHome[]>([]);
  const [popular, setPopular] = useState<Apartment[]>([]);
  const [discounted, setDiscounted] = useState<Apartment[]>([]);
  const [upcomingVacant, setUpcomingVacant] = useState<Apartment[]>([]);
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

        // Mark page as ready once core content (sections) is available so the hero + search show quickly
        setLoading(false);

        // Load other less-critical lists in parallel to avoid blocking the UI
        (async () => {
          try {
            const [topRes, discRes, upRes] = await Promise.allSettled([
              apartmentService.getMostInterested({ limit: 5, signal: controller.signal }),
              apartmentService.getDiscounted({ page: 1, limit: 10 }),
              apartmentService.getUpcomingVacant({ status: 'sap_trong', limit: 10 }),
            ]);

            if (topRes.status === 'fulfilled') {
              const topRaw = topRes.value || [];
              const top: Apartment[] = (topRaw || []).map((a) => {
                const secFound = patchedSections.find((sec) => sec.apartments?.some((x) => x.id === a.id));
                const districtName = secFound?.district?.name || a.location?.name || "";
                const cityName = rawCity?.name || "";
                const addressPath = a.addressPath || [districtName, cityName].filter(Boolean).join(", ");
                return { ...a, addressPath } as Apartment;
              });
              setPopular(top);
            }

            if (discRes.status === 'fulfilled') {
              const disc = discRes.value;
              const discountedItems = (disc.items || []).map((a: Apartment) => {
                const secFound = patchedSections.find((sec) => sec.apartments?.some((x) => x.id === a.id));
                const districtName = secFound?.district?.name || a.location?.name || "";
                const cityName = rawCity?.name || "";
                const addressPath = a.addressPath || [districtName, cityName].filter(Boolean).join(", ");
                return { ...a, addressPath } as Apartment;
              });
              setDiscounted(discountedItems);
            }

            if (upRes.status === 'fulfilled') {
              const up = upRes.value;
              const upItems: Apartment[] = (up.items || []).map((a: Apartment) => {
                const secFound = patchedSections.find((sec) => sec.apartments?.some((x) => x.id === a.id));
                const districtName = secFound?.district?.name || a.location?.name || "";
                const cityName = rawCity?.name || "";
                const addressPath = a.addressPath || [districtName, cityName].filter(Boolean).join(", ");
                return { ...a, addressPath } as Apartment;
              });
              setUpcomingVacant(upItems);
            }
          } catch (e) {
            // ignore errors for these non-blocking requests
          }
        })();
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
        <HeroCarousel images={[banner4.src, banner1.src, banner2.src, banner3.src]} isMobile={isMobile} />

        {/* Overlay search card (Agoda-style) */}
        <div className="absolute left-0 right-0 flex justify-center px-4 md:px-6 top-full -translate-y-1/2 z-20">
          <div id="hero-search-anchor" className="pointer-events-auto w-full max-w-5xl">
            <div className="rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5 p-3 md:p-4">
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              </div>
              <SearchBar
                className="mt-3"
                segmented
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

      {/* Spacer so content below isn't overlapped by the absolute search card */}
      <div className="h-20 md:h-30" />

      {/* ===== Ưu đãi giảm giá (trước PromoSection) ===== */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-0 rounded-xl overflow-hidden">
        {!loading && !err && (
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
      <div className="max-w-screen-2xl mx-auto px-4 md:px-0 rounded-xl overflow-hidden pt-5">
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
      <div className="max-w-screen-2xl mx-auto px-4 md:px-0 rounded-xl overflow-hidden pt-5">
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
      {/* ===== Các phòng sắp trống (approved) ===== */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-0 rounded-xl overflow-hidden mt-6">
        {!loading && !err && (
          <DistrictListingSection
            title="Các phòng sắp trống"
            subtitle="Căn hộ sắp trống đã được duyệt"
            data={upcomingVacant}
            showTabs={false}
            variant="grid"
            onBook={(apt) => console.log("book:", apt)}
          />
        )}
      </div>

      {/* Short review inline (limit 5) immediately below upcoming vacant section */}
      <ShortReviewInline limit={5} />

      <PromoSection />

      {/* ===== FAQ ===== */}
      <FaqCarousel />

      {/* ===== Bản đồ ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-screen-2xl bg-[#087748] p-5 text-white md:p-8 rounded-xl overflow-hidden">
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
