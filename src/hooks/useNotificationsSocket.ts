import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

export type NotificationPayload = {
  id: number;
  title: string;
  content?: string | null;
  attachments?: string | null;
  recipientType?: 'building' | 'apartment' | null;
  buildingId?: number | null;
  apartmentId?: number | null;
  createdAt?: string | Date;
};

export function useNotificationsSocket(currentUserId?: number){
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationPayload[]>([]);
  const sockRef = useRef<Socket | null>(null);

  useEffect(()=>{
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!baseUrl) return;
    const s = io(baseUrl, { transports: ['websocket','polling'], withCredentials: true, reconnectionAttempts: 5 });
    sockRef.current = s;
    s.on('connect', ()=>{
      setConnected(true);
      if (currentUserId) s.emit('join', { room: `user:${currentUserId}` });
    });
    s.on('disconnect', ()=> setConnected(false));
    s.on('notification:new', (msg: NotificationPayload)=>{
      setItems((prev)=> [msg, ...prev].slice(0, 50));
      setUnread((u)=> Math.min(99, u+1));
      toast.info(msg?.title || 'Bạn có thông báo mới');
    });
    return ()=>{
      s.off('notification:new');
      s.disconnect();
      sockRef.current = null;
    };
  }, [currentUserId]);

  const markAllRead = ()=> setUnread(0);

  return { connected, unread, items, markAllRead };
}
