"use client";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-emerald-900 py-10 text-emerald-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-6 w-6" /> NHÀ CỘNG
            </div>
            <p className="mt-2 text-sm text-emerald-100/80">
              Địa chỉ: số 27 liền kề 7, KĐT Văn Khê, La Khê, Hà Đông, Hà Nội
            </p>
            <p className="mt-1 text-sm">CSKH: 0968.345.486</p>
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
            <p className="font-semibold">Kênh</p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-100/90">
              <li><a href="#" className="hover:underline">Facebook</a></li>
              <li><a href="#" className="hover:underline">Zalo</a></li>
              <li><a href="#" className="hover:underline">Instagram</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Liên hệ</p>
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
