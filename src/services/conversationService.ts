import axiosClient from '@/utils/axiosClient';
import { apiUrl } from '@/utils/apiUrl';

function unwrap<T>(res: any): T {
  if (res == null) return res;
  if (typeof res === 'object') {
    if (res.success && (res.data !== undefined)) return res.data as T;
    if (res.data !== undefined) return res.data as T;
  }
  return res as T;
}

export const conversationService = {
  async create(participantIds: number[], apartmentId?: number, initialMessage?: string) {
    try {
      const payload: any = { participantIds, apartmentId };
      if (initialMessage) payload.initialMessage = initialMessage;
      const res = await axiosClient.post(apiUrl('/api/conversations'), payload);
  const conv = unwrap<any>(res ?? undefined);

  // If server returned an envelope with conversation/message keys, return it directly (new API shape)
  if (conv && conv.conversation) return conv;

  // If server didn't return an id, try to find an existing conversation matching participants/apartment
  if (!conv || conv.id == null) {
        try {
          const all = await (async () => {
            const listRes = await axiosClient.get(apiUrl('/api/conversations/mine'));
            return unwrap<any[]>(listRes ?? undefined) ?? [];
          })();
          const uniq = Array.from(new Set(participantIds.map((v) => Number(v)))).map(String).sort().join(',');
          const found = (Array.isArray(all) ? all : []).find((c: any) => {
            try {
              const p = Array.isArray(c?.participants) ? c.participants.map((x: any) => String(Number(x.id))).sort().join(',') : '';
              const sameParticipants = p === uniq;
              const sameApartment = (c?.apartmentId == null && apartmentId == null) || (Number(c?.apartmentId) === Number(apartmentId));
              return sameParticipants && sameApartment;
            } catch { return false; }
          });
          if (found) return found;
        } catch (e) {
          // ignore fallback errors
        }
      }

      return conv;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo cuộc trò chuyện';
      throw new Error(msg);
    }
  },
  async listMine() {
    try {
      const res = await axiosClient.get(apiUrl('/api/conversations/mine'));
      const raw = unwrap<any[]>(res ?? undefined) ?? [];

      const normalizeConv = (c: any) => {
        if (!c || typeof c !== 'object') return c;
        const out: any = { ...c };

        // if participants missing but owner/user exist, create participants array
        if (!Array.isArray(out.participants) || out.participants.length === 0) {
          const parts: any[] = [];
          if (out.owner) parts.push(out.owner);
          if (out.user) parts.push(out.user);
          if (parts.length) out.participants = parts;
        }

        // handle flattened aliases e.g., Conversation_owner_name, Conversation_user_id, etc.
        try {
          const keys = Object.keys(c || {});
          const ownerPrefix = 'Conversation_owner_';
          const userPrefix = 'Conversation_user_';
          const hasOwnerFlat = keys.some((k) => k.startsWith(ownerPrefix));
          const hasUserFlat = keys.some((k) => k.startsWith(userPrefix));
          if ((hasOwnerFlat || hasUserFlat) && !Array.isArray(out.participants)) {
            const ownerObj: any = {};
            const userObj: any = {};
            for (const k of keys) {
              if (k.startsWith(ownerPrefix)) {
                ownerObj[k.substring(ownerPrefix.length)] = c[k];
              }
              if (k.startsWith(userPrefix)) {
                userObj[k.substring(userPrefix.length)] = c[k];
              }
            }
            const parts2 = [] as any[];
            if (Object.keys(ownerObj).length) parts2.push(ownerObj);
            if (Object.keys(userObj).length) parts2.push(userObj);
            if (parts2.length) out.participants = parts2;
          }
        } catch (e) {
          // ignore
        }

        // normalize last/preview text keys
        out.last = out.last || out.lastMessageText || out.preview || (out.lastMessage && out.lastMessage.text) || '';
        out.preview = out.preview || out.last || '';

        return out;
      };

      if (Array.isArray(raw)) return raw.map(normalizeConv);
      return [normalizeConv(raw)];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lấy danh sách cuộc trò chuyện';
      throw new Error(msg);
    }
  },
  async getMessages(conversationId: number) {
    try {
      // First attempt: standard request
      const res = await axiosClient.get(apiUrl(`/api/conversations/${conversationId}/messages`));
      let raw = unwrap<any[]>(res ?? undefined) ?? [];

      // If empty result, try to inspect raw axios response and retry with cache-bust
      if ((!Array.isArray(raw) || raw.length === 0)) {
        // inspect possible nested envelopes or different field names
        try {
          const rawResp: any = (res && (res as any).data) ? (res as any).data : res;
          // possible locations for arrays
          const candidate = rawResp && (rawResp.data || rawResp.rows || rawResp.messages || rawResp.result || rawResp.items);
          if (Array.isArray(candidate) && candidate.length) raw = candidate;
        } catch (e) {
          // ignore
        }

        // If still empty, retry with a cache-busting timestamp to avoid 304/stale caching
        if ((!Array.isArray(raw) || raw.length === 0)) {
          try {
            const res2 = await axiosClient.get(apiUrl(`/api/conversations/${conversationId}/messages?_ts=${Date.now()}`));
            const raw2 = unwrap<any[]>(res2 ?? undefined) ?? [];
            if (Array.isArray(raw2) && raw2.length) raw = raw2;
            else {
              // inspect raw response body fields
              const rawResp2: any = (res2 && (res2 as any).data) ? (res2 as any).data : res2;
              const candidate2 = rawResp2 && (rawResp2.data || rawResp2.rows || rawResp2.messages || rawResp2.result || rawResp2.items);
              if (Array.isArray(candidate2) && candidate2.length) raw = candidate2;
            }
          } catch (e) {
            // ignore retry errors
          }
        }
      }

      // Normalize rows that may come from backend raw SQL with flattened aliases like
      // Message_from_id, Message_from_name, Message_to_id, etc. Convert them into
      // nested `from` and `to` objects so frontend mapping (m.from?.id) works.
      const normalizeRow = (r: any) => {
        if (!r || typeof r !== 'object') return r;

        // already nested shape
        if (r.from || r.to) return r;

        const out: any = { ...r };
        const fromPrefix = 'Message_from_';
        const toPrefix = 'Message_to_';

        const keys = Object.keys(r);
        const hasFrom = keys.some((k) => k.startsWith(fromPrefix));
        const hasTo = keys.some((k) => k.startsWith(toPrefix));

        if (hasFrom) {
          out.from = {} as any;
          for (const k of keys) {
            if (k.startsWith(fromPrefix)) {
              const sub = k.substring(fromPrefix.length);
              out.from[sub] = r[k];
              delete out[k];
            }
          }
        }

        if (hasTo) {
          out.to = {} as any;
          for (const k of keys) {
            if (k.startsWith(toPrefix)) {
              const sub = k.substring(toPrefix.length);
              out.to[sub] = r[k];
              delete out[k];
            }
          }
        }

        // also handle flattened prefixes without 'Message_' (e.g., from_id, to_id)
        const simpleFrom = keys.some((k) => k.startsWith('from_') || k === 'from_id' || k === 'fromId');
        if (!out.from && simpleFrom) {
          out.from = {} as any;
          for (const k of keys) {
            if (k.startsWith('from_')) out.from[k.replace(/^from_/, '')] = r[k];
            if (k === 'from_id') out.from.id = r[k];
            if (k === 'fromId') out.from.id = r[k];
          }
        }

        const simpleTo = keys.some((k) => k.startsWith('to_') || k === 'to_id' || k === 'toId');
        if (!out.to && simpleTo) {
          out.to = {} as any;
          for (const k of keys) {
            if (k.startsWith('to_')) out.to[k.replace(/^to_/, '')] = r[k];
            if (k === 'to_id') out.to.id = r[k];
            if (k === 'toId') out.to.id = r[k];
          }
        }

        return out;
      };

      if (Array.isArray(raw)) return raw.map(normalizeRow);
      return raw;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lấy danh sách tin nhắn';
      throw new Error(msg);
    }
  },
  async postMessage(conversationId: number, text: string, attachments?: any[] | undefined, icon?: string | undefined) {
    try {
      const payload: any = { text };
      if (attachments && attachments.length) payload.attachments = attachments;
      if (icon) payload.icon = icon;
      const res = await axiosClient.post(apiUrl(`/api/conversations/${conversationId}/messages`), payload);
      return unwrap<any>(res ?? undefined);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể gửi tin nhắn';
      throw new Error(msg);
    }
  }
};
