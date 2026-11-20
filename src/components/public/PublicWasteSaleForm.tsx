import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Trash2,
  Camera,
  CheckCircle2,
  Printer,
  RotateCcw,
  Send,
  AlertCircle,
  FileText,
  X,
  Upload
} from 'lucide-react';
import { api } from '../../services/api';
import type { WasteType, WasteSaleRecord } from '../../types';

interface PublicWasteSaleFormProps {
  wasteTypes: WasteType[];
  onSaleSuccess?: (sale: WasteSaleRecord) => void;
}

interface SaleRowInput {
  rowId: string;
  wasteTypeId: string;
  weight: string;
  pricePerKg: string;
}

function getLocalDateTimeValue(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

function createEmptyRow(defaultWasteTypeId: string): SaleRowInput {
  return {
    rowId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    wasteTypeId: defaultWasteTypeId,
    weight: '',
    pricePerKg: ''
  };
}

function formatRupiah(value: number): string {
  return 'Rp' + Math.round(value || 0).toLocaleString('id-ID');
}

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
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
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export const PublicWasteSaleForm: React.FC<PublicWasteSaleFormProps> = ({
  wasteTypes,
  onSaleSuccess
}) => {
  const activeWasteTypes = useMemo(
    () => wasteTypes.filter((w) => w.isActive !== false),
    [wasteTypes]
  );

  const defaultWasteId = activeWasteTypes[0]?.id || '';

  const [sellerName, setSellerName] = useState('');
  const [sellerRt, setSellerRt] = useState('');
  const [saleDate, setSaleDate] = useState(getLocalDateTimeValue());
  const [rows, setRows] = useState<SaleRowInput[]>(() => [createEmptyRow('')]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSale, setSubmittedSale] = useState<WasteSaleRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync first empty row's wasteTypeId once wasteTypes finishes loading
  React.useEffect(() => {
    if (defaultWasteId) {
      setRows((prev) =>
        prev.map((row) => (row.wasteTypeId ? row : { ...row, wasteTypeId: defaultWasteId }))
      );
    }
  }, [defaultWasteId]);

  const wasteTypeMap = useMemo(() => {
    const map = new Map<string, WasteType>();
    activeWasteTypes.forEach((wt) => map.set(wt.id, wt));
    return map;
  }, [activeWasteTypes]);

  const computedRows = useMemo(() => {
    return rows.map((row) => {
      const wt = wasteTypeMap.get(row.wasteTypeId);
      const weightNum = parseFloat(row.weight);
      const priceNum = parseFloat(row.pricePerKg);
      const validWeight = Number.isFinite(weightNum) && weightNum > 0 ? weightNum : 0;
      const validPrice = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0;
      const subtotal = Math.round(validWeight * validPrice);
      return {
        ...row,
        wasteType: wt,
        unit: wt?.unit || 'kg',
        validWeight,
        validPrice,
        subtotal
      };
    });
  }, [rows, wasteTypeMap]);

  const totals = useMemo(() => {
    const totalWeight = computedRows.reduce((sum, r) => sum + r.validWeight, 0);
    const totalAmount = computedRows.reduce((sum, r) => sum + r.subtotal, 0);
    const filledCount = computedRows.filter(
      (r) => r.wasteTypeId && r.validWeight > 0 && r.validPrice > 0
    ).length;
    return {
      totalWeight: Number(totalWeight.toFixed(2)),
      totalAmount: Math.round(totalAmount),
      filledCount
    };
  }, [computedRows]);

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow(defaultWasteId)]);
  };

  const handleRemoveRow = (rowId: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.rowId !== rowId) : prev));
  };

  const handleUpdateRow = (rowId: string, field: keyof Omit<SaleRowInput, 'rowId'>, value: string) => {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, [field]: value } : r)));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File bukti harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 10 MB.');
      return;
    }
    try {
      setErrorMsg('');
      const compressed = await compressImageToDataUrl(file);
      setPhotoUrl(compressed);
      setPhotoName(file.name);
    } catch {
      setErrorMsg('Gagal memproses foto bukti. Silakan coba gambar lain.');
    }
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
    setPhotoName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetForm = () => {
    setSellerName('');
    setSellerRt('');
    setSaleDate(getLocalDateTimeValue());
    setRows([createEmptyRow(defaultWasteId)]);
    handleClearPhoto();
    setNotes('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sellerName.trim()) {
      setErrorMsg('Nama lengkap warga wajib diisi.');
      return;
    }
    if (!sellerRt.trim()) {
      setErrorMsg('Nomor RT / wilayah wajib diisi (contoh: RT 003).');
      return;
    }

    const preparedItems: Array<{ wasteTypeId: string; weight: number; pricePerKg: number }> = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const w = parseFloat(r.weight);
      const p = parseFloat(r.pricePerKg);
      if (!r.wasteTypeId) {
        setErrorMsg(`Pilih jenis sampah pada baris #${i + 1}.`);
        return;
      }
      if (!Number.isFinite(w) || w <= 0) {
        setErrorMsg(`Masukkan berat timbangan yang valid pada baris #${i + 1}.`);
        return;
      }
      if (!Number.isFinite(p) || p <= 0) {
        setErrorMsg(`Masukkan harga aktual per satuan (Rp) pada baris #${i + 1}.`);
        return;
      }
      preparedItems.push({
        wasteTypeId: r.wasteTypeId,
        weight: Number(w.toFixed(2)),
        pricePerKg: Math.round(p)
      });
    }

    setSubmitting(true);
    try {
      const isoDate = saleDate ? new Date(saleDate).toISOString() : new Date().toISOString();
      const res = await api.submitPublicSale({
        sellerName: sellerName.trim(),
        sellerRt: sellerRt.trim(),
        date: isoDate,
        items: preparedItems,
        photoUrl: photoUrl || undefined,
        notes: notes.trim() || undefined
      });
      setSubmittedSale(res.sale);
      onSaleSuccess?.(res.sale);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan catatan penjualan sampah. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation Receipt Card after successful submission
  if (submittedSale) {
    const formattedDate = new Date(submittedSale.date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-emerald-200 dark:border-emerald-800/70 shadow-sm overflow-hidden">
          <div className="bg-emerald-700 text-white px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Bukti Pencatatan Penjualan Tersimpan
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-0.5">
                  Terima Kasih, {submittedSale.sellerName}
                </h2>
                <p className="text-xs text-emerald-100 mt-1">
                  Catatan penjualan sampah Anda telah masuk ke data pencatatan Bank Sampah Persatuan.
                </p>
              </div>
            </div>
            <div className="bg-emerald-900/50 border border-emerald-400/30 rounded-xl px-4 py-2.5 text-left sm:text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-emerald-200 font-semibold">
                Kode Bukti
              </p>
              <p className="text-lg font-mono font-black tracking-tight tabular-nums">
                {submittedSale.id}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium">Nama Warga Penjual</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {submittedSale.sellerName}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium">RT / Wilayah</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {submittedSale.sellerRt}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium">Tanggal & Waktu</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                  {formattedDate} WIB
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <th className="py-3 px-4 font-bold">Jenis Sampah</th>
                    <th className="py-3 px-4 font-bold text-right">Berat</th>
                    <th className="py-3 px-4 font-bold text-right">Harga / Satuan</th>
                    <th className="py-3 px-4 font-bold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {submittedSale.items.map((item, idx) => (
                    <tr key={idx} className="bg-white dark:bg-neutral-900">
                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900 dark:text-white">{item.wasteTypeName}</p>
                        {item.category && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{item.category}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-200">
                        {item.weight} {item.unit || 'kg'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-200">
                        {formatRupiah(item.pricePerKg)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                        {formatRupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50/70 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-800">
                    <td className="py-3.5 px-4 font-extrabold text-neutral-900 dark:text-white">
                      Total Penjualan
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-extrabold text-neutral-900 dark:text-white">
                      {submittedSale.totalWeight.toLocaleString('id-ID')} kg
                    </td>
                    <td className="py-3.5 px-4"></td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-base font-black text-emerald-700 dark:text-emerald-400">
                      {formatRupiah(submittedSale.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Optional Photo & Notes */}
            {(submittedSale.photoUrl || submittedSale.notes) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {submittedSale.photoUrl && (
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                    <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Foto Bukti Penjualan
                    </p>
                    <img
                      src={submittedSale.photoUrl}
                      alt="Bukti penjualan sampah"
                      className="w-full max-h-48 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700"
                    />
                  </div>
                )}
                {submittedSale.notes && (
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                    <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Catatan Tambahan
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {submittedSale.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan Bukti</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedSale(null);
                  handleResetForm();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Penjualan Baru</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-5">
      {/* Form Title Header Card (Google Form Accent Strip Style) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 border-t-8 border-t-emerald-600 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <FileText className="w-4 h-4" />
            <span>BUKTI PENCATATAN PENJUALAN SAMPAH</span>
          </div>
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            Tanpa Perlu Buat Akun · Harga Fluktuatif Ditulis Langsung
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Formulir Penjualan Sampah Warga
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Isi formulir ini sebagai bukti pencatatan sampah yang telah Anda jual ke Bank Sampah Persatuan. Karena harga jual sampah bersifat fluktuatif mengikuti harga pasar pengepul, silakan tulis langsung harga per kilogram/satuan pada kolom harga yang tersedia.
        </p>
        <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
          * Menunjukkan kolom wajib diisi
        </p>
      </div>

      {/* In-app Validation / Server Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-3 text-xs sm:text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-200"
            aria-label="Tutup pesan error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Identitas Warga Penjual */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
            1. Identitas Warga Penjual <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Ketik nama lengkap dan nomor RT/wilayah asal warga yang menjual sampah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="sellerName"
              className="block text-xs font-bold text-neutral-700 dark:text-neutral-300"
            >
              Nama Lengkap Warga <span className="text-red-500">*</span>
            </label>
            <input
              id="sellerName"
              type="text"
              required
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="Contoh: Ibu Siti Aminah"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sellerRt"
              className="block text-xs font-bold text-neutral-700 dark:text-neutral-300"
            >
              RT / Wilayah <span className="text-red-500">*</span>
            </label>
            <input
              id="sellerRt"
              type="text"
              required
              value={sellerRt}
              onChange={(e) => setSellerRt(e.target.value)}
              placeholder="Contoh: RT 003 / RW 08"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Tanggal & Waktu Penjualan */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
            2. Tanggal & Waktu Penjualan <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Sesuaikan tanggal dan jam saat penyerahan/penimbangan sampah dilakukan.
          </p>
        </div>

        <div className="max-w-xs">
          <input
            type="datetime-local"
            required
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Section 3: Rincian Jenis Sampah, Timbangan & Harga Aktual (Separate Price Column) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              3. Rincian Jenis Sampah, Timbangan & Harga Aktual <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Pilih jenis sampah terpilah, masukkan bobot timbangan, dan tulis langsung harga aktual per satuan (Rp).
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddRow}
            className="px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 w-fit shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris</span>
          </button>
        </div>

        {/* Item Rows */}
        <div className="space-y-3">
          {computedRows.map((row, idx) => (
            <div
              key={row.rowId}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* Jenis Sampah Dropdown (NO price in label) */}
                <div className="md:col-span-4 space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                    Jenis Sampah #{idx + 1}
                  </label>
                  <select
                    required
                    value={row.wasteTypeId}
                    onChange={(e) => handleUpdateRow(row.rowId, 'wasteTypeId', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {activeWasteTypes.length === 0 && (
                      <option value="">Memuat daftar jenis sampah...</option>
                    )}
                    {activeWasteTypes.map((wt) => (
                      <option key={wt.id} value={wt.id}>
                        {wt.name} ({wt.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Berat */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                    Berat ({row.unit})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={row.weight}
                      onChange={(e) => handleUpdateRow(row.rowId, 'weight', e.target.value)}
                      placeholder="0"
                      className="w-full pl-3 pr-10 py-2.5 text-sm font-mono tabular-nums rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 pointer-events-none">
                      {row.unit}
                    </span>
                  </div>
                </div>

                {/* Harga / Satuan (Separate Fluctuative Price Column) */}
                <div className="md:col-span-3 space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                    Harga / {row.unit} (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 pointer-events-none">
                      Rp
                    </span>
                    <input
                      type="number"
                      step="50"
                      min="1"
                      required
                      value={row.pricePerKg}
                      onChange={(e) => handleUpdateRow(row.rowId, 'pricePerKg', e.target.value)}
                      placeholder="Tulis harga"
                      className="w-full pl-9 pr-3 py-2.5 text-sm font-mono tabular-nums rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Kalkulasi Subtotal */}
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                    Kalkulasi Subtotal
                  </label>
                  <div className="w-full px-3 py-2.5 text-sm font-mono tabular-nums font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 truncate">
                    {formatRupiah(row.subtotal)}
                  </div>
                </div>

                {/* Remove Row Button */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.rowId)}
                    disabled={rows.length === 1}
                    title={rows.length === 1 ? 'Minimal 1 baris jenis sampah' : 'Hapus baris ini'}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      rows.length === 1
                        ? 'border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Akumulasi Hasil Timbangan Strip */}
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Akumulasi Hasil Timbangan:
            </p>
            <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-0.5">
              {totals.filledCount} Macam Kategori Sampah Terinput
            </p>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                TOTAL BERAT
              </p>
              <p className="text-lg sm:text-xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
                {totals.totalWeight.toLocaleString('id-ID')} kg
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                TOTAL NILAI PENJUALAN
              </p>
              <p className="text-lg sm:text-xl font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatRupiah(totals.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Foto Bukti Penjualan (Opsional) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
            4. Foto Bukti Penjualan / Timbangan (Opsional)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Unggah foto sampah yang ditimbang atau nota fisik bila ada sebagai dokumentasi pendukung.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {!photoUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 px-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-neutral-50/50 dark:bg-neutral-800/30 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors flex flex-col items-center justify-center gap-2 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Klik untuk pilih atau ambil foto bukti
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Format JPG, PNG, WEBP · Maksimal 10 MB
              </p>
            </div>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <img
              src={photoUrl}
              alt="Preview bukti penjualan"
              className="w-full sm:w-36 h-28 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{photoName || 'Foto bukti terpilih'}</span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Foto siap dilampirkan saat formulir dikirim.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Ganti Foto
                </button>
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  Hapus Foto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 5: Catatan Tambahan */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
            5. Catatan Tambahan (Opsional)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Tambahkan keterangan bila diperlukan (misalnya diterima oleh pengurus, kondisi sampah, atau catatan pembayaran).
          </p>
        </div>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tulis catatan tambahan di sini..."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Submit Bar */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleResetForm}
          disabled={submitting}
          className="px-5 py-3 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Kosongkan Formulir</span>
        </button>

        <button
          type="submit"
          disabled={submitting || activeWasteTypes.length === 0}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menyimpan Bukti Penjualan...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Kirim & Simpan Bukti Penjualan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
