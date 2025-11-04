"use client";
import Link from "next/link";
import logo from "@/assets/logo-mau.png";
import facebook from "@/assets/facebook.png";
import zalo from "@/assets/zalo.png";
import insta from "@/assets/instagram.png";

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
            <p className="mt-1 text-sm">Email: hotro.nhacong@gmail.com</p>
            {/* Social icons */}
            <div className="mt-2 flex items-center gap-2">
              <a
                href={"https://m.me/2041745982787369"}
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
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                title="Instagram"
              >
                <img src={insta.src} alt="Instagram" className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <p className="font-semibold">Về Nhà Cộng</p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100/90">
              <li>
                <Link href="/ve-chung-toi" className="hover:underline">Giới thiệu</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Quy chế hoạt động sàn</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Giải quyết tranh chấp</Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">Điều khoản sử dụng</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Về sản phẩm/ dịch vụ</p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100/90">
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Zalo</a></li>
              <li><a href="#" className="hover:underline">Instagram</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Chương trình</p>
            <p className="mt-2 text-sm text-emerald-100/80">Email: hotro.nhacong@gmail.com</p>
          </div>
          <div>
            <p className="font-semibold">Đối tác</p>
            <p className="mt-2 text-sm text-emerald-100/80">Email: hotro.nhacong@gmail.com</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-emerald-100/70">
          © {year} Nhà Cộng. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
