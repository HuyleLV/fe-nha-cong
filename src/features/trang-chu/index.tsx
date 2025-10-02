"use client";
import Image from "next/image";
import SearchBar from "@/components/searchBar";
import DistrictListingSection from "@/components/DistrictListingSection";
import { RoomCard } from "@/components/roomCardItem";
import banner from "@/assets/banner-01.jpg";
import PartnersCarousel, { PartnerLogo } from "@/components/partnersCarousel";
import FaqCarousel, { FaqItem } from "@/components/faqCarousel";

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

const DEMO: RoomCard[] = [
  {
    id: 1,
    title: "Phòng full nội thất, ban công thoáng",
    price: 2_500_000,
    district: "Đống Đa",
    address: "Ngõ 10 Xã Đàn",
    area: 22,
    beds: 1,
    baths: 1,
    image: "https://anphatgroups.vn/upload/post/mau-biet-thu-dep-9680.jpg",
  },
  {
    id: 2,
    title: "Căn hộ mini gần trường đại học",
    price: 3_500_000,
    district: "Cầu Giấy",
    address: "Trần Quốc Hoàn",
    area: 28,
    beds: 1,
    baths: 1,
    image: "https://anphatgroups.vn/upload/post/mau-biet-thu-dep-9680.jpg",
    isFav: true,
  },
  {
    id: 3,
    title: "Phòng có cửa sổ lớn thoáng sáng",
    price: 3_000_000,
    district: "Thanh Xuân",
    address: "Nguyễn Trãi",
    area: 24,
    beds: 1,
    baths: 1,
    image: "https://anphatgroups.vn/upload/post/mau-biet-thu-dep-9680.jpg",
  },
  // ---- Hà Đông (thêm để dùng cho block bên dưới)
  {
    id: 41,
    title: "Căn hộ mini Hà Đông nội thất mới",
    price: 2_800_000,
    district: "Hà Đông",
    address: "Tố Hữu",
    area: 20,
    beds: 1,
    baths: 1,
    image: "https://anphatgroups.vn/upload/post/mau-biet-thu-dep-9680.jpg",
  },
  {
    id: 42,
    title: "Căn hộ mini Hà Đông nội thất mới",
    price: 3_200_000,
    district: "Hà Đông",
    address: "Quang Trung",
    area: 26,
    beds: 1,
    baths: 1,
    image: "https://anphatgroups.vn/upload/post/mau-biet-thu-dep-9680.jpg",
    isFav: true,
  },
  {
    id: 43,
    title: "Phòng studio Hà Đông, có ban công",
    price: 3_600_000,
    district: "Hà Đông",
    address: "Phúc La",
    area: 30,
    beds: 1,
    baths: 1,
    image: "https://anphatgroups.vn/upload/post/mau-biet-thu-dep-9680.jpg",
  },
  {
    id: 44,
    title: "Phòng studio Hà Đông, có ban công",
    price: 3_600_000,
    district: "Hà Đông",
    address: "Phúc La",
    area: 30,
    beds: 1,
    baths: 1,
    image: "https://anphatgroups.vn/upload/post/mau-biet-thu-dep-9680.jpg",
  },
];

