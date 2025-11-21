"use client";

import clsx from "clsx";
import Link from "next/link";
import { Slide } from "react-slideshow-image";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import "react-slideshow-image/dist/styles.css";

export interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Tiền thuê phòng được tính và thanh toán như thế nào?",
    answer:
      "Thông thường, tiền thuê phòng được tính theo tháng, và người thuê sẽ thanh toán vào đầu hoặc cuối tháng tùy thỏa thuận. Một số chủ nhà yêu cầu đóng vào ngày cố định (ví dụ ngày 1 đến ngày 5 hằng tháng). Việc thanh toán có thể thực hiện bằng tiền mặt hoặc chuyển khoản ngân hàng. Khi thanh toán, người thuê nên yêu cầu hóa đơn hoặc biên nhận rõ ràng để tránh nhầm lẫn.",
  },
  {
    question:
      "Giá thuê có bao gồm tiền điện, nước, Internet và các chi phí khác không?",
    answer:
      "Tùy vào loại phòng và chính sách của chủ nhà. Nhiều nơi cho thuê chỉ bao gồm tiền phòng, còn điện, nước, Internet, rác thải… sẽ tính riêng. Giá điện, nước có thể tính theo đồng hồ riêng hoặc chia theo đầu người. Người thuê nên hỏi rõ cách tính các khoản này trước khi ký hợp đồng để tránh phát sinh mâu thuẫn.",
  },
  {
    question: "Khi thuê phòng, cần đặt cọc bao nhiêu tiền và dùng để làm gì?",
    answer:
      "Thông thường, người thuê phải đặt cọc từ 1 đến 2 tháng tiền phòng. Khoản tiền này đảm bảo người thuê giữ gìn tài sản, thực hiện đúng hợp đồng và không trả phòng đột ngột. Tiền cọc sẽ được hoàn trả khi người thuê kết thúc hợp đồng và bàn giao phòng trong tình trạng tốt. Nên yêu cầu giấy biên nhận tiền cọc để làm bằng chứng.",
  },
  {
    question: "Nếu muốn trả phòng trước hạn, có được hoàn lại tiền cọc không?",
    answer:
      "Tùy vào quy định hợp đồng. Nếu người thuê thông báo trước ít nhất 30 ngày và không vi phạm, không làm hư hỏng tài sản, đa số chủ nhà sẽ hoàn lại tiền cọc. Nếu trả phòng đột ngột hoặc không báo trước, có thể bị mất một phần hoặc toàn bộ tiền cọc.",
  },
  {
    question: "Có được phép nấu ăn trong phòng không?",
    answer:
      "Một số khu trọ cho phép nấu ăn bằng bếp điện, bếp từ hoặc nồi cơm điện, nhưng cấm dùng bếp gas để tránh cháy nổ. Một số nơi có khu bếp chung. Người thuê nên hỏi rõ và tuân thủ quy định về an toàn điện và vệ sinh.",
  },
  {
    question: "Giờ giấc ra vào phòng trọ có bị giới hạn không?",
    answer:
      "Nếu là khu trọ có quản lý hoặc chung chủ, thường sẽ có giờ đóng – mở cửa. Thuê phòng riêng hoặc căn hộ độc lập thì có thể ra vào 24/24. Dù vậy, người thuê vẫn nên tôn trọng giờ giấc chung, tránh gây tiếng ồn vào ban đêm.",
  },
  {
    question: "Có được nuôi thú cưng trong phòng trọ không?",
    answer:
      "Tùy chính sách của chủ nhà. Một số nơi cho phép nuôi thú cưng nhỏ nếu đảm bảo vệ sinh và không gây phiền hàng xóm. Một số khu trọ hoặc chung cư mini cấm hoàn toàn. Người thuê nên hỏi kỹ và ghi rõ trong hợp đồng.",
  },
  {
    question: "Khách đến chơi có được ở lại qua đêm không?",
    answer:
      "Nhiều chủ nhà cho phép khách đến thăm nhưng không khuyến khích ở lại qua đêm để đảm bảo an ninh. Nếu muốn người thân ở lại 1–2 đêm, nên báo trước. Một số nơi quy định không được ở quá số người trong hợp đồng hoặc phải đóng phụ phí.",
  },
  {
    question: "Nếu thiết bị trong phòng bị hỏng thì ai chịu trách nhiệm sửa?",
    answer:
      "Nếu hư hỏng do hao mòn tự nhiên hoặc lỗi kỹ thuật, chủ nhà sẽ sửa chữa. Nếu do người thuê sử dụng sai cách gây hư hại, người thuê phải chịu chi phí. Điều này nên được ghi rõ trong hợp đồng để tránh hiểu lầm.",
  },
  {
    question: "Có cần ký hợp đồng thuê phòng không?",
    answer:
      "Ký hợp đồng là rất cần thiết dù thuê ngắn hạn hay dài hạn. Hợp đồng ghi rõ giá thuê, tiền cọc, thời gian thuê, chi phí, nội quy, quyền lợi và nghĩa vụ của mỗi bên. Người thuê nên đọc kỹ từng điều khoản, đặc biệt về trả phòng và hoàn cọc.",
  },
];

