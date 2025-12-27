"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Paperclip } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';
import { apartmentService } from '@/services/apartmentService';
import { conversationService } from '@/services/conversationService';
import { userService } from '@/services/userService';
import UploadPicker from '@/components/UploadPicker';

type Message = {
  id: string;
  fromMe: boolean;
  text?: string;
  createdAt: string;
  attachments?: any[];
  icon?: string | null;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);

  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const search = useSearchParams();
  const router = useRouter();
  const convQuery = search?.get('c') ?? null;
  const ownerParam = search?.get('ownerId') ?? null;
  const apartmentParam = search?.get('apartmentId') ?? null;
  const [meId, setMeId] = useState<number | null>(null);
  const [apartment, setApartment] = useState<any | null>(null);
  const [owner, setOwner] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [icon, setIcon] = useState<string | null>(null);
  const createdForParams = useRef(false);
  const sockRef = useRef<Socket | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    // scroll to bottom on messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;

    try {
      // Ensure authenticated
      const hasToken = (typeof window !== 'undefined') && (
        !!localStorage.getItem('access_token') || !!localStorage.getItem('tokenUser') || !!localStorage.getItem('tokenAdmin') || document.cookie.includes('auth_user=')
      );
      if (!hasToken) {
        const next = `/chat?apartmentId=${encodeURIComponent(String(apartmentParam ?? ''))}&ownerId=${encodeURIComponent(String(ownerParam ?? ''))}`;
        router.push(`/dang-nhap?next=${encodeURIComponent(next)}`);
        return;
      }

      // If there's no active conversation, create one including current user and owner
      let convId = activeConv;
      if (!convId) {
        const me = await userService.getMe().catch(() => null);
        if (!me) {
          const next = `/chat?apartmentId=${encodeURIComponent(String(apartmentParam ?? ''))}&ownerId=${encodeURIComponent(String(ownerParam ?? ''))}`;
          router.push(`/dang-nhap?next=${encodeURIComponent(next)}`);
          return;
        }
        setMeId(me.id ?? null);
        const participantIds = [Number(owner?.id ?? ownerParam), Number(me.id)];
        try {
            const createRes = await conversationService.create(participantIds, apartmentParam ? Number(apartmentParam) : undefined);
            // If server returned a wrapper with conversation and possible messageError, surface messageError but continue
            if (createRes && (createRes as any).messageError) {
              try { toast.warn((createRes as any).messageError || 'Không gửi được tin nhắn khởi tạo'); } catch {}
            }
            const convObj = createRes && (createRes.conversation ? createRes.conversation : createRes);
            const id = convObj?.id ?? (convObj && convObj.id === 0 ? 0 : undefined);
            if (id == null) {
              // If server didn't return id, try to infer: if createRes is an id or contains 'conversationId'
              if (typeof createRes === 'number') {
                convId = String(createRes);
              } else if (createRes && (createRes.conversationId || createRes.id)) {
                convId = String(createRes.conversationId || createRes.id);
              } else {
                throw new Error('Không nhận được id cuộc trò chuyện từ server');
              }
            } else {
              convId = String(id);
            }
          setActiveConv(convId);
          // ensure conversation appears in list
            setConversations((s) => {
              try {
                const toAdd = convObj || createRes;
                if (!Array.isArray(s)) return [toAdd];
                if (s.some((x: any) => String(x?.id) === convId)) return s;
                return [toAdd, ...s];
              } catch {
                return s;
              }
            });
          // set owner if not set
          try {
              const participants = Array.isArray((convObj || createRes)?.participants) ? (convObj || createRes).participants : [];
              const other = participants.find((p: any) => Number(p.id) === Number(ownerParam)) || participants.find((p: any) => Number(p.id) !== Number(me.id)) || participants[0] || null;
            setOwner(other);
          } catch {}
        } catch (err: any) {
          console.error('Không thể tạo cuộc trò chuyện', err);
          try { toast.error(typeof err === 'string' ? err : (err?.message || 'Không thể tạo cuộc trò chuyện')); } catch {}
          return;
        }
      }

      // Now post the message to convId (include attachments and optional icon)
      const res = await conversationService.postMessage(Number(convId), input.trim(), attachments.length ? attachments : undefined, icon ?? undefined);
      const msg = res ?? res;

      // After posting, fetch authoritative message list for the conversation
      try {
        const fetched = await conversationService.getMessages(Number(convId));
        const msgs = fetched ?? [];
        const mapped: Message[] = (msgs || []).map((m: any) => ({ id: String(m.id), fromMe: Number(m.from?.id) === Number(meId), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null }));
        setMessages(mapped);
        // set owner from current conversation participants if available
        try {
          const conv = conversations.find((c) => String(c?.id ?? '') === String(convId));
          if (conv) {
            const participants = Array.isArray(conv.participants) ? conv.participants : [];
            const other = participants.find((p: any) => Number(p.id) !== Number(meId)) || participants[0] || null;
            setOwner(other);
          }
        } catch {}
      } catch (e) {
        // fallback: append local temporary message if fetch fails
        const local: Message = { id: String((msg && msg.id) || Date.now()), fromMe: true, text: (msg && msg.text) || input.trim(), createdAt: (msg && msg.createdAt) || new Date().toISOString(), attachments: (msg && msg.attachments) || attachments, icon: (msg && msg.icon) || icon };
        setMessages((s) => [...s, local]);
      }
      setInput('');
      // clear attachments/icon after send
      setAttachments([]);
      setIcon(null);
    } catch (e) {
      console.error(e);
      try { toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại.'); } catch {}
    }
  };

  // Load current user and conversation list
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await userService.getMe().catch(() => null);
        if (!mounted) return;
        setMeId(me?.id ?? null);
        const list = await conversationService.listMine().catch(() => []);
        if (!mounted) return;
        // Normalize response to array
        let arr: any[] = [];
        if (Array.isArray(list)) arr = list;
        else if (list && Array.isArray((list as any).data)) arr = (list as any).data;
        else if (list && typeof list === 'object') arr = [list];
        else arr = [];
        if (!Array.isArray(arr)) {
          console.warn('conversationService.listMine returned unexpected value, coercing to array:', list);
          arr = [];
        }
        setConversations(arr);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // If chat opened from room (ownerId+apartmentId), create or open conversation and set active
  useEffect(() => {
    if (!ownerParam) return;
    if (createdForParams.current) return;
    (async () => {
      // If there's no local token, redirect to login with next to this chat URL
      const hasToken = (typeof window !== 'undefined') && (
        !!localStorage.getItem('access_token') || !!localStorage.getItem('tokenUser') || !!localStorage.getItem('tokenAdmin') || document.cookie.includes('auth_user=')
      );
      if (!hasToken) {
        const next = `/chat?apartmentId=${encodeURIComponent(String(apartmentParam ?? ''))}&ownerId=${encodeURIComponent(String(ownerParam ?? ''))}`;
        router.push(`/dang-nhap?next=${encodeURIComponent(next)}`);
        return;
      }
      // Fetch apartment info (if provided) so header can show it
      if (apartmentParam) {
        try {
          const a = await apartmentService.getById(Number(apartmentParam));
          setApartment(a);
        } catch (err: any) {
          // ignore apartment fetch errors but show a short toast
          try { toast.info('Không thể tải thông tin căn hộ'); } catch {}
        }
      }

      try {
        // Ensure we have current user id to include in participants
        const me = await userService.getMe().catch(() => null);
        if (!me) {
          const next = `/chat?apartmentId=${encodeURIComponent(String(apartmentParam ?? ''))}&ownerId=${encodeURIComponent(String(ownerParam ?? ''))}`;
          router.push(`/dang-nhap?next=${encodeURIComponent(next)}`);
          return;
        }
        setMeId(me.id ?? null);

  // Compose preset message including apartment info and 'Đang quan tâm'
  const title = apartment?.title || apartment?.name || (apartmentParam ? `Căn hộ #${apartmentParam}` : 'căn hộ này');
  const addr = apartment?.address || apartment?.district?.name || '';
  const preset = `${title}${addr ? ' - ' + addr : ''}\nĐang quan tâm`;

  const createRes = await conversationService.create([Number(ownerParam), Number(me.id)], apartmentParam ? Number(apartmentParam) : undefined, preset);
  // If server returned a wrapper with a messageError, show a warning but continue
  if (createRes && (createRes as any).messageError) {
    try { toast.warn((createRes as any).messageError || 'Không gửi được tin nhắn khởi tạo'); } catch {}
  }
  // createRes may be the conversation object or { conversation, message }
  const conv = createRes && (createRes.conversation ? createRes.conversation : createRes);
  const id = conv?.id ?? (conv && conv.id === 0 ? 0 : undefined);
        if (id == null) throw new Error('Không nhận được id cuộc trò chuyện từ server');
        createdForParams.current = true;
        const idStr = String(id);
        setActiveConv(idStr);
        // ensure conversation appears in list
        setConversations((s) => {
          try {
            if (!Array.isArray(s)) return [conv];
            if (s.some((x: any) => String(x?.id) === idStr)) return s;
            return [conv, ...s];
          } catch {
            return s;
          }
        });

        // set owner from returned conversation participants
        try {
          const participants = Array.isArray(conv?.participants) ? conv.participants : [];
          const other = participants.find((p: any) => Number(p.id) === Number(ownerParam)) || participants.find((p: any) => Number(p.id) !== Number(me.id)) || participants[0] || null;
          setOwner(other);
        } catch {}

        // Replace URL so chat shows conversation id cleanly
        try { router.replace(`/chat?c=${encodeURIComponent(idStr)}`); } catch {}

        // If server returned an initial message as part of create response, use it
        try {
          if (createRes && createRes.message) {
            const m = createRes.message;
            const mappedAfter: Message[] = [{ id: String(m.id), fromMe: Number(m.from?.id) === Number(me.id), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null }];
            setMessages(mappedAfter);
          } else {
            // otherwise fetch existing messages for the conversation
            const existing = await conversationService.getMessages(Number(id));
            const mappedAfter: Message[] = (existing ?? []).map((m: any) => ({ id: String(m.id), fromMe: Number(m.from?.id) === Number(me.id), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null }));
            setMessages(mappedAfter);
          }
        } catch (err) {
          // ignore message-fetch errors
        }
      } catch (e) {
        console.error('Failed to create/open conversation from params', e);
        try { toast.error(typeof e === 'string' ? e : ((e as any)?.message || 'Không thể mở cuộc trò chuyện.')); } catch {}
      }
    })();
  }, [ownerParam, apartmentParam, router]);

  // Setup socket.io connection and listen for real-time messages
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!baseUrl) return;
    const s = io(baseUrl, { transports: ['websocket', 'polling'], withCredentials: true, reconnectionAttempts: 5 });
    sockRef.current = s;

    s.on('connect', () => {
      // join user room and conversation room if available
      try {
        if (meId) s.emit('join', { room: `user:${meId}` });
        if (activeConv) s.emit('join', { room: `conversation:${activeConv}` });
      } catch {}
    });

    s.on('conversation:message:new', (payload: any) => {
      try {
        const m = payload?.message;
        if (!m) return;
        // Only add if it belongs to current active conversation
        if (String(payload?.conversationId) !== String(activeConv)) return;
        setMessages((prev) => {
          const exists = (prev || []).some((x) => String(x.id) === String(m.id));
          if (exists) return prev;
          const mapped: Message = { id: String(m.id), fromMe: Number(m.from?.id) === Number(meId), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null };
          return [...prev, mapped];
        });
      } catch (e) {}
    });

    return () => {
      try { s.off('conversation:message:new'); s.disconnect(); } catch {}
      sockRef.current = null;
    };
  }, [meId, activeConv]);

  // If active conversation changes, ask socket to join that room
  useEffect(() => {
    try {
      if (sockRef.current && activeConv) {
        sockRef.current.emit('join', { room: `conversation:${activeConv}` });
      }
    } catch {}
  }, [activeConv]);

  // When active conversation changes (user clicked a conversation or opened via c=), load messages and owner
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activeConv) {
        setMessages([]);
        return;
      }

      try {
        const convId = Number(activeConv);
        // fetch authoritative messages
        const msgs = await conversationService.getMessages(convId).catch((e) => { throw e; });
        if (!mounted) return;
  const mapped: Message[] = (msgs ?? []).map((m: any) => ({ id: String(m.id), fromMe: Number(m.from?.id) === Number(meId), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null }));
        setMessages(mapped);

        // try to set owner from conversations list if available
        try {
          const convObj = conversations.find((c) => String(c?.id) === String(activeConv));
          if (convObj) {
            const participants = Array.isArray(convObj.participants) ? convObj.participants : [];
            const other = participants.find((p: any) => Number(p.id) !== Number(meId)) || participants[0] || null;
            setOwner(other);
          } else {
            // fallback: derive owner from latest message
            const last = mapped.find((m) => !m.fromMe);
            if (last) {
              // try to get sender info from message 'from' if present
              try {
                const raw = msgs.find((x: any) => String(x.id) === String(last.id));
                if (raw && raw.from) setOwner(raw.from);
              } catch {}
            }
          }
        } catch (e) {}
      } catch (e: any) {
        console.error('Lỗi khi tải tin nhắn:', e);
        try { toast.error((e && (e.message || (e.response && e.response.data && e.response.data.message))) || 'Không thể tải tin nhắn'); } catch {}
      }
    })();
    return () => { mounted = false; };
  }, [activeConv, meId, conversations]);

  return (
    <div className="min-h-screen bg-slate-50 pt-2">
      <div className="max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[calc(100vh-4rem)]">
        {/* Left: conversations */}
        <aside className="lg:col-span-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden h-full">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200">
            <h3 className="font-semibold">Tin nhắn</h3>
          </div>
            <div className="divide-y divide-slate-200">
            {conversations.map((c) => {
              // derive display name: prefer explicit name -> participant (other than me) -> fallback
              const participants = Array.isArray(c?.participants) ? c.participants : [];
              const other = participants.find((p: any) => Number(p.id) !== Number(meId)) || participants[0] || null;
              // Default to empty string until there is a message or explicit name
              const displayName = (c && (c.name || c.displayName)) || (other && (other.name || other.fullName || other.phone)) || '';
              const lastText = c && (c.last || c.lastMessage || c.preview) || '';
              const idStr = String(c?.id ?? '');
              const initial = displayName && String(displayName).length ? String(displayName).charAt(0) : '';
              return (
                <button
                  key={idStr}
                  onClick={() => setActiveConv(idStr)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 ${activeConv === idStr ? 'bg-emerald-50' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center text-emerald-700 font-semibold">{initial}</div>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 truncate">{displayName}</div>
                    <div className="text-xs text-slate-500 truncate">{lastText}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main chat area */}
  <main className="lg:col-span-3 bg-white rounded-xl shadow flex flex-col overflow-hidden h-full">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-md bg-emerald-100 grid place-items-center font-semibold text-emerald-700">{owner ? String((owner.name || owner.fullName || owner.phone || '')).charAt(0) : 'H'}</div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{owner ? (owner.name || owner.fullName || owner.phone) : (apartment ? (apartment.title || apartment.name || `Căn hộ #${apartment?.id}`) : 'Hỗ trợ')}</div>
                {apartment ? (
                  <div className="text-xs text-slate-500 truncate">{apartment?.title ? `${apartment?.title}${apartment?.address ? ' - ' + apartment?.address : ''}` : (apartment?.address || apartment?.district?.name || '')}</div>
                ) : (
                  <div className="text-xs text-slate-500">Hoạt động 5 phút trước</div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-auto" ref={listRef}>
            <div className="space-y-4">
              {messages.map((m) => {
                const isMe = m.fromMe;
                // conversations may have numeric ids; activeConv is string -> normalize compare
                const conv = conversations.find((c) => String(c?.id ?? '') === String(activeConv));
                const otherInitial = conv && conv.name ? String(conv.name).charAt(0) : "H";
                const meInitial = "B";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 py-3 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 grid place-items-center font-semibold">{otherInitial}</div>
                    )}

                    <div className="flex flex-col">
                      <div className={`${isMe ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"} rounded-xl px-4 py-2 max-w-[70%]`}>
                        {m.icon ? <div className="text-xl mb-1">{m.icon}</div> : null}
                        {m.text ? <div className="whitespace-pre-wrap">{m.text}</div> : null}
                        {m.attachments && m.attachments.length ? (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            {m.attachments.map((a: any, i: number) => {
                              const src = (String(a || '').startsWith('http') ? String(a) : `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}/${String(a).replace(/^\/+/, '')}`);
                              return (<img key={i} src={src} className="w-full h-20 object-cover rounded" alt={`att-${i}`} />);
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {isMe && (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center font-semibold">{meInitial}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => setShowUpload((s) => !s)} className="p-2 rounded bg-slate-100">
                    <Paperclip className="w-4 h-4 text-slate-600" />
                  </button>
                  {attachments && attachments.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 grid place-items-center">{attachments.length}</div>
                  )}
                  {showUpload && (
                    <div className="absolute z-50 left-0 mt-2">
                      <div className="bg-white p-2 rounded shadow border border-slate-200">
                        <UploadPicker value={attachments} onChange={(v) => setAttachments(Array.isArray(v) ? v : v ? [v] : [])} multiple max={6} />
                        <div className="text-right mt-2"><button onClick={() => setShowUpload(false)} className="text-sm text-slate-500">Đóng</button></div>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                  placeholder="Gửi tin nhắn..."
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 outline-none"
                />
                <div className="flex items-center gap-2">
                  <select value={icon ?? ''} onChange={(e) => setIcon(e.target.value || null)} className="rounded border border-slate-200 px-2 py-1 text-sm">
                    <option value="">Biểu tượng</option>
                    <option value="❤️">❤️ Thích</option>
                    <option value="👍">👍 Tốt</option>
                    <option value="🙂">🙂 Thân thiện</option>
                    <option value="❓">❓ Hỏi</option>
                  </select>
                  <button onClick={send} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full">
                    <Send className="w-4 h-4" /> Gửi
                  </button>
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
}
