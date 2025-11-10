"use client";
import Link from "next/link";
import logo from "@/assets/logo-mau.png";
import facebook from "@/assets/facebook.png";
import zalo from "@/assets/zalo.png";
import tiktok from "@/assets/tiktok.png";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 py-10 text-emerald-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <img src={logo.src} alt="Nhà Cộng" className="object-contain" />
            </div>
            <p className="mt-2 text-sm">
              Địa chỉ: số 27 liền kề 7, KĐT Văn Khê, La Khê, Hà Đông, Hà Nội
            </p>
            <p className="mt-1 text-sm">CSKH: 0968.345.486</p>
            <p className="mt-1 text-sm">Email: hotro@nhacong.com.vn</p>
            {/* Social icons */}
            <div className="mt-2 flex items-center gap-2">
              <a
                href={"https://www.facebook.com/share/17gWbnK2gc/?mibextid=wwXIfr"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                title="Facebook"
              >
                <img src={facebook.src} alt="Facebook" className="h-6 w-6" />
              </a>
              <a
                href="https://zalo.me/2661388511949942518"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zalo"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                title="Zalo"
              >
                <img src={zalo.src} alt="Zalo" className="h-6 w-6" />
              </a>
              <a
                href="https://www.tiktok.com/@nhacongolacong1?_r=1&_t=ZS-916loNG8MSI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                title="TikTok"
              >
                <img src={tiktok.src} alt="TikTok" className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <p className="font-semibold">Về Nhà Cộng</p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100/90">
              <li>
                <Link href="/ve-chung-toi" className="hover:underline">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Dành cho chủ nhà</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Dành cho khách thuê</Link>
              </li>
              <li>
                <Link href="/tuyen-dung" className="hover:underline">Cơ hội nghề nghiệp</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Hỗ trợ</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Chính sách</p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100/90">
              <li><a href="#" className="hover:underline">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:underline">Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Tin tức</p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100/90">
              <li><a href="/blog" className="hover:underline">Blog</a></li>
            </ul> 
          </div>
          <div>
            <p className="font-semibold">Theo dõi chúng tôi</p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100/90">
              <li><a href="https://www.facebook.com/share/17gWbnK2gc/?mibextid=wwXIfr" className="hover:underline">Facebook</a></li>
              <li><a href="https://www.tiktok.com/@nhacongolacong1?_r=1&_t=ZS-916loNG8MSI" className="hover:underline">Tiktok</a></li>
            </ul> 
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-emerald-100/70">
          © {year} Nhà Cộng. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
