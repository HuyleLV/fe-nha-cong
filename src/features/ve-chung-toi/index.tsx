"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Quote, Star, ChevronLeft, ChevronRight, BadgeCheck, HeartHandshake, Users2, Building2, ShieldCheck, Sparkles } from "lucide-react";


const TESTIMONIALS = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    role: "Chủ nhà • Quận 7",
    avatar: "https://i.pravatar.cc/120?img=5",
    rating: 5,
    content:
      "Mình đăng căn hộ chỉ trong 10 phút. Bộ lọc rõ ràng, khách liên hệ đều nghiêm túc. Đội hỗ trợ phản hồi rất nhanh!",
  },
  {
    id: 2,
    name: "Trần Đức Huy",
    role: "Người thuê • Cầu Giấy",
    avatar: "https://i.pravatar.cc/120?img=15",
    rating: 5,
    content:
      "Tìm phòng quanh đây cực tiện. Xem được giá, diện tích, ban công… đúng nhu cầu. UI mượt mà, duyệt rất sướng mắt.",
  },
  {
    id: 3,
    name: "Phạm Thu Hà",
    role: "Chủ nhà • Đống Đa",
    avatar: "https://i.pravatar.cc/120?img=30",
    rating: 4,
    content:
      "Quy trình xác thực gọn. Có thống kê lượt xem để điều chỉnh giá. Mình chốt được phòng chỉ sau 3 ngày.",
  },
  {
    id: 4,
    name: "Lê Quốc Bảo",
    role: "Người thuê • Thủ Đức",
    avatar: "https://i.pravatar.cc/120?img=56",
    rating: 5,
    content:
      "Rất thích phần bản đồ, lọc theo khu vực cực nhanh. Ảnh rõ nét, mô tả chi tiết, không bị thổi phồng.",
  },
];

