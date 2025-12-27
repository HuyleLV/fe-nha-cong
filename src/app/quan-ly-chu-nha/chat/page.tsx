"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HostChatPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect host admin chat path to main chat page (authenticated)
    router.replace('/chat');
  }, [router]);
  return null;
}
