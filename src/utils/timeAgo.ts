export function timeAgo(date: string | number | Date | any): string {
  const targetMs = new Date(date).getTime();
  if (!Number.isFinite(targetMs)) return "";

  // Use current time in ms (do not add manual timezone offset)
  const nowMs = Date.now();

  let diffSec = Math.floor((nowMs - targetMs) / 1000); // >0: quá khứ, <0: tương lai

  if (Math.abs(diffSec) < 1) return "vừa xong";

  const intervals = [
    { label: "năm", seconds: 31536000 },
    { label: "tháng", seconds: 2592000 },
    { label: "ngày", seconds: 86400 },
    { label: "giờ", seconds: 3600 },
    { label: "phút", seconds: 60 },
    { label: "giây", seconds: 1 },
  ];

  diffSec = Math.abs(diffSec);

  for (const it of intervals) {
    const count = Math.floor(diffSec / it.seconds);
    if (count >= 1) {
      return `${count} ${it.label} trước`;
    }
  }
  return "vừa xong";
}
