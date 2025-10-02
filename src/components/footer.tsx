"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import logo from "../assets/logo-trang.png";
import Image from "next/image";
import { toSlug } from "@/utils/formatSlug";
import { capitalizeWords } from "@/utils/capitalizeWords";

export default function Footer() {
  
  return (
    <footer className="bg-[#222] text-gray-300 py-10 px-4">
      <div className="max-w-screen-xl mx-auto px-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái */}
        <div>
            <a href="/">
                <Image src={logo} alt="Logo" width={150} priority />
            </a>

          <div className="mt-3 space-y-1 text-sm">
            <p>
              <Link href="#" className="hover:underline">
                Giới thiệu
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:underline">
                Liên hệ
              </Link>
            </p>
            <p>
              <Link href="#" className="hover:underline">
                Điều Khoản
              </Link>{" "}
              |{" "}
              <Link href="#" className="hover:underline">
                Chính Sách Bảo Mật
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-100">
              Liên hệ đặt quảng cáo
            </h3>
            <p className="text-sm mt-2">Email: info@nettruyenonline.com</p>
            <p className="text-sm">Telegram: @nettruyenonline</p>
            <p className="text-sm mt-2">Copyright © 2025 <a href="https://nhacong.com/"><b>nhacong.com</b></a></p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="col-span-2">

          <div className="pt-5">
            <h3 className="text-lg font-semibold text-gray-100">
              Miễn trừ trách nhiệm
            </h3>
            <p className="text-sm mt-2 leading-relaxed">
              Trang web của chúng tôi chỉ cung cấp dịch vụ đọc <a href="https://nhacong.com/"><b>nhacong.com </b></a>
              với mục đích giải trí và chia sẻ nội dung. Toàn bộ các
              truyện trên <a href="https://nhacong.com/"><b>nhacong.com</b></a> được đăng tải trên trang web được sưu tầm từ nhiều
              nguồn trên internet và chúng tôi không chịu trách nhiệm về bản quyền
              hoặc quyền sở hữu đối với bất kỳ nội dung nào. Nếu bạn là chủ sở hữu
              bản quyền và cho rằng nội dung trên trang vi phạm quyền của bạn, vui
              lòng liên hệ với chúng tôi để chúng tôi tiến hành gỡ bỏ nội dung vi
              phạm một cách kịp thời.
            </p>
            <p className="text-sm mt-3 leading-relaxed">
              Ngoài ra, chúng tôi không chịu trách nhiệm về các nội dung quảng cáo
              hiển thị trên trang web <a href="https://nhacong.com/"><b>nhacong.com</b></a>, bao gồm nhưng không giới hạn ở việc quảng
              cáo sản phẩm hoặc dịch vụ của bên thứ ba. Bất kỳ giao dịch nào xảy
              ra giữa bạn và các bên quảng cáo đều không phải là trách nhiệm của
              chúng tôi. Người sử dụng nên cân nhắc và chịu trách nhiệm khi tương
              tác với các quảng cáo đó.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
