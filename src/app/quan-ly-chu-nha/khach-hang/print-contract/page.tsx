"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { contractService } from '@/services/contractService';
import { apartmentService } from '@/services/apartmentService';
import { formatMoneyVND } from '@/utils/format-number';

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
        {/* Header / logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>CÔNG TY / CHỦ NHÀ (Tên)</div>
            <div style={{ color: '#555', marginTop: 4 }}>Địa chỉ: ________________________</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13 }}>{new Date(contract.createdAt || contract.startDate || Date.now()).toLocaleDateString()}</div>
            <button onClick={onPrint} style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#f7f7f7', cursor: 'pointer' }}>In / Print</button>
          </div>
        </div>

        <h1 style={{ textAlign: 'center', margin: '18px 0', fontSize: 20, textDecoration: 'underline' }}>HỢP ĐỒNG THUÊ NHÀ / PHÒNG</h1>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>Mã hợp đồng: <strong>{contract.id}</strong></div>

        {/* Parties */}
        <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>1. Các bên tham gia</strong></div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Bên cho thuê (Bên A)</div>
              <div>Tên: {contract.landlordName ?? '________________'}</div>
              <div>Điện thoại: {contract.landlordPhone ?? '________________'}</div>
              <div>Email: {contract.landlordEmail ?? '________________'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Bên thuê (Bên B)</div>
              <div>Tên: {customer?.name ?? contract.customerName ?? '________________'}</div>
              <div>Điện thoại: {customer?.phone ?? contract.customerPhone ?? '________________'}</div>
              <div>Email: {customer?.email ?? contract.customerEmail ?? '________________'}</div>
            </div>
          </div>
        </section>

        {/* Property info */}
        <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>2. Thông tin bất động sản</strong></div>
          <div>
            <div>Địa chỉ/Tòa nhà: {apartment?.buildingName ?? apartment?.streetAddress ?? contract.buildingAddress ?? '—'}</div>
            <div>Căn hộ/Phòng: {apartment?.title ?? contract.apartmentTitle ?? '—'}</div>
            <div>Mã phòng: {apartment?.roomCode ?? contract.roomCode ?? '-'}</div>
          </div>
        </section>

        {/* Terms table */}
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
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>Bên cho thuê</div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>Bên thuê</div>
            <div style={{ marginTop: 56 }}>_______________________</div>
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
