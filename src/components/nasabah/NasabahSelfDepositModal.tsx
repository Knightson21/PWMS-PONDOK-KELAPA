import React, { useState, useMemo } from 'react';
import type { User, WasteType, DepositTransaction } from '../../types';
import { api } from '../../services/api';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Scale, 
  Clock, 
  ShieldAlert, 
  Image as ImageIcon 
} from 'lucide-react';

interface NasabahSelfDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  wasteTypes: WasteType[];
  onSuccess: (newDep: DepositTransaction) => void;
}

export const NasabahSelfDepositModal: React.FC<NasabahSelfDepositModalProps> = ({
  isOpen,
  onClose,
  user,
  wasteTypes,
  onSuccess
}) => {
  const [items, setItems] = useState<Array<{ wasteTypeId: string; weight: number | string }>>([
    { wasteTypeId: wasteTypes[0]?.id || '', weight: 1 }
  ]);
  const [photoUrl, setPhotoUrl] = useState<string>('/assets/images/waste_sorting_guide.jpg');
  const [photoName, setPhotoName] = useState<string>('waste_sorting_guide.jpg');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItemRow = () => {
    if (wasteTypes.length > 0) {
      setItems(prev => [...prev, { wasteTypeId: wasteTypes[0].id, weight: 1 }]);
    }
  };

  const removeItemRow = (idx: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx: number, field: 'wasteTypeId' | 'weight', val: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const calculatedRows = useMemo(() => {
    return items.map(it => {
      const wt = wasteTypes.find(w => w.id === it.wasteTypeId);
      const price = wt ? wt.pricePerKg : 0;
      const weight = Number(it.weight) || 0;
      return {
        wt,
        weight,
        price,
        subtotal: Math.round(weight * price)
      };
    });
  }, [items, wasteTypes]);

  const totalWeight = calculatedRows.reduce((acc, r) => acc + r.weight, 0);
  const totalAmount = calculatedRows.reduce((acc, r) => acc + r.subtotal, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.some(i => !i.weight || Number(i.weight) <= 0)) {
      setError('Masukkan bobot estimasi lebih dari 0 kg untuk setiap sampah');
      return;
    }

    if (!photoUrl) {
      setError('Unggah foto sampah atau timbangan');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadItems = items.map(it => ({
        wasteTypeId: it.wasteTypeId,
        weight: Number(it.weight)
      }));

      const res = await api.submitNasabahDeposit({
        items: payloadItems,
        photoUrl,
        notes: notes.trim() || undefined
      });

      onSuccess(res.deposit);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim pengajuan setoran');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-6 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                Formulir Pengajuan Setoran Mandiri
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Akun: <strong>{user.name}</strong> ({user.id}) · {user.rt || 'RT 003'}/{user.rw || 'RW 08'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Notice Banner: BUKAN ACC LANGSUNG */}
        <div className="p-4 mx-6 mt-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Status: Menunggu Verifikasi Fisik (Bukan ACC Langsung)</span>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              Pengajuan ini mencatat perkiraan sampah terpilah Anda ke dalam antrean. <strong>Saldo buku tabungan Anda baru akan bertambah resmi</strong> setelah sampah dibawa dan ditimbang langsung oleh petugas Bank Sampah Persatuan di loket sekretariat.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Waste Items Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <span>Rincian Sampah Terpilah</span>
                <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jenis</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => {
                const calc = calculatedRows[idx];
                return (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="sm:col-span-6">
                      <select
                        value={item.wasteTypeId}
                        onChange={(e) => updateItem(idx, 'wasteTypeId', e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                        required
                      >
                        {wasteTypes.map(wt => (
                          <option key={wt.id} value={wt.id}>
                            {wt.name} (Rp{wt.pricePerKg.toLocaleString('id-ID')}/kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="Perkiraan kg"
                          value={item.weight}
                          onChange={(e) => updateItem(idx, 'weight', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono font-bold"
                          required
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-neutral-400">kg</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 text-right">
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 block tabular-nums">
                        Rp{(calc?.subtotal || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        disabled={items.length <= 1}
                        onClick={() => removeItemRow(idx)}
                        className="p-1 text-neutral-400 hover:text-rose-600 rounded disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Strip */}
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">Total Perkiraan Berat:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                {Math.round(totalWeight * 100) / 100} kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-semibold">Estimasi Nilai Tabungan:</span>
              <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                Rp{totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Foto Bukti Sampah */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
              Foto Sampah Terpilah / Timbangan (Wajib) *
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer border border-neutral-200 dark:border-neutral-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Berkas Foto</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-neutral-400 truncate max-w-[280px]">
                  {photoName}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan Nasabah */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Catatan untuk Petugas (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sampah kardus sudah dipacking rapi, akan dibawa hari Kamis pukul 14.00"
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Setoran'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
