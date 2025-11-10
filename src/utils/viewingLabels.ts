import type { Viewing } from "@/services/viewingService";

/** Detect if a viewing is a deposit request based on note prefix */
export function isDepositViewing(v: { note?: string | null }): boolean {
  return !!(v.note ?? "").includes("[DEPOSIT]");
}

/** Vietnamese label for the type of viewing (deposit vs normal viewing) */
export function viewingTypeLabel(v: Viewing): string {
  return isDepositViewing(v) ? "Lịch đặt cọc" : "Lịch xem phòng";
}

/** Vietnamese status label, with special case for deposit pending */
export function viewingStatusLabel(v: Viewing): string {
  if (isDepositViewing(v) && v.status === "pending") return "Chờ đặt cọc";
  switch (v.status) {
    case "pending":
      return "Đang chờ";
    case "confirmed":
      return "Đã xác nhận";
    case "cancelled":
      return "Đã huỷ";
    case "visited":
      return "Đã xem";
    default:
      return String(v.status);
  }
}

/** Clean user-friendly note: translate deposit prefix */
export function viewingDisplayNote(v: Viewing): string | undefined {
  if (!v.note) return undefined;
  if (isDepositViewing(v)) {
    return "Đặt cọc: " + v.note.replace("[DEPOSIT]", "").trim();
  }
  return v.note;
}
