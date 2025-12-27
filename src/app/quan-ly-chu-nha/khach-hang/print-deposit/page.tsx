"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { depositService } from '@/services/depositService';
import { apartmentService } from '@/services/apartmentService';
import { formatMoneyVND } from '@/utils/format-number';

function DepositPrintInner() {
  const search = useSearchParams();
  const id = (search.get('id') || '') as string;
  const [deposit, setDeposit] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await depositService.get(Number(id));
        const d = (res as any)?.data ?? res;
        if (mounted) setDeposit(d);

        if (d?.apartmentId) {
          try {
            const aptRes = await apartmentService.getById(Number(d.apartmentId));
            const apt = (aptRes as any)?.data ?? aptRes;
            if (mounted) setApartment(apt);
          } catch (e) {
            console.warn('Could not load apartment', e);
          }
        }

        // customer snapshot may be stored on deposit
        if (d?.customer) {
          if (mounted) setCustomer(d.customer);
        } else if (d?.customerName || d?.customerPhone || d?.customerEmail) {
          if (mounted) setCustomer({ name: d.customerName, phone: d.customerPhone, email: d.customerEmail });
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Không tải được biên nhận đặt cọc');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onPrint = () => window.print();

  if (loading) return <div style={{ padding: 16 }}>Đang tải biên nhận…</div>;
  if (!deposit) return <div style={{ padding: 16 }}>Không tìm thấy biên nhận đặt cọc</div>;

  return (
    <div style={{ background: '#fff', color: '#111' }}>
      <div style={{ maxWidth: 816, margin: '0 auto', padding: 40, fontFamily: 'Times New Roman, serif', fontSize: 14, lineHeight: 1.6 }}>
        {/* Header */}
        <div className="mb-8">
          {/* Logo */}
          <div className="mb-4 flex justify-start">
            <div className="flex flex-col items-center">
              <img
                src="/logo.png"
                alt="Nhà Cộng Logo"
                className="h-10 w-12"
              />
              <span className="mt-1 text-[10px] font-bold text-green-700">
                NHÀ CỘNG
              </span>
            </div>
          </div>

          {/* HÀNG 2: Quốc hiệu */}
          <div className="text-center">
            <p className="text-[20px] font-bold uppercase">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[20px] font-medium">
              Độc lập - Tự do - Hạnh Phúc
            </p>
            <div className="mt-2 flex justify-center">
              <div className="h-px w-64 bg-black" />
            </div>
          </div>

          {/* HÀNG 3: Tiêu đề */}
          <div className="mt-6 text-center">
            <h1 className="text-[20px] font-bold uppercase">
              HỢP ĐỒNG THUÊ PHÒNG
            </h1>
            <span className='italic'>(Về việc: Đặt cọc thuê nhà ở)
              <p>(Số: ….. /HĐĐC)</p>
            </span>
          </div>
        </div>
        {/* BODY */}
        <div>
          {/* Nội dung căn cứ */}
          <div className="space-y text-justify">
            <p>Dựa vào quy định của Bộ Luật Dân sự, Luật Nhà ở.</p>
            <p>Theo sự thỏa thuận của hai bên.</p>
            <p>Hôm nay, ngày ….. tháng ….. năm ….. Tại …..</p>
            <p>Chúng tôi gồm có:</p>
          </div>
          {/* Bên A */}
          <div className="mt-6">
            <p className="font-bold uppercase">BÊN ĐẶT CỌC (BÊN A)</p>
            <div className="mt-2 space-y">
              <p>
                1. Ông (Bà):
                <span className="inline-block w-56 border-b border-dotted border-black"></span>
                <span className="ml-4">
                  Năm sinh:
                  <span className="ml-2 inline-block w-30 border-b border-dotted border-black"></span>
                </span>
              </p>
              <p>
                2. CCCD/CMND số:
                <span className="ml-2 inline-block w-40 border-b border-dotted border-black"></span>
                <span className="ml-4">
                  Cấp ngày:
                  <span className="ml-2 inline-block w-30 border-b border-dotted border-black"></span>
                </span>
              </p>
              <p>
                Nơi cấp:<span className="ml-2 inline-block w-[200px] border-b border-dotted border-black"></span>
              </p>

              <p>
                3. Địa chỉ:
                <span className="ml-2 inline-block w-[120px] border-b border-dotted border-black"></span>
                <span className="ml-4">
                  Điện thoại:
                  <span className="ml-2 inline-block w-40 border-b border-dotted border-black"></span>
                </span>
              </p>
              <p>
                4. Số tài khoản ngân hàng:
                <span className="ml-2 inline-block w-[100px] border-b border-dotted border-black"></span>
                <span className="ml-4">
                  Ngân hàng:
                  <span className="ml-2 inline-block w-40 border-b border-dotted border-black"></span>
                </span>
              </p>
            </div>
          </div>
          {/* Bên B */}
          <div className="mt-6">
            <p className="font-bold uppercase">BÊN NHẬN ĐẶT CỌC (BÊN B):</p>
            <div className="mt-2 space-y">
              <p>CÔNG TY TNHH NET PARTNERS</p>
              <p>
                1. Đại Diện: Ông (Bà):
                <span className="inline-block w-56 border-b border-dotted border-black"></span>
                <span className="ml-4">
                  Chức vụ : Nhân viên kinh doanh
                </span>
              </p>
              <p>2. Mã số thuế: 0111162366</p>
              <p>3. Địa chỉ: Căn 27, LK7, Khu Đô Thị Văn Khê, La Khê, Hà Đông, Hà Nội </p>
              <p className='ml-15'>Điện thoại: 0968345486</p>
              <p>4. Số tài khoản ngân hàng: 0026G322171 Ngân hàng: Ngân hàng Thương mại cổ phần Việt Nam Thịnh Vượng(VPBANK)</p>
              <p>Chủ TK: BUI THI LAN</p>
            </div>
          </div>
          {/* Ngắt trang */}
          <div
            style={{
              pageBreakBefore: "always",
              breakBefore: "page",
            }}
          />
          {/* ĐIỀU 1 */}
          <div className="mt-6">
            <p className='italic'>Hai bên đồng ý thực hiện việc đặt cọc theo các thỏa thuận dưới đây:</p>
            <p className="font-bold uppercase">ĐIỀU 1: TIỀN ĐẶT CỌC, MỤC ĐÍCH VÀ THANH TOÁN:</p>
            <div className="mt-2 space-y">
              <p>1.1. Theo đề nghị của bên A, bên B đồng ý sẽ cho bên A thuê căn nhà số
                <span className="ml-2 inline-block w-96 border-b border-dotted border-black"></span>
                do mình là chủ sở hữu.
              </p>
              <p>  1.2. Để bảo đảm việc ký kết Hợp đồng thuê nhà dự kiến vào ngày
                <span className="ml-2 inline-block w-40 border-b border-dotted border-black"></span>,
                nay bên A đồng ý đóng cho bên B một số tiền là
                <span className="ml-2 inline-block w-40 border-b border-dotted border-black"></span>
                đồng gọi là tiền đặt cọc.</p>
              <p>1.3. Mục đích đặt cọc: Bảo đảm thực hiện việc ký kết hợp đồng thuê nhà.</p>
              <p> 1.4. Thời gian đặt cọc: Ngay sau khi hai bên cùng ký hợp đồng đặt cọc này.</p>
              <p> 1.5. Hình thức thanh toán:
                <span className="ml-2 inline-block w-48 border-b border-dotted border-black"></span>.
                Sau khi nhận tiền, bên B ghi rõ “đã nhận đủ
                <span className="ml-2 inline-block w-40 border-b border-dotted border-black"></span>
                đồng” vào cuối hợp đồng này.</p>
            </div>
          </div>
          {/* ĐIỀU 2 */}
          <div className="mt-6">
            <p className="font-bold uppercase">ĐIỀU 2: THỎA THUẬN VỀ VIỆC GIẢI QUYẾT TIỀN ĐẶT CỌC</p>
            {/* Điều 2.1 */}
            <div className="mt-2 space-y">
              <p className='font-bold'>2.1. Đối với bên A:</p>
              <p>- Giao tiền đặt cọc cho Bên B theo đúng thỏa thuận.</p>
              <p>
                - Nếu trong thời gian từ khi ký hợp đồng này đến ngày
                <span className="ml-2 inline-block w-32 border-b border-dotted border-black"></span>
                mà thay đổi ý định, không muốn thuê nhà nữa thì phải chịu mất toàn bộ số tiền đã đặt cọc.
              </p>
              <p>
                - Nếu đến hết ngày
                <span className="ml-2 inline-block w-32 border-b border-dotted border-black"></span>
                (là ngày dự kiến ký hợp đồng thuê nhà) mà bên A không liên hệ để ký hợp đồng thuê nhà thì cũng xem như đã tự ý không muốn thuê nhà nữa.
                Ngoại trừ trường hợp có lý do chính đáng, báo trước tối thiểu 2 ngày và được bên B chấp nhận bằng văn bản.
              </p>
              <p>
                - Được nhận lại toàn bộ số tiền đã đặt cọc sau khi hai bên chính thức ký hợp đồng thuê nhà tại Phòng công chứng.
                Trừ trường hợp hai bên có sự thỏa thuận khác về số tiền này (sẽ được ghi rõ trong hợp đồng thuê nhà).
              </p>
              <p>
                - Các quyền và nghĩa vụ khác (ngoài những thỏa thuận trên) của bên đặt cọc theo quy định tại Bộ luật dân sự.
              </p>
            </div>
            {/* Điều 2.2 */}
            <div className="mt-2 space-y">
              <p className='font-bold'>2.2. Đối với bên B:</p>
              <p> - Được nhận số tiền đặt cọc theo thỏa thuận tại Điều 1.</p>
              <p>
                - Được sở hữu và sử dụng toàn bộ số tiền đặt cọc đã nhận nếu bên A thay đổi ý kiến
                (không thuê nhà nữa) hoặc đến hết ngày
                <span className="ml-2 inline-block w-32 border-b border-dotted border-black"></span>
                bên A không liên hệ để ký kết hợp đồng thuê nhà.
              </p>
              <p>
                - Nếu từ ngày ký hợp đồng này đến hết ngày
                <span className="ml-2 inline-block w-32 border-b border-dotted border-black"></span>
                mà bên B thay đổi ý kiến (không cho bên A thuê nhà nữa) thì bên B phải trả lại cho bên A toàn bộ số tiền đặt cọc đã nhận
                và bồi thường cho bên A thêm một khoản tiền khác tương đương một số tiền đặt cọc đã nhận
                (tổng cộng
                <span className="ml-2 inline-block w-32 border-b border-dotted border-black"></span>
                đồng).
              </p>
              <p>
                - Các quyền và nghĩa vụ khác (ngoài những thỏa thuận trên) của bên nhận đặt cọc theo quy định tại Bộ luật dân sự.
              </p>
            </div>
          </div>
          {/* Ngắt trang */}
          <div
            style={{
              pageBreakBefore: "always",
              breakBefore: "page",
            }}
          />
          {/* ĐIỀU 3 */}
          <div className="mt-6">
            <p className="font-bold uppercase">ĐIỀU 3: CÁC ĐIỀU KHOẢN CHUNG</p>
            <div className="mt-2 space-y">
              <p>
                3.1. Bên A và bên B xác định hoàn toàn tự nguyện khi ký kết hợp đồng này,
                cam kết cùng nhau thực hiện nghiêm túc những điều đã thỏa thuận trên đây.
              </p>
              <p>
                3.2. Nếu phát sinh tranh chấp, các bên cùng nhau thương lượng giải quyết trên nguyên tắc hòa giải,
                cùng có lợi. Nếu không giải quyết được, thì một trong hai bên có quyền khởi kiện để yêu cầu Tòa án
                có thẩm quyền giải quyết theo quy định của pháp luật. Bên thua kiện phải chịu trả toàn bộ các chi phí
                liên quan đến vụ kiện, kể cả chi phí thuê luật sư cho bên thắng kiện.
              </p>
              <p>
                3.3. Hợp đồng này có hiệu lực kể từ khi hai bên cùng ký, được lập thành 02 (hai) bản,
                có giá trị như nhau, mỗi bên giữ 01 (một) bản.
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>Bên A
              <p className='italic'>Ký, ghi rõ họ tên</p>
            </div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>Bên B
              <p className='italic'>Ký, ghi rõ họ tên</p>
            </div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
        </div>
      </div>
      <style>{`@media print { @page { size: A4; margin: 20mm; } body { -webkit-print-color-adjust: exact; } }`}</style>
    </div>
  );
}

export default function PrintDepositPage() {
  return (
    <Suspense fallback={<div>Đang tải…</div>}>
      <DepositPrintInner />
    </Suspense>
  );
}
{/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>CÔNG TY / CHỦ NHÀ (Tên)</div>
            <div style={{ color: '#555', marginTop: 4 }}>Địa chỉ: ________________________</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13 }}>{new Date(deposit.createdAt || deposit.depositDate || Date.now()).toLocaleDateString()}</div>
            <button onClick={onPrint} style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#f7f7f7', cursor: 'pointer' }}>In / Print</button>
          </div>
        </div> */}

