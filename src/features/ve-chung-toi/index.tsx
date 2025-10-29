"use client";

import React from "react";
import {
  Home,
  Users2,
  Building2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Quote,
  Star,
} from "lucide-react";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import Footer from "@/components/footer";

export default function VeChungToiPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* ========== HERO ========== */}
      <section className="relative">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_20%_10%,#a7f3d0_0%,transparent_60%),radial-gradient(40%_40%_at_90%_20%,#bfdbfe_0%,transparent_60%)] opacity-40" />

        <div className="max-w-screen-xl mx-auto px-4 pt-10 pb-6">
          <header className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/80 px-3 py-1 text-emerald-700 shadow-sm backdrop-blur">
            <Home className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide">NHÀ CỘNG • THẾ GIỚI PHÒNG TRỌ</span>
          </header>

          <div className="grid gap-6 md:grid-cols-[1.15fr,0.85fr]">
          {/* Left: Title + intro block + stats */}
          <div>
            <h1 className="text-[44px] leading-[1.08] font-black text-emerald-900 sm:text-5xl">
              NHÀ CỘNG
            </h1>
            <p className="mt-1 text-2xl font-extrabold text-emerald-700">
              THẾ GIỚI PHÒNG TRỌ
            </p>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl shadow-md border border-emerald-100 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"
                  alt="Phòng studio thông tầng"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm backdrop-blur">
                  <h3 className="text-lg font-semibold text-emerald-900">Giới thiệu chung</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Nhà Cộng là nền tảng kết nối chủ nhà và người thuê với trải nghiệm nhanh, minh bạch, hiệu quả.
                    Đăng tin dễ – tìm phòng đã mắt – xác thực rõ ràng – công cụ lọc sâu theo đúng nhu cầu.
                  </p>
                </div>
                <div className="group overflow-hidden rounded-2xl shadow-md border border-emerald-100">
                  <img
                    src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"
                    alt="Phòng ngủ hiện đại"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            </div>

            {/* stats under left block */}
            <div className="mt-5 grid w-full grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              {[{ v: "150+", l: "Địa điểm", I: Building2 }, { v: "200+", l: "Số phòng trọ", I: Home }, { v: "350+", l: "Khách hàng", I: Users2 }].map(
                (s, i) => (
                  <div key={i} className="h-full rounded-xl border border-emerald-100 bg-white p-3 shadow">
                    <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                      {React.createElement(s.I, { className: "h-4 w-4" })}
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-700">{s.v}</p>
                    <p className="text-xs text-emerald-700/80">{s.l}</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right: Big hero image */}
          <div className="grid content-start gap-4">
            <div className="group overflow-hidden rounded-2xl shadow-md border border-emerald-100">
              <img
                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"
                alt="Không gian thông tầng ấm cúng"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ========== SỨ MỆNH ========== */}
      <section className="bg-emerald-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid items-center gap-7 md:grid-cols-2">
            <div>
              <p className="text-[22px] font-black uppercase tracking-wide text-emerald-900">
                SỨ MỆNH CỦA CHÚNG TÔI
              </p>
              <p className="mt-3 text-slate-700">
                Mang đến giải pháp nhà ở toàn diện – từ thiết kế, thi công, đến trải nghiệm nội thất – giúp bạn an cư
                và khẳng định phong cách sống. Chúng tôi không chỉ xây nhà, chúng tôi xây dựng niềm tin và hạnh phúc.
              </p>
              <ul className="mt-5 space-y-3 text-slate-700">
                {[
                  "Trải nghiệm di động mượt mà – tìm phòng quanh bạn theo GPS.",
                  "Hình ảnh rõ nét, nội dung chuẩn SEO, loại bỏ tin rác.",
                  "Hỗ trợ nhanh, đội ngũ CSKH thân thiện, nhiệt tình.",
                ].map((li, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> {li}
                  </li>
                ))}
              </ul>
            </div>
            <div className="group overflow-hidden rounded-2xl shadow-md border border-emerald-100">
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1300&q=80"
                alt="Sứ mệnh hình minh họa"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== GIÁ TRỊ CỐT LÕI ========== */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h2 className="text-3xl font-extrabold text-emerald-900">Giá Trị Cốt Lõi</h2>
            <ul className="mt-6 space-y-5 text-slate-700">
              {[
                {
                  t: "Chất lượng đỉnh cao",
                  d:
                    "Kiểm soát nghiêm ngặt từ thiết kế đến thi công. Vật liệu – quy trình – đội ngũ theo chuẩn quốc tế để mang lại sản phẩm bền và đẹp.",
                },
                {
                  t: "Sáng tạo không giới hạn",
                  d:
                    "Luôn cập nhật xu hướng kiến trúc, công nghệ xây dựng mới; tối ưu công năng và thẩm mỹ cho từng dự án.",
                },
                {
                  t: "Tận tâm từng chi tiết",
                  d:
                    "Lắng nghe nhu cầu riêng, đồng hành xuyên suốt từ ý tưởng – hiện thực hoá – bàn giao không gian sống.",
                },
                {
                  t: "Uy tín & trách nhiệm",
                  d:
                    "Cam kết đúng hẹn và chất lượng, được khách hàng tin yêu qua thời gian.",
                },
              ].map((it, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900">{it.t}</p>
                    <p className="text-[15px] leading-relaxed text-slate-700">{it.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid content-start gap-4">
            <img
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1300&q=80"
              alt="Nhà mẫu hiện đại"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02]"
            />
            <img
              src="https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1300&q=80"
              alt="Phòng khách tối giản"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="aspect-[16/10] w-full rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* ========== TẦM NHÌN & ĐỊNH HƯỚNG ========== */}
      <section className="bg-emerald-50/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-extrabold text-emerald-900">Tầm Nhìn & Định Hướng Phát Triển</h3>
              <p className="mt-3 text-slate-700">
                Mục tiêu trở thành nền tảng thuê trọ dẫn đầu Việt Nam với hệ sinh thái dịch vụ thông minh, an toàn, minh bạch.
              </p>
              <p className="mt-2 text-slate-700">
                Đầu tư mạnh vào công nghệ, con người và quy trình chất lượng – tập trung trải nghiệm và hiệu quả cho cả chủ nhà lẫn người thuê.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
              ].map((src, i) => (
                <div key={i} className="group overflow-hidden rounded-2xl shadow-md border border-emerald-100">
                  <img
                    src={src}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    alt={`Interior ${i + 1}`}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h3 className="text-2xl font-extrabold text-emerald-900">Khách hàng nói gì?</h3>
        <p className="mt-1 text-slate-600">Những trải nghiệm thật từ chủ nhà và người thuê trên nền tảng.</p>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Chủ nhà – Quận 7",
              text:
                "Tìm phòng quanh đây, giá, diện tích, ban công… đúng nhu cầu. UI mượt mà, duyệt rất sướng mắt.",
            },
            {
              name: "Người thuê – Cầu Giấy",
              text:
                "Ảnh rõ, mô tả chi tiết, lọc theo khu vực cực nhanh. Mình chốt phòng trong 3 ngày.",
            },
            {
              name: "Chủ nhà – Đống Đa",
              text:
                "Quy trình xác thực gọn, có thống kê lượt xem để điều chỉnh giá – rất hữu ích.",
            },
            {
              name: "Người thuê – Thủ Đức",
              text:
                "Bản đồ trực quan, lọc sâu theo nhu cầu; thông tin minh bạch, đáng tin.",
            },
          ].map((c, i) => (
            <article key={i} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-center gap-2 text-amber-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Quote className="mb-3 h-6 w-6 text-emerald-300" />
              <p className="text-[15px] leading-relaxed text-slate-700">{c.text}</p>
              <p className="mt-3 text-sm font-medium text-emerald-800">{c.name}</p>
            </article>
          ))}
        </div>

        {/* Slider (using react-slideshow-image) */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-100">
          <Slide autoplay infinite duration={4000} transitionDuration={600} canSwipe pauseOnHover arrows indicators>
            {[
              "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=80",
              "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=80",
              "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=80",
            ].map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt={`Slider ${i + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-72 w-full object-cover md:h-96"
                />
              </div>
            ))}
          </Slide>
        </div>
      </section>
    </main>
  );
}
