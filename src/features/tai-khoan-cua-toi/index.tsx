"use client";
// Note: constants module removed; this file intentionally uses literals/env.

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { User as UserIcon, Mail, Phone, Heart, Trash2, LogOut, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, ExternalLink, ShieldCheck, Sparkles, Calendar as CalendarIcon, Fingerprint } from "lucide-react";

import logo from "@/assets/logo-trang.png";
import { Me, User } from "@/type/user";
import { Apartment } from "@/type/apartment";
import { favoriteService } from "@/services/favoriteService";
import RoomCardItem from "@/components/roomCardItem";
import { viewingService, Viewing } from "@/services/viewingService";
import CompleteProfileSheet from "@/features/dang-nhap/CompleteProfileSheet";

/* ========= Cookie helpers ========= */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
function setCookie(name: string, value: string, maxAgeSec?: number) {
  if (typeof document === "undefined") return;
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax;` +
    (maxAgeSec ? ` Max-Age=${maxAgeSec};` : "");
}
function delCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

/* ========= Utils ========= */
const b64url = (s: string) => atob(s.replace(/-/g, "+").replace(/_/g, "/"));
const hasToken = () =>
  !!(
    getCookie("access_token") ||
    (typeof window !== "undefined" &&
      (localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("tokenAdmin") ||
        localStorage.getItem("tokenUser")))
  );

/* ========= Type cho Favorite item ========= */
type FavoriteItem = {
  id: number;
  apartment: Apartment;
  createdAt: string;
};

/* ========= Main ========= */
export default function AccountPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<(Me & Partial<User>) | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [saved, setSaved] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loadingViewings, setLoadingViewings] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [editing, setEditing] = useState(false);

  /* ---------- AUTH: đọc JWT ---------- */
  const readAuth = (): (Me & Partial<User>) | null => {
    try {
      const cu = getCookie("auth_user");
      if (cu) return JSON.parse(cu) as any;

      const raw = localStorage.getItem("auth_user") ?? sessionStorage.getItem("auth_user");
      if (raw) return JSON.parse(raw) as any;

      // Ưu tiên đọc thông tin admin nếu có
      const rawAdmin = localStorage.getItem("adminInfo");
      if (rawAdmin) return JSON.parse(rawAdmin) as any;

      const token =
        getCookie("access_token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token") ||
        localStorage.getItem("tokenAdmin") ||
        localStorage.getItem("tokenUser");
      if (token) {
        const [, payload] = token.split(".");
        if (payload) {
          const json = JSON.parse(b64url(payload));
          return {
            id: Number(json.sub),
            email: json.email,
            role: json.role,
            name: json.name,
            avatarUrl: json.avatarUrl,
            phone: json.phone,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const clearAuth = () => {
    delCookie("auth_user");
    delCookie("access_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("tokenUser");
    localStorage.removeItem("adminInfo");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("access_token");
  };

  /* ---------- FAVORITES LOCAL ---------- */
  const readSavedLocal = (): FavoriteItem[] => {
    try {
      const c = getCookie("saved_rooms");
      if (c) return JSON.parse(c);
      const raw = localStorage.getItem("saved_rooms") || sessionStorage.getItem("saved_rooms");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const writeSavedLocal = (data: FavoriteItem[]) => {
    const json = JSON.stringify(data);
    setCookie("saved_rooms", json, 60 * 60 * 24 * 30);
    localStorage.setItem("saved_rooms", json);
  };

  /* ---------- FETCH FAVORITES ---------- */
  useEffect(() => {
    const u = readAuth();
    if (!u) {
      toast.info("Vui lòng đăng nhập để xem tài khoản");
  router.replace("/dang-nhap");
      return;
    }
    setAuth(u);
    // Listen for auth updates (e.g., after profile edit)
    const onAuthUpdate = (e: any) => {
      const next = readAuth();
      setAuth(next);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('auth:update', onAuthUpdate as any);
    }

    (async () => {
      try {
        setLoading(true);
        if (hasToken()) {
          const resp: any = await favoriteService.getMyFavorites();
          // BE trả { items, meta } hoặc mảng trực tiếp
          const list: FavoriteItem[] = Array.isArray(resp)
            ? resp
            : (resp?.items ?? []);
          setSaved(list);
          writeSavedLocal(list);
        } else {
          setSaved(readSavedLocal());
        }
      } catch {
        setSaved(readSavedLocal());
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:update', onAuthUpdate as any);
      }
    };
  }, [router]);

  // Fetch my viewings
  useEffect(() => {
    (async () => {
      if (!hasToken()) return;
      try {
        setLoadingViewings(true);
        const { items } = await viewingService.mine({ limit: 500 });
        setViewings(items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoadingViewings(false);
      }
    })();
  }, []);

  // Helpers for calendar
  // Định dạng YYYY-MM-DD theo múi giờ local để tránh lệch ngày khi so sánh
  const fmtDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const monthLabel = useMemo(() => month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }), [month]);
  const startOfMonth = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1), [month]);
  const endOfMonth = useMemo(() => new Date(month.getFullYear(), month.getMonth()+1, 0), [month]);
  const startWeekday = (startOfMonth.getDay() + 6) % 7; // Mon=0
  const daysInMonth = endOfMonth.getDate();
  const days: string[] = useMemo(() => {
    const arr: string[] = [];
    for (let i=0;i<startWeekday;i++) arr.push("");
    for (let d=1; d<=daysInMonth; d++) {
      arr.push(fmtDate(new Date(month.getFullYear(), month.getMonth(), d)));
    }
    // pad to full weeks (42 cells)
    while (arr.length % 7 !== 0) arr.push("");
    return arr;
  }, [startWeekday, daysInMonth, month]);

  const eventsByDate = useMemo(() => {
    const m: Record<string, Viewing[]> = {};
    for (const v of viewings) {
      const key = fmtDate(new Date(v.preferredAt));
      (m[key] ||= []).push(v);
    }
    // sort each day by time
    Object.keys(m).forEach(k => m[k].sort((a,b) => +new Date(a.preferredAt) - +new Date(b.preferredAt)));
    return m;
  }, [viewings]);

  const selectedEvents = eventsByDate[selectedDate] || [];

  const statusLabel = (st: string) => {
    switch (st) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã huỷ';
      case 'pending':
      default:
        return 'Đang chờ';
    }
  };

  const goPrevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1));
  const goNextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1));

  /* ---------- HANDLERS ---------- */
  const handleRemoveFav = async (id: number) => {
    const prev = [...saved];
    const next = saved.filter((x) => x.apartment.id !== id);
    setSaved(next);
    writeSavedLocal(next);

    try {
      if (hasToken()) await favoriteService.removeFavorite(id);
      toast.info("Đã bỏ khỏi yêu thích 💔");
      window.dispatchEvent(new CustomEvent("fav:changed"));
    } catch (e: any) {
      setSaved(prev);
      toast.error(e?.message || "Không thể bỏ yêu thích");
    }
  };

  const handleClearAll = async () => {
    const prev = [...saved];
    setSaved([]);
    writeSavedLocal([]);
    try {
      if (hasToken()) {
        await Promise.all(prev.map((a) => favoriteService.removeFavorite(a.apartment.id)));
      }
      toast.info("Đã xóa toàn bộ phòng yêu thích");
      window.dispatchEvent(new CustomEvent("fav:changed"));
    } catch {
      setSaved(prev);
      toast.error("Không thể xóa danh sách");
    }
  };

  if (!auth) return null;

  /* ---------- RENDER ---------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* ===== Header user ===== */}
      <section className="relative">
        <div className="max-w-screen-xl mx-auto px-4 pt-24 pb-10">
          <div className="rounded-3xl bg-white shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-emerald-600 text-white grid place-items-center overflow-hidden ring-4 ring-white shadow">
              {auth.avatarUrl && !avatarBroken ? (
                <img
                  src={process.env.NEXT_PUBLIC_API_URL + auth.avatarUrl}
                  alt="Ảnh đại diện"
                  className="h-full w-full object-cover"
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                <UserIcon className="w-10 h-10" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900">{auth.name || "Người dùng"}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 justify-center md:justify-start">
                {typeof auth.emailVerified !== 'undefined' && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border ${auth.emailVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    <Sparkles className="w-3.5 h-3.5" /> {auth.emailVerified ? 'Email đã xác thực' : 'Email chưa xác thực'}
                  </span>
                )}
                {auth.provider && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-700">
                    <Fingerprint className="w-3.5 h-3.5" /> Đăng nhập: {auth.provider}
                  </span>
                )}
                {typeof auth.rewardBalance === 'number' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 px-2 py-0.5 text-xs text-amber-700">
                    <Sparkles className="w-3.5 h-3.5" /> Điểm thưởng: {auth.rewardBalance}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-2 flex flex-col sm:flex-row sm:gap-4 justify-center md:justify-start">
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {auth.email}
                </span>
                {auth.phone && (
                  <span className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {auth.phone}
                  </span>
                )}
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600">
                {auth.address && (
                  <div className="inline-flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Địa chỉ: {auth.address}</div>
                )}
                {auth.gender && (
                  <div className="inline-flex items-center gap-2"><UserIcon className="w-3.5 h-3.5" /> Giới tính: {auth.gender === 'male' ? 'Nam' : auth.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                )}
                {auth.dateOfBirth && (
                  <div className="inline-flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> Ngày sinh: {new Date(auth.dateOfBirth as any).toLocaleDateString('vi-VN')}</div>
                )}
                {auth.createdAt && (
                  <div className="inline-flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> Tham gia: {new Date(auth.createdAt as any).toLocaleDateString('vi-VN')}</div>
                )}
                {auth.referralCode && (
                  <div className="inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Mã giới thiệu: {auth.referralCode}</div>
                )}
              </div>
            </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-4 py-2 flex items-center gap-2"
                >
                  {editing ? 'Đóng sửa' : 'Sửa thông tin'}
                </button>
                <button
                  onClick={() => {
                    clearAuth();
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('auth:logout'));
                    }
                    toast.info("Đã đăng xuất");
                    router.replace("/dang-nhap");
                  }}
                  className="rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 px-4 py-2 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            </div>

            {editing && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <CompleteProfileSheet
                  initialName={auth?.name || ''}
                  initialPhone={auth?.phone || ''}
                  email={auth?.email || ''}
                  initialGender={(auth as any)?.gender || null}
                  initialDateOfBirth={auth?.dateOfBirth ? new Date(auth.dateOfBirth as any).toISOString().slice(0,10) : ''}
                  initialAvatarUrl={auth?.avatarUrl || ''}
                  initialAddress={auth?.address || ''}
                  onDone={() => {
                  const next = readAuth();
                  setAuth(next);
                  setEditing(false);
                }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Lịch xem phòng của tôi ===== */}
      <section className="max-w-screen-xl mx-auto px-4 pb-10">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
            <CalendarDays className="w-5 h-5 text-emerald-600" /> Lịch xem phòng của tôi
          </h2>
          {loadingViewings && <span className="text-sm text-slate-500">Đang tải…</span>}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Calendar grid */}
          <div className="rounded-2xl bg-white border shadow-sm p-4 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <button onClick={goPrevMonth} className="rounded-lg p-2 hover:bg-slate-50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-sm font-semibold text-slate-800 uppercase tracking-wide">{monthLabel}</div>
              <button onClick={goNextMonth} className="rounded-lg p-2 hover:bg-slate-50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
              {['T2','T3','T4','T5','T6','T7','CN'].map(d => <div key={d} className="py-0.5">{d}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-2">
              {days.map((d, idx) => {
                const events = d ? (eventsByDate[d] || []) : [];
                const dayNum = d ? Number(d.slice(-2)) : '';
                const isSelected = d === selectedDate;
                const dotColors = (evs: Viewing[]) => evs.map(e => (
                  e.status === 'confirmed' ? 'bg-emerald-600' : e.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                ));
                const colors = dotColors(events.slice(0,3));
                const more = Math.max(0, events.length - 3);
                return (
                  <button
                    key={idx}
                    onClick={() => d && setSelectedDate(d)}
                    className={`aspect-square rounded-lg border text-sm ${
                      d ? 'bg-white hover:bg-slate-50' : 'bg-transparent border-transparent'
                    } ${isSelected ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-100'} flex flex-col items-center justify-center p-0.5`}
                  >
                    <span className="leading-none">{dayNum}</span>
                    {d && (
                      <div className="mt-1 flex items-center gap-1">
                        {colors.map((c, i) => (
                          <span key={i} className={`h-2 w-2 rounded-full ${c}`} />
                        ))}
                        {more > 0 && <span className="ml-0.5 text-[10px] text-slate-500">+{more}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Day details */}
          <div className="rounded-2xl bg-white border shadow-sm p-3">
            <div className="mb-2 text-sm font-semibold text-slate-800">
              {(() => {
                const [y, m, d] = selectedDate.split('-').map(Number);
                const localDate = new Date(y, (m || 1) - 1, d || 1);
                return `Sự kiện ngày ${localDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}`;
              })()}
            </div>
            {selectedEvents.length === 0 ? (
              <div className="text-sm text-slate-500">Không có lịch trong ngày này.</div>
            ) : (
              <ul className="space-y-2.5">
                {selectedEvents.map((v) => {
                  const hhmm = new Date(v.preferredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <li key={v.id} className="rounded-xl border border-slate-100 bg-white p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-semibold">{hhmm}</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          v.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          v.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>{statusLabel(v.status)}</span>
                      </div>
                      {v.note && <div className="mt-0.5 text-xs text-slate-600">{v.note}</div>}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5" /> Mã tin: #{v.apartmentId}
                        <a className="ml-auto inline-flex items-center gap-1 text-emerald-700 hover:underline" href={`/room/${v.apartmentId}`}>
                          Xem phòng <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ===== Danh sách yêu thích ===== */}
      <section className="max-w-screen-xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900">
            <Heart className="w-5 h-5 text-rose-500" /> Phòng đã yêu thích
          </h2>
          {saved.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Xóa tất cả
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-slate-600 shadow-sm">
            Đang tải danh sách yêu thích...
          </div>
        ) : saved.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-slate-600 shadow-sm">
            Bạn chưa lưu phòng nào. Hãy nhấn biểu tượng{" "}
            <Heart className="inline w-4 h-4 -mt-1 text-rose-500" /> ở trang phòng để thêm vào danh sách.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {saved.map((fav) => (
              <RoomCardItem
                key={fav.apartment.id}
                item={{ ...fav.apartment, favorited: true }}
                isFav={true}
                onToggleFav={handleRemoveFav}
                onBook={() => router.push(`/room/${fav.apartment.slug}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== Footer logo ===== */}
      <div className="pointer-events-none fixed bottom-6 right-6 opacity-20">
        <Image src={logo} alt="Thương hiệu" width={72} height={72} />
      </div>
    </main>
  );
}
