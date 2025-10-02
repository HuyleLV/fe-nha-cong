// components/SearchBar.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import clsx from "clsx";

type Props = {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  onSearch?: (q: string) => void;      // ✅ thêm
  onOpenLocation?: () => void;         // ✅ thêm
};

export default function SearchBar({
  placeholder = "Tìm nhà, phòng trọ, căn hộ dịch vụ…",
  defaultValue = "",
  className,
  onSearch,
  onOpenLocation,
}: Props) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    if (onSearch) onSearch(value);      // ✅ gọi nếu có
    else router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className={clsx("w-full", className)}>
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600">
          <Search className="h-5 w-5 text-white" />
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => onOpenLocation?.()}   // ✅ optional chaining
          className="hidden xs:inline-flex items-center rounded-full border border-emerald-600 text-emerald-700 px-4 py-2 text-sm font-medium hover:bg-emerald-50"
        >
          Chọn khu vực
        </button>
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-semibold hover:bg-emerald-700"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
