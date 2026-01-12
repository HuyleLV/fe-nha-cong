"use client";

import React, { useState } from "react";
import Panel from "@/app/quan-ly-chu-nha/components/Panel";
import { toast } from "react-toastify";

export default function DangKyCTVPage() {
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    setLoading(true);
    try {
      const { apiUrl } = await import("@/utils/apiUrl");
      const res = await fetch(apiUrl("/api/ctv/requests"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ source: "resident_portal" }),
      });
      if (!res.ok) {
        const err = await res.text();
        toast.error("Gửi yêu cầu thất bại: " + err);
      } else {
        toast.success("Yêu cầu đăng ký CTV đã được gửi. Admin sẽ duyệt.");
        // notify other parts of the app if needed
        window.dispatchEvent(new CustomEvent("ctv:requested"));
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Có lỗi khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Panel title="Đăng ký CTV">
        <p className="text-sm text-slate-600">Nút đăng ký CTV giúp cư dân đăng ký trở thành cộng tác viên. Yêu cầu sẽ được gửi tới admin để duyệt.</p>
        <div className="mt-4">
          <button disabled={loading} onClick={onRegister} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50">
            {loading ? "Đang gửi…" : "Đăng ký CTV"}
          </button>
        </div>
      </Panel>
    </div>
  );
}
