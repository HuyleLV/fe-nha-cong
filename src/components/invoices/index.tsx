"use client";

import React from 'react';
import HoaDonDatCoc from './InvoiceTemplateHoaDonDatCoc';
import HoaDonHangThang from './InvoiceTemplateHoaDonHangThang';
import HoaDonThanhLy from './InvoiceTemplateHoaDonThanhLy';
import HoaDonHoanTien from './InvoiceTemplateHoaDonHoanTien';
import HoaDonChuyenNhuong from './InvoiceTemplateHoaDonChuyenNhuong';
import HoaDonHopDongMoi from './InvoiceTemplateHoaDonHopDongMoi';

interface Props { printTemplate?: string, invoice: any }

export function RenderInvoiceTemplate({ printTemplate, invoice }: Props) {
  const slug = String(printTemplate || '').trim();
  switch (slug) {
    case 'hoa-don-dat-coc':
      return <HoaDonDatCoc invoice={invoice} />;
    case 'hoa-don-hang-thang':
      return <HoaDonHangThang invoice={invoice} />;
    case 'hoa-don-thanh-ly-hop-dong':
      return <HoaDonThanhLy invoice={invoice} />;
    case 'hoa-don-hoan-tien-dat-coc':
      return <HoaDonHoanTien invoice={invoice} />;
    case 'hoa-don-chuyen-nhuong':
      return <HoaDonChuyenNhuong invoice={invoice} />;
    case 'hoa-don-hop-dong-moi':
      return <HoaDonHopDongMoi invoice={invoice} />;
    default:
      // Fallback: simple monthly invoice view
      return <HoaDonHangThang invoice={invoice} />;
  }
}

export default RenderInvoiceTemplate;
