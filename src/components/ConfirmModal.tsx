"use client";

import React from "react";
import Modal from "./Modal";

export default function ConfirmModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
}: {
  open: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <Modal open={open} title={title ?? "Xác nhận"} onClose={onCancel} maxWidthClass="max-w-md">
      <div className="text-sm text-slate-700 mb-4">{message}</div>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">{cancelLabel}</button>
        <button onClick={onConfirm} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">{confirmLabel}</button>
      </div>
    </Modal>
  );
}
