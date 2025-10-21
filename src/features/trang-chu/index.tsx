// app/page.tsx (Trang chủ)
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SearchBar from "@/components/searchBar";
import DistrictListingSection from "@/components/DistrictListingSection";
import banner from "@/assets/banner-01.jpg";
import PartnersCarousel, { PartnerLogo } from "@/components/partnersCarousel";
import FaqCarousel, { FaqItem } from "@/components/faqCarousel";
import { Apartment } from "@/type/apartment";
import { useDevice } from "@/hooks/useDevice";
import { apartmentService, ApiSectionHome, HomeSectionsResponse } from "@/services/apartmentService";

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
  const [sections, setSections] = useState<ApiSectionHome[]>([]);
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

        console.log("Home sections:", res);

        const rawCity = res?.city ?? null;
        const rawSections = (res?.sections ?? []) as ApiSectionHome[];

        // Thêm addressPath để DistrictListingSection nhóm theo quận (nếu BE chưa có)
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
    <div className="w-full bg-gradient-to-b from-emerald-50 to-white">
      {/* ===== Banner ===== */}
      <Image
        src={banner}
        alt="nha-cong"
        className={`w-full object-cover ${isMobile ? "h-60" : "h-200"}`}
        priority
      />

      {/* ===== Search ===== */}
      <div className="p-4">
        <SearchBar
          className="max-w-4xl mx-auto mt-6"
          onOpenLocation={() => console.log("open location picker")}
          onSearch={(q) => console.log("search:", q)}
        />
      </div>

      {/* ===== Section nhiều quận (có tabs) ===== */}
      <div className="max-w-screen-xl mx-auto mt-6 px-4 md:px-0">
        {loading ? (
          <div className="h-40 rounded-2xl bg-emerald-100 animate-pulse" />
        ) : err ? (
          <div className="rounded-xl bg-red-50 text-red-700 p-4">
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
      <div className="max-w-screen-2xl mx-auto mt-6 px-4 md:px-0">
        <section className="w-full bg-emerald-900 rounded-xl px-6 md:px-12 py-10 md:py-16 text-white my-10">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">Tìm kiếm dễ dàng</h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Hệ thống giúp bạn tìm phòng nhanh, chính xác và tiết kiệm thời gian nhất.
              </p>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Chúng tôi kết nối hàng nghìn phòng trọ uy tín tại Hà Nội, cập nhật mỗi ngày.
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

      {/* ===== Section tái dùng (ẩn tabs) ===== */}
      <div className="max-w-screen-xl mx-auto mt-6 px-4 md:px-0">
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
      </div>

      {/* ===== Partners & FAQ ===== */}
      <PartnersCarousel items={PARTNERS} perSlide={6} />
      <FaqCarousel items={FAQS} />

      {/* ===== Bản đồ ===== */}
      <section className="py-10">
        <div className="mx-auto max-w-screen-2xl rounded-3xl bg-emerald-900 p-5 text-white md:p-8">
          <h3 className="text-lg font-bold md:text-xl">Khám phá khu vực trên bản đồ</h3>
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
