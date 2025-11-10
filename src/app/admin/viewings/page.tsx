"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { viewingService, Viewing } from "@/services/viewingService";
import { isDepositViewing, viewingStatusLabel, viewingDisplayNote } from "@/utils/viewingLabels";
import { apartmentService } from "@/services/apartmentService";
import { Apartment } from "@/type/apartment";
import { CalendarDays, Calendar as CalendarIcon, List, Search, Clock, Phone, User as UserIcon, ChevronLeft, ChevronRight, RefreshCw, Circle, CheckCircle2 } from "lucide-react";
import AdminTable from "@/components/AdminTable";

type AdminViewing = Viewing & { apartment?: Apartment };

function AdminViewingsPage() {
  const searchParams = useSearchParams();
  const lockedAptId = (() => {
    const v = searchParams.get('apartmentId');
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  })();
  const lockedMode = lockedAptId != null;
  const [query, setQuery] = useState("");
  const [aptResults, setAptResults] = useState<Apartment[]>([]);
  const [aptLoading, setAptLoading] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);

  const [statusFilter, setStatusFilter] = useState<""|"pending"|"confirmed"|"cancelled"|"visited">("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [viewMode, setViewMode] = useState<'list'|'calendar'>('calendar');
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0,10));

  const [viewings, setViewings] = useState<AdminViewing[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ total?: number; page?: number; limit?: number; pageCount?: number } | null>(null);

  // Search apartments by keyword
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      if (!query) { setAptResults([]); return; }
      try {
        setAptLoading(true);
        const res = await apartmentService.getAll({ q: query, limit: 10 });
        setAptResults(res.items || []);
      } catch (e: any) {
        // ignore
      } finally {
        setAptLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [query]);

  const loadViewings = async (opts?: { keepPage?: boolean }) => {
    if (!selectedApt) return;
    try {
      setLoading(true);
      const { items, meta } = await viewingService.adminList({ apartmentId: selectedApt.id, status: statusFilter || undefined, page: viewMode === 'list' ? (opts?.keepPage ? page : 1) : 1, limit: viewMode === 'list' ? limit : 1000 });
      const arr = Array.isArray(items) ? items : (items as any) || [];
      setViewings(arr);
      setMeta(viewMode === 'list' ? (meta || null) : null);
      if (viewMode === 'list' && !opts?.keepPage) setPage(1);
    } catch (e: any) {
      toast.error(e?.message || "Không thể tải lịch xem phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadViewings(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [selectedApt, statusFilter]);
  useEffect(() => { if (selectedApt) loadViewings({ keepPage: true }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);
  useEffect(() => { if (selectedApt) loadViewings({ keepPage: true }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [viewMode]);
  // Preselect apartment by ?apartmentId=
  useEffect(() => {
    if (!lockedAptId) return;
    (async () => {
      try {
        const apt = await apartmentService.getById(lockedAptId);
        setSelectedApt(apt);
      } catch (e: any) {
        toast.error(e?.message || 'Không tìm thấy căn hộ');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthLabel = useMemo(() => new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }), []);
  // Calendar helpers
  const calMonthLabel = useMemo(() => month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }), [month]);
  const startOfMonth = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1), [month]);
  const endOfMonth = useMemo(() => new Date(month.getFullYear(), month.getMonth()+1, 0), [month]);
  const startWeekday = (startOfMonth.getDay() + 6) % 7; // Mon=0
  const daysInMonth = endOfMonth.getDate();
  const dayCells: string[] = useMemo(() => {
    const arr: string[] = [];
    for (let i=0;i<startWeekday;i++) arr.push("");
    for (let d=1; d<=daysInMonth; d++) {
      const key = new Date(month.getFullYear(), month.getMonth(), d).toISOString().slice(0,10);
      arr.push(key);
    }
    while (arr.length % 7 !== 0) arr.push("");
    return arr;
  }, [startWeekday, daysInMonth, month]);
  const eventsByDate = useMemo(() => {
    const map: Record<string, AdminViewing[]> = {};
    for (const v of viewings) {
      const key = new Date(v.preferredAt).toISOString().slice(0,10);
      (map[key] ||= []).push(v);
    }
    Object.keys(map).forEach(k => map[k].sort((a,b) => +new Date(a.preferredAt) - +new Date(b.preferredAt)));
    return map;
  }, [viewings]);
  const goPrevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1));
  const goNextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1));
  const selectedEvents = eventsByDate[selectedDate] || [];

  const onChangeStatus = async (v: AdminViewing, next: 'pending'|'confirmed'|'cancelled'|'visited') => {
    if (!v) return;
    const prev = v.status;
    setViewings(list => list.map(it => it.id === v.id ? { ...it, status: next } : it));
    try {
      await viewingService.adminUpdateStatus(v.id, { status: next });
      toast.success("Đã cập nhật trạng thái");
    } catch (e: any) {
      setViewings(list => list.map(it => it.id === v.id ? { ...it, status: prev } : it));
      toast.error(e?.message || "Cập nhật thất bại");
    }
  };

  // ===== Table config (List mode) =====
  const tableHeaders = useMemo(() => [
    'Thời gian',
    'Khách',
    'Liên hệ',
    'Ghi chú',
    'Trạng thái',
  ], []);

  const renderRows = (arr: AdminViewing[]) => arr.map(v => {
    const timeStr = new Date(v.preferredAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    const isDeposit = isDepositViewing(v);
    const displayNote = viewingDisplayNote(v) || '-';
    return (
      <tr key={v.id} className="hover:bg-slate-50">
        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 ${isDeposit ? 'text-cyan-700' : 'text-slate-800'}`}><Clock className="h-4 w-4" /> {timeStr}</span></td>
        <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><UserIcon className="h-4 w-4" /> {v.name || 'Khách'}</span></td>
        <td className="px-4 py-3"><span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" /> {v.phone || '-'}</span></td>
  <td className="px-4 py-3 max-w-[320px] truncate" title={displayNote}>{displayNote}{isDeposit && <span className="ml-1 inline-flex items-center rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 px-1.5 py-0.5 text-[10px]">Đặt cọc</span>}</td>
        <td className="px-4 py-3">
          <select value={v.status} onChange={(e) => onChangeStatus(v, e.target.value as any)} className="rounded-lg border px-2 py-1 text-sm">
            <option value="pending">{isDeposit ? 'Chờ đặt cọc' : 'Đang chờ'}</option>
            <option value="confirmed">{isDeposit ? 'Xác nhận đặt cọc' : 'Đã xác nhận'}</option>
            <option value="cancelled">{isDeposit ? 'Huỷ đặt cọc' : 'Đã huỷ'}</option>
            <option value="visited">Đã xem</option>
          </select>
        </td>
      </tr>
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
  <div className="mx-auto max-w-screen-2xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-emerald-600" /> Quản lý lịch xem phòng</h1>
          <span className="text-xs text-slate-500">{monthLabel}</span>
        </div>

        {!lockedMode ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Sidebar: search & select apartment */}
          <aside className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-700 mb-2">Chọn phòng</div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Search className="h-4 w-4" /></span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tiêu đề / mã" className="w-full rounded-lg border px-3 py-2 pl-9" />
            </div>
            <div className="mt-2 max-h-72 overflow-auto divide-y">
              {aptLoading ? (
                <div className="p-3 text-sm text-slate-500">Đang tìm…</div>
              ) : (
                aptResults.map(apt => (
                  <button key={apt.id} onClick={() => { setSelectedApt(apt); }} className={`w-full text-left p-3 hover:bg-slate-50 ${selectedApt?.id === apt.id ? 'bg-emerald-50 ring-1 ring-emerald-200' : ''}`}>
                    <div className="text-sm font-medium text-slate-800 line-clamp-1">#{apt.id} • {apt.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{apt.streetAddress || apt.addressPath || '-'}</div>
                  </button>
                ))
              )}
            </div>
          </aside>
          {/* Main: viewings table */}
          <section className="lg:col-span-2 rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm text-slate-600">Đang xem lịch của:</div>
                <div className="text-base font-semibold text-slate-900">{selectedApt ? `#${selectedApt.id} • ${selectedApt.title}` : 'Chưa chọn phòng'}</div>
              </div>
              <select className="rounded-lg border px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Đang chờ</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã huỷ</option>
                <option value="visited">Đã xem</option>
              </select>
              <div className="ml-2 flex overflow-hidden rounded-lg border">
                <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm ${viewMode==='list' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-600'}`} title="Danh sách">
                  <span className="inline-flex items-center gap-1"><List className="h-4 w-4" /> Danh sách</span>
                </button>
                <button onClick={() => setViewMode('calendar')} className={`px-3 py-2 text-sm ${viewMode==='calendar' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-600'}`} title="Lịch">
                  <span className="inline-flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> Lịch</span>
                </button>
              </div>
              <button onClick={() => loadViewings({ keepPage: true })} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Tải lại</button>
            </div>

            {!selectedApt ? (
              <div className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-600">Hãy chọn một phòng ở cột bên trái để xem lịch xem phòng.</div>
            ) : loading ? (
              <div className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-600">Đang tải dữ liệu…</div>
            ) : viewMode === 'list' ? (
              <AdminTable headers={tableHeaders} loading={loading} emptyText="Chưa có lịch xem phòng nào cho phòng này.">
                {renderRows(viewings)}
              </AdminTable>
            ) : (
              <div className="grid gap-5 lg:grid-cols-3">
                {/* Calendar grid */}
                <div className="rounded-2xl border bg-white p-3 shadow-sm lg:col-span-2 max-w-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <button onClick={goPrevMonth} className="rounded-lg p-1.5 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                    <div className="text-xs font-semibold text-slate-800 uppercase tracking-wide">{calMonthLabel}</div>
                    <button onClick={goNextMonth} className="rounded-lg p-1.5 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500">
                    {['T2','T3','T4','T5','T6','T7','CN'].map(d => <div key={d} className="py-0.5">{d}</div>)}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {dayCells.map((d, idx) => {
                      const events = d ? (eventsByDate[d] || []) : [];
                      const dayNum = d ? Number(d.slice(-2)) : '';
                      const isSelected = d === selectedDate;
                      const hasEvents = events.length > 0;
                      return (
                        <button
                          key={idx}
                          onClick={() => d && setSelectedDate(d)}
                          className={`aspect-square rounded-lg border text-[11px] ${
                            d ? 'bg-white hover:bg-slate-50' : 'bg-transparent border-transparent'
                          } ${isSelected ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-100'} flex flex-col items-center justify-center p-0.5`}
                        >
                            <span className="leading-none">{dayNum}</span>
                          {hasEvents && (() => {
                            const depositCount = events.filter(v => isDepositViewing(v)).length;
                            const allDeposit = depositCount === events.length && events.length > 0;
                            const hasBoth = depositCount > 0 && !allDeposit;
                            const label = allDeposit ? 'Lịch đặt cọc' : hasBoth ? 'Có lịch' : 'Lịch xem phòng';
                            const baseClass = allDeposit ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
                            return (
                              <span className={`mt-0.5 relative inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${baseClass}`}>
                                {label}
                                {events.length >= 2 && (
                                  <span className={`absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full ${allDeposit ? 'bg-cyan-600' : 'bg-emerald-600'} text-[10px] font-bold text-white`}>
                                    {events.length}
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600"></span> Xác nhận</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Chờ</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Huỷ</span>
                  </div>
                </div>

                {/* Day details */}
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="mb-2 text-sm font-semibold text-slate-800">Lịch ngày {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                  {selectedEvents.length === 0 ? (
                    <div className="text-sm text-slate-500">Không có lịch trong ngày này.</div>
                  ) : (
                    <ul className="space-y-2.5">
                      {selectedEvents.map((v) => {
                        const hhmm = new Date(v.preferredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <li key={v.id} className="rounded-xl border border-slate-100 bg-white p-2.5">
                            <div className="flex items-center gap-3 text-xs">
                              <span className={`inline-flex items-center gap-1.5 ${isDepositViewing(v) ? 'text-cyan-700' : 'text-emerald-700'}`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-semibold text-[13px]">{hhmm}</span>
                                {isDepositViewing(v) && (
                                  <span className="rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 px-1.5 py-0.5 text-[10px] leading-none">Đặt cọc</span>
                                )}
                              </span>
                              <span className="hidden sm:inline h-3 w-px bg-slate-200" />
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <UserIcon className="h-3.5 w-3.5" /> {v.name || 'Khách'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <Phone className="h-3.5 w-3.5" /> {v.phone || '-'}
                              </span>
                              {(() => {
                                const note = viewingDisplayNote(v);
                                return note ? (
                                  <span className="truncate text-slate-600 max-w-[140px] sm:max-w-[220px]" title={note}>• {note}</span>
                                ) : null;
                              })()}
                              <span className="ml-auto" />
                              <select value={v.status} onChange={(e) => onChangeStatus(v, e.target.value as any)} className="rounded-lg border px-2 py-1 text-xs">
                                <option value="pending">{isDepositViewing(v) ? 'Chờ đặt cọc' : 'Đang chờ'}</option>
                                <option value="confirmed">{isDepositViewing(v) ? 'Xác nhận đặt cọc' : 'Đã xác nhận'}</option>
                                <option value="cancelled">{isDepositViewing(v) ? 'Huỷ đặt cọc' : 'Đã huỷ'}</option>
                                <option value="visited">Đã xem</option>
                              </select>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {meta?.pageCount && meta.pageCount > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="rounded-lg border px-3 py-1 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm text-slate-600">Trang {page}/{meta.pageCount}</span>
                <button disabled={page >= (meta.pageCount || 1)} onClick={() => setPage(p => p+1)} className="rounded-lg border px-3 py-1 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </section>
        </div>
        ) : (
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm text-slate-600">Đang xem lịch của:</div>
                <div className="text-base font-semibold text-slate-900">{selectedApt ? `#${selectedApt.id} • ${selectedApt.title}` : 'Đang tải căn hộ...'}</div>
              </div>
              <select className="rounded-lg border px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Đang chờ</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã huỷ</option>
                <option value="visited">Đã xem</option>
              </select>
              <div className="ml-2 flex overflow-hidden rounded-lg border">
                <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm ${viewMode==='list' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-600'}`} title="Danh sách">
                  <span className="inline-flex items-center gap-1"><List className="h-4 w-4" /> Danh sách</span>
                </button>
                <button onClick={() => setViewMode('calendar')} className={`px-3 py-2 text-sm ${viewMode==='calendar' ? 'bg-slate-100 text-slate-900' : 'bg-white text-slate-600'}`} title="Lịch">
                  <span className="inline-flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> Lịch</span>
                </button>
              </div>
              <button onClick={() => loadViewings({ keepPage: true })} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"><RefreshCw className="h-4 w-4" /> Tải lại</button>
            </div>
            {!selectedApt ? (
              <div className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-600">Đang tải dữ liệu…</div>
            ) : loading ? (
              <div className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-600">Đang tải dữ liệu…</div>
            ) : viewMode === 'list' ? (
              <AdminTable headers={tableHeaders} loading={loading} emptyText="Chưa có lịch xem phòng nào cho phòng này.">
                {renderRows(viewings)}
              </AdminTable>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {/* Calendar (left) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <button onClick={goPrevMonth} className="rounded-lg p-1.5 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                    <div className="text-xs font-semibold text-slate-800 uppercase tracking-wide">{calMonthLabel}</div>
                    <button onClick={goNextMonth} className="rounded-lg p-1.5 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 max-w-2xl">
                    {['T2','T3','T4','T5','T6','T7','CN'].map(d => <div key={d} className="py-0.5">{d}</div>)}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1 max-w-2xl">
                    {dayCells.map((d, idx) => {
                      const events = d ? (eventsByDate[d] || []) : [];
                      const dayNum = d ? Number(d.slice(-2)) : '';
                      const isSelected = d === selectedDate;
                      const hasEvents = events.length > 0;
                      return (
                        <button
                          key={idx}
                          onClick={() => d && setSelectedDate(d)}
                          className={`aspect-square rounded-lg border text-[11px] ${
                            d ? 'bg-white hover:bg-slate-50' : 'bg-transparent border-transparent'
                          } ${isSelected ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-slate-100'} flex flex-col items-center justify-center p-0.5`}
                        >
                          <span className="font-medium text-slate-700 leading-none">{dayNum}</span>
                          {hasEvents && (() => {
                            const depositCount = events.filter(v => isDepositViewing(v)).length;
                            const allDeposit = depositCount === events.length && events.length > 0;
                            const hasBoth = depositCount > 0 && !allDeposit;
                            const label = allDeposit ? 'Lịch đặt cọc' : hasBoth ? 'Có lịch' : 'Lịch xem phòng';
                            const baseClass = allDeposit ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
                            return (
                              <span className={`mt-0.5 relative inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${baseClass}`}>
                                {label}
                                {events.length >= 2 && (
                                  <span className={`absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full ${allDeposit ? 'bg-cyan-600' : 'bg-emerald-600'} text-[10px] font-bold text-white`}>
                                    {events.length}
                                  </span>
                                )}
                              </span>
                            );
                          })()}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600"></span> Xác nhận</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Chờ</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Huỷ</span>
                  </div>
                </div>

                {/* Day details (right) */}
                <div className="rounded-2xl border bg-white p-3 shadow-sm">
                  <div className="mb-2 text-sm font-semibold text-slate-800">Lịch ngày {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                  {selectedEvents.length === 0 ? (
                    <div className="text-sm text-slate-500">Không có lịch trong ngày này.</div>
                  ) : (
                    <ul className="space-y-2.5">
                      {selectedEvents.map((v) => {
                        const hhmm = new Date(v.preferredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <li key={v.id} className="rounded-xl border border-slate-100 bg-white p-2.5">
                            <div className="flex items-center gap-3 text-xs">
                              <span className={`inline-flex items-center gap-1.5 ${isDepositViewing(v) ? 'text-cyan-700' : 'text-emerald-700'}`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-semibold text-[13px]">{hhmm}</span>
                                {isDepositViewing(v) && (
                                  <span className="rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 px-1.5 py-0.5 text-[10px] leading-none">Đặt cọc</span>
                                )}
                              </span>
                              <span className="hidden sm:inline h-3 w-px bg-slate-200" />
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <UserIcon className="h-3.5 w-3.5" /> {v.name || 'Khách'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-slate-700">
                                <Phone className="h-3.5 w-3.5" /> {v.phone || '-'}
                              </span>
                              {(() => {
                                const note = viewingDisplayNote(v);
                                return note ? (
                                  <span className="truncate text-slate-600 max-w-[160px] sm:max-w-[260px]" title={note}>• {note}</span>
                                ) : null;
                              })()}
                              <span className="ml-auto" />
                              <select value={v.status} onChange={(e) => onChangeStatus(v, e.target.value as any)} className="rounded-lg border px-2 py-1 text-xs">
                                <option value="pending">{isDepositViewing(v) ? 'Chờ đặt cọc' : 'Đang chờ'}</option>
                                <option value="confirmed">{isDepositViewing(v) ? 'Xác nhận đặt cọc' : 'Đã xác nhận'}</option>
                                <option value="cancelled">{isDepositViewing(v) ? 'Huỷ đặt cọc' : 'Đã huỷ'}</option>
                                <option value="visited">Đã xem</option>
                              </select>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {meta?.pageCount && meta.pageCount > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="rounded-lg border px-3 py-1 disabled:opacity-50">Trước</button>
                <span className="text-sm text-slate-600">Trang {page}/{meta.pageCount}</span>
                <button disabled={page >= (meta.pageCount || 1)} onClick={() => setPage(p => p+1)} className="rounded-lg border px-3 py-1 disabled:opacity-50">Sau</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-screen-2xl"><div className="rounded-xl border bg-white p-4 text-sm text-slate-600">Đang tải…</div></div></main>}>
      <AdminViewingsPage />
    </Suspense>
  );
}
