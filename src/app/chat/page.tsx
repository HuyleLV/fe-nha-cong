"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Paperclip, Check, CheckCheck } from "lucide-react";
import { useRouter } from 'next/navigation';
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
  readAt?: string | null;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);

  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const getParam = (k: string) => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(k) : null);
  const convQuery = getParam('c');
  const ownerParam = getParam('ownerId');
  const apartmentParam = getParam('apartmentId');
  const [meId, setMeId] = useState<number | null>(null);
  const [apartment, setApartment] = useState<any | null>(null);
  const [owner, setOwner] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [icon, setIcon] = useState<string | null>(null);
  const createdForParams = useRef(false);
  const sockRef = useRef<Socket | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [typingText, setTypingText] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;

    try {
      const hasToken = (typeof window !== 'undefined') && (
        !!localStorage.getItem('access_token') || !!localStorage.getItem('tokenUser') || !!localStorage.getItem('tokenAdmin') || document.cookie.includes('auth_user=')
      );
      if (!hasToken) {
        const next = `/chat?apartmentId=${encodeURIComponent(String(apartmentParam ?? ''))}&ownerId=${encodeURIComponent(String(ownerParam ?? ''))}`;
        router.push(`/dang-nhap?next=${encodeURIComponent(next)}`);
        return;
      }

      let convId = activeConv;
      if (!convId) {
        const me = await userService.getProfile().catch(() => null);
        if (!me) {
          const next = `/chat?apartmentId=${encodeURIComponent(String(apartmentParam ?? ''))}&ownerId=${encodeURIComponent(String(ownerParam ?? ''))}`;
          router.push(`/dang-nhap?next=${encodeURIComponent(next)}`);
          return;
        }
        setMeId(me.id ?? null);
        const participantIds = [Number(owner?.id ?? ownerParam), Number(me.id)];
        try {
          const createRes = await conversationService.create(participantIds, apartmentParam ? Number(apartmentParam) : undefined);
          if (createRes && (createRes as any).messageError) {
            try { toast.warn((createRes as any).messageError || 'Không gửi được tin nhắn khởi tạo'); } catch { }
          }
          const convObj = createRes && (createRes.conversation ? createRes.conversation : createRes);
          const id = convObj?.id ?? (convObj && convObj.id === 0 ? 0 : undefined);
          if (id == null) {
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
          try {
            const participants = Array.isArray((convObj || createRes)?.participants) ? (convObj || createRes).participants : [];
            const other = participants.find((p: any) => Number(p.id) === Number(ownerParam)) || participants.find((p: any) => Number(p.id) !== Number(me.id)) || participants[0] || null;
            setOwner(other);
          } catch { }
          // load messages for the newly created conversation
          try { loadMessagesForConv(convId); } catch (e) { }
        } catch (err: any) {
          console.error('Không thể tạo cuộc trò chuyện', err);
          try { toast.error(typeof err === 'string' ? err : (err?.message || 'Không thể tạo cuộc trò chuyện')); } catch { }
          return;
        }
      }

      // Post message and optimistically append the returned message (server also emits via socket)
      const res = await conversationService.postMessage(Number(convId), input.trim(), attachments.length ? attachments : undefined, icon ?? undefined);
      const msg = res ?? null;
      if (msg && msg.id) {
        setMessages((prev) => {
          try {
            if ((prev || []).some((x) => String(x.id) === String(msg.id))) return prev;
            const mapped: Message = { id: String(msg.id), fromMe: Number(msg.from?.id) === Number(meId), text: msg.text, createdAt: msg.createdAt, attachments: msg.attachments || [], icon: msg.icon ?? null };
            return [...(prev || []), mapped];
          } catch { return prev || []; }
        });
      } else {
        // fallback: optimistic local message
        const local: Message = { id: String(Date.now()), fromMe: true, text: input.trim(), createdAt: new Date().toISOString(), attachments: attachments || [], icon: icon || null };
        setMessages((s) => [...(s || []), local]);
      }
      setInput('');
      setAttachments([]);
      setIcon(null);
    } catch (e) {
      console.error(e);
      try { toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại.'); } catch { }
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await userService.getProfile().catch(() => null);
        if (!mounted) return;
        setMeId(me?.id ?? null);
        const list = await conversationService.listMine().catch(() => []);
        if (!mounted) return;
        let arr: any[] = [];
        if (Array.isArray(list)) arr = list;
        else if (list && Array.isArray((list as any).data)) arr = (list as any).data;
        else if (list && typeof list === 'object') arr = [list];
        else arr = [];
        if (!Array.isArray(arr)) {
          console.warn('conversationService.listMine returned unexpected value, coercing to array:', list);
          arr = [];
        }
        // If ownerParam is present, prefer showing conversations that include that owner first
        setConversations(arr);

        // If ownerParam provided in URL and we already have a matching conversation, open it
        try {
          if (ownerParam) {
            const found = (arr || []).find((c: any) => {
              try {
                const parts = Array.isArray(c?.participants) ? c.participants : [];
                return parts.some((p: any) => String(p?.id) === String(ownerParam)) || String(c?.owner?.id) === String(ownerParam) || String(c?.user?.id) === String(ownerParam);
              } catch { return false; }
            });
            if (found) {
              const idStr = String(found?.id);
              setActiveConv(idStr);
              // ensure owner is set from participants
              try {
                const participants = Array.isArray(found.participants) ? found.participants : [];
                const other = participants.find((p: any) => String(p?.id) === String(ownerParam)) || participants.find((p: any) => Number(p.id) !== Number(me?.id)) || participants[0] || null;
                if (other) setOwner(other);
              } catch { }
            }
          }
        } catch (e) { }
      } catch (e) {
        console.error('Failed to load conversations', e);
        try { toast.error('Không thể tải danh sách cuộc trò chuyện'); } catch { }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // If URL contains a conversation id (c=...), open it on load so refresh preserves the active chat
  useEffect(() => {
    (async () => {
      try {
        if (!convQuery) return;
        // ensure we have current user id before loading messages (auth may affect results)
        if (!meId) {
          try {
            const me = await userService.getProfile().catch(() => null);
            setMeId(me?.id ?? null);
          } catch { }
        }
        setActiveConv(String(convQuery));
        // load messages for the conversation from URL
        try { await loadMessagesForConv(convQuery); } catch (e) { /* ignore */ }
      } catch (e) { }
    })();
  }, [convQuery]);

  // Helper to load messages and set owner with extra logging for debugging
  const loadMessagesForConv = async (convIdRaw: string | number | null | undefined) => {
    try {
      if (!convIdRaw) return;
      const convId = Number(convIdRaw);
      const fetched = await conversationService.getMessages(convId).catch((e) => { throw e; });
      const mapped: Message[] = (fetched ?? []).map((m: any) => ({ id: String(m.id), fromMe: Number(m.from?.id) === Number(meId), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null, readAt: m.readAt }));
      // If no messages returned, but conversation list has a lastMessageText, show that as a fallback
      if ((!Array.isArray(mapped) || mapped.length === 0)) {
        try {
          const convObj = conversations.find((c) => String(c?.id) === String(convId));
          if (convObj && (convObj.lastMessageText || convObj.lastMessageAt || convObj.lastMessageFrom)) {
            const lastFrom = convObj.lastMessageFrom || convObj.lastMessageFrom || (convObj.owner || convObj.user || null);
            const synthetic: Message = {
              id: `last-${convObj.id}`,
              fromMe: Number(lastFrom?.id) === Number(meId),
              text: String(convObj.lastMessageText || convObj.preview || ''),
              createdAt: convObj.lastMessageAt || new Date().toISOString(),
              attachments: [],
              icon: null,
            };
            setMessages([synthetic]);
          } else {
            setMessages([]);
          }
        } catch (e) {
          setMessages([]);
        }
      } else {
        setMessages(mapped);
      }

      // Try to set owner from conversation participants if available, otherwise derive from first non-me message
      try {
        const convObj = conversations.find((c) => String(c?.id) === String(convId));
        if (convObj) {
          // Prefer explicit owner field if present, otherwise derive from participants or lastMessageFrom
          const ownerCandidate = convObj.owner || (Array.isArray(convObj.participants) ? convObj.participants.find((p: any) => Number(p.id) !== Number(meId)) : null) || convObj.lastMessageFrom || convObj.user || null;
          if (ownerCandidate) {
            setOwner(ownerCandidate);
            return;
          }
        }

        const last = mapped.find((m) => !m.fromMe);
        if (last) {
          const raw = (fetched || []).find((x: any) => String(x.id) === String(last.id));
          if (raw && raw.from) setOwner(raw.from);
        }
      } catch (e) {
        // ignore
      }

      // After messages set, scroll to bottom
      try {
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 30);
      } catch { }
    } catch (e) {
      console.error('[Chat] loadMessagesForConv failed', e);
    }
  };

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

      if (apartmentParam) {
        try {
          const a = await apartmentService.getById(Number(apartmentParam));
          setApartment(a);
        } catch (err: any) {
          try { toast.info('Không thể tải thông tin căn hộ'); } catch { }
        }
      }

      try {
        // Ensure we have current user id to include in participants
        const me = await userService.getProfile().catch(() => null);
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
          try { toast.warn((createRes as any).messageError || 'Không gửi được tin nhắn khởi tạo'); } catch { }
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
        } catch { }

        // Replace URL so chat shows conversation id cleanly
        try { router.replace(`/chat?c=${encodeURIComponent(idStr)}`); } catch { }

        // If server returned an initial message as part of create response, use it
        try {
          if (createRes && createRes.message) {
            const m = createRes.message;
            const mappedAfter: Message[] = [{ id: String(m.id), fromMe: Number(m.from?.id) === Number(me.id), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null }];
            setMessages(mappedAfter);
          } else {
            await loadMessagesForConv(id);
          }
        } catch (err) {
        }
      } catch (e) {
        console.error('Failed to create/open conversation from params', e);
        try { toast.error(typeof e === 'string' ? e : ((e as any)?.message || 'Không thể mở cuộc trò chuyện.')); } catch { }
      }
    })();
  }, [ownerParam, apartmentParam, router]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!baseUrl) return;
    const s = io(baseUrl, { transports: ['websocket', 'polling'], withCredentials: true, reconnectionAttempts: 5 });
    sockRef.current = s;

    s.on('connect', () => {
      try {
        if (meId) s.emit('join', { room: `user:${meId}` });
        if (activeConv) s.emit('join', { room: `conversation:${activeConv}` });
      } catch { }
    });

    s.on('conversation:message:new', (payload: any) => {
      try {
        const m = payload?.message;
        if (!m) return;
        if (String(payload?.conversationId) !== String(activeConv)) return;

        // If this is the active conversation, mark as read immediately
        if (activeConv) {
          try { sockRef.current?.emit('conversation:read', { conversationId: activeConv }); } catch { }
        }

        setMessages((prev) => {
          const exists = (prev || []).some((x) => String(x.id) === String(m.id));
          if (exists) return prev;
          const mapped: Message = { id: String(m.id), fromMe: Number(m.from?.id) === Number(meId), text: m.text, createdAt: m.createdAt, attachments: m.attachments || [], icon: m.icon ?? null, readAt: m.readAt };
          return [...prev, mapped];
        });
        setTypingText(null);
      } catch (e) { }
    });

    s.on('conversation:typing', (payload: any) => {
      try {
        if (String(payload?.conversationId) !== String(activeConv)) return;
        const typerId = Number(payload?.from?.id || payload?.userId);
        if (typerId === Number(meId)) return;

        const typerName = payload?.from?.name || payload?.name || "Người khác";
        if (payload.isTyping) {
          setTypingText(`${typerName} đang soạn tin...`);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingText(null), 3000);
        } else {
          setTypingText(null);
        }
      } catch { }
    });

    return () => {
      try { s.off('conversation:message:new'); s.disconnect(); } catch { }
      sockRef.current = null;
    };
  }, [meId, activeConv]);

  // If active conversation changes, ask socket to join that room
  useEffect(() => {
    try {
      if (sockRef.current && activeConv) {
        sockRef.current.emit('join', { room: `conversation:${activeConv}` });
      }
    } catch { }
  }, [activeConv]);

  // When active conversation changes (user clicked a conversation or opened via c=), load messages and owner
  useEffect(() => {
    if (!activeConv) {
      setMessages([]);
      setOwner(null);
      return;
    }

    // load messages once when conversation switches; subsequent new messages come via socket
    loadMessagesForConv(activeConv as string);
  }, [activeConv, meId]);

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
              const participants = Array.isArray(c?.participants) ? c.participants : [];
              const other = participants.find((p: any) => Number(p.id) !== Number(meId)) || participants[0] || null;
              const displayName = (c && (c.name || c.displayName)) || (other && (other.name || other.fullName || other.phone)) || '';
              const lastText = c && (c.last || c.lastMessage || c.preview) || '';
              const idStr = String(c?.id ?? '');
              const initial = displayName && String(displayName).length ? String(displayName).charAt(0) : '';
              return (
                <button
                  key={idStr}
                  onClick={async () => {
                    try {
                      setActiveConv(idStr);
                      // set owner from participants if available
                      try {
                        const otherLocal = Array.isArray(c?.participants) ? c.participants.find((p: any) => Number(p.id) !== Number(meId)) || c.participants[0] || null : null;
                        if (otherLocal) setOwner(otherLocal);
                      } catch { }
                      // load messages immediately for this conversation
                      try { await loadMessagesForConv(idStr); } catch (e) { }
                    } catch (e) { }
                  }}
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
              {/* Compute display name: prefer owner state, then participants from the active conversation, then apartment fallback */}
              {(() => {
                const convObj = conversations.find((c) => String(c?.id) === String(activeConv));
                const participantFromConv = convObj && Array.isArray(convObj.participants) ? (convObj.participants.find((p: any) => Number(p.id) !== Number(meId)) || convObj.participants[0]) : null;
                const displayParticipant = owner || participantFromConv || null;
                const initial = displayParticipant ? String((displayParticipant.name || displayParticipant.fullName || displayParticipant.phone || '')).charAt(0) : (apartment ? String((apartment.title || apartment.name || '')).charAt(0) : 'H');
                const titleName = displayParticipant ? (displayParticipant.name || displayParticipant.fullName || displayParticipant.phone) : (apartment ? (apartment.title || apartment.name || `Căn hộ #${apartment?.id}`) : 'Hỗ trợ');
                const subtitle = displayParticipant ? 'Hoạt động 5 phút trước' : (apartment ? (apartment?.title ? `${apartment?.title}${apartment?.address ? ' - ' + apartment?.address : ''}` : (apartment?.address || apartment?.district?.name || '')) : 'Hoạt động 5 phút trước');
                return (
                  <>
                    <div className="w-12 h-12 rounded-md bg-emerald-100 grid place-items-center font-semibold text-emerald-700">{initial}</div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{titleName}</div>
                      <div className="text-xs text-slate-500 truncate">{subtitle}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="p-4 flex-1 overflow-auto" ref={listRef}>
            <div className="space-y-4">
              {messages.map((m) => {
                const isMe = m.fromMe;
                const conv = conversations.find((c) => String(c?.id ?? '') === String(activeConv));
                const otherInitial = conv && conv.name ? String(conv.name).charAt(0) : "H";
                const meInitial = "B";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 grid place-items-center font-semibold">{otherInitial}</div>
                    )}

                    <div className="flex flex-col">
                      <div className={`${isMe ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"} rounded-xl px-4 py-2 inline-block break-words whitespace-pre-wrap`}>
                        {m.icon ? <div className="text-xl mb-1">{m.icon}</div> : null}
                        {m.text ? <div>{m.text}</div> : null}
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
                      <div className="flex flex-col items-end gap-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center font-semibold">{meInitial}</div>
                        {m.readAt ? (
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Check className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {typingText && (
                <div className="flex items-center gap-2 text-slate-500 text-xs italic ml-12 animate-pulse">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                  {typingText}
                </div>
              )}
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
                onChange={(e) => {
                  setInput(e.target.value);
                  try {
                    if (sockRef.current && activeConv) {
                      sockRef.current.emit('conversation:typing', { conversationId: activeConv, isTyping: true });
                      // Debounce stop typing? usually handled by server or client timeout, but for now just emit true
                    }
                  } catch { }
                }}
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
