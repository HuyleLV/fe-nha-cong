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

type Step = "enter-personal" | "verify-otp" | "enter-credentials";

export default function RegisterPage() {
  const router = useRouter();
  const formId = useId();
  const [step, setStep] = useState<Step>("enter-personal");
  const [phone, setPhone] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phoneExistsError, setPhoneExistsError] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Forms
  const {
    register: regPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { isSubmitting: isSubmittingPhone, errors: errorsPhone },
  } = useForm<{ name?: string; phone: string }>({
    mode: "onTouched",
    defaultValues: { phone: "", name: "" },
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
      const n = String((data as any).name || "").trim();
      if (n) setFullName(n);
      if (!p) {
        toast.warning("Vui lòng nhập số điện thoại");
        return;
      }
      const res = await userService.postStartRegisterPhone({ phone: p });
      // If backend says the phone is already registered, show message and redirect to login
      if ((res as any)?.alreadyRegistered) {
        const msg = (res as any)?.message || "Số điện thoại đã được đăng ký. Vui lòng đăng ký bằng số khác.";
        setPhoneExistsError(msg);
        toast.info(msg);
        // stay on the registration screen and let user change the phone number
        return;
      }
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
        setStep("enter-personal");
        return;
      }
      if (!code) {
        toast.warning("Vui lòng nhập mã OTP");
        return;
      }
      // Verify phone; after successful verification, proceed to credential step
      const res = await userService.postVerifyPhone({ phone, code });
      if (res) {
        // Do NOT auto-login here. Proceed to collect email & password.
        setStep("enter-credentials");
        toast.success((res as any)?.message || "Số điện thoại đã được xác minh. Vui lòng nhập email và mật khẩu để hoàn tất đăng ký.");
      } else {
        toast.error((res as any)?.message || "Xác minh thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message || "Xác minh thất bại. Vui lòng thử lại!";
      toast.error(apiMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Credential form (email + password)
  const {
    register: regCred,
    handleSubmit: handleCredSubmit,
    getValues,
    formState: { isSubmitting: isSubmittingCred, errors: errorsCred },
  } = useForm<{ email: string; password: string; confirmPassword: string; agree?: boolean }>({
    mode: "onTouched",
    defaultValues: { email: "", password: "", confirmPassword: "", agree: true },
  });

  const submitCredentials = async (data: { email: string; password: string; confirmPassword: string; agree?: boolean }) => {
    try {
      const payload = {
        name: fullName || undefined,
        phone: phone || undefined,
        email: String(data.email || "").trim() || undefined,
        password_hash: String(data.password || "").trim() || undefined,
        confirmPassword: String(data.confirmPassword || "").trim() || undefined,
        agree: !!data.agree,
      } as any;
      const res = await userService.postRegisterUser(payload);
      // If backend returns accessToken, log in. Otherwise, show success and redirect.
      const anyRes: any = res;
      if (anyRes?.accessToken && anyRes?.user) {
        localStorage.setItem("access_token", anyRes.accessToken);
        localStorage.setItem("auth_user", JSON.stringify(anyRes.user));
        if (typeof document !== "undefined") {
          document.cookie = `access_token=${anyRes.accessToken}; Path=/; SameSite=Lax`;
        }
        window.dispatchEvent(new CustomEvent("auth:login", { detail: anyRes.user }));
        toast.success(anyRes?.message || "Đăng ký thành công.");
        router.replace("/");
        return;
      }

      // If the register route did not return a token, attempt to log in automatically
      try {
        const identifier = payload.email || payload.phone;
        if (identifier && payload.password_hash) {
          const loginRes: any = await userService.postLoginUser({ identifier, password_hash: payload.password_hash });
          if (loginRes?.accessToken && loginRes?.user) {
            localStorage.setItem("access_token", loginRes.accessToken);
            localStorage.setItem("auth_user", JSON.stringify(loginRes.user));
            if (typeof document !== "undefined") {
              document.cookie = `access_token=${loginRes.accessToken}; Path=/; SameSite=Lax`;
            }
            window.dispatchEvent(new CustomEvent("auth:login", { detail: loginRes.user }));
            toast.success(loginRes?.message || anyRes?.message || "Đăng ký và đăng nhập thành công.");
            router.replace("/");
            return;
          }
        }
      } catch (e: any) {
        // ignore login error here, show register message below
        console.warn('Auto-login after register failed', e?.response?.data || e?.message || e);
      }

      toast.success(anyRes?.message || "Đăng ký thành công. Vui lòng đăng nhập.");
      router.replace("/");
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      toast.error(apiMsg);
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

      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: benefits panel (visible on md+) */}
          <aside className="hidden md:block">
            <div className="relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/90 border border-white/40 h-full">
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-32 w-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 blur-3xl opacity-8" />
              </div>
              <div className="relative p-8">
                <h2 className="text-2xl font-semibold mb-4">🔑 Lợi Ích Khi Đăng Ký Tài Khoản</h2>
                <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
                  <li>Truy Cập Tính Năng Độc Quyền</li>
                  <li>Cập Nhật Tin Tức &amp; Ưu Đãi Sớm Nhất</li>
                  <li>Lưu Trữ &amp; Quản Lý Dễ Dàng</li>
                  <li>Nhận Thông Báo Tin Đăng Mới Theo Tiêu Chí</li>
                  <li>Tương Tác Trực Tiếp &amp; Riêng Tư</li>
                  <li>Đánh Giá &amp; Phản Hồi Chất Lượng</li>
                </ol>
                <p className="text-xs text-gray-500 mt-6">Đăng ký ngay để tận hưởng trải nghiệm tối ưu và nhận thông báo phù hợp với nhu cầu của bạn.</p>
              </div>
            </div>
          </aside>

          {/* RIGHT: existing register card */}
          <div>
            <div className="relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/80 border border-white/40">
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-32 w-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 blur-3xl opacity-20" />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="px-7 pt-7 pb-4 text-center">
              <div className="flex flex-col items-center">
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">Đăng ký</h1>
                <p className="mt-1 text-sm text-gray-600">Nhập họ tên và số điện thoại để nhận mã OTP qua Zalo và xác minh</p>
              </div>
            </div>
            {step === "enter-personal" && (
              <form id={formId} onSubmit={handlePhoneSubmit(sendOtp)} className="px-7 pb-7 space-y-4" noValidate>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700">Họ và tên</span>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <input
                      {...regPhone("name", { required: "Vui lòng nhập họ và tên" })}
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {errorsPhone.name && <p className="mt-1 text-xs text-red-600">{(errorsPhone as any).name?.message as string}</p>}
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-gray-700">Số điện thoại</span>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <Phone className="size-4 shrink-0 text-gray-400" />
                    <input
                      {...regPhone("phone", {
                        required: "Vui lòng nhập số điện thoại",
                        pattern: { value: /^(?:\+?84|0)[0-9\s\-().]{8,}$/, message: "Số điện thoại không hợp lệ" },
                      })}
                      onInput={() => setPhoneExistsError("")}
                      type="tel"
                      inputMode="tel"
                      placeholder="090..."
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                      aria-invalid={!!errorsPhone.phone || !!phoneExistsError}
                    />
                  </div>
                  {errorsPhone.phone && <p className="mt-1 text-xs text-red-600">{errorsPhone.phone.message as string}</p>}
                  {phoneExistsError && <p className="mt-1 text-xs text-red-600">{phoneExistsError}</p>}
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
                  <button type="button" className="hover:underline" onClick={() => setStep("enter-personal")}>Đổi số</button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOtp || isVerifying}
                  className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  <span className="relative z-10">{isSubmittingOtp || isVerifying ? "Đang xác minh..." : "Xác minh"}</span>
                  <span className="absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition">
                    <span className="absolute left-0 top-0 h-full w-1/3 -translate-x-[120%] bg-white/30 blur-lg group-hover:translate-x-[220%] transition-transform duration-700" />
                  </span>
                </button>
                <p className="text-center text-sm text-gray-600">Sau khi xác minh thành công, vui lòng nhập email và mật khẩu để hoàn tất đăng ký.</p>
              </form>
            )}

            {step === "enter-credentials" && (
              <form onSubmit={handleCredSubmit(submitCredentials)} className="px-7 pb-7 space-y-4" noValidate>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700">Email</span>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <input
                      {...regCred("email", { required: "Vui lòng nhập email", pattern: { value: /\S+@\S+\.\S+/, message: "Email không hợp lệ" } })}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {errorsCred.email && <p className="mt-1 text-xs text-red-600">{errorsCred.email.message as string}</p>}
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-gray-700">Mật khẩu</span>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <input
                      {...regCred("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" } })}
                      type="password"
                      placeholder="Mật khẩu"
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {errorsCred.password && <p className="mt-1 text-xs text-red-600">{errorsCred.password.message as string}</p>}
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</span>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <input
                      {...regCred("confirmPassword", {
                        required: "Vui lòng xác nhận mật khẩu",
                        validate: (v) => v === getValues().password || "Mật khẩu không khớp",
                      })}
                      type="password"
                      placeholder="Xác nhận mật khẩu"
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {errorsCred.confirmPassword && <p className="mt-1 text-xs text-red-600">{errorsCred.confirmPassword.message as string}</p>}
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input {...regCred("agree")} type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                  <span>Tôi đồng ý với Điều khoản và Chính sách</span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmittingCred}
                  className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  <span className="relative z-10">{isSubmittingCred ? "Đang gửi..." : "Hoàn tất đăng ký"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
          </div>
        </div>

        <div className="mx-auto mt-6 h-2 w-40 rounded-full bg-emerald-200/50 blur-md" />
      </div>
    </div>
  );
}
