"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SearchBar from "@/components/searchBar";
import DistrictListingSection from "@/components/DistrictListingSection";
// ❌ Bỏ import RoomCard
// import { RoomCard } from "@/components/roomCardItem";
import banner from "@/assets/banner-01.jpg";
import PartnersCarousel, { PartnerLogo } from "@/components/partnersCarousel";
import FaqCarousel, { FaqItem } from "@/components/faqCarousel";
import { Apartment } from "@/type/apartment";
import { useDevice } from "@/hooks/useDevice";

/* ================= Types từ API ================= */
type ApiApartment = {
  id: number;
  title: string;
  slug: string;
  coverImageUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  rentPrice?: number;
  currency?: string;
  createdAt?: string;
  locationId?: number;
};

type ApiSection = {
  district: { id: number; name: string; slug: string };
  apartments: ApiApartment[];
};

type HomeSectionsResponse = {
  city: { id: number; name: string; slug: string };
  sections: ApiSection[];
};

/* ================= Mock khác vẫn giữ ================= */
const PARTNERS: PartnerLogo[] = [
  { label: "20AGAIN" }, { label: "LIIN" }, { label: "FPT" },
  { label: "OW" }, { label: "YOKO" }, { label: "URBAN" },
];

const FAQS: FaqItem[] = [
  { text: "Làm sao tìm phòng gần trường và theo ngân sách?" },
  { text: "Có thể đặt phòng online và huỷ miễn phí không?" },
  { text: "Tiêu chí kiểm duyệt tin đăng gồm những gì?" },
  { text: "Phí dịch vụ khi ký hợp đồng là bao nhiêu?" },
];

