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
import nhanthongbao from "@/assets/nhan-thong-bao.png"
import PromoSection from "@/components/PromoSection";
import ShortReviewInline from "@/features/short-review/inline";
import { newsService } from "@/services/newsService";
import Link from "next/link";

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
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    // load top news for homepage
    (async () => {
      try {
        setLoadingNews(true);
        const { items } = await newsService.getAll({ page: 1, limit: 4 });
        setNewsItems(items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoadingNews(false);
      }
    })();

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

      {/* ===== Top Nhà Tiếp thị (static sample avatars) ===== */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-0 py-4">
        <div className="bg-white rounded-xl p-5">
          <div className="flex items-center mb-6">
            <h3 className="text-xl font-bold">Top Nhà Tiếp thị</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-start justify-items-center">
            {[
              { name: 'Nguyễn Văn A' },
              { name: 'Lê Thị B' },
              { name: 'Trần Văn C' },
              { name: 'Phạm Thị D' },
              { name: 'Hoàng Văn E' },
            ].map((p, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                  {p.name.split(' ').slice(-1)[0][0]}
                </div>
                <div className="text-sm mt-3 text-slate-800">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tin tức và sự kiện (4 items) ===== */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-0 py-4">
        <div className="bg-white rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Tin tức &amp; Sự kiện</h3>
            <Link href="/news" className="text-sm text-slate-500 hover:underline">Xem thêm</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingNews && <div className="col-span-full py-6 text-center text-slate-500">Đang tải...</div>}
            {!loadingNews && newsItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">Chưa có tin tức.</div>
            )}
            {!loadingNews && newsItems.map((it: any) => (
              <div key={it.id} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
                <div className="h-36 bg-slate-100 flex items-center justify-center text-slate-400">
                  {it.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.coverImageUrl} alt={it.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">No image</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-slate-800 line-clamp-2">{it.title}</div>
                  <div className="text-sm text-slate-500 mt-2">{it.excerpt || ''}</div>
                  <div className="mt-3">
                    <Link href={`/news/${it.slug}`} className="text-sm text-sky-600 font-medium">Đọc thêm →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ===== Nhận thông báo từ chúng tôi (subscribe) ===== */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-0 py-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="p-6 md:p-10">
              <h3 className="text-2xl font-bold mb-2">Nhận thông báo từ chúng tôi</h3>
              <p className="text-slate-600 mb-4">Đọc và chia sẻ quan điểm mới về bất kì chủ đề nào. Bất cứ ai cũng có thể tham gia. Nhận nhiều ưu đãi hơn.</p>

              <ul className="text-sm text-slate-700 mb-4 space-y-1">
                <li>• Thêm ưu đãi</li>
                <li>• Nhận thông tin cập nhật mới nhất</li>
              </ul>

              <form className="flex flex-col sm:flex-row gap-3 sm:gap-4" onSubmit={(e) => { e.preventDefault(); /* no-op for now */ }}>
                <label htmlFor="subscribe-email" className="sr-only">Nhập email</label>
                <input id="subscribe-email" type="email" placeholder="Nhập email" className="w-full sm:flex-1 rounded-md border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                <button type="submit" className="rounded-md bg-emerald-600 text-white px-4 py-3 font-medium hover:bg-emerald-700">Đăng ký</button>
              </form>
            </div>

            <div className="p-2 flex items-center justify-center bg-emerald-50">
              <div className="w-100 h-100 sm:w-100 sm:h-100 bg-cover bg-center rounded-lg overflow-hidden">
                <img src={nhanthongbao.src} alt="Nhận thông báo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

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
