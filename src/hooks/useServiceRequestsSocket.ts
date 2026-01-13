import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type ServiceRequestPayload = {
  id: number;
  title: string;
  type?: string | null;
  status?: string | null;
  buildingId?: number | null;
  apartmentId?: number | null;
  customerId?: number | null;
  createdAt?: string | Date;
};

export function useServiceRequestsSocket(opts: { isAdmin?: boolean; userId?: number }){
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<ServiceRequestPayload[]>([]);
  const sockRef = useRef<Socket | null>(null);

  useEffect(()=>{
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!baseUrl) return;
    const s = io(baseUrl, { transports: ['websocket','polling'], withCredentials: true, reconnectionAttempts: 5 });
    sockRef.current = s;
    s.on('connect', ()=>{
      setConnected(true);
      if (opts?.isAdmin) s.emit('join', { room: 'admin' });
      if (opts?.userId) s.emit('join', { room: `user:${opts.userId}` });
    });
    s.on('disconnect', ()=> setConnected(false));
    s.on('service-request:new', (msg: ServiceRequestPayload)=>{
      setItems((prev)=> [msg, ...prev].slice(0, 50));
      setUnread((u)=> Math.min(99, u+1));
    });
    const onMarkOneRead = () => setUnread((u)=> Math.max(0, u-1));
    const onMarkAllReadEvt = () => setUnread(0);
    if (typeof window !== 'undefined') {
      window.addEventListener('service-requests:markOneRead', onMarkOneRead as EventListener);
      window.addEventListener('service-requests:markAllRead', onMarkAllReadEvt as EventListener);
    }
    return ()=>{
      s.off('service-request:new');
      s.disconnect();
      sockRef.current = null;
      if (typeof window !== 'undefined') {
        window.removeEventListener('service-requests:markOneRead', onMarkOneRead as EventListener);
        window.removeEventListener('service-requests:markAllRead', onMarkAllReadEvt as EventListener);
      }
    };
  }, [opts?.isAdmin, opts?.userId]);

  const markAllRead = ()=> setUnread(0);
  const markOneRead = ()=> setUnread((u)=> Math.max(0, u-1));

  return { connected, unread, items, markAllRead, markOneRead };
}
