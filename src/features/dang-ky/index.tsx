"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Mail, Phone, User, Lock, Eye, EyeOff } from "lucide-react";
import google from "@/assets/google.png";
import banner from "@/assets/banner-01.jpg";
import logo from "@/assets/logo-trang.png";
import { RegisterUserRequest } from "@/type/user";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";

type FormValues = RegisterUserRequest & {
  confirmPassword: string;
  agree: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const formId = useId();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password_hash: "",
      confirmPassword: "",
      agree: false,
    },
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const pwd = watch("password_hash");

  const onSubmit = async (data: FormValues) => {
    // Client-side guards
    if (data.password_hash !== data.confirmPassword) {
      toast.warning("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!data.agree) {
      toast.warning("Bạn chưa đồng ý điều khoản của trang chúng tôi!");
      return;
    }

    try {
      const payload: Omit<RegisterUserRequest, "confirmPassword" | "agree"> = {
        name: data.name!.trim(),
        phone: data.phone!.trim(),
        email: data.email!.trim(),
        password_hash: data.password_hash!,
      };

      const res = await userService.postRegisterUser(payload as RegisterUserRequest);
      // tuỳ API của bạn: có thể trả user hoặc message; mình chỉ báo thành công:
      toast.success("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
      reset();
      router.push("/dang-nhap");
      return res;
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng ký thất bại. Vui lòng thử lại!";
      toast.error(apiMsg);
    }
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

      {/* Card */}
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
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Tạo tài khoản</h1>
                  <p className="text-sm text-gray-600">Nhập thông tin bên dưới để bắt đầu ✨</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form id={formId} onSubmit={handleSubmit(onSubmit)} className="px-7 pb-7 space-y-4" noValidate>
              {/* Họ và tên */}
              <label className="block">
                <span className="block text-sm font-medium text-gray-700">Họ và tên</span>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                  <User className="size-4 shrink-0 text-gray-400" />
                  <input
                    {...register("name", {
                      required: "Vui lòng nhập họ và tên",
                      minLength: { value: 2, message: "Họ tên quá ngắn" },
                    })}
                    placeholder="Nguyễn Văn A"
                    className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </label>

              {/* Số điện thoại */}
              <label className="block">
                <span className="block text-sm font-medium text-gray-700">Số điện thoại</span>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                  <Phone className="size-4 shrink-0 text-gray-400" />
                  <input
                    {...register("phone", {
                      required: "Vui lòng nhập số điện thoại",
                      pattern: {
                        // Cho phép 0xxx... hoặc +84..., có khoảng trắng, dấu gạch
                        value: /^(?:\+?84|0)[0-9\s\-().]{8,}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    })}
                    type="tel"
                    inputMode="tel"
                    placeholder="090..."
                    className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </label>

              {/* Email */}
              <label className="block">
                <span className="block text-sm font-medium text-gray-700">Email</span>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                  <Mail className="size-4 shrink-0 text-gray-400" />
                  <input
                    {...register("email", {
                      required: "Vui lòng nhập email",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Email không hợp lệ" },
                    })}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </label>

              {/* Mật khẩu + Xác nhận */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="flex items-center justify-between">
                    <span className="block text-sm font-medium text-gray-700">Mật khẩu</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <Lock className="size-4 shrink-0 text-gray-400" />
                    <input
                      {...register("password_hash", {
                        required: "Vui lòng nhập mật khẩu",
                        minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                      })}
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                      aria-invalid={!!errors.password_hash}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password_hash && (
                    <p className="mt-1 text-xs text-red-600">{errors.password_hash.message}</p>
                  )}
                </label>

                <label className="block">
                  <div className="flex items-center justify-between">
                    <span className="block text-sm font-medium text-gray-700">Xác nhận</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-300">
                    <Lock className="size-4 shrink-0 text-gray-400" />
                    <input
                      {...register("confirmPassword", {
                        required: "Vui lòng xác nhận mật khẩu",
                        validate: (v) => v === pwd || "Không khớp",
                      })}
                      type={showPw2 ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                      aria-invalid={!!errors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2((s) => !s)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label={showPw2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPw2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </label>
              </div>

              {/* Đồng ý điều khoản */}
              <label className="mt-1 inline-flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("agree", { required: "Bạn cần đồng ý điều khoản để tiếp tục" })}
                  className="mt-1 rounded border-gray-300"
                  aria-invalid={!!errors.agree}
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a className="text-emerald-700 underline" href="#" onClick={(e) => e.preventDefault()}>
                    Điều khoản
                  </a>{" "}
                  &{" "}
                  <a className="text-emerald-700 underline" href="#" onClick={(e) => e.preventDefault()}>
                    Chính sách
                  </a>.
                </span>
              </label>
              {errors.agree && <p className="text-xs text-red-600">{errors.agree.message as string}</p>}

              {/* Submit */}
              <button
                type="submit"
                onClick={() => console.log("[REGISTER_BUTTON_CLICK] getValues:", getValues())}
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-2xl bg-emerald-600 px-4 py-2.5 font-medium text-white shadow hover:bg-emerald-700 transition disabled:opacity-60"
              >
                <span className="relative z-10">{isSubmitting ? "Đang xử lý..." : "Đăng ký"}</span>
                <span className="absolute inset-0 -z-0 opacity-0 group-hover:opacity-100 transition">
                  <span className="absolute left-0 top-0 h-full w-1/3 -translate-x-[120%] bg-white/30 blur-lg group-hover:translate-x-[220%] transition-transform duration-700" />
                </span>
              </button>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-500">hoặc</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Nút Google */}
              <button
                type="button"
                aria-label="Tiếp tục với Google"
                className="relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => console.log("[REGISTER_GOOGLE_CLICK]")}
              >
                <span className="absolute left-3 inline-flex items-center">
                  <Image src={google} alt="Google" width={18} height={18} className="inline-block" priority />
                </span>
                <span className="pointer-events-none">Tiếp tục với Google</span>
              </button>

              {/* Footer */}
              <div className="pt-3 text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link href="/dang-nhap" className="text-emerald-700 font-medium hover:underline">
                  Đăng nhập
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
