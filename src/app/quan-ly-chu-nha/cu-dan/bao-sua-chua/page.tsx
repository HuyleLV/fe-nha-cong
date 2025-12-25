"use client";

import React from 'react';
import Panel from '@/app/quan-ly-chu-nha/components/Panel';
import Link from 'next/link';

export default function BaoSuaChuaPage() {
  return (
    <div className="p-6">
      <Panel title="Báo sửa chữa">
        <p className="text-sm text-slate-600">Nơi cư dân báo sửa chữa các thiết bị/hạng mục.</p>
        <div className="mt-4">
          <Link href="/quan-ly-chu-nha/cu-dan" className="text-sm text-emerald-600">Quay lại Cư dân</Link>
        </div>
      </Panel>
    </div>
  );
}
