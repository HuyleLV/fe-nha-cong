"use client";

import React, { useEffect, useState } from "react";
import { commentService } from "@/services/commentService";
import { userService } from "@/services/userService";
import { toast } from "react-toastify";

function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const getCookie = (name: string) => {
    try {
      const v = `; ${document.cookie}`;
      const parts = v.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    } catch {}
    return null;
  };
  const cookieToken = getCookie("access_token");
  const local = window.localStorage.getItem("access_token") || window.localStorage.getItem("tokenUser") || window.localStorage.getItem("tokenAdmin");
  const session = window.sessionStorage.getItem("access_token");
  return !!(cookieToken || local || session);
}

export default function CommentForm({ targetType, targetId }: { targetType: string; targetId: string | number }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState<boolean | null>(null);
  const [me, setMe] = useState<any | null>(null);

  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    // Only run client-side after mount
    setMounted(true);
    if (!mounted) return () => { mounted = false; };

    (async () => {
      try {
        const logged = isLoggedIn();
        setLoggedIn(logged);
        if (!logged) {
          setPhoneVerified(false);
          setLoadingUser(false);
          return;
        }

        setLoadingUser(true);
        const me = await userService.getMe();
        if (!mounted) return;
        setPhoneVerified(!!me?.phoneVerified);
        setMe(me ?? null);
      } catch (e) {
        // Silent on errors — treat as not verified
        if (!mounted) return;
        setPhoneVerified(false);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();
    return () => { mounted = false; };
  }, [loggedIn]);

  const handleSubmit = async () => {
    if (!content || submitting) return;
    try {
      setSubmitting(true);
      await commentService.create({ targetType, targetId, content });
      setContent("");
      // notify other components to refresh
      try { window.dispatchEvent(new CustomEvent('comments:changed')); } catch {}
      toast.success("Đã gửi bình luận");
    } catch (e: any) {
      // Be gentle: if 401/403 just show message to user, do not log errors
      if (e?.response?.status === 401) {
        toast.info("Vui lòng đăng nhập để bình luận");
        return;
      }
      if (e?.response?.status === 403) {
        toast.info("Bạn cần xác thực số điện thoại để bình luận");
        return;
      }
      toast.error(e?.message || "Không thể gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  // Avoid rendering on server and before hydration to prevent mismatch
  if (!mounted) return null;

  // If still loading user, render nothing (so we don't flash the message)
  if (loadingUser) return null;

  // If user not logged in -> show action to login / info (no API calls were made)
  if (!loggedIn) return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-emerald-900">
      <div>Bạn cần đăng nhập và xác thực số điện thoại để bình luận.</div>
      <div className="mt-2 flex gap-2">
        <a href="/dang-nhap" className="inline-block rounded-md bg-white px-3 py-1 text-emerald-700 shadow-sm">Đăng nhập</a>
        <a href="/dang-ky" className="inline-block rounded-md border border-emerald-200 px-3 py-1 text-emerald-700">Đăng ký</a>
      </div>
    </div>
  );

  // If user logged in but not verified, show a nicer CTA to verify
  if (!phoneVerified) return (
    <div className="rounded-lg border border-rose-100 bg-rose-50/30 p-3 text-sm text-rose-700">
      <div>Bạn đã đăng nhập nhưng chưa xác thực số điện thoại — cần xác thực để bình luận.</div>
      <div className="mt-2">
        <a href="/tai-khoan-cua-toi" className="inline-block rounded-md bg-rose-600 px-3 py-1 text-white">Xác thực ngay</a>
      </div>
    </div>
  );

  // Main form for verified users
  const charLimit = 1000;
  const remaining = charLimit - content.length;

  return (
    <div className="rounded-lg border border-emerald-100 bg-white p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-emerald-50">
          {me?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatarUrl} alt={me.name || 'avatar'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-emerald-700">{(me?.name || 'U').split(' ').map((s: string) => s[0]).slice(0,2).join('').toUpperCase()}</div>
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
            rows={4}
            placeholder="Viết bình luận..."
            className="w-full resize-none rounded-md border border-emerald-100 px-3 py-2 text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-700/80">
            <div>{remaining} ký tự còn lại</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setContent("")} className="rounded-md border border-emerald-200 px-3 py-1 text-emerald-800 hover:bg-emerald-50">Huỷ</button>
              <button
                disabled={!content || submitting}
                onClick={handleSubmit}
                className="rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-1 text-white disabled:opacity-60"
              >{submitting ? 'Đang gửi...' : 'Gửi bình luận'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
