import Link from "next/link";
import { Check, Star } from "lucide-react";
import { Fragment } from "react";

export default function BangGiaPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-6 py-10">
      <header className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Bảng giá mô hình căn hộ cho thuê</h1>
        <p className="mt-1 text-slate-500 text-sm">(Bảng giá đã bao gồm thuế VAT)</p>
      </header>

      {/* Pricing table */}
      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[1200px] rounded-3xl border border-gray-200 bg-white shadow overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[320px_1fr_1fr_1fr_1fr] gap-4 px-0 border-b border-b-gray-200">
            <div className="px-4 relative pt-6 pb-4 break-words">
              <div className="rounded-xl bg-gray-100 text-slate-700 text-center py-3 font-semibold">
                Mô hình căn hộ
              </div>
            </div>
            <div className="px-4 relative pt-6">
              <div className="rounded-xl bg-orange-500 text-white text-center py-3 font-bold">Cơ bản</div>
            </div>
            <div className="px-4 relative pt-6">
              <div className="rounded-xl bg-fuchsia-700 text-white text-center py-3 font-bold">Nâng cao</div>
            </div>
            <div className="px-4 relative pt-6">
              <div className="relative rounded-xl bg-red-600 text-white text-center py-3 font-bold">
                <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 text-white text-xs px-3 py-1 shadow">
                  <Star className="w-3 h-3" /> Phổ biến
                </div>
                Cao cấp
              </div>
            </div>
            <div className="px-4 relative pt-6">
              <div className="rounded-xl bg-blue-700 text-white text-center py-3 font-bold">Chuyên nghiệp</div>
            </div>
          </div>

          {/* Feature rows */}
          <div className="mt-2 grid grid-cols-[320px_1fr_1fr_1fr_1fr] gap-4">
            {/* Row: Căn hộ tối đa */}
            <div className="px-4 py-3 border-t border-t-gray-200 text-slate-700 bg-slate-50">Căn hộ tối đa</div>
            <div className="px-4 py-3 border-t border-t-gray-200 text-center text-slate-700 bg-slate-50">20</div>
            <div className="px-4 py-3 border-t border-t-gray-200 text-center text-slate-700 bg-slate-50">50</div>
            <div className="px-4 py-3 border-t border-t-gray-200 text-center text-slate-700 bg-slate-50">100</div>
            <div className="px-4 py-3 border-t border-t-gray-200 text-center text-slate-700 bg-slate-50">200-500</div>

            {[
              "Quản lý hợp đồng, khách hàng",
              "Quản lý tài chính, thu/chi",
              "Quản lý tài sản, thiết bị",
              "Quản lý nhân viên, phân quyền",
              "Quản lý sự cố, công việc, thông báo",
              "Thống kê báo cáo",
            ].map((feature, idx) => (
                <Fragment key={`feature-row-${idx}`}>
                <div className={`px-4 py-3 border-t border-t-gray-200 text-slate-700 break-words ${idx % 2 ? 'bg-slate-50' : 'bg-white'}`}>{feature}</div>
                <div className={`px-4 py-3 border-t border-t-gray-200 grid place-items-center ${idx % 2 ? 'bg-slate-50' : 'bg-white'}`}>
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className={`px-4 py-3 border-t border-t-gray-200 grid place-items-center ${idx % 2 ? 'bg-slate-50' : 'bg-white'}`}>
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className={`px-4 py-3 border-t border-t-gray-200 grid place-items-center ${idx % 2 ? 'bg-slate-50' : 'bg-white'}`}>
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className={`px-4 py-3 border-t border-t-gray-200 grid place-items-center ${idx % 2 ? 'bg-slate-50' : 'bg-white'}`}>
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                </Fragment>
            ))}

            {/* Price blocks */}
            <div className="px-4 py-6 border-t border-t-gray-200" />
            <div className="px-4 py-6 border-t border-t-gray-200">
              <div className="rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-200 text-center p-4">
                <div className="text-rose-600 text-xl font-bold">219,000 đ</div>
                <div className="text-xs text-slate-500 mt-1">20 căn hộ/tháng</div>
                <Link href="/dang-ky" className="mt-3 inline-block rounded-xl bg-orange-500 text-white px-4 py-2 font-semibold hover:bg-orange-600">
                  Dùng thử miễn phí
                </Link>
              </div>
            </div>
            <div className="px-4 py-6 border-t border-t-gray-200">
              <div className="rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-200 text-center p-4">
                <div className="text-fuchsia-700 text-xl font-bold">439,000 đ</div>
                <div className="text-xs text-slate-500 mt-1">50 căn hộ/tháng</div>
                <Link href="/dang-ky" className="mt-3 inline-block rounded-xl bg-fuchsia-700 text-white px-4 py-2 font-semibold hover:bg-fuchsia-800">
                  Dùng thử miễn phí
                </Link>
              </div>
            </div>
            <div className="px-4 py-6 border-t border-t-gray-200">
              <div className="rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-200 text-center p-4">
                <div className="text-red-600 text-xl font-bold">879,000 đ</div>
                <div className="text-xs text-slate-500 mt-1">100 căn hộ/tháng</div>
                <Link href="/dang-ky" className="mt-3 inline-block rounded-xl bg-red-600 text-white px-4 py-2 font-semibold hover:bg-red-700">
                  Dùng thử miễn phí
                </Link>
              </div>
            </div>
            <div className="px-4 py-6 border-t border-t-gray-200">
              <div className="rounded-xl bg-white shadow-sm hover:shadow-md border border-gray-200 text-center p-4">
                <div className="text-blue-700 text-xl font-bold">7,900 đ</div>
                <div className="text-xs text-slate-500 mt-1">1 căn hộ/tháng</div>
                <Link href="/dang-ky" className="mt-3 inline-block rounded-xl bg-blue-700 text-white px-4 py-2 font-semibold hover:bg-blue-800">
                  Dùng thử miễn phí
                </Link>
              </div>
            </div>
          </div>
          <div className="px-4 py-4 text-[13px] text-slate-500 border-t border-t-gray-200">
            Ghi chú: Giá đã bao gồm VAT. Tính năng có thể thay đổi theo phiên bản; vui lòng liên hệ để nhận tư vấn gói phù hợp.
          </div>
        </div>
      </div>
    </main>
  );
}
