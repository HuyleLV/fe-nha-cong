"use client";

import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-screen-xl px-4 py-10 lg:py-12">
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:p-10">
          <h1 className="mb-6 text-center text-2xl font-bold uppercase tracking-wide text-slate-900 lg:text-3xl">
            CHÍNH SÁCH BẢO MẬT
          </h1>

          {/* 1. Mục đích và phạm vi thu thập */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              1. Mục đích và phạm vi thu thập
            </h2>

            <h3 className="font-semibold text-slate-900">
              + Mục đích thu thập thông tin:
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">
              Website nhacong.com.vn thu thập thông tin khách hàng để điều chỉnh các
              nội dung thông tin về hàng hóa mà người dùng đăng tải, sao cho phù
              hợp với bố cục và nội dung của website cung cấp dịch vụ; Thông
              báo đến khách hàng về tình trạng xử lý đơn hàng; quản lý thông tin
              phục vụ cho hoạt động hỗ trợ kỹ thuật và giải quyết tranh chấp
              khiếu nại (nếu có), để hồi đáp những câu hỏi hay thực hiện các yêu
              cầu khác của khách hàng.
            </p>

            <h3 className="font-semibold text-slate-900">+ Phạm vi thu thập:</h3>
            <p className="text-sm leading-relaxed text-slate-700">
              Đối với Người sử dụng dịch vụ lưu trú/nhà hàng/cho thuê xe:
              nhacong.com.vn sẽ thu thập các thông tin của Người cung cấp dịch vụ bao
              gồm: Tên, địa chỉ, email, số điện thoại. Đây là các thông tin bắt
              buộc khi đăng ký để phục vụ xác nhận, hỗ trợ và đảm bảo quyền lợi
              cho người dùng.
            </p>
          </section>

          {/* 2. Phạm vi sử dụng thông tin */}
          <section className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              2. Phạm vi sử dụng thông tin
            </h2>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li>Hỗ trợ, giải đáp thắc mắc của khách hàng;</li>
              <li>Cung cấp thông tin nếu khách hàng đăng ký nhận email;</li>
              <li>Ngăn ngừa các hành vi phá hoại tài khoản hoặc giả mạo;</li>
              <li>Liên hệ và giải quyết các tình huống đặc biệt;</li>
              <li>Hỗ trợ hoạt động CSKH và tiếp nhận phản hồi;</li>
              <li>
                Cung cấp thông tin khi có yêu cầu từ cơ quan chức năng theo quy
                định pháp luật.
              </li>
            </ul>
          </section>

          {/* 3. Các bên thứ ba */}
          <section className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              3. Các bên thứ ba được quyền tiếp cận thông tin
            </h2>

            <p className="text-sm leading-relaxed text-slate-700">
              Website nhacong.com.vn không bán thông tin khách hàng. Chỉ chia sẻ cho
              các bên thứ ba sau:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li>
                Các đối tác thực hiện một phần dịch vụ theo hợp đồng đã ký;
              </li>
              <li>
                Cơ quan nhà nước khi có yêu cầu phục vụ điều tra theo pháp luật.
              </li>
            </ul>
          </section>

          {/* 4. Thời gian lưu trữ */}
          <section className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              4. Thời gian lưu trữ thông tin
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Dữ liệu cá nhân được lưu trữ đến khi khách hàng yêu cầu hủy bỏ.
              Thời gian lưu trữ tối thiểu 02 năm và tối đa 10 năm, có thể gia
              tăng nếu cần thiết.
            </p>
          </section>

          {/* 5. Địa chỉ của đơn vị thu thập & quản lý thông tin – ĐÃ THAY BẰNG 3 DÒNG BẠN YÊU CẦU */}
          <section className="mt-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              5. Địa chỉ của đơn vị thu thập và quản lý thông tin cá nhân
            </h2>

            {/* 🔥 Thông tin bạn yêu cầu thay thế */}
            <p className="mt-3 text-base leading-relaxed text-emerald-700">
              Địa chỉ:{" "}
              <span className="font-semibold text-emerald-900">
                số 27 liền kề 7, KĐT Văn Khê, La Khê, Hà Đông, Hà Nội
              </span>
            </p>

            <p className="mt-1 text-base text-emerald-700">
              CSKH:{" "}
              <span className="font-semibold text-emerald-900">
                0968.345.486
              </span>
            </p>

            <p className="mt-1 text-base text-emerald-700">
              Email:{" "}
              <span className="font-semibold text-emerald-900">
                hotro@nhacong.com.vn
              </span>
            </p>
          </section>

          {/* 6. Phương tiện chỉnh sửa thông tin */}
          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              6. Phương tiện để người dùng tiếp cận & chỉnh sửa dữ liệu cá nhân
            </h2>

            <p className="text-sm leading-relaxed text-slate-700">
              Khách hàng có quyền kiểm tra, cập nhật, điều chỉnh hoặc yêu cầu
              Công ty hỗ trợ chỉnh sửa dữ liệu cá nhân bất kỳ lúc nào.
            </p>
          </section>

          {/* 7. Cam kết bảo mật */}
          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              7. Cam kết bảo mật thông tin cá nhân
            </h2>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li>
                Không chia sẻ hay tiết lộ thông tin cá nhân khi chưa được phép
                của người dùng;
              </li>
              <li>
                Nếu bị hacker tấn công, sẽ thông báo cơ quan chức năng và người
                dùng;
              </li>
              <li>
                Người dùng phải tự chịu trách nhiệm về tính chính xác và hợp
                pháp của thông tin cung cấp;
              </li>
              <li>
                Không chịu trách nhiệm nếu rò rỉ thông tin do lỗi kỹ thuật, lỗi
                đường truyền, phần mềm hoặc sự cố bất khả kháng khác.
              </li>
            </ul>
          </section>

          {/* 8. Khiếu nại */}
          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              8. Cơ chế tiếp nhận & giải quyết khiếu nại
            </h2>

            <p className="text-sm leading-relaxed text-slate-700">
              Người tiêu dùng có thể gửi khiếu nại khi phát hiện thông tin cá
              nhân bị sử dụng sai mục đích qua các hình thức:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li>Gọi hotline: 0968.345.486</li>
              <li>Email: hotro@nhacong.com.vn</li>
              <li>
                Gửi văn bản hoặc đến trực tiếp địa chỉ: số 27 liền kề 7, KĐT
                Văn Khê, La Khê, Hà Đông, Hà Nội
              </li>
            </ul>

            <p className="text-sm leading-relaxed text-slate-700">
              Thời gian xử lý khiếu nại: tối đa 05 ngày làm việc kể từ ngày tiếp
              nhận thông tin.
            </p>

            <p className="text-sm leading-relaxed text-slate-700">
              Nếu thương lượng không thành, hai bên có quyền đưa vụ việc ra tòa
              án có thẩm quyền.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
