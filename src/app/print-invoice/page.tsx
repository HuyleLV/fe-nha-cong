"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RenderInvoiceTemplate from '@/components/invoices';
import { toast } from 'react-toastify';

export default function PrintInvoicePage() {
  const search = useSearchParams?.();
  const id = (search?.get('id') || search?.get('invoiceId') || '') as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Không tải được hóa đơn');
        const json = await res.json();
        const data = json?.data ?? json;
        if (mounted) setInvoice(data);
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
        {/* Controls are provided in the parent modal; hide in-page buttons here */}

        {loading && <div>Đang tải hóa đơn...</div>}
        {!loading && !invoice && <div>Không tìm thấy hóa đơn</div>}
        {!loading && invoice && (
          <RenderInvoiceTemplate printTemplate={invoice.printTemplate} invoice={invoice} />
        )}
      </div>
    </div>
  );
}
