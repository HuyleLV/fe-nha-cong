"use client";

import React from "react";
import { COMPANY } from './companyInfo';

interface Props { invoice: any }

const fmt = (v: any) => new Intl.NumberFormat('vi-VN').format(Number(v || 0)) + ' ₫';

export default function InvoiceTemplateHoaDonHoanTien({ invoice }: Props) {
  const company = { name: COMPANY.name, taxCode: COMPANY.taxCode, address: COMPANY.address, logo: COMPANY.logo };
  const customer = invoice.customer || {};
  const apartment = invoice.apartment || {};
  const id = invoice.id ?? '';
  const date = invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '';

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial', color: '#111827' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '2px solid #e6e6e6', paddingBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <img src={company.logo} alt="logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{company.name}</div>
              <div style={{ fontSize: 12, color: '#374151' }}>MST: {company.taxCode}</div>
              <div style={{ fontSize: 12, color: '#374151' }}>{company.address}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>PHIẾU CHI / HÓA ĐƠN HOÀN TIỀN ĐẶT CỌC</div>
            <div style={{ marginTop: 6 }}>Số: <strong>{id}</strong></div>
            <div>Ngày: <strong>{date}</strong></div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div><strong>Khách hàng:</strong> {customer.name ?? ''}</div>
          <div><strong>Phòng:</strong> {apartment.roomNumber ?? apartment.title ?? ''}</div>
        </div>

        <div style={{ marginTop: 12, background: '#fafafa', padding: 12, borderRadius: 6 }}>
          <div style={{ marginBottom: 6 }}><strong>Nội dung:</strong> Hoàn tiền đặt cọc sau thanh lý hợp đồng</div>
          <div><strong>Số tiền:</strong> {fmt(invoice.total ?? invoice.amount)}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
          <div style={{ textAlign: 'center' }}>
            <div>Người nhận tiền</div>
            <div style={{ marginTop: 40 }}>(Ký, ghi rõ họ tên)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div>Người chi tiền</div>
            <div style={{ marginTop: 40 }}>(Ký, ghi rõ họ tên)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
