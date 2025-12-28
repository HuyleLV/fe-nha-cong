import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

export function useMessagesSocket(currentUserId?: number, isChatOpen?: boolean) {
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const [last, setLast] = useState<any | null>(null);
  const sockRef = useRef<Socket | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!baseUrl) return;
    const s = io(baseUrl, { transports: ['websocket','polling'], withCredentials: true, reconnectionAttempts: 5 });
    sockRef.current = s;

    s.on('connect', () => {
      setConnected(true);
      try {
        if (currentUserId) s.emit('join', { room: `user:${currentUserId}` });
      } catch {}
    });
    s.on('disconnect', () => setConnected(false));

    const onNew = (payload: any) => {
      try {
        // payload shape from server: { conversationId, message }
        const msg = payload?.message || payload;
        setLast(msg || null);

        // If chat page is open, consider messages read
        if (isChatOpen) {
          setUnread(0);
        } else {
          setUnread((u) => Math.min(99, u + 1));
          try { toast.info((msg && (msg.text || msg.preview || 'Bạn có tin nhắn mới')) || 'Bạn có tin nhắn mới'); } catch {}
        }
      } catch (e) {}
    };

    s.on('conversation:message:new', onNew);

    return () => {
      try { s.off('conversation:message:new', onNew); s.disconnect(); } catch {}
      sockRef.current = null;
    };
  }, [currentUserId, isChatOpen]);

  const markAllRead = () => setUnread(0);

  return { connected, unread, last, markAllRead };
}
