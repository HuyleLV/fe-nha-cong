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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>CÔNG TY / CHỦ NHÀ (Tên)</div>
            <div style={{ color: '#555', marginTop: 4 }}>Địa chỉ: ________________________</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13 }}>{new Date(deposit.createdAt || deposit.depositDate || Date.now()).toLocaleDateString()}</div>
            <button onClick={onPrint} style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#f7f7f7', cursor: 'pointer' }}>In / Print</button>
          </div>
        </div>

        <h1 style={{ textAlign: 'center', margin: '18px 0', fontSize: 20, textDecoration: 'underline' }}>BIÊN NHẬN ĐẶT CỌC</h1>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>Mã biên nhận: <strong>{deposit.id}</strong></div>

        <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>1. Thông tin người đặt cọc</strong></div>
          <div>
            <div>Tên: {customer?.name ?? deposit.customerName ?? '________________'}</div>
            <div>Điện thoại: {customer?.phone ?? deposit.customerPhone ?? '________________'}</div>
            <div>Email: {customer?.email ?? deposit.customerEmail ?? '________________'}</div>
          </div>
        </section>

        <section style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}><strong>2. Thông tin bất động sản</strong></div>
          <div>
            <div>Địa chỉ/Tòa nhà: {apartment?.buildingName ?? apartment?.streetAddress ?? deposit.buildingAddress ?? '—'}</div>
            <div>Căn hộ/Phòng: {apartment?.title ?? deposit.apartmentTitle ?? '—'}</div>
            <div>Mã phòng: {apartment?.roomCode ?? deposit.roomCode ?? '-'}</div>
          </div>
        </section>

        <section style={{ marginBottom: 12 }}>
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
        </section>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>Người nhận tiền</div>
            <div style={{ marginTop: 56 }}>_______________________</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>Người đặt cọc</div>
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
