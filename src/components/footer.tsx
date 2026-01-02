"use client";
import Link from "next/link";
import logo from "@/assets/logo-mau.png";
import facebook from "@/assets/facebook.png";
import zalo from "@/assets/zalo.png";
import tiktok from "@/assets/tiktok.png";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-emerald-100/60 py-12 text-emerald-800">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <img loading="lazy" src={logo.src} alt="Nhà Cộng" className="object-contain" />
            </div>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-emerald-700">
              Địa chỉ: <span className="font-semibold text-emerald-900">số 27 liền kề 7, KĐT Văn Khê, La Khê, Hà Đông, Hà Nội</span>
            </p>
            <p className="mt-1 text-base text-emerald-700">CSKH: <span className="font-semibold text-emerald-900">0968.345.486</span></p>
            <p className="mt-1 text-base text-emerald-700">Email: <span className="font-semibold text-emerald-900">hotro@nhacong.com.vn</span></p>
            {/* Social icons */}
            <div className="mt-3 flex items-center gap-3">
              <a
                href={"https://www.facebook.com/share/17gWbnK2gc/?mibextid=wwXIfr"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                title="Facebook"
              >
                <img loading="lazy" src={facebook.src} alt="Facebook" className="h-6 w-6" />
              </a>
              <a
                href="https://zalo.me/2661388511949942518"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                title="Zalo"
              >
                <img loading="lazy" src={zalo.src} alt="Zalo" className="h-6 w-6" />
              </a>
              <a
                href="https://www.tiktok.com/@nhacongolacong1?_r=1&_t=ZS-916loNG8MSI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                title="TikTok"
              >
                <img loading="lazy" src={tiktok.src} alt="TikTok" className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Về Nhà Cộng</p>
            <ul className="mt-3 space-y-1 text-base text-emerald-700">
              <li>
                <Link href="/ve-chung-toi" className="font-medium text-emerald-700 transition hover:text-emerald-900">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-emerald-700 transition hover:text-emerald-900">Dành cho chủ nhà</Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-emerald-700 transition hover:text-emerald-900">Dành cho khách thuê</Link>
              </li>
              <li>
                <Link href="/tuyen-dung" className="font-medium text-emerald-700 transition hover:text-emerald-900">Cơ hội nghề nghiệp</Link>
              </li>
              <li>
                <Link href="#" className="font-medium text-emerald-700 transition hover:text-emerald-900">Hỗ trợ</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Chính sách</p>
            <ul className="mt-3 space-y-1 text-base text-emerald-700">
              <li><Link href="/dieu-khoan-su-dung" className="font-medium text-emerald-700 transition hover:text-emerald-900">Điều khoản sử dụng</Link></li>
              <li><Link href="/chinh-sach-bao-mat" className="font-medium text-emerald-700 transition hover:text-emerald-900">Chính sách bảo mật</Link></li>
              <li><a href="#" className="font-medium text-emerald-700 transition hover:text-emerald-900">Chính sách cộng đồng</a></li>
              <li><a href="#" className="font-medium text-emerald-700 transition hover:text-emerald-900">Chính sách quyền riêng tư</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Tin tức</p>
            <ul className="mt-3 space-y-1 text-base text-emerald-700">
              <li><a href="/blog" className="font-medium text-emerald-700 transition hover:text-emerald-900">Ưu đãi</a></li>
              <li><a href="#" className="font-medium text-emerald-700 transition hover:text-emerald-900">Blog/Thuê nhà</a></li>
            </ul> 
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Theo dõi chúng tôi</p>
            <ul className="mt-3 space-y-1 text-base text-emerald-700">
              <li><a href="https://www.facebook.com/share/17gWbnK2gc/?mibextid=wwXIfr" className="font-medium text-emerald-700 transition hover:text-emerald-900">Facebook</a></li>
              <li><a href="https://www.tiktok.com/@nhacongolacong1?_r=1&_t=ZS-916loNG8MSI" className="font-medium text-emerald-700 transition hover:text-emerald-900">Tiktok</a></li>
              <li><a href="https://www.tiktok.com/@nhacongolacong1?_r=1&_t=ZS-916loNG8MSI" className="font-medium text-emerald-700 transition hover:text-emerald-900">Instagram</a></li>
              <li><a href="https://www.tiktok.com/@nhacongolacong1?_r=1&_t=ZS-916loNG8MSI" className="font-medium text-emerald-700 transition hover:text-emerald-900">Youtube</a></li>
              <li><a href="https://zalo.me/2661388511949942518" className="font-medium text-emerald-700 transition hover:text-emerald-900">Zalo</a></li>
            </ul> 
          </div>
        </div>
        <div className="mt-10 border-t border-emerald-100 pt-5 text-center text-sm text-emerald-700">
          © {year} <span className="font-semibold text-emerald-900">Nhà Cộng</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
