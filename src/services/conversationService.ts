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
      return unwrap<any[]>(res ?? undefined) ?? [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lấy danh sách cuộc trò chuyện';
      throw new Error(msg);
    }
  },
  async getMessages(conversationId: number) {
    try {
      const res = await axiosClient.get(apiUrl(`/api/conversations/${conversationId}/messages`));
      return unwrap<any[]>(res ?? undefined) ?? [];
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
