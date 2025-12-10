"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KhachTiemNangIdPage({ params }: { params: { id: string } }){
  const router = useRouter();
  useEffect(() => {
    // redirect to the original customer edit page to reuse existing form
    router.replace(`/quan-ly-chu-nha/khach-hang/khach-hang/${params.id}`);
  }, [params.id, router]);
  return null;
}
