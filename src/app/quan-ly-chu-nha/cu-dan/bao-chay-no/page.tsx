"use client";

import React from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import Link from 'next/link';

export default function BaoChayNoPage() {
  return (
    <div className="p-6">
      <Panel title="Báo cháy nổ">
        <p className="text-sm text-slate-600">Báo sự cố cháy nổ từ cư dân sẽ xuất hiện ở đây.</p>
        <div className="mt-4">
          <Link href="/quan-ly-chu-nha/cu-dan" className="text-sm text-emerald-600">Quay lại Cư dân</Link>
        </div>
      </Panel>
    </div>
  );
}