export default function FaqCarousel() {
  const durationMs = 4500;

  // Nhóm 2 câu hỏi / slide
  const grouped: FaqItem[][] = [];
  for (let i = 0; i < FAQS.length; i += 3) {
    grouped.push(FAQS.slice(i, i + 3));
  }

  return (
    <section className={clsx("py-12")}>
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-3">
            <HelpCircle className="h-4 w-4" />
            FAQ cho người thuê phòng
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-2">
            Những câu hỏi thường gặp
          </h3>

          <p className="text-sm md:text-base text-emerald-800/80 max-w-2xl mx-auto">
            Giải đáp các thắc mắc về tiền thuê, cọc, hợp đồng, giờ giấc, thú cưng, khách ở lại...
            giúp bạn tự tin trước khi ký hợp đồng thuê phòng.
          </p>
        </div>

        {/* Slider */}
        <Slide
          duration={durationMs}
          transitionDuration={500}
          autoplay
          infinite
          pauseOnHover
          indicators
          arrows
          prevArrow={
            <button
              aria-label="Câu hỏi trước"
              className="inline-flex items-center justify-center rounded-full bg-white/95 text-emerald-700 shadow-md ring-1 ring-emerald-200 hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          }
          nextArrow={
            <button
              aria-label="Câu hỏi tiếp theo"
              className="inline-flex items-center justify-center rounded-full bg-white/95 text-emerald-700 shadow-md ring-1 ring-emerald-200 hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          }
        >
          {grouped.map((pair, slideIndex) => (
            <div key={slideIndex} className="px-2 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-xl mx-auto">
                {pair.map((item, index) => {
                  const globalIndex = slideIndex * 3 + index;
                  return (
                    <Link
                      key={globalIndex}
                      href="/nhung-cau-hoi-thuong-gap"
                      className="group relative block rounded-2xl bg-white/95 ring-1 ring-emerald-100 hover:ring-emerald-300 hover:shadow-xl transition-all duration-200 overflow-hidden"
                    >
                      {/* border gradient cạnh trái */}
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-600" />

                      <div className="relative p-6 md:p-7 pl-7 md:pl-8">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            {globalIndex + 1}
                          </span>
                          <span className="text-[11px] uppercase tracking-wide text-emerald-500 font-semibold">
                            Xem chi tiết
                          </span>
                        </div>

                        <h4 className="text-base md:text-lg font-semibold text-emerald-900 mb-2 group-hover:text-emerald-700 line-clamp-2">
                          {item.question}
                        </h4>

                        <p className="text-sm md:text-[15px] leading-relaxed text-slate-700 line-clamp-2 group-hover:text-slate-800">
                          {item.answer}
                        </p>

                        <div className="mt-4 flex items-center text-xs md:text-sm text-emerald-600 font-medium">
                          <span>Xem đầy đủ câu trả lời</span>
                          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </Slide>

        {/* CTA dưới slider */}
        <div className="mt-6 text-center">
          <Link
            href="/nhung-cau-hoi-thuong-gap"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-600 text-emerald-700 text-sm font-medium hover:bg-emerald-600 hover:text-white transition-colors"
          >
            Xem tất cả câu hỏi thường gặp
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
