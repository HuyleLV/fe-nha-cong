// app/blog/[slug]/share-actions.tsx
"use client";

import { Copy, Share2 } from "lucide-react";

export default function ShareActions({ shareUrl }: { shareUrl: string }) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Đã copy liên kết bài viết!");
    } catch {
      alert("Không thể copy. Hãy copy thủ công: " + shareUrl);
    }
  };

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:border-emerald-400"
      >
        <Copy className="h-4 w-4" /> Copy link
      </button>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <Share2 className="h-4 w-4" /> Chia sẻ Facebook
      </a>
    </div>
  );
}
