import Link from "next/link";
import {
  Wallet,
  Rocket,
  GraduationCap,
  ShieldCheck,
  BarChart3,
  Target,
  Award,
  CalendarCheck,
  Headphones,
  Wrench,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function TroThanhCTVPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-4 md:px-6 py-10">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white shadow-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-16 -right-24 w-96 h-96 rounded-full bg-emerald-300/20 blur-2xl" aria-hidden="true" />
        <div className="relative grid md:grid-cols-2">
          <div className="p-7 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs md:text-sm">
              <Rocket className="w-4 h-4" /> Bứt phá thu nhập với chiết khấu đến 84%
            </div>
            <h1 className="mt-3 text-2xl md:text-4xl font-bold leading-tight">
              Gia nhập đội ngũ CTV Nhà Cộng – Thu nhập không giới hạn, chủ động thời gian
            </h1>
            <p className="mt-4 text-sm md:text-base text-emerald-50">
              Bạn đang tìm kiếm một công việc tự do, không gò bó thời gian nhưng mang lại nguồn thu nhập “khủng”? Bạn đam mê lĩnh vực bất động sản và muốn làm việc trong một môi trường chuyên nghiệp, minh bạch? Chào mừng bạn đến với chương trình Tiếp thị Liên kết tại Nhà Cộng – nơi mỗi kết nối của bạn biến thành giá trị tài chính thực tế.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/quan-ly-cu-dan/dang-ky-ctv" className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-700 font-semibold px-5 py-3 hover:bg-emerald-50">
                Đăng ký CTV ngay <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#loi-ich" className="inline-flex items-center gap-2 rounded-xl bg-emerald-900/30 text-white px-4 py-3 hover:bg-emerald-900/40">
                Tìm hiểu lợi ích
              </Link>
            </div>

            {/* Feature chips */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-white/15 px-3 py-2 text-sm inline-flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Hoa hồng đến 84%
              </div>
              <div className="rounded-xl bg-white/15 px-3 py-2 text-sm inline-flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" /> Instant Pay 50%
              </div>
              <div className="rounded-xl bg-white/15 px-3 py-2 text-sm inline-flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Đào tạo 1-1
              </div>
              <div className="rounded-xl bg-white/15 px-3 py-2 text-sm inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Chính sách minh bạch
              </div>
            </div>
          </div>
          <div
            className="h-[260px] md:h-full bg-cover bg-center"
            style={{ backgroundImage: "url(/images/ctv-hero-placeholder.jpg)" }}
            aria-label="Banner: Gia nhập đội ngũ CTV - Thu nhập không giới hạn - Chiết khấu lên đến 84%"
          />
        </div>
      </section>

      {/* 1. Giới thiệu */}
      <section className="mt-10">
        <h2 className="text-xl md:text-2xl font-bold">1. Giới thiệu về Chương trình Tiếp thị Liên kết tại Nhà Cộng</h2>
        <p className="mt-3 text-slate-700">
          Nhà Cộng là hệ thống quản lý và cho thuê phòng chuyên nghiệp. Chương trình tiếp thị liên kết của chúng tôi được thiết kế để kết nối những người môi giới tài năng, các bạn trẻ năng động với khách hàng đang có nhu cầu về không gian sống chất lượng. Với nền tảng công nghệ hiện đại, chúng tôi giúp bạn tối ưu hóa quy trình bán hàng và quản lý doanh thu chỉ trong một nốt nhạc.
        </p>
      </section>

      {/* 2. Tiềm năng thị trường */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">2. Tiềm năng ngành nghề: Những "con số biết nói" về thị trường cho thuê</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[220px] grid place-items-center text-slate-500 text-sm">
            Ảnh Tiềm năng thị trường (Infographic Cityscape)
          </div>
          <div>
            <p className="text-slate-700">
              Đừng chỉ nhìn Nhà Cộng như một đơn vị cho thuê phòng, hãy nhìn vào thị trường bất động sản dòng tiền – nơi đang bùng nổ mạnh mẽ nhất trong thập kỷ tới.
            </p>
            <ul className="mt-3 list-disc ml-5 space-y-1 text-slate-700">
              <li><strong>10.000.000+ người:</strong> Nhu cầu thuê nhà tại các đô thị lớn như TP.HCM và Hà Nội.</li>
              <li><strong>15–20%/năm:</strong> Tăng trưởng ổn định của phân khúc căn hộ dịch vụ và phòng trọ chất lượng cao.</li>
              <li><strong>70% Gen Z & Millennials:</strong> Ưu tiên các giải pháp sống tiện nghi, quản lý chuyên nghiệp.</li>
            </ul>
            <h3 className="mt-4 font-semibold">Bài toán kinh tế: Tại sao làm CTV Nhà Cộng lại nhanh giàu hơn?</h3>
            <div className="mt-2 overflow-auto">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Chỉ số so sánh</th>
                    <th className="px-3 py-2 text-left">Affiliate Sản phẩm vật lý</th>
                    <th className="px-3 py-2 text-left">Đối tác Tiếp thị Nhà Cộng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-2">Giá trị đơn hàng (AOV)</td>
                    <td className="px-3 py-2">~200.000 VNĐ</td>
                    <td className="px-3 py-2">~5.000.000 – 10.000.000 VNĐ</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Tỉ lệ hoa hồng</td>
                    <td className="px-3 py-2">1% – 3%</td>
                    <td className="px-3 py-2">74% – 84%</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Số tiền nhận trên 1 đơn</td>
                    <td className="px-3 py-2">2.000 – 6.000 VNĐ</td>
                    <td className="px-3 py-2">3.700.000 – 8.600.000 VNĐ</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Nỗ lực cần thiết</td>
                    <td className="px-3 py-2">Cần bán 1.000 đơn để có 6 triệu</td>
                    <td className="px-3 py-2">Chỉ cần 01 giao dịch là có hơn 4 triệu</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="mt-4 font-semibold">Lộ trình thăng tiến "không giới hạn"</h3>
            <ul className="mt-2 list-disc ml-5 space-y-1 text-slate-700">
              <li><strong>Giai đoạn 1 (CTV/Affiliate):</strong> Thu nhập kỳ vọng 10 – 30 triệu/tháng.</li>
              <li><strong>Giai đoạn 2 (Trưởng nhóm kinh doanh):</strong> Thu nhập kỳ vọng 50 – 100 triệu/tháng.</li>
              <li><strong>Giai đoạn 3 (Đối tác chiến lược):</strong> Thu nhập thụ động khổng lồ từ vận hành.</li>
            </ul>
            <p className="mt-3 text-slate-700">
              Kết luận: Với mức hoa hồng lên tới 84%, Nhà Cộng không chỉ cung cấp một công việc, chúng tôi cung cấp một cơ hội khởi nghiệp 0 đồng với tỷ lệ lợi nhuận cao nhất trong ngành bất động sản hiện nay.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Lợi ích vượt trội */}
      <section id="loi-ich" className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">3. Lợi ích vượt trội: Tại sao nên chọn Tiếp thị liên kết tại Nhà Cộng?</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[200px] grid place-items-center text-slate-500 text-sm">
            Ảnh So sánh "Cá lớn - Cá bé"
          </div>
          <div>
            <p className="text-slate-700">
              Nếu bạn đã từng làm CTV hoặc Affiliate cho các sàn TMĐT hay nhãn hàng khác, bạn sẽ thấy sự khác biệt "một trời một vực" tại Nhà Cộng. Chúng tôi không chỉ trả hoa hồng, chúng tôi chia sẻ lợi nhuận bền vững.
            </p>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Đặc điểm</th>
                    <th className="px-3 py-2 text-left">CTV/Affiliate Truyền thống</th>
                    <th className="px-3 py-2 text-left">Đối tác Tiếp thị Nhà Cộng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-2">Mức hoa hồng</td>
                    <td className="px-3 py-2">1 – 2% doanh thu</td>
                    <td className="px-3 py-2">Lên đến 84% doanh thu thực tế (RV)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Giá trị sản phẩm</td>
                    <td className="px-3 py-2">Thấp (đơn hàng lẻ...)</td>
                    <td className="px-3 py-2">Giá trị cao (bất động sản, căn hộ cho thuê)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Cách tính hoa hồng</td>
                    <td className="px-3 py-2">Chia 1 lần duy nhất</td>
                    <td className="px-3 py-2">Chia trọn vẹn theo thời gian thuê</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Nội dung & Công cụ</td>
                    <td className="px-3 py-2">Tự mày mò nội dung</td>
                    <td className="px-3 py-2">Kho tài liệu sẵn: ý tưởng, video, ảnh</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Đào tạo & Hỗ trợ</td>
                    <td className="px-3 py-2">Ít hỗ trợ</td>
                    <td className="px-3 py-2">Đào tạo bài bản từ chuyên gia</td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-3 py-2">Dòng tiền</td>
                    <td className="px-3 py-2">Đối soát lâu, chậm</td>
                    <td className="px-3 py-2">Instant Pay: nhận ngay 50% khi chốt</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="mt-4 list-disc ml-5 space-y-2 text-slate-700">
              <li><strong>Mức hoa hồng lên đến 84%:</strong> cao nhất thị trường hiện nay.</li>
              <li><strong>Kho dữ liệu khổng lồ:</strong> Video/hình ảnh thực tế, content bắt trend.</li>
              <li><strong>Hệ thống đào tạo thực chiến:</strong> cầm tay chỉ việc đến khi chốt đơn đầu tiên.</li>
              <li><strong>Thu nhập thụ động:</strong> hưởng hoa hồng duy trì theo thời gian khách ở.</li>
              <li><strong>Tự chủ hoàn toàn:</strong> không cần tới văn phòng, chủ động thời gian và thu nhập.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Quyền lợi & Chính sách */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">4. Quyền lợi và Chính sách Hợp tác (Cập nhật 2026)</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[220px] grid place-items-center text-slate-500 text-sm">
            Biểu đồ tròn "Chia sẻ lợi nhuận" (CTV 84% / Công ty 16%)
          </div>
          <div className="text-slate-700">
            <p><strong>Cơ cấu hoa hồng:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>IPC (Hoa hồng ngay): 50% RV.</li>
              <li>IPM (Hoa hồng tháng): 2% RV.</li>
              <li>Phí dịch vụ: 2% RV.</li>
            </ul>
            <p className="mt-3"><strong>Tổng mức hưởng:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Hợp đồng 6 tháng: Nhận 74% doanh thu.</li>
              <li>Hợp đồng 12 tháng: Nhận 84% doanh thu.</li>
            </ul>
            <p className="mt-3">Chế độ Sales chuyên nghiệp: Lương cứng đến 6.000.000 VNĐ cho bạn đồng hành toàn thời gian.</p>
          </div>
        </div>
      </section>

      {/* 5. Hệ thống đào tạo */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">5. Hệ thống đào tạo bài bản</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[200px] grid place-items-center text-slate-500 text-sm">Ảnh Đào tạo & Cộng đồng</div>
          <div>
            <ul className="list-disc ml-5 space-y-1 text-slate-700">
              <li>Kỹ năng tìm kiếm và tiếp cận khách hàng mục tiêu.</li>
              <li>Kỹ năng tư vấn, xử lý từ chối và chốt sale thần tốc.</li>
              <li>Kiến thức chuyên sâu về thị trường bất động sản cho thuê.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Công cụ hỗ trợ */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">6. Công cụ hỗ trợ hiện đại</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[200px] grid place-items-center text-slate-500 text-sm">Ảnh Hệ thống Công cụ (App/CRM)</div>
          <div>
            <ul className="list-disc ml-5 space-y-1 text-slate-700">
              <li>Theo dõi giỏ hàng (phòng trống) thời gian thực.</li>
              <li>Quản lý danh sách khách hàng và tình trạng hợp đồng.</li>
              <li>CRM theo dõi khách hàng, doanh thu, hoa hồng minh bạch từng hợp đồng.</li>
              <li>Nhận khuyến mãi/Ưu đãi tự động.</li>
              <li>Báo cáo giao dịch, kiểm soát hoa hồng tự động.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Tài liệu bán hàng */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">7. Tài liệu bán hàng sẵn có</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[200px] grid place-items-center text-slate-500 text-sm">Ảnh Kho tài liệu sẵn có</div>
          <div>
            <ul className="list-disc ml-5 space-y-1 text-slate-700">
              <li>Hình ảnh/Video phòng thực tế, sắc nét.</li>
              <li>Mẫu content thu hút trên Facebook, TikTok.</li>
              <li>Bộ tài liệu pháp lý, hợp đồng mẫu chuyên nghiệp.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Quy trình hoạt động */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">8. Quy trình hoạt động đơn giản</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[200px] grid place-items-center text-slate-500 text-sm">Ảnh Quy trình 4 bước</div>
          <div>
            <ol className="list-decimal ml-5 space-y-1 text-slate-700">
              <li>Tìm kiếm: Sử dụng tài liệu Nhà Cộng cung cấp để tìm khách hàng.</li>
              <li>Tư vấn: Giới thiệu phòng và đưa khách xem trực tiếp (có đội ngũ hỗ trợ nếu cần).</li>
              <li>Chốt đơn: Khách ký hợp đồng và cọc tiền.</li>
              <li>Nhận hoa hồng: Hệ thống tự động tính và trả hoa hồng Instant Pay.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 9. Hướng dẫn đăng ký */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">9. Hướng dẫn đăng ký tham gia</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-100 h-[200px] grid place-items-center text-slate-500 text-sm">Ảnh Uy tín & Địa điểm</div>
          <div>
            <ol className="list-decimal ml-5 space-y-1 text-slate-700">
              <li>Bước 1: Truy cập vào đường link: trang này và nút đăng ký bên dưới.</li>
              <li>Bước 2: Điền thông tin cá nhân và xác nhận số điện thoại.</li>
              <li>Bước 3: Tham gia nhóm Zalo hỗ trợ CTV và bắt đầu khóa đào tạo cơ bản trong 30 phút.</li>
            </ol>
            <div className="mt-4">
              <Link href="/quan-ly-cu-dan/dang-ky-ctv" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white font-semibold px-5 py-3 hover:bg-emerald-700">
                Đăng ký CTV ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold">10. Các câu hỏi thường gặp (FAQ)</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-6">
          <div className="space-y-2 text-slate-700">
            <p><strong>Tôi có phải đóng phí gia nhập không?</strong> Hoàn toàn KHÔNG.</p>
            <p><strong>Khi nào tôi nhận được tiền hoa hồng?</strong> Khoản 50% (IPC) sẽ được thanh toán ngay sau khi khách chốt và hoàn tất thủ tục.</p>
            <p><strong>Tôi có được hỗ trợ khi dẫn khách không?</strong> Có, đội ngũ Sale admin luôn sẵn sàng hỗ trợ bạn tại các điểm xem phòng.</p>
            <p><strong>Tôi có cần phải dẫn khách không?</strong> Không phải dẫn, Nhà Cộng có đội ngũ chăm sóc và dẫn khách; bạn chỉ việc giới thiệu khách hàng.</p>
            <p><strong>Nhà Cộng có hỗ trợ đàm phán giá không?</strong> Hoàn toàn có, tùy vào hợp đồng khách muốn thuê.</p>
            <p><strong>Hợp đồng thuê nhà có linh hoạt không?</strong> Có: 3, 6, 9, 12 tháng.</p>
            <p><strong>Khách hàng có được trả cọc sau khi hết hợp đồng không?</strong> Có, sau khi trừ các khoản phí hợp lệ.</p>
            <p><strong>Tôi có thể giới thiệu các CTV/Saler/Affiliate?</strong> Hoàn toàn có thể; bạn nhận thêm hoa hồng đến 2%.</p>
            <p><strong>Đào tạo trực tiếp ở đâu?</strong> 27/7 KĐT Văn Khê, La Khê, Hà Đông, Hà Nội.</p>
          </div>
          <div className="rounded-xl bg-slate-100 h-[220px] grid place-items-center text-slate-500 text-sm">Ảnh minh họa FAQ / cộng đồng</div>
        </div>
        <div className="mt-8 text-center">
          <p className="font-semibold text-lg">ĐỪNG BỎ LỠ CƠ HỘI BỨT PHÁ TÀI CHÍNH VÀ TRỞ THÀNH ĐỐI TÁC CỦA NHÀ CỘNG NGAY HÔM NAY!</p>
          <Link href="/quan-ly-cu-dan/dang-ky-ctv" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white font-semibold px-6 py-3 hover:bg-emerald-700">
            Đăng ký CTV ngay <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
