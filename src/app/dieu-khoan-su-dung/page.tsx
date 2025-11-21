"use client";

import React from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <div className="max-w-screen-2xl mx-auto px-12 py-16">
        <Panel title="Điều khoản sử dụng">
          <div id="top" />
          <div className="flex items-start justify-between mb-6">
            <div className="text-sm text-slate-600">Cập nhật: <span className="font-medium">21/11/2025</span></div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                In / Lưu PDF
              </button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <aside className="hidden md:block md:col-span-1 md:pr-6">
              <nav className="sticky top-28 space-y-3 text-sm w-56">
                <a href="#gioi-thieu" className="block text-emerald-700 hover:underline">Giới thiệu</a>
                <a href="#pham-vi" className="block text-emerald-700 hover:underline">Phạm vi thu thập</a>
                <a href="#muc-dich" className="block text-emerald-700 hover:underline">Mục đích sử dụng</a>
                <a href="#luu-tru" className="block text-emerald-700 hover:underline">Thời gian lưu trữ</a>
                <a href="#chia-se" className="block text-emerald-700 hover:underline">Chia sẻ dữ liệu</a>
                <a href="#quyen" className="block text-emerald-700 hover:underline">Quyền người dùng</a>
                <a href="#baomat" className="block text-emerald-700 hover:underline">Bảo mật</a>
              </nav>
            </aside>
            <section className="md:col-span-3">
              <article className="mx-auto max-w-4xl space-y-10 text-slate-700">
                <header className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Điều khoản sử dụng</h1>
                  <p className="text-sm text-slate-500">Cập nhật: <span className="font-medium text-slate-700">21/11/2025</span> — Phiên bản 1.0</p>
                </header>

                <div className="prose prose-slate prose-lg lg:prose-xl">
                  <section id="gioi-thieu" className="space-y-4">
                    <h2 className="font-bold text-slate-800">GIỚI THIỆU</h2>
                    <p className="leading-relaxed text-slate-700">Nhà Cộng tôn trọng quyền riêng tư và bảo vệ thông tin cá nhân của người dùng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn khi sử dụng website và ứng dụng Nhà Cộng. Việc sử dụng Nhà Cộng ngụ ý bạn đồng ý với các điều khoản được mô tả trong tài liệu này.</p>
                  </section>

                  <section id="pham-vi" className="space-y-4">
                    <h3 className="font-bold text-slate-800">PHẠM VI THU THẬP DỮ LIỆU CÁ NHÂN</h3>
                    <p className="leading-relaxed">Chúng tôi chỉ thu thập dữ liệu cần thiết cho việc cung cấp dịch vụ. Các loại dữ liệu có thể bao gồm:</p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li><strong>Thông tin liên hệ:</strong> số điện thoại, tên, email (nếu được cung cấp).</li>
                      <li><strong>Thông tin tài khoản:</strong> dữ liệu đăng ký, tên hiển thị, ảnh hồ sơ.</li>
                      <li><strong>Thông tin bất động sản (đối với chủ nhà):</strong> địa chỉ, mô tả, ảnh, mức giá, tiện ích.</li>
                      <li><strong>Dữ liệu kỹ thuật:</strong> địa chỉ IP, loại thiết bị, hệ điều hành, thông tin trình duyệt.</li>
                      <li><strong>Dữ liệu hành vi:</strong> lịch sử tương tác, lượt xem bài đăng, tìm kiếm, v.v.</li>
                      <li><strong>Cookies và công nghệ theo dõi:</strong> để cải thiện trải nghiệm và cá nhân hóa nội dung.</li>
                    </ul>
                  </section>

                  <section id="muc-dich" className="space-y-4">
                    <h3 className="font-bold text-slate-800">MỤC ĐÍCH SỬ DỤNG DỮ LIỆU</h3>
                    <p className="leading-relaxed">Chúng tôi sử dụng dữ liệu cho các mục đích chính sau:</p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li>Cung cấp, quản lý và cải thiện dịch vụ.</li>
                      <li>Xác thực người dùng, hỗ trợ liên hệ giữa người thuê và chủ nhà.</li>
                      <li>Gửi thông báo hệ thống và cập nhật quan trọng.</li>
                      <li>Phân tích hành vi để nâng cao trải nghiệm và hiệu suất sản phẩm.</li>
                      <li>Phục vụ cho mục đích tuân thủ pháp luật và xử lý khiếu nại, tranh chấp.</li>
                    </ul>
                  </section>

                  <section id="luu-tru" className="space-y-4">
                    <h3 className="font-bold text-slate-800">THỜI GIAN VÀ PHƯƠNG THỨC LƯU TRỮ</h3>
                    <p className="leading-relaxed">Dữ liệu được lưu trên hệ thống máy chủ được quản lý an toàn và chỉ trong thời gian cần thiết cho mục đích thu thập hoặc theo yêu cầu pháp luật. Thông tin nhạy cảm (ví dụ: mật khẩu) được mã hóa trước khi lưu trữ.</p>
                  </section>

                  <section id="chia-se" className="space-y-4">
                    <h3 className="font-bold text-slate-800">CHIA SẺ VỚI BÊN THỨ BA</h3>
                    <p className="leading-relaxed">Chúng tôi không bán dữ liệu cá nhân. Dữ liệu có thể được chia sẻ với nhà cung cấp dịch vụ, đối tác hạ tầng, công cụ phân tích hoặc cơ quan có thẩm quyền khi có yêu cầu hợp pháp. Mọi đối tác đều bị ràng buộc bởi hợp đồng bảo mật.</p>
                  </section>

                  <section id="quyen" className="space-y-4">
                    <h3 className="font-bold text-slate-800">QUYỀN CỦA NGƯỜI DÙNG</h3>
                    <p className="leading-relaxed">Bạn có quyền truy cập, chỉnh sửa, xóa, và rút lại quyền đồng ý xử lý dữ liệu của mình theo quy định pháp luật. Để thực hiện quyền, liên hệ theo thông tin ở phần Liên hệ bên dưới.</p>
                  </section>

                  <section id="baomat" className="space-y-4">
                    <h3 className="font-bold text-slate-800">BẢO MẬT</h3>
                    <p className="leading-relaxed">Nhà Cộng áp dụng các biện pháp kỹ thuật và tổ chức để bảo vệ dữ liệu, bao gồm mã hóa, phân quyền truy cập, và sao lưu định kỳ nhằm giảm thiểu rủi ro mất mát hoặc truy cập trái phép.</p>
                  </section>

                  <section id="thay-doi-chinh-sach" className="space-y-4">
                    <h3 className="font-bold text-slate-800">THAY ĐỔI CHÍNH SÁCH</h3>
                    <p className="leading-relaxed">Chính sách này có thể được cập nhật. Mọi thay đổi sẽ được đăng trên trang này kèm ngày hiệu lực. Nếu thay đổi ảnh hưởng đáng kể đến quyền lợi người dùng, chúng tôi sẽ thông báo rõ ràng.</p>
                  </section>

                  <section id="lien-he" className="space-y-4">
                    <h3 className="font-bold text-slate-800">LIÊN HỆ</h3>
                    <p className="leading-relaxed">Mọi câu hỏi hoặc yêu cầu liên quan đến chính sách bảo mật xin gửi về: <a className="text-emerald-700" href="mailto:hotro@nhacong.com.vn">hotro@nhacong.com.vn</a>.</p>
                  </section>
                </div>

                <div className="border-t pt-6 text-sm text-slate-500">
                  <a href="#top" className="text-emerald-700 hover:underline">Quay lên đầu trang</a>
                </div>
              </article>
            </section>
          </div>
        </Panel>

      </div>
    </main>
  );
}
