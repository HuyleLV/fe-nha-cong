"use client";

import message from "@/assets/messenger.png";
import zalo from "@/assets/zalo.png";

export default function FloatingChatButtons() {
  const zaloUrl = process.env.NEXT_PUBLIC_ZALO_LINK || "https://zalo.me/0968345486";
  const messengerUrl = process.env.NEXT_PUBLIC_FB_MESSENGER_LINK || "https://m.me/2041745982787369";

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Stack each icon with its own decorative background */}
      <div className="flex flex-col items-end gap-3">
        {/* Zalo */}
        <div className="relative w-14 h-14 grid place-items-center">
          {/* Outer soft green */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-emerald-200/70 ring-1 ring-emerald-300/40" />
          {/* Inner white disc to increase contrast */}
          <div className="pointer-events-none absolute inset-1.5 rounded-full bg-white/95 ring-1 ring-white/80" />
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Zalo"
            title="Chat Zalo"
            className="inline-block hover:scale-105 transition-transform"
          >
            <img src={zalo.src} alt="Zalo" className="h-11 w-11 md:h-12 md:w-12 select-none drop-shadow-sm" />
            <span className="sr-only">Zalo</span>
          </a>
        </div>

        {/* Facebook Messenger */}
        <div className="relative w-14 h-14 grid place-items-center">
          {/* Outer soft green */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-emerald-200/70 ring-1 ring-emerald-300/40" />
          {/* Inner white disc to increase contrast */}
          <div className="pointer-events-none absolute inset-1.5 rounded-full bg-white/95 ring-1 ring-white/80" />
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Facebook Messenger"
            title="Chat Facebook Messenger"
            className="inline-block hover:scale-105 transition-transform"
          >
            <img src={message.src} alt="Messenger" className="h-11 w-11 md:h-12 md:w-12 select-none drop-shadow-sm" />
            <span className="sr-only">Messenger</span>
          </a>
        </div>
      </div>
    </div>
  );
}