{/* <h1 style={{ textAlign: 'center', margin: '18px 0', fontSize: 20, textDecoration: 'underline' }}>BIÊN NHẬN ĐẶT CỌC</h1>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>Mã biên nhận: <strong>{deposit.id}</strong></div> */}

{/* <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>1. Thông tin người đặt cọc</strong></div>
          <div>
            <div>Tên: {customer?.name ?? deposit.customerName ?? '________________'}</div>
            <div>Điện thoại: {customer?.phone ?? deposit.customerPhone ?? '________________'}</div>
            <div>Email: {customer?.email ?? deposit.customerEmail ?? '________________'}</div>
          </div>
        </section> */}

{/* <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>2. Thông tin bất động sản</strong></div>
          <div>
            <div>Địa chỉ/Tòa nhà: {apartment?.buildingName ?? apartment?.streetAddress ?? deposit.buildingAddress ?? '—'}</div>
            <div>Căn hộ/Phòng: {apartment?.title ?? deposit.apartmentTitle ?? '—'}</div>
            <div>Mã phòng: {apartment?.roomCode ?? deposit.roomCode ?? '-'}</div>
          </div>
        </section> */}

{/* <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>3. Chi tiết đặt cọc</strong></div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8, width: '40%' }}>Số tiền đặt cọc</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{deposit.depositAmount != null ? formatMoneyVND(Number(deposit.depositAmount)) : '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Số tiền thuê (tham khảo)</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{deposit.rentAmount != null ? formatMoneyVND(Number(deposit.rentAmount)) : '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Ngày đặt cọc</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{deposit.depositDate ? new Date(deposit.depositDate).toLocaleDateString() : '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Phương thức thanh toán</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{deposit.paymentMethod ?? deposit.method ?? '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Ghi chú</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{deposit.note ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </section> */}