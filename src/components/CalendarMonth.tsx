"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarEvent = {
  id: number | string;
  date: Date; // date/time of event
  title: string;
  status?: "pending" | "confirmed" | "cancelled" | string;
};

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addMonths(d: Date, n: number) {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + n);
  return nd;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]; // Monday first

export default function CalendarMonth({
  events,
  initialMonth,
  onEventClick,
}: {
  events: CalendarEvent[];
  initialMonth?: Date;
  onEventClick?: (ev: CalendarEvent) => void;
}) {
  const [month, setMonth] = useState<Date>(initialMonth ? new Date(initialMonth) : new Date());

  // Normalize events into map by Y-M-D for quick rendering
  const eventsMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events || []) {
      const d = new Date(ev.date);
      const key = formatYMD(d);
      (map[key] ||= []).push({ ...ev, date: d });
    }
    // sort by time within the day
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.date.getTime() - b.date.getTime()));
    return map;
  }, [events]);

  const year = month.getFullYear();
  const mIdx = month.getMonth(); // 0..11
  const firstOfMonth = new Date(year, mIdx, 1);
  const lastOfMonth = new Date(year, mIdx + 1, 0);

  // Determine start of calendar grid (Monday as first column)
  const startDay = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(year, mIdx, 1 - startDay);

  // 6 weeks * 7 days grid (to cover all months)
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }

  const monthLabel = `${firstOfMonth.toLocaleString("vi-VN", { month: "long" })} ${year}`;

  const statusClass = (st?: string) => {
    if (st === "confirmed") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (st === "pending") return "bg-amber-100 text-amber-900 border-amber-200";
    if (st === "cancelled") return "bg-rose-100 text-rose-800 border-rose-200 line-through";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="font-semibold text-slate-800 capitalize">{monthLabel}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-lg border border-slate-200 hover:bg-white cursor-pointer"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            aria-label="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border border-slate-200 hover:bg-white cursor-pointer"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-white text-sm">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-center font-medium text-slate-600 border-b border-slate-100">
            {w}
          </div>
        ))}
        {days.map((d, idx) => {
          const inMonth = d.getMonth() === mIdx;
          const key = formatYMD(d);
          const list = eventsMap[key] || [];
          return (
            <div
              key={idx}
              className={`min-h-[110px] border-b border-r border-slate-100 p-2 ${idx % 7 === 0 ? "border-l" : ""} ${inMonth ? "bg-white" : "bg-slate-50/50"}`}
            >
              <div className={`text-xs ${inMonth ? "text-slate-800" : "text-slate-400"}`}>{d.getDate()}</div>
              <div className="mt-1 space-y-1">
                {list.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className={`px-2 py-1 rounded border ${statusClass(ev.status)} text-xs truncate hover:brightness-95 cursor-pointer`}
                    onClick={() => onEventClick?.(ev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onEventClick?.(ev); }}
                    title={`${ev.title} — ${ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                  >
                    <span className="font-medium">{ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>{" "}
                    <span className="opacity-80">{ev.title}</span>
                  </div>
                ))}
                {list.length > 3 && (
                  <div className="text-xs text-slate-500">+{list.length - 3} lịch nữa…</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
