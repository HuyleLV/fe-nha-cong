"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RenderInvoiceTemplate from '@/components/invoices';
import { toast } from 'react-toastify';
import { invoiceService } from '@/services/invoiceService';
import { apartmentService } from '@/services/apartmentService';

function PrintInvoiceInner() {
  const search = useSearchParams();
  const id = (search.get('id') || search.get('invoiceId') || '') as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Fetch invoice via invoiceService (uses app's axios client)
        const invRes = await invoiceService.getById(Number(id));
        const inv = invRes?.data ?? invRes;
        if (mounted) setInvoice(inv);

        // If invoice contains apartmentId, fetch apartment via apartmentService
        const apartmentId = inv?.apartmentId ?? inv?.apartmentId;
        if (apartmentId) {
          try {
            const aptRes = await apartmentService.getById(Number(apartmentId));
            // apartmentService.getById may return the entity directly or wrapped in { data }
            const apt = (aptRes as any)?.data ?? aptRes;
            if (mounted) setApartment(apt);
          } catch (e) {
            console.warn('Could not load apartment', e);
          }
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Không tải được hóa đơn');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onPrint = () => window.print();

  const downloadDoc = () => {
    try {
      const doc = document.documentElement.outerHTML;
      const blob = new Blob([doc], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id || 'unknown'}.doc`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error('Không thể tải file Word');
    }
  };

  return (
    <div style={{ padding: 16, background: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {loading && <div>Đang tải hóa đơn...</div>}
        {!loading && !invoice && <div>Không tìm thấy hóa đơn</div>}
        {!loading && invoice && (
          <RenderInvoiceTemplate printTemplate={invoice.printTemplate} invoice={{ ...invoice, apartment }} />
        )}
      </div>
    </div>
  );
}

export default function PrintInvoicePage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <PrintInvoiceInner />
    </Suspense>
  );
}
