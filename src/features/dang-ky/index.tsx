"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Phone, KeyRound, Clock } from "lucide-react";
import banner from "@/assets/banner-01.jpg";
import logo from "@/assets/logo-trang.png";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";

type Step = "enter-phone" | "verify-otp";

export default function RegisterPage() {
  const router = useRouter();
  const formId = useId();
  const [step, setStep] = useState<Step>("enter-phone");
  const [phone, setPhone] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Forms
  const {
    register: regPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { isSubmitting: isSubmittingPhone, errors: errorsPhone },
  } = useForm<{ phone: string }>({
    mode: "onTouched",
    defaultValues: { phone: "" },
  });

  const {
    register: regOtp,
    handleSubmit: handleOtpSubmit,
    formState: { isSubmitting: isSubmittingOtp, errors: errorsOtp },
  } = useForm<{ code: string }>({
    mode: "onTouched",
    defaultValues: { code: "" },
  });

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const sendOtp = async (data: { phone: string }) => {
    try {
      setIsSending(true);
      const p = String(data.phone || "").trim();
      if (!p) {
        toast.warning("Vui lòng nhập số điện thoại");
        return;
      }
      await userService.postStartRegisterPhone({ phone: p });
      setPhone(p);
      setStep("verify-otp");
      setCooldown(60);
      toast.success("Đã gửi mã OTP qua Zalo/SMS. Vui lòng kiểm tra tin nhắn.");
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message || "Không gửi được OTP. Vui lòng thử lại!";
      toast.error(apiMsg);
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async (data: { code: string }) => {
    try {
      setIsVerifying(true);
      const code = String(data.code || "").trim();
      if (!phone) {
        toast.warning("Thiếu số điện thoại. Vui lòng quay lại bước trước.");
        setStep("enter-phone");
        return;
      }
      if (!code) {
        toast.warning("Vui lòng nhập mã OTP");
        return;
      }
      const res = await userService.postVerifyPhone({ phone, code });
      if (res?.accessToken && res?.user) {
        localStorage.setItem("access_token", res.accessToken);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        if (typeof document !== "undefined") {
          document.cookie = `access_token=${res.accessToken}; Path=/; SameSite=Lax`;
        }
        window.dispatchEvent(new CustomEvent("auth:login", { detail: res.user }));
        toast.success(res?.message || "Xác minh thành công. Bạn đã được đăng nhập.");
        router.replace("/");
      } else {
        toast.error(res?.message || "Xác minh thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message || "Xác minh thất bại. Vui lòng thử lại!";
      toast.error(apiMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    if (!phone || cooldown > 0) return;
    await sendOtp({ phone });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <Image src={banner} alt="background" fill className="object-cover brightness-[1] blur-[2px]" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-white/30" />
      </div>

      <div className="relative z-10 w-full max-w-[520px] px-4">
        <div className="relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/80 border border-white/40">
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-32 w-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 blur-3xl opacity-20" />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="px-7 pt-7 pb-4 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-600 text-white grid place-items-center text-lg font-bold shadow-md">
                  <Image src={logo} alt="logo" className="w-20 h-14 p-2 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Đăng ký bằng số điện thoại</h1>
                  <p className="text-sm text-gray-600">Nhập số điện thoại để nhận mã OTP qua Zalo và xác minh</p>
                </div>
              </div>
            </div>

            {step === "enter-phone" && (
              <form id={formId} onSubmit={handlePhoneSubmit(sendOtp)} className="px-7 pb-7 space-y-4" noValidate>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700">Số điện thoại</span>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <Phone className="size-4 shrink-0 text-gray-400" />
                    <input
                      {...regPhone("phone", {
                        required: "Vui lòng nhập số điện thoại",
                        pattern: { value: /^(?:\+?84|0)[0-9\s\-().]{8,}$/, message: "Số điện thoại không hợp lệ" },
                      })}
                      type="tel"
                      inputMode="tel"
                      placeholder="090..."
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                      aria-invalid={!!errorsPhone.phone}
                    />
                  </div>
                  {errorsPhone.phone && <p className="mt-1 text-xs text-red-600">{errorsPhone.phone.message as string}</p>}
                </label>

                <button
                  type="submit"
                  disabled={isSubmittingPhone || isSending}
                  className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  <span className="relative z-10">{isSubmittingPhone || isSending ? "Đang gửi..." : "Gửi mã OTP qua Zalo"}</span>
                  <span className="absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition">
                    <span className="absolute left-0 top-0 h-full w-1/3 -translate-x-[120%] bg-white/30 blur-lg group-hover:translate-x-[220%] transition-transform duration-700" />
                  </span>
                </button>

                <p className="text-xs text-gray-600">Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Chính sách của chúng tôi.</p>
              </form>
            )}

            {step === "verify-otp" && (
              <form onSubmit={handleOtpSubmit(verifyOtp)} className="px-7 pb-7 space-y-4" noValidate>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs text-emerald-800">
                  Đã gửi mã OTP tới số <b>{phone}</b>. Vui lòng nhập mã để hoàn tất.
                </div>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700">Mã OTP</span>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <KeyRound className="size-4 shrink-0 text-gray-400" />
                    <input
                      {...regOtp("code", { required: "Vui lòng nhập mã OTP", minLength: { value: 4, message: "Mã không hợp lệ" } })}
                      inputMode="numeric"
                      placeholder="Nhập mã 6 số"
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                      aria-invalid={!!errorsOtp.code}
                    />
                  </div>
                  {errorsOtp.code && <p className="mt-1 text-xs text-red-600">{errorsOtp.code.message as string}</p>}
                </label>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {cooldown > 0 ? (
                      <span>Gửi lại sau {cooldown}s</span>
                    ) : (
                      <button type="button" className="text-emerald-700 hover:underline" onClick={resend}>Gửi lại mã</button>
                    )}
                  </div>
                  <button type="button" className="hover:underline" onClick={() => setStep("enter-phone")}>Đổi số</button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOtp || isVerifying}
                  className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  <span className="relative z-10">{isSubmittingOtp || isVerifying ? "Đang xác minh..." : "Xác minh & Đăng nhập"}</span>
                  <span className="absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition">
                    <span className="absolute left-0 top-0 h-full w-1/3 -translate-x-[120%] bg-white/30 blur-lg group-hover:translate-x-[220%] transition-transform duration-700" />
                  </span>
                </button>

                <p className="text-center text-sm text-gray-600">Sau khi xác minh thành công, bạn sẽ được đăng nhập ngay. Bạn có thể bổ sung email/mật khẩu sau trong phần Hồ sơ.</p>
              </form>
            )}
          </div>
        </div>

        <div className="mx-auto mt-6 h-2 w-40 rounded-full bg-emerald-200/50 blur-md" />
      </div>
    </div>
  );
}
