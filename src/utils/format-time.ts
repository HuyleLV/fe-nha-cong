import type { Dayjs } from "dayjs";

import dayjs from "dayjs";
import "dayjs/locale/vi";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

// ----------------------------------------------------------------------

dayjs.extend(duration);
dayjs.extend(relativeTime);

// ----------------------------------------------------------------------

export type DatePickerFormat =
  | Dayjs
  | Date
  | string
  | number
  | null
  | undefined;

/**
 * Docs: https://day.js.org/docs/en/display/format
 */
export const formatStr = {
  dateTime: "DD MMM YYYY h:mm a", // 17 Apr 2022 12:00 am
  date: "DD MMM YYYY", // 17 Apr 2022
  time: "h:mm a", // 12:00 am
  split: {
    dateTime: "DD/MM/YYYY h:mm a", // 17/04/2022 12:00 am
    date: "DD/MM/YYYY", // 17/04/2022
  },
  paramCase: {
    dateTime: "DD-MM-YYYY h:mm a", // 17-04-2022 12:00 am
    date: "DD-MM-YYYY", // 17-04-2022
  },
};

export function today(format?: string) {
  return dayjs(new Date()).startOf("day").format(format);
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022 12:00 am
 */
export function fDateTime(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid
    ? dayjs(date).locale("vi").format(format ?? formatStr.dateTime)
    : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 17 Apr 2022
 */
export function fDate(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid
    ? dayjs(date).format(format ?? formatStr.date)
    : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 12:00 am
 */
export function fTime(date: DatePickerFormat, format?: string) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid
    ? dayjs(date).format(format ?? formatStr.time)
    : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: 1713250100
 */
export function fTimestamp(date: DatePickerFormat) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).valueOf() : "Invalid time value";
}

// ----------------------------------------------------------------------

/** output: a few seconds, 2 years
 */
export function fToNow(date: DatePickerFormat) {
  if (!date) {
    return null;
  }

  const isValid = dayjs(date).isValid();

  return isValid ? dayjs(date).toNow(true) : "Invalid time value";
}
// ----------------------------------------------------------------------

/** output: 24 hours 30 minutes (if < 24 hours) or 2 days 5 hours (if >= 24 hours)
 * Properly handles pluralization and allows custom separator
 * Only shows days when >= 24 hours to avoid "1 day" for short periods
 */
export function countdownTo(date: DatePickerFormat, separator: string = " ") {
  if (!date) return "No date provided";

  const targetDate = dayjs(date);
  if (!targetDate.isValid()) return "Invalid date value";

  const now = dayjs();
  const difference = targetDate.diff(now);
  const duration = dayjs.duration(Math.abs(difference));

  const totalHours = Math.floor(duration.asHours());
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = duration.minutes();

  // Helper function for proper pluralization
  const pluralize = (count: number, singular: string, plural?: string) => {
    const pluralForm = plural || `${singular}s`;
    return `${count} ${count === 1 ? singular : pluralForm}`;
  };

  let result = "";

  // Only show days if we have 24+ hours (full days)
  if (days > 0) {
    result += pluralize(days, "day");
    if (hours > 0) {
      result += `${separator}${pluralize(hours, "hour")}`;
    }
  } else {
    // For less than 24 hours, show hours & minutes
    if (totalHours > 0) {
      result += pluralize(totalHours, "hour");
    }
    if (minutes > 0) {
      if (result) result += separator;
      result += pluralize(minutes, "minute");
    }
  }

  // Handle edge case where everything is 0
  result = result || "0 minutes";

  return difference >= 0 ? result : `${result} ago`;
}

//output: YYYY-MM-DD HH:mm:ss
export function formatDateTime(date?: string | number | Date): string {
  if (!date) return ""; // hoặc trả về "N/A"
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


