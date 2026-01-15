"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Spinner from "@/components/spinner";
import { Save, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { bankAccountService } from "../../../../../services/bankAccountService";

export default function Page() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id ?? "";
  const isCreate = id === "create";

  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [note, setNote] = useState("");
  const [balance, setBalance] = useState<string | number>('0');

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isCreate) {
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await bankAccountService.hostGet(Number(id));
        if (!mounted) return;
        setAccountHolder(data.accountHolder || "");
        setAccountNumber(data.accountNumber || "");
        setBankName(data.bankName || "");
        setBranch(data.branch || "");
  setNote(data.note || "");
  setBalance(data.balance ?? '0');
      } catch (err: any) {
        toast.error(err?.message ?? "Không thể tải tài khoản");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const save = async () => {
    if (!accountHolder.trim()) return toast.error("Vui lòng nhập chủ tài khoản");
    if (!accountNumber.trim()) return toast.error("Vui lòng nhập số tài khoản");
    if (!bankName.trim()) return toast.error("Vui lòng nhập ngân hàng");
    setActionLoading(true);
    try {
      const payload: any = {
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
        branch: branch.trim() || undefined,
        note: note.trim() || undefined,
        balance: (typeof balance === 'number' ? String(balance) : (balance || '0')),
      };
      if (isCreate) {
        await bankAccountService.hostCreate(payload);
        toast.success("Thêm tài khoản thành công");
      } else {
        await bankAccountService.hostUpdate(Number(id), payload);
        toast.success("Cập nhật tài khoản thành công");
      }
      router.push("/quan-ly-chu-nha/danh-muc-khac/danh-sach-tai-khoan");
    } catch (err: any) {
      toast.error(err?.message ?? "Lỗi khi lưu");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Sticky header like other edit pages */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">{isCreate ? "Thêm tài khoản ngân hàng" : "Cập nhật tài khoản ngân hàng"}</p>
              <h1 className="text-lg font-semibold text-slate-800 line-clamp-1">{isCreate ? "Tài khoản mới" : `#${id}`}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/quan-ly-chu-nha/danh-muc-khac/danh-sach-tai-khoan")} className="border px-3 py-2 rounded-lg">Hủy</button>
            <button onClick={save} disabled={actionLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {actionLoading ? <Spinner /> : <CheckCircle2 className="w-5 h-5" />} {isCreate ? "Tạo mới" : "Cập nhật"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="py-12 text-center"><Spinner /></div>
          ) : (
            <div className="space-y-6 bg-white rounded-xl border border-slate-200 p-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Chủ tài khoản</label>
                <input ref={inputRef} value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Số tài khoản</label>
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Ngân hàng</label>
                  <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Chi nhánh (tuỳ chọn)</label>
                  <input value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Số dư</label>
                <input type="number" value={typeof balance === 'number' ? balance : String(balance)} onChange={(e) => setBalance(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Ghi chú</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200" rows={3} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-700">Ghi chú</h3>
            <p className="text-sm text-slate-500 mt-2">Tài khoản ngân hàng sẽ hiển thị cho khách khi cần thanh toán. Đặt một tài khoản làm mặc định để hiển thị ưu tiên.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
