"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { contractService } from '@/services/contractService';
import { apartmentService } from '@/services/apartmentService';
import { formatMoneyVND } from '@/utils/format-number';
import Image from "next/image";


function ContractPrintInner() {
  const search = useSearchParams();
  const id = (search.get('id') || search.get('contractId') || '') as string;
  const [contract, setContract] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await contractService.get(Number(id));
        const c = (res as any)?.data ?? res;
        if (mounted) setContract(c);

        if (c?.apartmentId) {
          try {
            const aptRes = await apartmentService.getById(Number(c.apartmentId));
            const apt = (aptRes as any)?.data ?? aptRes;
            if (mounted) setApartment(apt);
          } catch (e) {
            console.warn('Could not load apartment', e);
          }
        }

        // customer data might be included in contract payload
        if (c?.customer) {
          if (mounted) setCustomer(c.customer);
        } else if (c?.customerName || c?.customerPhone || c?.customerEmail) {
          if (mounted) setCustomer({ name: c.customerName, phone: c.customerPhone, email: c.customerEmail });
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Không tải được hợp đồng');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onPrint = () => window.print();

  if (loading) return <div style={{ padding: 16 }}>Đang tải hợp đồng…</div>;
  if (!contract) return <div style={{ padding: 16 }}>Không tìm thấy hợp đồng</div>;

  return (
    <div style={{ background: '#fff', color: '#111' }}>
      <div style={{ maxWidth: 816, margin: '0 auto', padding: 40, fontFamily: 'Times New Roman, serif', fontSize: 14, lineHeight: 1.6 }}>
        {/* Header */}
        <div className="mb-8">
          {/* HÀNG 1: Logo góc trái */}
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
            <p className="font-bold uppercase">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="font-medium">
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
            <p className="mt-1 italic">
              (Số: .<strong>{contract.id}</strong>. /HĐTP-
              <span className="ml-1 text-[13px] not-italic">
                {new Date(
                  contract.createdAt || contract.startDate || Date.now()
                ).toLocaleDateString()}
              </span>
              )
            </p>
          </div>
        </div>
        {/* Nội dung căn cứ */}
        <div className="space-y text-justify">
          <p>
            Căn cứ Bộ Luật dân sự số 91/2015/QH13 do Quốc hội nước Cộng hòa
            xã hội chủ nghĩa Việt Nam khóa XIII ban hành ngày 24 tháng 11
            năm 2015, có hiệu lực thi hành từ ngày 01 tháng 01 năm 2017;
          </p>
          <p>
            Căn cứ Nghị định số 99/2015/NĐ-CP ngày 20/10/2015 của Chính phủ
            quy định chi tiết và hướng dẫn thi hành một số điều của Luật Nhà ở;
          </p>
          <p>
            Căn cứ vào phụ lục hợp đồng thuê nhà, hạng mục tài sản bàn giao
            cho bên thuê;
          </p>
          <p>
            Căn cứ nhu cầu thuê phòng ở và bên cho thuê phòng dựa trên tinh
            thần thỏa thuận bình đẳng, hợp tác.
          </p>
          <p>
            Căn cứ vào Hợp đồng dịch vụ quản lý vận hành tài sản số: .....<strong>{contract.id}</strong>
            ....., ngày ..... tháng ..... năm 2025.
          </p>
        </div>
        {/* Bên A */}
        <div className="mt-6">
          <p className="font-bold uppercase">BÊN CHO THUÊ (BÊN A)</p>
          <div className="mt-2 space-y">
            <p className="font-semibold uppercase">
              ĐẠI DIỆN CHO CHỦ NHÀ LÀ:
            </p>

            <p className="font-bold uppercase">
              CÔNG TY TNHH NET PARTNERS
            </p>

            <p>- Mã số thuế: 0111162366</p>

            <p>
              - Địa chỉ: Số 27 LK7, KĐT Văn Khê, La Khê, Phường Hà Đông,
              Hà Nội
            </p>

            <p>
              - Đại diện Công ty là Ông (bà):{" "}
              {contract.landlordName ? (
                <span className="font-medium">
                  {contract.landlordName}
                </span>
              ) : (
                <span className="inline-block w-56 border-b border-dotted border-black"></span>
              )}
              <span className="ml-4">
                Chức vụ: Nhân viên kinh doanh
              </span>
            </p>

            <p>
              - Hộ khẩu thường trú tại:
              <span className="ml-2 inline-block w-[200px] border-b border-dotted border-black"></span>
            </p>

            <p>
              - Số CCCD:
              <span className="ml-2 inline-block w-40 border-b border-dotted border-black"></span>
              <span className="ml-4">
                Cấp ngày:
                <span className="ml-2 inline-block w-30 border-b border-dotted border-black"></span>
              </span>
            </p>

            <p>
              - Nơi cấp:
              <span className="ml-2 inline-block w-[200px] border-b border-dotted border-black"></span>
            </p>

            <p>
              - Điện thoại:{" "}
              {contract.landlordPhone ? (
                <span className="font-medium">
                  {contract.landlordPhone}
                </span>
              ) : (
                <span className="ml-2 inline-block w-48 border-b border-dotted border-black"></span>)}
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
        {/* BÊN B */}
        <div className="mt-6">
          <p className="font-bold uppercase">
            BÊN THUÊ (BÊN B)
          </p>
          <div className="mt-2 space-y">
            <p>
              Ông/Bà:{" "}
              {customer?.name ? (
                <span className="font-medium">
                  {contract.customerName}
                </span>
              ) : (
                <span className="ml-2 inline-block w-[400px] border-b border-dotted border-black"></span>)}
            </p>
            <p>
              Ngày sinh:
              <span className="ml-2 inline-block w-[400px] border-b border-dotted border-black"></span>
            </p>

            <p>
              Địa chỉ thường trú:
              <span className="ml-2 inline-block w-[300px] border-b border-dotted border-black"></span>
            </p>

            <p>
              Số CCCD:
              <span className="ml-2 inline-block w-[120px] border-b border-dotted border-black"></span>
              <span className="ml-6">
                Ngày cấp:
                <span className="ml-2 inline-block w-[120px] border-b border-dotted border-black"></span>
              </span>
            </p>

            <p>
              Nơi cấp:
              <span className="ml-2 inline-block w-[400px] border-b border-dotted border-black"></span>
            </p>

            <p>
              Số điện thoại:{" "}
              {customer?.phone ? (
                <span className="font-medium">
                  {contract.customerPhonee}
                </span>
              ) : (
                <span className="ml-2 inline-block w-[120px] border-b border-dotted border-black"></span>)}
              <span className="ml-6">
                Email:
                {" "}
                {customer?.email ? (
                  <span className="font-medium">
                    {contract.customerEmail}
                  </span>
                ) : (
                  <span className="ml-2 inline-block w-[120px] border-b border-dotted border-dotted border-black"></span>)}
              </span>
            </p>
          </div>
        </div>
        <p className="mt-3">
          Sau khi bàn bạc, hai bên thống nhất ký kết hợp đồng gồm các điều khoản và điều kiện sau:
        </p>
        {/* ĐIỀU 1 */}
        <div className="mt-6">
          <p className="mt-3 font-bold">
            Điều 1. Nội dung hợp đồng
          </p>
          <p>
            Bên A thay mặt Chủ Nhà đồng ý cho Bên B thuê diện tích dưới đây để sử dụng cụ thể như sau:
          </p>
          <div className="ml-6 mt-1 space-y">
            <p>
              1. Phòng: <span className="inline-block w-[80px] border-b border-dotted border-black"></span>
              tại địa chỉ: <span className="inline-block w-[200px] border-b border-dotted border-black"></span>
            </p>

            <p>
              2. Giá thuê:
              <span className="ml-2 inline-block w-[80px] border-b border-dotted border-black"></span>
              VND/01 tháng
              <span className="ml-2">
                (Bằng chữ:
                <span className="ml-2 inline-block w-[120px] border-b border-dotted border-black"></span>
                )
              </span>
            </p>

            <p>
              3. Thời hạn thuê:
              <span className="ml-2 inline-block w-[60px] border-b border-dotted border-black"></span>
              tháng, bắt đầu từ
              <span className="ml-2 inline-block w-[60px] border-b border-dotted border-black"></span>
              đến
              <span className="ml-2 inline-block w-[60px] border-b border-dotted border-black"></span>
            </p>

            <p>
              4. Mục đích thuê:
              Để ở. Số người ở:
              <span className="ml-2 inline-block w-[40px] border-b border-dotted border-black"></span>
              (…… người). Nếu thêm người phải thông báo và được sự đồng ý của Bên A
              (Bên B phải thông báo trước, quá 2 ngày tính là thêm người).
            </p>

            <p>
              5. Giá dịch vụ:
            </p>

            <div className="ml-6 space-y">
              <p>
                - Tiền điện (thu sau):
                <span className="ml-2 inline-block w-15 border-b border-dotted border-black"></span>
                đ/số (có công tơ riêng).
              </p>

              <p>
                - Tiền nước (thu sau):
                <span className="ml-2 inline-block w-15 border-b border-dotted border-black"></span>
                đ/khối (có đồng hồ riêng).
              </p>

              <p>
                - Tiền vệ sinh, máy giặt, thang máy và điện chung (thu trước):
                <span className="ml-2 inline-block w-15 border-b border-dotted border-black"></span>
                đ/người/tháng.
              </p>

              <p>
                - Tiền Internet (thu trước):
                <span className="ml-2 inline-block w-15 border-b border-dotted border-black"></span>
                đ/phòng/tháng.
              </p>

              <p>
                - Tiền sạc xe điện (nếu có – thu trước):
                <span className="ml-2 inline-block w-15 border-b border-dotted border-black"></span>
                đ/xe/tháng.
              </p>

              <p>
                - Gửi xe:
                <span className="ml-2 inline-block w-15 border-b border-dotted border-black"></span>
                đ/xe/tháng.
              </p>
            </div>
            <p className="mt-1">
              Tiền dịch vụ hàng tháng Bên B thanh toán cho Bên A bằng chuyển khoản trong vòng 02 ngày đầu tháng. Tiền dịch vụ được thu theo số lượng người ở trong phòng tính bằng số lượng đăng ký vắn tay ra vào nhà bất kể ít hay nhiều hay không. Tiền Internet được tính bất kể sử dụng hay không.
            </p>
          </div>
        </div>
        {/* ĐIỀU 2 */}
        <div className="mt-6">
          <p className="mt-3 font-bold">
            Điều 2. Quyền lợi và trách nhiệm của mỗi bên
          </p>
          <p className="font-bold">Bên A</p>
          <p className="ml-4">
            Bảo đảm quyền sử dụng phòng cho thuê một cách trọn vẹn, riêng rẽ, ổn định
            của Bên B trong suốt thời gian hợp đồng.
          </p>
          <p className="mt-2 font-bold">Bên B</p>
          <div className="ml-6">
            <p>1. Sử dụng diện tích đã thuê đúng mục đích thuê để ở và sinh hoạt theo đúng số lượng người đăng ký với ban quản lý và không được cho thuê lại căn phòng, không được sang nhượng phòng, không được tổ chức lớp học, hoạt động tập thể xã hội, kinh doanh tại phòng thuê mà không có sự đồng ý trước của bên A hay sử dụng cho bất kỳ mục đích nào khác.</p>
            <p>2.	Thực hiện nghiêm chỉnh các quy định của nhà nước về an ninh và phòng cháy chữa cháy, không được sử dụng các chất và vật liệu dễ gây cháy nổ, không được làm các công việc dễ gây cháy nổ hoặc các nguy cơ khác ảnh hưởng tới khu vực xung quanh. Bảo đảm vệ sinh môi trường, không gây ô nhiễm môi trường không khí, nguồn nước thải, rác thải và tiếng ồn tại khu vực thuê. Chịu trách nhiệm về hoạt động của mình tại địa điểm thuê.</p>
            <p>3.	Thanh toán tiền phòng, tiền điện, tiền nước, kết nối internet, phí vệ sinh an ninh chung…theo đúng hạn quy định trong hợp đồng.</p>
            <p>4.	Khi hết hạn hợp đồng thuê phòng hoặc khi kết thúc hợp đồng có thời hạn, phải bàn giao lại phòng cho bên A nguyên trạng tại thời điểm bàn giao và chịu trách nhiệm bồi thường các trang thiết bị hư hỏng do bên B gây ra. Nếu muốn khoan đục phải được sự đồng ý của bên A. Trường hợp bên B khoan đục thì khi chuyển đi phải chít lại lỗ khoan và sơn lại như ban đầu hoặc thanh toán chi phí cho bên A để bên A khắc phục.</p>
            <p>5.	Trong thời gian thuê nếu bên B có nhu cầu sửa lại hoặc thay đổi nội, ngoại thất căn phòng phải được sự đồng ý của bên A và việc sửa chữa không làm ảnh hưởng tới kết cấu căn phòng, chi phí sửa chữa thay đổi do bên B chịu.</p>
            <p>6.	Có trách nhiệm bảo quản tài sản trong căn phòng, sữa chữa và bảo dưỡng các hỏng hóc thông thường liên quan đến kết cấu căn hộ hệ thống điện nước…trong căn hộ mà nguyên nhân từ phía bên B gây ra trong quá trình sử dụng. Tự chịu trách nhiệm về tài sản của mình, xảy ra mất mát bên A hoàn toàn không chịu trách nhiệm. Đồ dùng và các trang thiết bị nơi thuê sẽ được bên A bảo hành trong vòng 15 ngày kể từ ngày ký hợp đồng, sau đó mọi hư hại, hỏng hóc.. thì bên B hoàn toàn chịu trách nhiệm.</p>
            <p>7.	Trong khi sinh hoạt, bên B có trách nhiệm bảo vệ tính mạng những người sinh hoạt trong phòng và bạn bè, người thân đến chơi hoặc sinh hoạt. Nếu xảy ra vấn đề liên quan đến an ninh, vi phạm pháp luật bên B phải chịu hoàn toàn trách nhiệm và hoàn toàn không liên quan  trách nhiệm đến bên A.</p>
            <p>8.	Không tàng trữ, buôn bán và sử dụng các loại hàng hóa mà Nhà Nước và Pháp Luật cấm. Nếu xảy ra vấn đề liên quan đến hàng hóa mà Nhà Nước và Pháp Luật không cho phép thì bên B phải chịu hoàn toàn trách nhiệm và hoàn toàn không liên quan  trách nhiệm đến bên A.</p>
            <p>9.	Có trách nhiệm tự khai báo tạm trú ở khu vực sinh sống trong vòng 7 ngày kể từ ngày chuyển đến ở. Nếu không khai báo mà bị cơ quan có thẩm quyền kiểm tra thì mọi vấn đề phát sinh bên A hoàn toàn không chịu trách nhiệm.</p>
            <p>10.	 Có trách nhiệm mở cửa cho khách xem phòng giúp bên A trong trường hợp muốn chuyển đi.</p>
          </div>
        </div>
        {/* Điều 3 */}
        <div className="mt-6">
          <p className="mt-2 font-bold">Điều 3: Đặt cọc.</p>
          <div className="ml-6">
            <p>Ngay sau khi ký hợp đồng, Bên B đặt cọc một khoản tiền bằng 01 tháng của hợp đồng này (gọi là khoản đặt cọc thực hiện hợp đồng). Khi kết thúc hợp đồng, tiền đặt cọc sẽ được bên A hoàn trả cho bên B sau khi trừ các khoản mà bên B chưa thanh toán (nếu có) nhưng không vượt quá số tiền đặt cọc, và phải bàn giao đầy đủ đồ đạc nguyên trạng ban đầu.</p>
          </div>
        </div>
        {/* Điều 4 */}
        <div className="mt-6">
          <p className="mt-2 font-bold">Điều 4: Phương thức thanh toán.</p>
          <div className="ml-6">
            <p>1.	Tiền thuê phòng được bên B thanh toán cho bên A trước khi sử dụng, 01 tháng/lần và chuyển cho bên A vào ngày mùng 1 hoặc mùng 2 dương lịch các kỳ nộp tiền tiếp theo của tháng.            </p>
            <p>2.	Nếu bên B thanh toán muộn tiền thuê phòng quá 5 ngày từ ngày thanh toán quy định trong hợp đồng và các khoản phí quy định khác thì phải chịu mức phạt 100.000đ/ngày. Quá thời hạn 5 ngày chậm sẽ thu hồi lại phòng.</p>
            <p>3.	Tiền thuê phòng được bên B thanh toán trực tiếp cho bên A bằng chuyển khoản vào số  tài khoản sau:</p>
            {/* Tài khoản ngân hàng */}
            <p>- STK:        0026G322171</p>
            <p>- Ngân hàng: Ngân hàng Thương mại cổ phần Việt Nam Thịnh Vượng(VPBANK)</p>
            <p>- Chủ TK: BUI THI LAN</p>
            <p className="font-bold">-  Nội dung ghi rõ: “Thanh Toan P…. thang… sn……………………………</p>
          </div>
          <p>Ví dụ phòng 603 : Thanh toan P603 thang 07 sn 24/27/116 Mieu Dam</p>
          <p>Xác nhận bằng chứng từ ngân hàng.</p>
        </div>

        {/* Điều 5 */}
        <div className="mt-6">
          <p className="mt-2 font-bold">Điều 5: Chấm dứt hợp đồng</p>
          <div className="ml-6">
            <p>1.	Hợp đồng này chấm dứt trong trường hợp bên B vi phạm an ninh trật tự, do vi phạm Pháp Luật hoặc do yêu cầu của cơ quan chức năng, bên A không có trách nhiệm bồi hoàn các khoản tiền đã đóng.</p>
            <p>2.	Hợp đồng chấm dứt trước thời hạn trong trường hợp căn nhà của bên A hư hỏng nặng do những nguyên nhân bất khả kháng nằm ngoài tầm kiểm soát của bên A (Chiến tranh, hỏa hoạn, động đất,…) dẫn đến bên B không thể tiếp tục ở.</p>
            <p>3.	Trường hợp khi hết hạn hợp đồng mà bên B vẫn muốn thuê hoặc không thông báo gì cho bên A. thì hợp đồng mặc định được gia hạn bằng đúng số tháng và có giá trị giống như hợp đồng được ký ở lần đầu. </p>
            <p>4.	Trường hợp đến hạn của hợp đồng mà bên B không có nhu cầu thuê nữa thì phải báo trước cho bên A ít nhất 30 ngày trước ngày hợp đồng hết hạn. Trường hợp thông báo quá muộn (không đủ 30 ngày) thì bên B sẽ mất 100% số tiền đặt cọc </p>
            <p>5.	Nếu Bên B muốn chấm dứt hợp đồng trước thời hạn thì phải thông báo cho bên A biết trước ít nhất 30 ngày thì sẽ được nhận lại 1/3 số tiền đặt cọc. Còn bên A không thông báo hoặc thông báo ít hơn 30 ngày sẽ mất hoàn toàn số tiền đặt cọc</p>
            <p>6.	Bên A có quyền chỉ tiếp nhận ngày chấm dứt hợp đồng vào đúng ngày cuối tháng dương lịch.</p>
            <p>7.	Trong khoảng thời gian 1 tháng trước và sau tết Nguyên Đán hàng năm, bên A sẽ không tiếp nhận bất cứ yêu cầu thanh lý hợp đồng nào từ bên B dù thời hạn hợp đồng còn hay hết. Trường hơp bên B chuyển đi trong khoảng thời gian này thì bên A không có trách nhiệm phải trả lại bất cứ khoản tiền nào mà bên B đã đóng.</p>
            <p>8.	Sau khi hợp đồng chấm dứt, bên B sẽ chuyển tất cả đồ đạc và con người ra khỏi tòa nhà.  Đồng thời vệ sinh sạch sẽ phòng trọ giống như lúc ban đầu nhận phòng. Sau đó thông báo cho bên A thông tin tài khoản của mình. Bên A có trách nhiệm kiểm tra, tính toán và thanh toán cho bên B số tiền dư còn lại (nếu còn) thông qua hình thức chuyển khoản trong vòng 15 ngày làm việc.</p>
          </div>
        </div>
        {/* Điều 6 */}
        <div className="mt-6">
          <p className="mt-2 font-bold">Điều 6: Điều khoản chung.</p>
          <div className="ml-6">
            <p>1.	Hai bên cam kết thực hiện hợp đồng một cách đầy đủ và nghiêm túc. Trong trường hợp có tranh chấp thì hai bên sẽ cùng thiện chí tiến hành thương thảo, nếu không tìm được giải pháp, hai bên thống nhất sẽ tuân theo phán xét của cơ quan tòa án Việt Nam.</p>
            <p>2.	Mọi sửa đổi và bổ sung vào hợp đồng này đều phải được thỏa thuận hai bên và tiến hành bằng văn bản.</p>
            <p>3.	Bản hợp đồng này được hai bên thống nhất lập bằng ngôn ngữ Tiếng Việt. Trong trường hợp xảy ra tranh chấp, bất đồng thì bản Tiếng Việt sẽ được sử dụng làm căn cứ để phán quyết.</p>
            <p>4.	Hợp đồng này được làm thành 02 bản, mỗi bên giữ 01 bản. Các hợp đồng có giá trị pháp lý như nhau.</p>
          </div>
        </div>
        {/* CHỮ KÝ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>BÊN CHO THUÊ (BÊN A)
              <p>(ĐẠI DIỆN BAN QUẢN LÝ)</p>
            </div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>BÊN THUÊ
              <p>(BÊN B)</p>
            </div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
        </div>
        {/* Ngắt trang */}
        <div
          style={{
            pageBreakBefore: "always",
            breakBefore: "page",
          }}
        />
        {/* PHỤ LỤC HỢP ĐỒNG */}
        <div className="mb-8">
          {/* HÀNG 1: Logo góc trái */}
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
            <p className="font-bold uppercase">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="font-medium">
              Độc lập - Tự do - Hạnh Phúc
            </p>
            <div className="mt-2 flex justify-center">
              <div className="h-px w-64 bg-black" />
            </div>
          </div>

          {/* HÀNG 3: Tiêu đề */}
          <div className="mt-6 text-center">
            <h1 className="text-[20px] font-bold uppercase">
              PHỤ LỤC HỢP ĐỒNG
            </h1>
            <p className="font-bold">(v/v bàn giao các trang thiết bị trong phòng và tình trạng sử dụng)</p>
          </div>
          {/* NỘI DUNG */}
          <div className="mt-6">
            <p>Căn cứ vào hợp đồng thuê phòng giữa hai bên. Hai bên đồng ý ký kết phụ lục hợp đồng này để xác nhận việc bàn giao các trang thiết bị trong phòng và tình trạng sử dụng.</p>
          </div>
          {/* Thiết bị trong phòng */}
          <div className="ml-6">
            <p className="font-bold">**Các trang thiết bị trong phòng bao gồm:</p>
            <p>- Tủ lạnh …………………..- CS: 85w : 01 </p>
            <p>- Điều hoà …………………- CS 2638w : 01</p>
            <p> - Giường  1m6x2m: 01</p>
            <p>- Tủ quần áo :01</p>
            <p>- Cửa chính : 01</p>
            <p>- Hệ thống bóng đèn trong phòng</p>

          </div>
          {/* Thiết bị nhà vệ sinh */}
          <div className="ml-6">
            <p className="font-bold">**Các thiết bị trong nhà vệ sinh bao gồm:</p>
            <p>- Cửa ra vào, gương, bồn rửa mặt, đèn nhà vệ sinh, vòi sen, bồn cầu, vòi xịt, vòi nước, vắt khăn, móc treo, ống đựng giấy, 01 bình nóng lạnh 15 lít (tất cả đều mới sử dụng bình thường)</p>
          </div>
          {/* Thiết bị khu vực bếp */}
          <div className="ml-6">
            <p className="font-bold">**Các thiết bị khu vực bếp ban công bao gồm:</p>
            <p>- 01 bộ tủ bếp . 01 kệ bếp. 01 chậu rửa. 01 vòi rửa, 01 bếp từ ARBER- CS: 2000w , 01 máy hút mùi  Sevilla-Sv.s60B
              Phụ lục hợp đồng là một phần không tách rời của hợp đồng chính và được lập thành 02 bản bằng tiếng Việt, mỗi bên giữ 01 bản.
            </p>
          </div>
          {/* CHỮ KÝ */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>BÊN CHO THUÊ (BÊN A)
            </div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>BÊN THUÊ (BÊN B)
            </div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
        </div>
        </div>





      </div>
      <style>{`@media print { @page { size: A4; margin: 20mm; } body { -webkit-print-color-adjust: exact; } }`}</style>
    </div>
  );
}

export default function PrintContractPage() {
  return (
    <Suspense fallback={<div>Đang tải…</div>}>
      <ContractPrintInner />
    </Suspense>
  );
}
{/* Property info
        <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>2. Thông tin bất động sản</strong></div>
          <div>
            <div>Địa chỉ/Tòa nhà: {apartment?.buildingName ?? apartment?.streetAddress ?? contract.buildingAddress ?? '—'}</div>
            <div>Căn hộ/Phòng: {apartment?.title ?? contract.apartmentTitle ?? '—'}</div>
            <div>Mã phòng: {apartment?.roomCode ?? contract.roomCode ?? '-'}</div>
          </div>
        </section> */}
{/* Terms table
        <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>3. Điều khoản chính</strong></div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8, width: '40%' }}>Giá thuê</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{contract.rentAmount != null ? formatMoneyVND(Number(contract.rentAmount)) : '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Tiền đặt cọc</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{contract.depositAmount != null ? formatMoneyVND(Number(contract.depositAmount)) : '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Chu kỳ thanh toán</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{contract.paymentCycle ?? '—'} tháng</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Ngày bắt đầu</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Ngày kết thúc</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString() : '—'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>Trạng thái</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{contract.status ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ marginTop: 18 }}>
          <div style={{ marginBottom: 6 }}><strong>4. Nội dung hợp đồng</strong></div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: contract.contentHtml ?? contract.note ?? '<p>Điều khoản chi tiết...</p>' }} />
        </section> */}

