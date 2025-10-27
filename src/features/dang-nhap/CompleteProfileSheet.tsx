"use client";
import { useMemo, useState } from "react";
import { userService } from "@/services/userService";
import { toast } from "react-toastify";
import { User as UserIcon, Phone, Lock, MapPin, Calendar as CalendarIcon, ImageIcon } from "lucide-react";
import UploadPicker from "@/components/UploadPicker";

export default function CompleteProfileSheet({ onDone, initialName, initialPhone, email, initialGender, initialDateOfBirth, initialAvatarUrl, initialAddress, }: { onDone?: () => void; initialName?: string; initialPhone?: string; email?: string; initialGender?: 'male' | 'female' | 'other' | null; initialDateOfBirth?: string | Date | null; initialAvatarUrl?: string | null; initialAddress?: string | null; }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dob, setDob] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");

  // Hydrate initial values on mount
  // Avoid overriding once user starts typing
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated) {
    if (initialName) setName(initialName);
    if (initialPhone) setPhone(initialPhone);
    if (initialGender) setGender(initialGender);
    if (initialAvatarUrl) setAvatarUrl(initialAvatarUrl);
    if (initialAddress) setAddress(initialAddress);
    if (initialDateOfBirth) {
      const iso = typeof initialDateOfBirth === 'string' ? initialDateOfBirth : new Date(initialDateOfBirth).toISOString().slice(0,10);
      setDob(iso);
    }
    setHydrated(true);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Require login token to call protected endpoint
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        toast.error("Bạn cần đăng nhập lại để cập nhật hồ sơ");
        return;
      }
    }
    if (pw && pw.length < 6) {
      toast.warning("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (pw && pw !== pw2) {
      toast.warning("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      setLoading(true);
      const res = await userService.postCompleteProfile({
        name: name || undefined,
        phone: phone || undefined,
        password_hash: pw || undefined,
        gender: gender || undefined,
        dateOfBirth: dob || undefined,
        avatarUrl: avatarUrl || undefined,
        address: address || undefined,
      });
      if (res?.user) {
        try {
          localStorage.setItem("auth_user", JSON.stringify(res.user));
          window.dispatchEvent(new CustomEvent("auth:update", { detail: res.user }));
        } catch {}
      }
      toast.success(res?.message || "Cập nhật hồ sơ thành công");
      onDone?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Cập nhật thất bại";
      toast.error(msg);
      // If missing user info or unauthorized, hint re-login
      if (msg?.toLowerCase?.().includes('thiếu thông tin người dùng') || err?.response?.status === 401) {
        toast.info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 md:p-5 space-y-4">
      <div className="text-sm text-slate-600">Hoàn tất hồ sơ để sử dụng đầy đủ tính năng. Mật khẩu là tuỳ chọn.</div>
      {email && (
        <div className="text-xs text-slate-500">Email của bạn: <span className="font-medium text-slate-700">{email}</span></div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600">Họ và tên</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
            <UserIcon className="size-4 shrink-0 text-slate-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-600">Số điện thoại</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
            <Phone className="size-4 shrink-0 text-slate-400" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090x xxx xxx"
              className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600">Giới tính</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-300"
          >
            <option value="">-- Chọn --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-600">Ngày sinh</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
            <CalendarIcon className="size-4 shrink-0 text-slate-400" />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block md:col-span-2">
          <span className="block text-xs font-medium text-slate-600">Địa chỉ</span>
          <div className="mt-1 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              rows={2}
              className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400 resize-y"
            />
          </div>
        </label>
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-600 mb-1">Ảnh đại diện</span>
        <UploadPicker value={avatarUrl || null} onChange={setAvatarUrl} aspectClass="aspect-square" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600">Mật khẩu (tuỳ chọn)</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
            <Lock className="size-4 shrink-0 text-slate-400" />
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Để trống nếu không muốn thay đổi mật khẩu.</div>
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-600">Xác nhận mật khẩu</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
            <Lock className="size-4 shrink-0 text-slate-400" />
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-medium shadow transition disabled:opacity-60"
      >
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