export default function TrangChu() {
  return (
    <div className="w-full bg-gradient-to-b from-emerald-50 to-white">
            <Image
                src={banner}
                alt="nha-cong"
                className="w-full h-200"
                priority
            />

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
            <DistrictListingSection
                data={DEMO}
                districtsOrder={["Đống Đa", "Cầu Giấy", "Thanh Xuân", "Hà Đông"]}
                onToggleFav={(id: any) => console.log("toggle fav:", id)}
                onBook={(room: any) => console.log("book:", room)}
                onSeeAll={(d: any) => console.log("see all:", d)}
            />
        </div>
        
        <div className="max-w-screen-2xl mx-auto mt-6 px-4 md:px-0">
            {/* Intro banner text + ảnh */}
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
            {/* Section Hà Đông tái dùng component (ẩn tabs) */}
            <DistrictListingSection
                title="Các khu vực nhà trọ Hà Đông"
                subtitle="Hãy đến và trải nghiệm"
                data={DEMO}
                onlyDistrict="Hà Đông" 
                showTabs={false}      
                variant="scroll"       
                onBook={(room: any) => console.log("book:", room)}
            />
        </div>

        {/* ========== ƯU ĐÃI / CHƯƠNG TRÌNH ========== */}
        <section className="max-w-screen-2xl mx-auto my-10">
            <div className="bg-emerald-900 rounded-3xl p-4 md:p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold">Ưu đãi / Chương trình</h3>
                <button className="rounded-full border border-white/30 px-3 py-1 text-sm hover:bg-white/10">
                    Xem tất cả
                </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Promo 1 */}
                <div className="rounded-2xl bg-white p-3">
                    <div className="h-100 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-between px-6">
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

                {/* Promo 2 */}
                <div className="rounded-2xl bg-white p-3">
                    <div className="h-100 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white flex items-center justify-between px-6">
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
        </section>

        <section className="max-w-screen-xl mx-auto mt-6 px-4 md:px-0">
            <DistrictListingSection
                title="Các khu vực nhà trọ Đẹp nhất"
                subtitle="Hãy đến và trải nghiệm"
                data={DEMO}
                onlyDistrict="Hà Đông" 
                showTabs={false}      
                variant="scroll"       
                onBook={(room: any) => console.log("book:", room)}
            />
        </section>

        <section className="my-10">
            <div className="relative max-w-screen-2xl mx-auto">
                {/* Ảnh nền bên trái */}
                <div className="relative rounded-3xl overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400"
                        alt="Không gian bếp"
                        className="w-full h-[230px] md:h-[360px] object-cover"
                    />
                </div>

                {/* Khối xanh chồng lên bên phải */}
                <div className="absolute inset-y-4 md:inset-y-6 right-4 md:right-6 w-[88%] md:w-[60%] lg:w-[50%]">
                    <div className="relative h-full rounded-2xl bg-emerald-900 text-white shadow-xl px-5 py-4 md:px-8 md:py-6">
                        <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                        Tại sao lựa chọn chúng tôi?
                        </h3>

                        <div className="space-y-2 text-xs md:text-base text-white/90 pr-28 md:pr-40">
                            <p>
                                Các chủ homestay, nhà trọ và xe hãy mạnh dạn đăng tin đúng nhu cầu,
                                không cần trả trước một khoản nào.
                            </p>
                            <p>
                                Lượng khách hàng đúng đối tượng, dịch vụ chất lượng, hỗ trợ tận tâm.
                            </p>
                            <p>
                                Đăng tin dễ, tối ưu chi phí marketing, hiệu quả chuyển đổi cao.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <PartnersCarousel items={PARTNERS} perSlide={6} />

        <FaqCarousel items={FAQS} />

        {/* ========== THAM KHẢO GIÁ BẤT ĐỘNG SẢN ========== */}
        <section className="py-10">
        <div className="max-w-screen-2xl mx-auto rounded-3xl bg-emerald-900 text-white p-5 md:p-8">
            <h3 className="text-lg md:text-xl font-bold">Tham khảo giá bất động sản</h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Form bên trái (cố định) */}
                <div>
                    {/* Segmented control */}
                    <div className="inline-flex rounded-full bg-white p-1 text-emerald-800 shadow">
                        <span className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-semibold">
                            Căn hộ/phòng
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-sm">Nhà ở</span>
                        <span className="px-3 py-1.5 rounded-full text-sm">Đất</span>
                    </div>

                    {/* Hàng chọn quận + nút */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-white text-emerald-700 px-4 py-2 text-sm font-semibold shadow">
                            Cầu giấy
                        </span>
                        <button
                            type="button"
                            className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            Xem giá ngay
                        </button>
                    </div>

                    {/* 2 gạch đầu dòng mô tả */}
                    <ul className="mt-4 space-y-2 text-white/90 text-sm">
                        <li>Giá nhà từ 100 triệu tới 10 tỷ – đủ phân khúc, quận, phường.</li>
                        <li>Gợi ý giao dịch thực tế cập nhật mỗi tháng.</li>
                    </ul>
                </div>

                {/* Map bên phải */}
                <div className="relative h-150 rounded-2xl overflow-hidden bg-white">
                    <iframe
                        title="Bản đồ Hà Đông"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59615.428462975906!2d105.71369061023124!3d20.953949609279487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134532bef4bcdb7%3A0xbcc7a679fcba07f6!2zSMOgIMSQw7RuZywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1759043217443!5m2!1svi!2s"
                        className="absolute inset-0 h-full w-full border-0"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    />

                    {/* Marker overlay — không chặn thao tác trên map */}
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