"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useId } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Phone, User as UserIcon, CheckCircle2, Sparkles, ShieldCheck, Star } from "lucide-react";
import google from "@/assets/google.png";
import banner from "@/assets/banner-01.jpg";
import logo from "@/assets/logo-trang.png";
import logomau from "@/assets/logo-mau.png";
import { userService } from "@/services/userService";
import { LoginUserRequest, RegisterUserRequest, resLoginUser } from "@/type/user";
import { partnerService } from "@/services/partnerService";
import type { PartnerForm } from "@/type/partners";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const initialMode = (search?.get("mode") === "register" ? "register" : "login") as "login" | "register";
  const initialRole = (search?.get("role") === "partner" ? "partner" : "customer") as "customer" | "partner";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [role, setRole] = useState<"customer" | "partner">(initialRole);
  const codeClientRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = useForm<LoginUserRequest & { remember: boolean }>({
    defaultValues: { identifier: "", password_hash: "", remember: true },
  });
  const formId = useId();

  const onSubmit = async (data: LoginUserRequest & { remember: boolean }) => {
    try {
      const payload: LoginUserRequest = {
        identifier: String(data.identifier || "").trim(),
        password_hash: data.password_hash,
      };
      const res = (await userService.postLoginUser(payload)) as resLoginUser;
      console.log("Login response:", res);
      if (res?.accessToken && res?.user) {
        const rawUser: any = res.user;
        const normalizedUser = {
          ...rawUser,
          avatarUrl:
            rawUser?.avatarUrl || rawUser?.avatar || rawUser?.picture || rawUser?.photo || rawUser?.avatar_url || rawUser?.profile_image || null,
        } as typeof res.user;

        const storage = data.remember ? localStorage : sessionStorage;
        storage.setItem("access_token", res.accessToken);
        storage.setItem("auth_user", JSON.stringify(normalizedUser));

        if (typeof document !== "undefined") {
          const maxAge = data.remember ? 60 * 60 * 24 * 7 : undefined;
          document.cookie = `access_token=${res.accessToken}; Path=/; ${maxAge ? `Max-Age=${maxAge};` : ""
            } SameSite=Lax`;
        }

        window.dispatchEvent(new CustomEvent("auth:login", { detail: normalizedUser }));

        toast.success(res?.message || "Đăng nhập thành công");
        toast.success(res?.message || "Đăng nhập thành công");
        const callbackUrl = search?.get("callbackUrl");
        if (callbackUrl && callbackUrl.startsWith('/')) {
          router.replace(callbackUrl);
        } else {
          router.replace("/");
        }
      } else {
        toast.error(res?.message || "Tài khoản hoặc mật khẩu không đúng");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };

  // Forgot password modal state & handler
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  const handleForgotSubmit = async () => {
    try {
      if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
        toast.warning('Vui lòng nhập email hợp lệ');
        return;
      }
      setIsSubmittingForgot(true);
      const res = await userService.postForgotPassword({ email: String(forgotEmail).trim() });
      toast.success(res?.message || 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.');
      setShowForgot(false);
      setForgotEmail("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  // Register form state (when mode = register)
  const {
    register: reg,
    handleSubmit: handleRegisterSubmit,
    formState: { isSubmitting: isSubmittingRegister },
    watch: watchRegister,
    getValues: getRegisterValues,
    reset: resetRegister,
  } = useForm<RegisterUserRequest & { confirmPassword?: string; agree?: boolean; need?: string }>(
    {
      defaultValues: {
        name: "",
        phone: "",
        email: "",
        password_hash: "",
        confirmPassword: "",
        agree: false,
        need: "",
      },
    }
  );

  const submitRegister = async (data: RegisterUserRequest & { confirmPassword?: string; agree?: boolean; need?: string }) => {
    try {
      if (role === "customer") {
        if (data.password_hash !== data.confirmPassword) {
          toast.warning("Mật khẩu xác nhận không khớp");
          return;
        }
        if (!data.agree) {
          toast.warning("Bạn cần đồng ý điều khoản để tiếp tục");
          return;
        }
        const payload: RegisterUserRequest = {
          name: String(data.name || "").trim(),
          phone: String(data.phone || "").trim(),
          email: String(data.email || "").trim(),
          password_hash: String(data.password_hash || ""),
        };
        const res = await userService.postRegisterUser(payload);
        toast.success(res?.message || "Đã gửi mã xác thực tới email. Vui lòng kiểm tra hộp thư của bạn.");
        router.push(`/xac-thuc-email?email=${encodeURIComponent(payload.email || "")}`);
      } else {
        // Đối tác: tạo lead
        const payload: PartnerForm = {
          role: "landlord",
          fullName: String(data.name || "").trim(),
          phone: String(data.phone || "").trim(),
          email: String(data.email || "").trim(),
          need: String((data as any).need || "").trim(),
        };
        await partnerService.create(payload);
        toast.success("Đã ghi nhận đăng ký đối tác. Chúng tôi sẽ liên hệ sớm!");
        resetRegister();
        setMode("login");
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.message || "Thao tác thất bại. Vui lòng thử lại!";
      toast.error(apiMsg);
    }
  };

  const handleGoogleCode = async (resp: any) => {
    try {
      const code = resp?.code;
      if (!code) {
        toast.error("Không nhận được mã Google");
        return;
      }
      const res = (await userService.postLoginGoogleCode({ code, redirectUri: "postmessage" })) as resLoginUser;
      if (res?.accessToken && res?.user) {
        const rawUser: any = res.user;
        const normalizedUser = {
          ...rawUser,
          avatarUrl:
            rawUser?.avatarUrl || rawUser?.avatar || rawUser?.picture || rawUser?.photo || rawUser?.avatar_url || rawUser?.profile_image || null,
        } as typeof res.user;

        localStorage.setItem("access_token", res.accessToken);
        localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
        window.dispatchEvent(new CustomEvent("auth:login", { detail: normalizedUser }));
        toast.success(res?.message || "Đăng nhập thành công");
        toast.success(res?.message || "Đăng nhập thành công");
        const callbackUrl = search?.get("callbackUrl");
        if (callbackUrl && callbackUrl.startsWith('/')) {
          router.replace(callbackUrl);
        } else {
          router.replace("/");
        }
      } else {
        toast.error(res?.message || "Đăng nhập Google thất bại");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập Google thất bại");
    }
  };

  // Load Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cid = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!cid) return; // Chưa cấu hình client id

    const onLoad = () => {
      try {
        // Init OAuth Code client (single method via popup)
        // @ts-ignore
        codeClientRef.current = window.google?.accounts.oauth2.initCodeClient({
          client_id: cid,
          scope: "openid email profile",
          ux_mode: "popup",
          redirect_uri: "postmessage",
          callback: handleGoogleCode,
        });
      } catch { }
    };

    const scriptId = "google-gis-script";
    if (document.getElementById(scriptId)) {
      onLoad();
      return;
    }
    const s = document.createElement("script");
    s.id = scriptId;
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = onLoad;
    document.body.appendChild(s);

    return () => {
      // Không xoá script để tránh tải lại nhiều lần
    };
  }, [router]);

  const onLoginWithGoogle = () => {
    const cid = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!cid) {
      toast.error("Thiếu cấu hình Google Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID)");
      return;
    }
    if (!codeClientRef.current) {
      toast.info("Đang tải Google Sign-In. Vui lòng thử lại...");
      return;
    }
    try {
      codeClientRef.current.requestCode();
    } catch (e) {
      toast.error("Không mở được popup Google. Hãy tắt chặn popup hoặc thử lại.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <Image src={banner} alt="background" fill className="object-cover brightness-[1] blur-[2px]" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-white/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left: brand/benefits panel */}
          <div className="hidden md:flex relative rounded-3xl overflow-hidden ring-1 ring-white/40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 transition-colors">
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-emerald-300/50 blur-2xl dark:opacity-30" />
            <div className="absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-teal-300/50 blur-2xl dark:opacity-30" />
            <div className="relative p-8 lg:p-10 flex flex-col justify-center items-center text-center">
              <Image src={logomau} alt="Logo" priority className="h-10 md:h-12 w-auto object-contain" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Nền tảng thuê trọ dễ dàng</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Nhanh chóng • Minh bạch • Hỗ trợ tận tâm</p>

              <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-200 text-left max-w-md">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Tài khoản miễn phí, bảo mật <b className="ml-1">Shield</b></li>
                <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-amber-500" /> Tìm phòng nhanh với bộ lọc thông minh</li>
                <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-rose-500" /> Yêu thích, đặt lịch xem phòng ngay</li>
              </ul>

              <div className="mt-6 text-xs text-gray-600 dark:text-gray-400">
                Bằng việc tiếp tục, bạn đồng ý với <a href="#" onClick={(e) => e.preventDefault()} className="underline decoration-emerald-400 decoration-2 underline-offset-2">Điều khoản</a> & <a href="#" onClick={(e) => e.preventDefault()} className="underline decoration-emerald-400 decoration-2 underline-offset-2">Chính sách</a> của chúng tôi.
              </div>
            </div>
          </div>

          {/* Right: form card */}
          <div className="relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/50 transition-colors">
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-32 w-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 blur-3xl opacity-20 dark:opacity-10" />
            </div>

            <div className="relative">
              {/* Header + Tabs */}
              <div className="px-7 pt-7 pb-10 text-center">
                <div className="flex flex-col items-center">
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {mode === "login" ? "Chào mừng quay lại 👋" : "Nhập thông tin để bắt đầu ✨"}
                  </p>
                </div>

                {/* Tabs removed per request; mode is set via route params */}

                {/* Role selector (bigger) */}
                {/* <div className="mt-4 text-center">
                <div className="text-sm md:text-base font-medium text-slate-700 mb-2">Tôi là</div>
                <div className="inline-flex rounded-2xl border border-emerald-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`px-4 py-2 rounded-xl text-sm md:text-base font-semibold transition ${role === "customer" ? "bg-emerald-600 text-white shadow" : "text-emerald-700 hover:bg-emerald-50"}`}
                  >
                    Khách hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("partner")}
                    className={`px-4 py-2 rounded-xl text-sm md:text-base font-semibold transition ${role === "partner" ? "bg-emerald-600 text-white shadow" : "text-emerald-700 hover:bg-emerald-50"}`}
                  >
                    Đối tác
                  </button>
                </div>
              </div> */}
              </div>

              {/* Forms */}
              {mode === "login" ? (
                <form id={formId} onSubmit={handleSubmit(onSubmit)} className="px-7 pb-7 space-y-4">
                  {/* Email hoặc số điện thoại */}
                  <label className="block">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email hoặc số điện thoại</span>
                    <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50 transition-colors">
                      <Mail className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                      <input
                        {...register("identifier", { required: true })}
                        type="text"
                        placeholder="you@example.com hoặc 0912345678"
                        className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </label>

                  {/* Removed top-right CTA per request */}

                  {/* Password */}
                  <label className="block">
                    <div className="flex items-center justify-between">
                      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50 transition-colors">
                      <Lock className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                      <input
                        {...register("password_hash", { required: true })}
                        type="password"
                        placeholder="••••••••"
                        className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </label>

                  {/* Options */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="checkbox" className="rounded border-gray-300" {...register("remember")} />
                      Ghi nhớ đăng nhập
                    </label>
                    <button type="button" className="text-sm text-emerald-700 hover:underline" onClick={() => setShowForgot(true)}>
                      Quên mật khẩu?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    <span className="relative z-10">{isSubmitting ? "Đang xử lý..." : "Đăng nhập"}</span>
                    <span className="absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition">
                      <span className="absolute left-0 top-0 h-full w-1/3 translate-x-[-120%] bg-white/30 blur-lg group-hover:translate-x-[220%] transition-transform duration-700" />
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">hoặc</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
                  </div>

                  {/* Google: single button */}
                  <button
                    type="button"
                    aria-label="Tiếp tục với Google"
                    className="relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    onClick={onLoginWithGoogle}
                  >
                    <span className="absolute left-3 inline-flex items-center">
                      <Image src={google} alt="Google" width={18} height={18} className="inline-block" priority />
                    </span>
                    <span className="pointer-events-none">Đăng nhập bằng Google</span>
                  </button>


                  {/* Footer text: prompt to register */}
                  <div className="pt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    Chưa có tài khoản? {" "}
                    <button
                      type="button"
                      onClick={() => router.push(`/dang-ky`)}
                      className="text-emerald-700 font-medium hover:underline"
                    >
                      Tạo tài khoản miễn phí
                    </button>
                  </div>

                  {/* Removed in-form switch to register */}
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit(submitRegister)} className="px-7 pb-7 space-y-4" noValidate>
                  {role === "customer" ? (
                    <>
                      {/* Họ và tên */}
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</span>
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50">
                          <UserIcon className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                          <input {...reg("name", { required: true, minLength: 2 })} placeholder="Nguyễn Văn A" className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                        </div>
                      </label>
                      {/* Số điện thoại */}
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</span>
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50">
                          <Phone className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                          <input {...reg("phone", { required: true })} type="tel" inputMode="tel" placeholder="090..." className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                        </div>
                      </label>
                      {/* Email */}
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50">
                          <Mail className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                          <input {...reg("email", { required: true })} type="email" placeholder="you@example.com" className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                        </div>
                      </label>
                      {/* PW + confirm */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</span>
                          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50">
                            <Lock className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                            <input {...reg("password_hash", { required: true, minLength: 6 })} type="password" placeholder="••••••••" className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                          </div>
                        </label>
                        <label className="block">
                          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận</span>
                          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50">
                            <Lock className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                            <input {...reg("confirmPassword", { required: true })} type="password" placeholder="••••••••" className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                          </div>
                        </label>
                      </div>
                      {/* Agree */}
                      <label className="mt-1 inline-flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" {...reg("agree", { required: true })} className="mt-1 rounded border-gray-300" />
                        <span>
                          Tôi đồng ý với <a className="text-emerald-700 underline" href="#" onClick={(e) => e.preventDefault()}>Điều khoản</a> & <a className="text-emerald-700 underline" href="#" onClick={(e) => e.preventDefault()}>Chính sách</a>.
                        </span>
                      </label>
                      <button type="submit" disabled={isSubmittingRegister} className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60">
                        <span className="relative z-10">{isSubmittingRegister ? "Đang xử lý..." : "Đăng ký"}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Partner form */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 text-xs text-emerald-800 dark:text-emerald-400 inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Đăng ký đối tác: để lại thông tin, chúng tôi sẽ liên hệ tư vấn.</div>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</span>
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300 dark:focus-within:ring-emerald-500/50">
                          <UserIcon className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
                          <input {...reg("name", { required: true })} placeholder="Nguyễn Văn A" className="w-full outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700">Số điện thoại</span>
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                          <Phone className="size-4 shrink-0 text-gray-400" />
                          <input {...reg("phone", { required: true })} type="tel" inputMode="tel" placeholder="090..." className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700">Email</span>
                        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                          <Mail className="size-4 shrink-0 text-gray-400" />
                          <input {...reg("email", { required: true })} type="email" placeholder="you@example.com" className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nhu cầu</span>
                        <textarea {...reg("need")} rows={3} placeholder="Mô tả nhanh về nhu cầu, số lượng phòng/căn hộ..." className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-500/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                      </label>
                      <button type="submit" disabled={isSubmittingRegister} className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60">
                        <span className="relative z-10">{isSubmittingRegister ? "Đang gửi..." : "Gửi đăng ký đối tác"}</span>
                      </button>
                    </>
                  )}

                  {/* Removed in-form switch to login */}
                </form>
              )}
              {/* Forgot password modal (simple) */}
              {showForgot ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowForgot(false)} />
                  <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quên mật khẩu</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Nhập email để nhận liên kết đặt lại mật khẩu.</p>
                    <div className="mt-4">
                      <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 dark:border-slate-600 px-3 py-2 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button type="button" onClick={() => setShowForgot(false)} className="rounded-xl px-4 py-2 border dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">Hủy</button>
                      <button type="button" onClick={handleForgotSubmit} disabled={isSubmittingForgot} className="rounded-xl bg-emerald-600 px-4 py-2 text-white disabled:opacity-60">{isSubmittingForgot ? 'Đang gửi...' : 'Gửi'}</button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
