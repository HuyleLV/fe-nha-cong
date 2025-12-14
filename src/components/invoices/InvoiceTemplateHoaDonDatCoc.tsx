"use client";

import React from "react";
import { COMPANY } from './companyInfo';

interface Props { invoice: any }

const formatMoney = (v: any) => {
  const n = Number((v ?? 0));
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
};

export default function InvoiceTemplateHoaDonDatCoc({ invoice }: Props) {
  // Use global company info
  const company = { name: COMPANY.name, taxCode: COMPANY.taxCode, address: COMPANY.address, logo: COMPANY.logo };
  const customer = invoice.customer || {};
  const id = invoice.id ?? '';
  const date = invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '';
  const amount = invoice.total ?? invoice.amount ?? invoice.depositAmount ?? '';
  const paymentMethod = (invoice.paymentMethod ?? invoice.payment) || '';
  const contractRef = invoice.contractRef ?? invoice.contractNumber ?? '';
  const contractDate = invoice.contractDate ? new Date(invoice.contractDate).toLocaleDateString() : '';

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, Roboto, Arial', color: '#111827', padding: 20 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '2px solid #e6e6e6', paddingBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <img src={company.logo} alt="logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{company.name}</div>
              <div style={{ fontSize: 12, color: '#374151' }}>MST: {company.taxCode}</div>
              <div style={{ fontSize: 12, color: '#374151' }}>{company.address}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>HÓA ĐƠN THU TIỀN ĐẶT CỌC</div>
            <div style={{ marginTop: 6 }}>Số: <strong>{id}</strong></div>
            <div>Ngày: <strong>{date}</strong></div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div><strong>Khách hàng:</strong> {customer.name ?? invoice.payerName ?? ''}</div>
          <div><strong>CCCD/MST:</strong> {customer.idNumber ?? customer.taxCode ?? invoice.payerId ?? ''}</div>
          <div><strong>Địa chỉ:</strong> {customer.address ?? ''}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div><strong>Nội dung:</strong></div>
          <div>Thu tiền đặt cọc thuê phòng theo Hợp đồng số {contractRef || '...'} ngày {contractDate || '...'}</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left' }}>Mô tả</th>
              <th style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>Số tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>Tiền đặt cọc</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'right' }}>{formatMoney(amount)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 12 }}><strong>Hình thức thanh toán:</strong> {paymentMethod}</div>

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
