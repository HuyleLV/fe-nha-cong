"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/logo-trang.png";
import {
  Heart,
  UserRound,
  Menu,
  X,
  UserPlus,
  LogIn,
  LifeBuoy,
  ArrowRight,
  Building2,
  MapPin,
  Newspaper,
  Phone,
  LogOut,
  User as UserIcon,
  Map,
  Search,
  FileSearch,
} from "lucide-react";
import { User } from "@/type/user";
import { toast } from "react-toastify";
import { asImageSrc } from "@/utils/imageUrl";

export default function Header() {
  const router = useRouter();
  const [openUser, setOpenUser] = useState(false);
  const [openNavMobile, setOpenNavMobile] = useState(false);
  const [openNavDesktop, setOpenNavDesktop] = useState(false);

  const [auth, setAuth] = useState<User | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const userBtnRef = useRef<HTMLButtonElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const readStoredUser = () => {
    try {
      // Ưu tiên người dùng thường từ storage
      const rawLocal = localStorage.getItem("auth_user");
      const rawSession = sessionStorage.getItem("auth_user");
      const raw = rawLocal ?? rawSession;
      if (raw) return JSON.parse(raw) as User;

      // Sau đó đến adminInfo nếu có
      const adminInfo = localStorage.getItem("adminInfo");
      if (adminInfo) return JSON.parse(adminInfo) as User;

      // Cuối cùng decode JWT nếu chỉ có token
      const token = localStorage.getItem("tokenAdmin") || localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (token) {
        try {
          const [, payload] = token.split(".");
          if (payload) {
            const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
            return {
              id: Number(json.sub),
              email: json.email,
              role: json.role,
              name: json.name,
              avatarUrl: json.avatarUrl,
              phone: json.phone,
            } as User;
          }
        } catch {
          // ignore
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("tokenAdmin");
    localStorage.removeItem("tokenUser");
    localStorage.removeItem("adminInfo");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("access_token");
    document.cookie = "access_token=; Max-Age=0; Path=/; SameSite=Lax";
  };

  // Load auth on mount & subscribe to auth events
  useEffect(() => {
    setAuth(readStoredUser());

    const onLogin = (e: Event) => {
      const detail = (e as CustomEvent<User>).detail;
      if (detail) {
        setAvatarBroken(false);
        setAuth(detail);
      } else {
        setAuth(readStoredUser());
      }
    };
    const onLogout = () => {
      setAuth(null);
      setAvatarBroken(false);
    };

    window.addEventListener("auth:login", onLogin as EventListener);
    window.addEventListener("auth:logout", onLogout as EventListener);
    return () => {
      window.removeEventListener("auth:login", onLogin as EventListener);
      window.removeEventListener("auth:logout", onLogout as EventListener);
    };
  }, []);

  useEffect(() => {
    const outside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        userMenuRef.current &&
        userBtnRef.current &&
        !userMenuRef.current.contains(t) &&
        !userBtnRef.current.contains(t)
      ) {
        setOpenUser(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenUser(false);
        setOpenNavMobile(false);
        setOpenNavDesktop(false);
      }
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Lock scroll when any panel open
  const anyPanelOpen = openNavMobile || openNavDesktop;
  useEffect(() => {
    if (anyPanelOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [anyPanelOpen]);

  const mainMenus = [
    { label: "TÌM PHÒNG", href: "/" },
    { label: "TÌM VIỆC", href: "/" },
    { label: "TÌM XE", href: "/" },
    { label: "TÌM THỢ", href: "/" },
  ];

  const AvatarButtonContent = () => {
    const url = auth?.avatarUrl?.trim();
    if (!auth || !url || avatarBroken) {
      return <UserRound className="text-white w-9 h-9 p-2" />;
    }
    return (
      <img
        src={asImageSrc(url)}
        alt={auth?.name || auth?.email || "user"}
        className="w-9 h-9 rounded-full object-cover"
        onError={() => setAvatarBroken(true)}
      />
    );
  };

  const handleLogout = () => {
    clearAuthStorage();
    setOpenUser(false);
    setAuth(null);
    setAvatarBroken(false);
    window.dispatchEvent(new CustomEvent("auth:logout"));
    toast.success("Đăng xuất thành công!");
    // Always go to login page after logout
    try {
      router.replace("/dang-nhap");
    } catch {}
  };

  const ensureAuthAnd = (action: () => void) => {
    if (!auth) {
      toast.info("Vui lòng đăng nhập để sử dụng chức năng này");
      router.push("/dang-nhap");
      return;
    }
    action();
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#006633] to-[#4CAF50] text-white shadow-md">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center">
            <Image src={logo} alt="Logo" className="h-10 w-auto" priority />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 text-base font-semibold bg-white text-green-800 py-2 px-6 rounded-full shadow">
            {mainMenus.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className="px-4 py-1 rounded-full hover:text-white hover:bg-gradient-to-r hover:from-[#006633] hover:to-[#4CAF50] transition"
              >
                {m.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="relative flex items-center gap-2 md:gap-3">
            <Link
              href="/tim-phong-quanh-day"
              aria-label="Tìm phòng"
              className="p-2 rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] border border-white/60 hover:scale-110 hover:shadow-lg transition cursor-pointer"
            >
              <Search className="text-white w-5 h-5" />
            </Link>

            <button
              ref={userBtnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={openUser}
              aria-controls="user-menu"
              onClick={() => setOpenUser((v) => !v)}
              className="rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] border border-white/60 hover:scale-110 hover:shadow-lg transition cursor-pointer"
              title={auth ? (auth.name || auth.email) : "Tài khoản"}
            >
              <AvatarButtonContent />
            </button>

            {/* Menu Mobile trigger */}
            <button
              type="button"
              aria-label="Mở menu mobile"
              onClick={() => setOpenNavMobile(true)}
              className="p-2 rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] border border-white/60 hover:scale-110 hover:shadow-lg transition md:hidden cursor-pointer"
            >
              <Menu className="text-white w-5 h-5" />
            </button>

            {/* Menu Desktop trigger */}
            <button
              type="button"
              aria-label="Mở menu desktop"
              onClick={() => setOpenNavDesktop(true)}
              className="hidden md:inline-flex p-2 rounded-full bg-gradient-to-r from-[#006633] to-[#4CAF50] border border-white/60 hover:scale-110 hover:shadow-lg transition cursor-pointer"
            >
              <Menu className="text-white w-5 h-5" />
            </button>

            {/* Dropdown User */}
            {openUser && (
              <div
                id="user-menu"
                ref={userMenuRef}
                role="menu"
                className="absolute right-0 top-12 w-72 bg-white text-slate-700 rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden"
              >
                {auth ? (
                  <>
                    {/* Logged-in header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50">
                      <div className="shrink-0">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center overflow-hidden">
                          {auth.avatarUrl && !avatarBroken ? (
                            <img
                              src={asImageSrc(auth.avatarUrl)}
                              alt="avatar"
                              className="w-full h-full object-cover"
                              onError={() => setAvatarBroken(true)}
                            />
                          ) : (
                            <UserIcon className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{auth.name || "Người dùng"}</div>
                        <div className="text-xs text-slate-500 truncate">{auth.email}</div>
                      </div>
                    </div>

                    <Link
                      href="/tai-khoan-cua-toi"
                      className="flex items-center px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => setOpenUser(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-3" /> Tài khoản của tôi
                    </Link>

                    <div className="my-2 h-px bg-slate-200" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-3 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dang-ky"
                      className="flex items-center px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => setOpenUser(false)}
                    >
                      <UserPlus className="w-4 h-4 mr-3" /> Đăng ký
                    </Link>
                    <Link
                      href="/dang-nhap"
                      className="flex items-center px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => setOpenUser(false)}
                    >
                      <LogIn className="w-4 h-4 mr-3" /> Đăng nhập
                    </Link>

                    <div className="my-2 h-px bg-slate-200" />

                    <Link
                      href="/help"
                      className="flex items-center px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => setOpenUser(false)}
                    >
                      <LifeBuoy className="w-4 h-4 mr-3" /> Trợ giúp
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-12 md:h-[64px]" />

      {/* ===== Overlay (shared) ===== */}
      {anyPanelOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
          onClick={() => {
            setOpenNavMobile(false);
            setOpenNavDesktop(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* ===== Mobile Off-canvas (md:hidden) ===== */}
      <aside
        className={`fixed top-0 right-0 z-[60] h-dvh w-[86%] max-w-xs bg-white text-slate-800 shadow-2xl md:hidden transition-transform duration-300 ${
          openNavMobile ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng (mobile)"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="Logo" width={28} height={28} />
            <span className="font-semibold text-slate-700">NhaCong</span>
          </div>
          <button onClick={() => setOpenNavMobile(false)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Đóng">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="px-3 py-2">
          {mainMenus.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              onClick={() => setOpenNavMobile(false)}
              className="block rounded-xl px-4 py-3 text-[15px] font-medium hover:bg-emerald-50 hover:text-emerald-700"
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="mx-3 my-3 h-px bg-slate-200" />

        <div className="px-3">
          {!auth ? (
            <>
              <div className="text-xs font-semibold text-slate-500 px-1 mb-1">Tài khoản</div>
              <Link href="/dang-ky" onClick={() => setOpenNavMobile(false)} className="flex items-center rounded-xl px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700">
                <UserPlus className="w-4 h-4 mr-3" /> Đăng ký
              </Link>
              <Link href="/dang-nhap" onClick={() => setOpenNavMobile(false)} className="flex items-center rounded-xl px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700">
                <LogIn className="w-4 h-4 mr-3" /> Đăng nhập
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white grid place-items-center overflow-hidden">
                  {auth.avatarUrl && !avatarBroken ? (
                    <img
                      src={asImageSrc(auth.avatarUrl)}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarBroken(true)}
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">{auth.name || "Người dùng"}</div>
                  <div className="text-xs text-slate-500">{auth.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpenNavMobile(false);
                  handleLogout();
                }}
                className="mt-2 flex items-center rounded-xl px-4 py-3 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
              </button>
            </>
          )}

          <div className="mx-1 my-3 h-px bg-slate-200" />

          <Link href="/help" onClick={() => setOpenNavMobile(false)} className="flex items-center rounded-xl px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700">
            <LifeBuoy className="w-4 h-4 mr-3" /> Trợ giúp
          </Link>
        </div>
      </aside>

      {/* ===== Desktop Off-canvas (hidden md:flex) ===== */}
      <aside
        className={`fixed top-0 right-0 z-[60] hidden md:flex h-dvh w-[420px] bg-white text-slate-800 shadow-2xl transition-transform duration-300 ${
          openNavDesktop ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu mở rộng (desktop)"
      >
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-emerald-700">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center">
                <Image src={logo} alt="Logo" width={100} />
              </div>
            </div>
            <button onClick={() => setOpenNavDesktop(false)} className="p-2 rounded-full cursor-pointer" aria-label="Đóng">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Khối CTA đối tác */}
          <div className="p-5">
            <div className="rounded-2xl border bg-emerald-50/60 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2 bg-emerald-100">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-emerald-800">Trở thành đối tác</div>
                  <p className="text-sm text-emerald-700/80 mt-1">
                    Đăng tin nhanh, quản lý căn hộ/chỗ ở, theo dõi đơn đặt.
                  </p>
                </div>
              </div>
              <Link
                href="/hop-tac-cung-chung-toi"
                onClick={() => setOpenNavDesktop(false)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700"
              >
                Bắt đầu ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick items (2 columns) */}
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={auth ? "/phong-quan-tam" : "/dang-nhap"}
                onClick={(e) => {
                  e.preventDefault();
                  ensureAuthAnd(() => {
                    setOpenNavDesktop(false);
                    router.push("/phong-quan-tam");
                  });
                }}
                className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700"
              >
                Phòng quan tâm
              </Link>
              <Link
                href={auth ? "/phong-da-xem" : "/dang-nhap"}
                onClick={(e) => {
                  e.preventDefault();
                  ensureAuthAnd(() => {
                    setOpenNavDesktop(false);
                    router.push("/phong-da-xem");
                  });
                }}
                className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700"
              >
                Phòng đã xem
              </Link>
              <Link
                href={auth ? "/phong-quan-tam" : "/dang-nhap"}
                onClick={(e) => {
                  e.preventDefault();
                  ensureAuthAnd(() => {
                    setOpenNavDesktop(false);
                    router.push("/phong-quan-tam");
                  });
                }}
                className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700"
              >
                Phòng yêu thích
              </Link>
              {/* <Link
                href="#"
                onClick={() => setOpenNavDesktop(false)}
                className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700"
              >
                So sánh
              </Link> */}
            </div>
          </div>

          {/* Blog & Hỗ trợ */}
          <div className="px-5 mt-6 space-y-3">
            <Link
              href="/tim-phong-quanh-day"
              onClick={() => setOpenNavDesktop(false)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Map className="w-5 h-5" /> Tìm phòng quanh đây
            </Link>
            <Link
              href="/blog"
              onClick={() => setOpenNavDesktop(false)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Newspaper className="w-5 h-5" /> Blog & Cẩm nang thuê nhà
            </Link>
            <Link
              href="/tuyen-dung"
              onClick={() => setOpenNavDesktop(false)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <FileSearch className="w-5 h-5" /> Cơ hội nghề nghiệp
            </Link>
            <Link
              href="/ve-chung-toi"
              onClick={() => setOpenNavDesktop(false)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Phone className="w-5 h-5" /> Về chúng tôi
            </Link>
          </div>

          <div className="mt-auto p-5 text-xs text-slate-500">© {new Date().getFullYear()} NhaCong</div>
        </div>
      </aside>
    </>
  );
}
