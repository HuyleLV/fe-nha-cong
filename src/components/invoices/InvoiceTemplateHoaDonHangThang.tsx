"use client";

import React from "react";
import { COMPANY } from './companyInfo';

interface Props { invoice: any }

const formatMoney = (v: any) => {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
};

export default function InvoiceTemplateHoaDonHangThang({ invoice }: Props) {
  const company = { name: COMPANY.name, taxCode: COMPANY.taxCode, address: COMPANY.address, logo: COMPANY.logo };
  const customer = invoice.customer || {};
  const apartment = invoice.apartment || {};
  const roomCode = apartment.roomCode ?? apartment.code ?? apartment.roomNumber ?? invoice.roomCode ?? invoice.roomNumber ?? '';
  const roomTitle = apartment.title ?? invoice.roomTitle ?? invoice.roomName ?? '';
  const id = invoice.id ?? '';
  const monthLabel = invoice.period ?? invoice.month ?? '';

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial', color: '#111827', padding: 20 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '2px solid #e6e6e6', paddingBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <img loading="lazy" src={company.logo} alt="logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{company.name}</div>
              <div style={{ fontSize: 12, color: '#374151' }}>MST: {company.taxCode}</div>
              <div style={{ fontSize: 12, color: '#374151' }}>{company.address}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>HÓA ĐƠN TIỀN THUÊ PHÒNG</div>
            <div style={{ marginTop: 6 }}>Số: <strong>{id}</strong></div>
            <div>Tháng: <strong>{monthLabel}</strong></div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div><strong>Khách hàng:</strong> {customer.name ?? invoice.payerName ?? ''}</div>
          <div><strong>Mã phòng:</strong> {roomCode}</div>
          <div><strong>Tên phòng:</strong> {roomTitle}</div>
        </div>

        <div style={{ marginBottom: 12, background: '#fafafa', padding: 12, borderRadius: 6 }}>
          <div style={{ marginBottom: 6 }}><strong>Nội dung:</strong> Tiền thuê phòng tháng {monthLabel}</div>
          <div style={{ marginBottom: 6 }}><strong>Số tiền:</strong> {formatMoney(invoice.total ?? invoice.amount)}</div>
          <div><strong>Hình thức thanh toán:</strong> {(invoice.paymentMethod ?? invoice.payment) || ''}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
          <div style={{ textAlign: 'center' }}>
            <div>Người nộp tiền</div>
            <div style={{ marginTop: 40 }}>(Ký, ghi rõ họ tên)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div>Người thu tiền</div>
            <div style={{ marginTop: 40 }}>(Ký, ghi rõ họ tên)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
