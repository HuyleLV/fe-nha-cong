"use client";

const TENANT_FAQS = [
  {
    id: 1,
    question: "1. Tiền thuê phòng được tính và thanh toán như thế nào?",
    answer:
      "Thông thường, tiền thuê phòng được tính theo tháng, và người thuê sẽ thanh toán vào đầu hoặc cuối tháng tùy thỏa thuận. Một số chủ nhà yêu cầu đóng vào ngày cố định (ví dụ ngày 1 đến ngày 5 hằng tháng). Việc thanh toán có thể thực hiện bằng tiền mặt hoặc chuyển khoản ngân hàng để tiện theo dõi. Khi thanh toán, người thuê nên yêu cầu hóa đơn hoặc biên nhận rõ ràng để tránh nhầm lẫn.",
  },
  {
    id: 2,
    question:
      "2. Giá thuê có bao gồm tiền điện, nước, Internet và các chi phí khác không?",
    answer:
      "Tùy vào loại phòng và chính sách của chủ nhà. Nhiều nơi cho thuê chỉ bao gồm tiền phòng, còn điện, nước, Internet, rác thải… sẽ tính riêng. Giá điện, nước có thể tính theo đồng hồ riêng của từng phòng hoặc chia theo đầu người. Người thuê nên hỏi rõ cách tính các khoản này trước khi ký hợp đồng để tránh phát sinh mâu thuẫn sau này.",
  },
  {
    id: 3,
    question: "3. Khi thuê phòng, cần đặt cọc bao nhiêu tiền và dùng để làm gì?",
    answer:
      "Thông thường, người thuê phải đặt cọc từ 1 đến 2 tháng tiền phòng. Khoản tiền này nhằm đảm bảo người thuê giữ gìn tài sản, thực hiện đúng hợp đồng và không trả phòng đột ngột. Tiền cọc sẽ được hoàn trả khi người thuê kết thúc hợp đồng và bàn giao lại phòng trong tình trạng tốt. Người thuê nên yêu cầu giấy biên nhận tiền cọc để làm bằng chứng khi cần.",
  },
  {
    id: 4,
    question:
      "4. Nếu muốn trả phòng trước hạn, có được hoàn lại tiền cọc không?",
    answer:
      "Điều này phụ thuộc vào quy định trong hợp đồng thuê. Thông thường, nếu người thuê thông báo trước ít nhất 30 ngày và không vi phạm quy định, không làm hư hỏng tài sản, thì chủ nhà sẽ hoàn lại tiền cọc. Tuy nhiên, nếu trả phòng đột ngột mà không báo trước, người thuê có thể bị mất toàn bộ hoặc một phần tiền cọc như bồi thường cho chủ nhà.",
  },
  {
    id: 5,
    question:
      "5. Có được phép nấu ăn trong phòng không và nếu có thì quy định thế nào?",
    answer:
      "Một số khu trọ cho phép người thuê nấu ăn trong phòng bằng bếp điện, bếp từ hoặc nồi cơm điện, nhưng cấm sử dụng bếp gas để tránh nguy cơ cháy nổ. Một số nơi khác có khu bếp chung cho tất cả người thuê sử dụng. Người thuê nên hỏi rõ trước khi ký hợp đồng, đồng thời tuân thủ các quy định về an toàn điện và vệ sinh khi nấu ăn.",
  },
  {
    id: 6,
    question: "6. Giờ giấc ra vào phòng trọ có bị giới hạn hay không?",
    answer:
      "Nếu là khu trọ có quản lý hoặc chung chủ, thường sẽ có giờ đóng – mở cửa (ví dụ: đóng cổng sau 23h). Tuy nhiên, nếu bạn thuê phòng riêng hoặc căn hộ độc lập, bạn có thể ra vào tự do 24/24. Trong mọi trường hợp, người thuê nên tôn trọng giờ giấc chung, tránh gây tiếng ồn hoặc ảnh hưởng đến hàng xóm vào ban đêm.",
  },
  {
    id: 7,
    question: "7. Có được nuôi thú cưng trong phòng trọ không?",
    answer:
      "Chính sách này tùy thuộc vào chủ nhà. Một số nơi chấp nhận nuôi thú cưng nhỏ như chó, mèo, cá cảnh nếu người thuê đảm bảo giữ vệ sinh, không gây mùi và không làm phiền hàng xóm. Tuy nhiên, nhiều khu trọ hoặc chung cư mini cấm nuôi thú cưng để đảm bảo vệ sinh chung. Người thuê nên hỏi kỹ và ghi rõ trong hợp đồng để tránh tranh cãi sau này.",
  },
  {
    id: 8,
    question: "8. Khách đến chơi có được ở lại qua đêm không?",
    answer:
      "Nhiều chủ nhà cho phép khách đến thăm trong giờ hành chính hoặc buổi tối nhưng không khuyến khích ở lại qua đêm để đảm bảo an ninh trật tự. Nếu bạn muốn người thân ở lại ngắn hạn (ví dụ 1–2 đêm), nên báo trước với chủ nhà. Một số nơi quy định rõ: không được ở quá số người đăng ký trong hợp đồng, hoặc phải đóng phụ phí nếu có thêm người ở.",
  },
  {
    id: 9,
    question:
      "9. Nếu thiết bị trong phòng (đèn, quạt, máy lạnh, vòi nước...) bị hỏng thì ai chịu trách nhiệm sửa?",
    answer:
      "Nếu hư hỏng do hao mòn tự nhiên hoặc lỗi kỹ thuật (ví dụ bóng đèn cháy, máy lạnh hư do cũ), chủ nhà sẽ chịu trách nhiệm sửa chữa hoặc thay mới. Nhưng nếu người thuê sử dụng sai cách gây hư hại (làm rơi vỡ, quá tải điện, nghẹt ống nước...), người thuê sẽ phải chịu chi phí sửa chữa. Việc này nên được ghi rõ trong hợp đồng để tránh hiểu lầm.",
  },
  {
    id: 10,
    question: "10. Có cần ký hợp đồng thuê phòng không?",
    answer:
      "Việc ký hợp đồng là rất cần thiết, dù thuê ngắn hạn hay dài hạn. Hợp đồng giúp hai bên có căn cứ pháp lý rõ ràng, ghi nhận đầy đủ các điều khoản như: giá thuê, tiền cọc, thời gian thuê, chi phí phát sinh, nội quy, và quyền lợi – nghĩa vụ của mỗi bên. Người thuê nên đọc kỹ từng điều khoản, đặc biệt là về việc trả phòng, hoàn cọc và trách nhiệm khi hư hại tài sản.",
  },
];

export default function TenantFaqPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/40 py-10 md:py-14">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8 md:mb-10 text-center">
          <p className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-emerald-600 mb-3">
            FAQ • NGƯỜI THUÊ PHÒNG
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-900 mb-3">
            NHỮNG CÂU HỎI THƯỜNG GẶP CỦA NGƯỜI THUÊ PHÒNG
          </h1>
          <p className="text-sm md:text-base text-emerald-700/80 max-w-2xl mx-auto">
            Tổng hợp các thắc mắc phổ biến về tiền thuê, cọc, chi phí phát sinh,
            giờ giấc và quy định khi thuê phòng, giúp bạn yên tâm hơn trước khi
            quyết định.
          </p>
        </header>

        {/* FAQ list */}
        <section className="space-y-4 md:space-y-5">
          {TENANT_FAQS.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100/80 p-4 md:p-5 hover:shadow-md transition-shadow"
            >
              <h2 className="text-base md:text-lg font-semibold text-emerald-900 mb-2">
                {item.question}
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                <span className="font-semibold text-emerald-700 mr-1">💬</span>
                {item.answer}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
