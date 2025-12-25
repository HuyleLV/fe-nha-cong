export const SERVICE_REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  done: 'Hoàn thành',
  cancelled: 'Hủy',
};

export function serviceRequestStatusLabel(status?: string | null) {
  if (!status) return '-';
  return SERVICE_REQUEST_STATUS_LABELS[status] ?? status;
}
