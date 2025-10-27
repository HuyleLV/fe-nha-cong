"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useId } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import google from "@/assets/google.png";
import banner from "@/assets/banner-01.jpg";
import logo from "@/assets/logo-trang.png";
import { userService } from "@/services/userService";
import { LoginUserRequest, resLoginUser } from "@/type/user";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const [gisReady, setGisReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const codeClientRef = useRef<any>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = useForm<LoginUserRequest & { remember: boolean }>({
    defaultValues: { email: "", password_hash: "", remember: true },
  });
  const formId = useId();

  const onSubmit = async (data: LoginUserRequest & { remember: boolean }) => {
    try {
      const res = (await userService.postLoginUser(data)) as resLoginUser;
      console.log("Login response:", res);
      if (res?.accessToken && res?.user) {
        const storage = data.remember ? localStorage : sessionStorage;
        storage.setItem("access_token", res.accessToken);
        storage.setItem("auth_user", JSON.stringify(res.user));

        if (typeof document !== "undefined") {
          const maxAge = data.remember ? 60 * 60 * 24 * 7 : undefined;
          document.cookie = `access_token=${res.accessToken}; Path=/; ${
            maxAge ? `Max-Age=${maxAge};` : ""
          } SameSite=Lax`;
        }

        window.dispatchEvent(new CustomEvent("auth:login", { detail: res.user }));

        toast.success(res?.message || "Đăng nhập thành công");
        router.replace("/"); 
      } else {
        toast.error(res?.message || "Tài khoản hoặc mật khẩu không đúng");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại."
      );
    }
  };

  // Handle Google credential (id_token) -> call backend
  const handleGoogleCredential = async (response: any) => {
    try {
      const idToken = response?.credential;
      if (!idToken) {
        toast.error("Không nhận được token Google");
        return;
      }
      const res = (await userService.postLoginGoogleIdToken(idToken)) as resLoginUser;
      if (res?.accessToken && res?.user) {
        localStorage.setItem("access_token", res.accessToken);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        window.dispatchEvent(new CustomEvent("auth:login", { detail: res.user }));
        toast.success(res?.message || "Đăng nhập thành công");
        router.replace("/");
      } else {
        toast.error(res?.message || "Đăng nhập Google thất bại");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đăng nhập Google thất bại");
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
        localStorage.setItem("access_token", res.accessToken);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        window.dispatchEvent(new CustomEvent("auth:login", { detail: res.user }));
        toast.success(res?.message || "Đăng nhập thành công");
        router.replace("/");
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
        // @ts-ignore
        window.google?.accounts.id.initialize({
          client_id: cid,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: false,
          // Tránh dùng FedCM ở môi trường không đủ điều kiện khiến lỗi CORS/FedCM
          use_fedcm_for_prompt: false,
        });
        setGisReady(true);

        // Init OAuth Code client as fallback (popup)
        // @ts-ignore
        codeClientRef.current = window.google?.accounts.oauth2.initCodeClient({
          client_id: cid,
          scope: "openid email profile",
          ux_mode: "popup",
          // Use postmessage so we don't need to pre-register redirect URI
          redirect_uri: "postmessage",
          callback: handleGoogleCode,
        });

        // Render a hidden google button that we can trigger if needed
        if (googleBtnRef.current) {
          // @ts-ignore
          window.google?.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "rectangular",
          });
        }
      } catch {}
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
    if (!gisReady) {
      toast.info("Đang tải Google Sign-In. Vui lòng thử lại...");
      // @ts-ignore
      window.google?.accounts.id.prompt();
      return;
    }
    // Hiển thị prompt (One Tap) hoặc fallback click vào nút chuẩn nếu cần
    // @ts-ignore
    window.google?.accounts.id.prompt((notification: any) => {
      const notDisplayed = notification?.isNotDisplayed?.();
      const skipped = notification?.isSkippedMoment?.();
      const dismissed = notification?.isDismissedMoment?.();

      if (notDisplayed || skipped || dismissed) {
        // Fallback: trigger Code Flow popup
        if (codeClientRef.current) {
          try {
            codeClientRef.current.requestCode();
            return;
          } catch {}
        }
        // As a last resort, click rendered button if available
        const btn = googleBtnRef.current?.querySelector('div[role="button"], button') as HTMLDivElement | HTMLButtonElement | null;
        btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
      if (notification?.isSkippedMoment()) {
        console.debug('[GSI] prompt skipped:', notification.getSkippedReason?.());
      }
      if (notification?.isDismissedMoment()) {
        console.debug('[GSI] prompt dismissed:', notification.getDismissedReason?.());
      }
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <Image
            src={banner}
            alt="background"
            fill
            className="object-cover brightness-[1] blur-[2px]"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-white/30" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-4">
        <div className="relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl bg-white/80 border border-white/40">
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-32 w-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 blur-3xl opacity-20" />
          </div>

          <div className="relative">
            {/* Header */}
            <div className="px-7 pt-7 pb-4 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-600 text-white grid place-items-center text-lg font-bold shadow-md">
                  <Image src={logo} alt="logo" className="w-22 h-10 p-2" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Đăng nhập</h1>
                  <p className="text-sm text-gray-600">Chào mừng quay lại 👋</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form id={formId} onSubmit={handleSubmit(onSubmit)} className="px-7 pb-7 space-y-4">
              {/* Email */}
              <label className="block">
                <span className="block text-sm font-medium text-gray-700">Email</span>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                  <Mail className="size-4 shrink-0 text-gray-400" />
                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>
              </label>

              {/* Password */}
              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-gray-700">Mật khẩu</span>
                </div>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                  <Lock className="size-4 shrink-0 text-gray-400" />
                  <input
                    {...register("password_hash", { required: true })}
                    type="password"
                    placeholder="••••••••"
                    className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>
              </label>

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded border-gray-300" {...register("remember")} />
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="text-sm text-emerald-700 hover:underline">
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
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-500">hoặc</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                aria-label="Tiếp tục với Google"
                className="relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                onClick={onLoginWithGoogle}
              >
                <span className="absolute left-3 inline-flex items-center">
                  <Image src={google} alt="Google" width={18} height={18} className="inline-block" priority />
                </span>
                <span className="pointer-events-none">Tiếp tục với Google</span>
              </button>

              {/* Hidden Google button container for fallback */}
              <div ref={googleBtnRef} className="sr-only" aria-hidden="true" />

              {/* Fallback explicit popup login if One Tap bị chặn */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!codeClientRef.current) {
                      toast.info("Google đang tải. Vui lòng thử lại...");
                      return;
                    }
                    try {
                      codeClientRef.current.requestCode();
                    } catch (e) {
                      toast.error("Không mở được popup Google. Hãy tắt chặn popup hoặc thử lại.");
                    }
                  }}
                  className="text-xs text-gray-600 hover:underline"
                >
                  Không thấy One Tap? Nhấn để đăng nhập bằng popup
                </button>
              </div>

              {/* Footer */}
              <div className="pt-3 text-center text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link href="/dang-ky" className="text-emerald-700 font-medium hover:underline">
                  Đăng ký
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-6 h-2 w-40 rounded-full bg-emerald-200/50 blur-md" />
      </div>
    </div>
  );
}