export default function TrangChu() {
  const { isMobile } = useDevice();
  const [city, setCity] = useState<HomeSectionsResponse["city"] | null>(null);
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
    const url = `${base}/api/apartments/home-sections?citySlug=ha-noi&limitPerDistrict=4`;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: HomeSectionsResponse = await res.json();
        setCity(json?.city ?? null);
        setSections(json?.sections ?? []);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const dataAll: Apartment[] = useMemo(() => {
    const list: Apartment[] = [];
    for (const sec of sections) {
      for (const a of sec.apartments) {
        // Tạo object Apartment tối thiểu từ ApiApartment + thông tin quận
        list.push({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: null,
          description: null,
          location: {
            id: sec.district.id,
            name: sec.district.name,
            slug: sec.district.slug,
            level: "District",
          },
          streetAddress: null,
          lat: null,
          lng: null,
          bedrooms: a.bedrooms ?? 0,
          bathrooms: a.bathrooms ?? 0,
          areaM2: a.areaM2 ?? null,
          rentPrice: a.rentPrice ?? "0",
          currency: a.currency ?? "VND",
          status: "published",
          coverImageUrl: a.coverImageUrl ?? null,
          addressPath: [sec.district.name, city?.name].filter(Boolean).join(", "),
          createdById: 0,
          createdAt: a.createdAt ?? new Date().toISOString(),
          updatedAt: a.createdAt ?? new Date().toISOString(),
        } as Apartment);
      }
    }
    return list;
  }, [sections, city]);

  const districtsOrder = useMemo(
    () => sections.map((s) => s.district.name),
    [sections]
  );

  return (
    <div className="w-full bg-gradient-to-b from-emerald-50 to-white">
      <Image src={banner} alt="nha-cong" className={`w-full ${isMobile ? 'h-60' : 'h-200'}`} priority />

      {/* Search */}
      <div className="p-4">
        <SearchBar
          className="max-w-4xl mx-auto mt-6"
          onOpenLocation={() => console.log("open location picker")}
          onSearch={(q) => console.log("search:", q)}
        />
      </div>

      <div className="max-w-screen-xl mx-auto mt-6 px-4 md:px-0">
        {/* Section nhiều quận (có tabs) */}
        {loading ? (
          <div className="h-40 rounded-2xl bg-emerald-100 animate-pulse" />
        ) : err ? (
          <div className="rounded-xl bg-red-50 text-red-700 p-4">
            Không tải được dữ liệu: {err}
          </div>
        ) : (
          <DistrictListingSection
            data={dataAll}                 // ✅ giờ truyền Apartment[]
            districtsOrder={districtsOrder}
            onToggleFav={(id: number) => console.log("toggle fav:", id)}
            onBook={(apt: Apartment) => console.log("book:", apt)}
            onSeeAll={(d: string) => console.log("see all:", d)}
          />
        )}
      </div>

      <div className="max-w-screen-2xl mx-auto mt-6 px-4 md:px-0">
        {/* Intro banner text + ảnh (giữ nguyên) */}
        <section className="w-full bg-emerald-900 rounded-xl px-6 md:px-12 py-10 md:py-16 text-white my-10">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Tìm kiếm dễ dàng
              </h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Bạn có thể tạo ra các chiến dịch quảng cáo theo nhu cầu của bạn,
                mà không cần phải trả trước một khoản nào.
              </p>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Bạn có thể tạo ra các chiến dịch quảng cáo theo nhu cầu của bạn,
                mà không cần phải trả trước một khoản nào.
              </p>
            </div>

            <div className="relative w-full h-64 md:h-96">
              <img
                src="https://khothietke.net/wp-content/uploads/2021/05/PNGKhothietke.net-03230.png"
                alt="Ngôi nhà"
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-screen-xl mx-auto mt-6 px-4 md:px-0">
        {/* Section tái dùng (ẩn tabs) */}
        {!loading && !err && (
          <DistrictListingSection
            title="Các khu vực nhà trọ Hà Đông"
            subtitle="Hãy đến và trải nghiệm"
            data={dataAll}      
            onlyDistrict="Ba Đình"
            showTabs={false}
            variant="scroll"
            onBook={(apt: Apartment) => console.log("book:", apt)}
          />
        )}
      </div>

      {/* Ưu đãi / chương trình (giữ nguyên) */}
      <section className="max-w-screen-2xl mx-auto my-10">
        <div className="bg-emerald-900 rounded-3xl p-4 md:p-6 text-white">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold">Ưu đãi / Chương trình</h3>
            <button className="rounded-full border border-white/30 px-3 py-1 text-sm hover:bg-white/10">
              Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-3">
              <div className="h-100 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 px-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl md:text-3xl font-extrabold leading-none">THỨ 5</div>
                    <div className="text-sm md:text-base font-semibold opacity-90">DEAL CỰC CHÁY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs opacity-90">GIẢM CẢ NGÀY</div>
                    <div className="text-3xl md:text-4xl font-black">50%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-3">
              <div className="h-100 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 px-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl md:text-3xl font-extrabold leading-none">CUỐI TUẦN</div>
                    <div className="text-sm md:text-base font-semibold opacity-90">FLASH SALE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs opacity-90">GIẢM TỚI</div>
                    <div className="text-3xl md:text-4xl font-black">40%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto mt-6 px-4 md:px-0">
        {!loading && !err && (
          <DistrictListingSection
            title="Các khu vực nhà trọ Đẹp nhất"
            subtitle="Hãy đến và trải nghiệm"
            data={dataAll}           
            onlyDistrict="Mỹ Đình"
            showTabs={false}
            variant="scroll"
            onBook={(apt: Apartment) => console.log("book:", apt)}
          />
        )}
      </section>

      {/* Vì sao chọn chúng tôi + Partners + FAQ giữ nguyên */}
      <section className="my-10">
        <div className="relative mx-auto max-w-screen-2xl">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400"
              alt="Không gian bếp"
              className="h-[230px] w-full object-cover md:h-[360px]"
            />
          </div>

          <div className="absolute inset-y-4 right-4 w-[88%] md:inset-y-6 md:right-6 md:w-[60%] lg:w-[50%]">
            <div className="relative h-full rounded-2xl bg-emerald-900 px-5 py-4 text-white shadow-xl md:px-8 md:py-6">
              <h3 className="mb-2 text-lg font-bold md:mb-3 md:text-2xl">
                Tại sao lựa chọn chúng tôi?
              </h3>
              <div className="space-y-2 pr-28 text-xs text-white/90 md:pr-40 md:text-base">
                <p>Các chủ homestay, nhà trọ và xe hãy mạnh dạn đăng tin đúng nhu cầu, không cần trả trước.</p>
                <p>Lượng khách hàng đúng đối tượng, dịch vụ chất lượng, hỗ trợ tận tâm.</p>
                <p>Đăng tin dễ, tối ưu chi phí marketing, hiệu quả chuyển đổi cao.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PartnersCarousel items={PARTNERS} perSlide={6} />
      <FaqCarousel items={FAQS} />

      {/* Tham khảo giá BĐS (giữ nguyên) */}
      <section className="py-10">
        <div className="mx-auto max-w-screen-2xl rounded-3xl bg-emerald-900 p-5 text-white md:p-8">
          <h3 className="text-lg font-bold md:text-xl">Tham khảo giá bất động sản</h3>
          <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div>
              <div className="inline-flex rounded-full bg-white p-1 text-emerald-800 shadow">
                <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">
                  Căn hộ/phòng
                </span>
                <span className="px-3 py-1.5 text-sm">Nhà ở</span>
                <span className="px-3 py-1.5 text-sm">Đất</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow">
                  Cầu giấy
                </span>
                <button
                  type="button"
                  className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Xem giá ngay
                </button>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/90">
                <li>Giá nhà từ 100 triệu tới 10 tỷ – đủ phân khúc, quận, phường.</li>
                <li>Gợi ý giao dịch thực tế cập nhật mỗi tháng.</li>
              </ul>
            </div>

            <div className="relative h-150 overflow-hidden rounded-2xl bg-white">
              <iframe
                title="Bản đồ Hà Đông"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59615.428462975906!2d105.71369061023124!3d20.953949609279487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134532bef4bcdb7%3A0xbcc7a679fcba07f6!2zSMOgIMSQw7RuZywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1759043217443!5m2!1svi!2s"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-emerald-600 ring-4 ring-white shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}