// ==== Star Rating nhỏ gọn ====
function StarRating({ value = 5 }: { value?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < value ? "fill-emerald-500 text-emerald-500" : "text-emerald-200"}`}
        />
      ))}
    </div>
  );
}

// ==== Thẻ testimonial ====
function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <div className="group relative rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:shadow-lg">
      <Quote className="absolute -top-3 -right-3 h-8 w-8 text-emerald-200" />
      <div className="flex items-center gap-4">
        <img
          src={t.avatar}
          alt={t.name}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-100"
        />
        <div>
          <p className="font-semibold text-emerald-900">{t.name}</p>
          <p className="text-sm text-emerald-600">{t.role}</p>
        </div>
      </div>
      <div className="mt-4 text-slate-700">{t.content}</div>
      <div className="mt-4">
        <StarRating value={t.rating} />
      </div>
    </div>
  );
}

// ==== Carousel testimonials (auto + điều khiển) ====
function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const len = TESTIMONIALS.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % len), 4500);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [len]);

  const next = () => setIndex((i) => (i + 1) % len);
  const prev = () => setIndex((i) => (i - 1 + len) % len);

  return (
    <div className="relative">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => {
          const t = TESTIMONIALS[(index + col) % len];
          return <TestimonialCard key={col} t={t} />;
        })}
      </div>

      <div className="pointer-events-none absolute -bottom-6 right-0 flex gap-2 sm:-bottom-8">
        <button
          onClick={prev}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          aria-label="Slide trước"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          aria-label="Slide tiếp"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function VeChungToiPage() {
  const STATS = useMemo(
    () => [
      { icon: Users2, label: "Người dùng hoạt động", value: "120K+" },
      { icon: Building2, label: "Tin đăng mỗi tháng", value: "8.5K+" },
      { icon: ShieldCheck, label: "Xác thực tin cậy", value: "100%" },
      { icon: BadgeCheck, label: "Tỷ lệ chốt thành công", value: "78%" },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_40rem_at_120%_-10%,#10b9811f,transparent),radial-gradient(28rem_28rem_at_-10%_-10%,#34d39926,transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
              <Sparkles className="h-4 w-4" /> Về Chúng Tôi
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-emerald-900 sm:text-5xl">
              Kết nối người thuê và chủ nhà<span className="text-emerald-600">. Nhanh, minh bạch, hiệu quả.</span>
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-slate-600">
              Nền tảng thuê nhà tối ưu tại Việt Nam: tìm phòng quanh đây, lọc thông minh, quản lý tin đăng,
              và hệ thống xác thực giúp bạn tự tin ra quyết định.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/tim-phong-quanh-day"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white shadow-sm transition hover:bg-emerald-700"
              >
                <HeartHandshake className="h-5 w-5" /> Bắt đầu tìm phòng
              </a>
              <a
                href="/dang-tin"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                <CheckCircle2 className="h-5 w-5" /> Đăng căn hộ của bạn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-sm"
            >
              <s.icon className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-2 text-2xl font-extrabold text-emerald-900">{s.value}</p>
              <p className="text-sm text-emerald-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl font-bold text-emerald-900 sm:text-3xl">Sứ mệnh của chúng tôi</h2>
            <p className="mt-4 text-slate-700">
              Chúng tôi xây dựng trải nghiệm thuê nhà minh bạch và tiết kiệm thời gian cho cả chủ nhà và người thuê.
              Công cụ lọc sâu (giá, diện tích, phòng tắm, ban công…), bản đồ trực quan, và quy trình xác thực giúp
              bạn tiếp cận đúng nhu cầu trong vài phút.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                Trải nghiệm di động mượt mà – tìm phòng quanh bạn theo GPS.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                Hình ảnh rõ nét, nội dung chuẩn SEO, loại bỏ tin rác.
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                Hỗ trợ nhanh chóng – đội ngũ CSKH thân thiện, nhiệt tình.
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522706604294-57bdf59b5e49?q=80&w=1600&auto=format&fit=crop"
                alt="Tìm phòng hiệu quả"
                className="h-full w-full rounded-3xl border border-emerald-100 object-cover shadow-lg"
              />
              <div className="absolute -bottom-5 -right-5 rounded-2xl border border-emerald-100 bg-white p-4 shadow-md">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-900">Tin đăng đã xác thực</p>
                </div>
                <p className="text-xs text-slate-600">Chống giả mạo, bảo vệ người thuê</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 sm:text-3xl">Khách hàng nói gì?</h2>
            <p className="mt-2 text-slate-600">Những trải nghiệm thật từ chủ nhà và người thuê trên nền tảng.</p>
          </div>
        </div>
        <div className="mt-6">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[{
            title: "Minh bạch trước tiên",
            desc: "Mọi tin đăng đều có tiêu chí rõ ràng, đánh giá công khai, báo cáo vi phạm chỉ với 1 chạm.",
          }, {
            title: "Thiết kế vì người dùng",
            desc: "Tập trung tốc độ, khả năng đọc, tối ưu thao tác một tay cho thiết bị di động.",
          }, {
            title: "Công nghệ đáng tin",
            desc: "Thông báo thời gian thực, bộ lọc thông minh, SEO mạnh để tin của bạn luôn nổi bật.",
          }].map((v, i) => (
            <div key={i} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-emerald-900">{v.title}</h3>
              <p className="mt-2 text-slate-700">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-white shadow-lg">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold sm:text-3xl">Sẵn sàng đồng hành cùng bạn</h3>
              <p className="mt-2 text-emerald-50">
                Đăng tin chỉ trong vài phút hoặc bắt đầu tìm phòng quanh khu vực của bạn ngay bây giờ.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/dang-tin"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                >
                  <ShieldCheck className="h-5 w-5" /> Đăng tin miễn phí
                </a>
                <a
                  href="/tim-phong-quanh-day"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-medium text-white/90 transition hover:bg-white/10"
                >
                  <Users2 className="h-5 w-5" /> Khám phá phòng trống
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
                <img
                  src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200&auto=format&fit=crop"
                  alt="Căn hộ đẹp"
                  className="h-24 w-36 rounded-xl object-cover"
                />
                <div>
                  <p className="text-sm text-emerald-50">Hơn 8.5K+ tin đăng mỗi tháng</p>
                  <p className="text-sm text-white">Và đang tăng trưởng mỗi ngày 🚀</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}