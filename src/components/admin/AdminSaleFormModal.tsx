import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CalendarClock,
  Camera,
  Upload,
  AlertCircle,
  History
} from 'lucide-react';
import { api } from '../../services/api';
import type { WasteSaleRecord, WasteType } from '../../types';

interface AdminSaleFormModalProps {
  open: boolean;
  editingSale: WasteSaleRecord | null;
  defaultMonthKey?: string;
  wasteTypes: WasteType[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void> | void;
}

interface SaleFormRow {
  rowId: string;
  wasteTypeId: string;
  weight: string;
  pricePerKg: string;
}

function formatRupiah(val: number): string {
  return 'Rp' + Math.round(val || 0).toLocaleString('id-ID');
}

function toLocalDateTimeInput(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
  }
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function compressSalePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxWidth = 1200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminSaleFormModal: React.FC<AdminSaleFormModalProps> = ({
  open,
  editingSale,
  defaultMonthKey,
  wasteTypes,
  onClose,
  onSaved
}) => {
  const [sellerName, setSellerName] = useState('');
  const [sellerRt, setSellerRt] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [rows, setRows] = useState<SaleFormRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [maxDateTime, setMaxDateTime] = useState(() => toLocalDateTimeInput());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const now = new Date();
    const nowLocal = toLocalDateTimeInput(now);
    setMaxDateTime(nowLocal);
    setErrorMsg('');

    const defaultWtId = wasteTypes.find((w) => w.isActive !== false)?.id || wasteTypes[0]?.id || '';

    if (editingSale) {
      setSellerName(editingSale.sellerName);
      setSellerRt(editingSale.sellerRt);
      setSaleDate(toLocalDateTimeInput(editingSale.date));
      setNotes(editingSale.notes || '');
      setPhotoUrl(editingSale.photoUrl || '');
      setRows(
        editingSale.items.map((it, idx) => ({
          rowId: `edit-${idx}-${Date.now()}`,
          wasteTypeId: it.wasteTypeId,
          weight: String(it.weight),
          pricePerKg: String(it.pricePerKg)
        }))
      );
    } else {
      setSellerName('');
      setSellerRt('');
      setNotes('');
      setPhotoUrl('');

      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (defaultMonthKey && defaultMonthKey < currentMonthKey) {
        setSaleDate(`${defaultMonthKey}-15T10:00`);
      } else {
        setSaleDate(nowLocal);
      }

      setRows([
        {
          rowId: `new-${Date.now()}`,
          wasteTypeId: defaultWtId,
          weight: '',
          pricePerKg: ''
        }
      ]);
    }
  }, [open, editingSale, defaultMonthKey, wasteTypes]);

  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalAmount = 0;
    rows.forEach((r) => {
      const w = parseFloat(r.weight) || 0;
      const p = parseFloat(r.pricePerKg) || 0;
      if (w > 0 && p > 0) {
        totalWeight += w;
        totalAmount += Math.round(w * p);
      }
    });
    return {
      totalWeight: Number(totalWeight.toFixed(2)),
      totalAmount: Math.round(totalAmount)
    };
  }, [rows]);

  const dateStatus = useMemo(() => {
    if (!saleDate) return { isBackdate: false, isFuture: false };
    const selected = new Date(saleDate);
    if (Number.isNaN(selected.getTime())) return { isBackdate: false, isFuture: false };
    const now = new Date();
    const isFuture = selected.getTime() > now.getTime() + 60 * 1000;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const isBackdate = selected.getTime() < todayStart;
    return { isBackdate, isFuture };
  }, [saleDate]);

  if (!open) return null;

  const setPresetNow = () => {
    const nowLocal = toLocalDateTimeInput(new Date());
    setMaxDateTime(nowLocal);
    setSaleDate(nowLocal);
    setErrorMsg('');
  };

  const setPresetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(10, 0, 0, 0);
    setSaleDate(toLocalDateTimeInput(d));
    setErrorMsg('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Berkas bukti harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 10 MB.');
      return;
    }
    try {
      setErrorMsg('');
      const compressed = await compressSalePhoto(file);
      setPhotoUrl(compressed);
    } catch {
      setErrorMsg('Gagal memproses foto bukti. Silakan coba gambar lain.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sellerName.trim() || !sellerRt.trim()) {
      setErrorMsg('Nama warga dan RT / wilayah wajib diisi.');
      return;
    }

    if (!saleDate) {
      setErrorMsg('Tanggal dan waktu transaksi wajib diisi.');
      return;
    }

    const parsedDate = new Date(saleDate);
    if (Number.isNaN(parsedDate.getTime())) {
      setErrorMsg('Format tanggal dan waktu tidak valid.');
      return;
    }

    // Admin can backdate or use now, but cannot pick future dates
    if (parsedDate.getTime() > Date.now() + 2 * 60 * 1000) {
      setErrorMsg('Tanggal dan waktu transaksi tidak boleh melebihi waktu saat ini.');
      return;
    }

    const itemsPayload: Array<{ wasteTypeId: string; weight: number; pricePerKg: number }> = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const w = parseFloat(r.weight);
      const p = parseFloat(r.pricePerKg);
      if (!r.wasteTypeId || !Number.isFinite(w) || w <= 0 || !Number.isFinite(p) || p <= 0) {
        setErrorMsg(`Lengkapi jenis sampah, berat (> 0), dan harga aktual (> 0) pada baris #${i + 1}.`);
        return;
      }
      itemsPayload.push({
        wasteTypeId: r.wasteTypeId,
        weight: Number(w.toFixed(2)),
        pricePerKg: Math.round(p)
      });
    }

    setSaving(true);
    try {
      const isoDate = parsedDate.toISOString();
      if (editingSale) {
        await api.updateAdminSale(editingSale.id, {
          sellerName: sellerName.trim(),
          sellerRt: sellerRt.trim(),
          date: isoDate,
          items: itemsPayload,
          photoUrl: photoUrl.trim(),
          notes: notes.trim()
        });
        await onSaved(`Data transaksi ${editingSale.id} berhasil diperbarui.`);
      } else {
        const res = await api.createAdminSale({
          sellerName: sellerName.trim(),
          sellerRt: sellerRt.trim(),
          date: isoDate,
          items: itemsPayload,
          photoUrl: photoUrl.trim() || undefined,
          notes: notes.trim()
        });
        await onSaved(`Data transaksi baru ${res.sale.id} berhasil ditambahkan.`);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan data penjualan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Formulir Khusus Admin · Mendukung Tanggal Sekarang & Lampau</span>
            </div>
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white mt-0.5">
              {editingSale ? `Sunting Data Penjualan (${editingSale.id})` : 'Catat Penjualan Sampah (Admin)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Tutup formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Seller Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Nama Warga Penjual *
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Contoh: Ibu Siti Aminah"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                RT / Wilayah *
              </label>
              <input
                type="text"
                required
                value={sellerRt}
                onChange={(e) => setSellerRt(e.target.value)}
                placeholder="Contoh: RT 003"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Admin Backdate-Capable Date & Time Section */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Tanggal & Waktu Transaksi *
                </label>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Admin dapat memilih tanggal hari ini maupun tanggal lampau. Tanggal masa depan diblokir otomatis.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={setPresetNow}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  Sekarang
                </button>
                <button
                  type="button"
                  onClick={setPresetYesterday}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 transition-colors"
                >
                  Kemarin
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="datetime-local"
                required
                max={maxDateTime}
                value={saleDate}
                onChange={(e) => {
                  setSaleDate(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full sm:max-w-xs px-3 py-2 text-xs font-mono tabular-nums rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {dateStatus.isFuture ? (
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Melebihi waktu saat ini (tidak diizinkan)</span>
                </span>
              ) : dateStatus.isBackdate ? (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 shrink-0" />
                  <span>Mode tanggal lampau · pencatatan susulan / koreksi</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Waste Items Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Rincian Jenis Sampah & Harga Aktual *
              </span>
              <button
                type="button"
                onClick={() => {
                  const defaultWtId = wasteTypes.find((w) => w.isActive !== false)?.id || wasteTypes[0]?.id || '';
                  setRows((prev) => [
                    ...prev,
                    { rowId: `r-${Date.now()}-${Math.random()}`, wasteTypeId: defaultWtId, weight: '', pricePerKg: '' }
                  ]);
                }}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Baris</span>
              </button>
            </div>

            {rows.map((row, idx) => {
              const wt = wasteTypes.find((w) => w.id === row.wasteTypeId);
              const wNum = parseFloat(row.weight) || 0;
              const pNum = parseFloat(row.pricePerKg) || 0;
              const sub = Math.round(wNum * pNum);
              return (
                <div
                  key={row.rowId}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="sm:col-span-4 space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500">
                      Jenis Sampah #{idx + 1}
                    </label>
                    <select
                      value={row.wasteTypeId}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.rowId === row.rowId ? { ...item, wasteTypeId: e.target.value } : item
                          )
                        )
                      }
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    >
                      {wasteTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500">
                      Berat ({wt?.unit || 'kg'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={row.weight}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.rowId === row.rowId ? { ...item, weight: e.target.value } : item
                          )
                        )
                      }
                      className="w-full px-2.5 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500">
                      Harga / {wt?.unit || 'kg'} (Rp)
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="1"
                      required
                      value={row.pricePerKg}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.rowId === row.rowId ? { ...item, pricePerKg: e.target.value } : item
                          )
                        )
                      }
                      className="w-full px-2.5 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-500">Subtotal</label>
                    <div className="px-2.5 py-2 text-xs font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 truncate">
                      {formatRupiah(sub)}
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      disabled={rows.length === 1}
                      onClick={() =>
                        setRows((prev) =>
                          prev.length > 1 ? prev.filter((item) => item.rowId !== row.rowId) : prev
                        )
                      }
                      className="p-2 rounded-lg text-neutral-500 hover:text-red-600 disabled:opacity-30"
                      aria-label="Hapus baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Live Calculation Summary Bar */}
            <div className="px-4 py-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                Total Akumulasi ({rows.length} baris)
              </span>
              <div className="flex items-center gap-5 font-mono tabular-nums">
                <span className="text-neutral-700 dark:text-neutral-300">
                  Berat: <strong className="text-neutral-900 dark:text-white">{totals.totalWeight} kg</strong>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                  {formatRupiah(totals.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Photo Evidence Upload / Replace / Remove */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Foto Bukti Timbangan / Nota (Opsional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {photoUrl ? (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={photoUrl}
                  alt="Pratinjau foto bukti penjualan"
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-28 h-24 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-900"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Foto bukti terpasang dan akan tersimpan pada transaksi ini.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/30 hover:border-emerald-500 dark:hover:border-emerald-500 text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Unggah Foto Bukti Timbangan / Nota (JPG, PNG, WEBP)</span>
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Catatan Tambahan
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rekap susulan dari buku catatan timbangan minggu lalu..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || dateStatus.isFuture}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : editingSale ? 'Simpan Perubahan' : 'Simpan Data Penjualan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
