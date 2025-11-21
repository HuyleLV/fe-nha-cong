"use client";

import React, { useEffect, useState } from "react";
import Panel from "../../components/Panel";
import AdminTable from "@/components/AdminTable";
import Modal from "@/components/Modal";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";

type Item = { id: string; name: string };
const STORAGE_KEY = "nhacong:dich_vu";

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "delete">("add");

  useEffect(() => { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { try { setItems(JSON.parse(raw)); } catch { setItems([]); } } }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {} }, [items]);

  const startEdit = (it: Item) => { setEditingId(it.id); setName(it.name); setModalMode("edit"); setModalOpen(true); };
  const startDelete = (it: Item) => { setEditingId(it.id); setName(it.name); setModalMode("delete"); setModalOpen(true); };
  const resetForm = () => { setEditingId(null); setName(""); };
  const save = () => { if (!name.trim()) return alert("Nhập tên dịch vụ"); if (editingId) setItems(cur => cur.map(i => i.id === editingId ? { ...i, name: name.trim() } : i)); else setItems(cur => [{ id: String(Date.now()), name: name.trim() }, ...cur]); resetForm(); setModalOpen(false); };
  const remove = (id?: string) => { if (!id) return; setItems(cur => cur.filter(i => i.id !== id)); setModalOpen(false); };

  return (
    <div className="p-6">
      <Panel title="Quản lý Dịch vụ" actions={(
        <button onClick={() => { resetForm(); setModalMode("add"); setModalOpen(true); }} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-md" title="Thêm dịch vụ"><PlusCircle className="w-5 h-5"/></button>
      )}>

        <AdminTable headers={["#","Tên dịch vụ","Hành động"]}>
          {items.length === 0 ? null : items.map((it, idx) => (
            <tr key={it.id} className="border-b">
              <td className="py-3 text-sm text-slate-700">{items.length - idx}</td>
              <td className="py-3 text-sm text-slate-700">{it.name}</td>
              <td className="py-3 text-sm text-slate-700 text-center">
                <div className="inline-flex items-center gap-2">
                  <button onClick={() => startEdit(it)} className="inline-flex items-center justify-center p-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700" title="Sửa"><Edit3 className="w-4 h-4"/></button>
                  <button onClick={() => startDelete(it)} className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 text-white hover:bg-red-700" title="Xóa"><Trash2 className="w-4 h-4"/></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>

        <Modal open={modalOpen} title={modalMode === "add" ? "Thêm dịch vụ" : modalMode === "edit" ? "Sửa dịch vụ" : "Xóa dịch vụ"} onClose={() => setModalOpen(false)} footer={modalMode === "delete" ? (
          <div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className="border px-3 py-2 rounded-md">Hủy</button><button onClick={() => remove(editingId ?? undefined)} className="bg-red-600 text-white px-4 py-2 rounded-md">Xóa</button></div>
        ) : (
          <div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className="border px-3 py-2 rounded-md">Hủy</button><button onClick={save} className="bg-emerald-600 text-white px-4 py-2 rounded-md">Lưu</button></div>
        )}>
          {modalMode === "delete" ? (<div>Bạn có chắc muốn xóa dịch vụ "{name}" không?</div>) : (
            <div className="space-y-3"><input value={name} onChange={e => setName(e.target.value)} placeholder="Tên dịch vụ" className="w-full rounded-md border px-3 py-2"/></div>
          )}
        </Modal>
      </Panel>
    </div>
  );
}
