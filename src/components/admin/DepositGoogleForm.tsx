import React, { useState, useMemo } from 'react';
import type { User, WasteType, DepositTransaction } from '../../types';
import { api } from '../../services/api';
import { 
  FileSpreadsheet, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Scale, 
  User as UserIcon, 
  Image as ImageIcon, 
  RotateCcw,
  Sparkles,
  Camera,
  Search
} from 'lucide-react';

interface DepositGoogleFormProps {
  nasabahList: User[];
  wasteTypes: WasteType[];
  onSuccess: (dep: DepositTransaction) => void;
  onSwitchToSpreadsheet?: () => void;
}

export const DepositGoogleForm: React.FC<DepositGoogleFormProps> = ({
  nasabahList,
  wasteTypes,
  onSuccess,
  onSwitchToSpreadsheet
}) => {
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [nasabahSearch, setNasabahSearch] = useState('');
  const [selectedRtFilter, setSelectedRtFilter] = useState('ALL');
  
  const [depositDate, setDepositDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });

  const [items, setItems] = useState<Array<{ wasteTypeId: string; weight: number | string }>>([
    { wasteTypeId: wasteTypes[0]?.id || '', weight: 1 }
  ]);

  const [photoUrl, setPhotoUrl] = useState<string>('/assets/images/waste_sorting_guide.jpg');
  const [photoName, setPhotoName] = useState<string>('waste_sorting_guide.jpg');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDep, setSuccessDep] = useState<DepositTransaction | null>(null);

  // Filtered nasabah list by RT and search
  const filteredNasabah = useMemo(() => {
    return nasabahList.filter(n => {
      const matchRt = selectedRtFilter === 'ALL' || n.rt === selectedRtFilter;
      const matchSearch = !nasabahSearch || 
        n.name.toLowerCase().includes(nasabahSearch.toLowerCase()) ||
        n.id.toLowerCase().includes(nasabahSearch.toLowerCase()) ||
        (n.phone && n.phone.includes(nasabahSearch));
      return matchRt && matchSearch;
    });
  }, [nasabahList, selectedRtFilter, nasabahSearch]);

  const selectedNasabah = useMemo(() => {
    return nasabahList.find(n => n.id === selectedNasabahId) || null;
  }, [nasabahList, selectedNasabahId]);

  // Available RT list (RT 001 - RT 016)
  const rtList = useMemo(() => {
    const set = new Set<string>();
    nasabahList.forEach(n => {
      if (n.rt) set.add(n.rt);
    });
    // Add default RT 001 - RT 016 if not already in set
    for (let i = 1; i <= 16; i++) {
      set.add(`RT ${String(i).padStart(3, '0')}`);
    }
    return Array.from(set).sort();
  }, [nasabahList]);

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

  const handleResetForm = () => {
    setSelectedNasabahId('');
    setNasabahSearch('');
    setSelectedRtFilter('ALL');
    setItems([{ wasteTypeId: wasteTypes[0]?.id || '', weight: 1 }]);
    setPhotoUrl('/assets/images/waste_sorting_guide.jpg');
    setPhotoName('waste_sorting_guide.jpg');
    setNotes('');
    setError(null);
    setSuccessDep(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedNasabahId) {
      setError('Silakan pilih nasabah penyetor pada bagian Kartu 1.');
      return;
    }

    if (items.some(i => !i.weight || Number(i.weight) <= 0)) {
      setError('Pastikan berat setiap jenis sampah lebih besar dari 0 kg.');
      return;
    }

    if (!photoUrl) {
      setError('Unggah foto bukti penimbangan pada Kartu 4.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadItems = items.map(it => ({
        wasteTypeId: it.wasteTypeId,
        weight: Number(it.weight)
      }));

      const newDep = await api.createDeposit({
        nasabahId: selectedNasabahId,
        items: payloadItems,
        photoUrl,
        notes: notes.trim() || undefined
      });

      setSuccessDep(newDep);
      onSuccess(newDep);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan formulir penyetoran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-10">
      
      {/* Top Banner & Switcher bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            📋
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Formulir Penyetoran Sampah (Google Form Mode)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                Resmi Petugas BSP
              </span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Formulir terpadu penimbangan sampah langsung berpedoman pada SOP No. 184 Kp. Curug RW 08.
            </p>
          </div>
        </div>

        {onSwitchToSpreadsheet && (
          <button
            type="button"
            onClick={onSwitchToSpreadsheet}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Beralih ke Spreadsheet Grid (Excel)</span>
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {successDep && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Setoran Berhasil Disimpan ({successDep.id})</span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            Transaksi atas nama <strong>{successDep.nasabahName}</strong> ({successDep.nasabahRt}) sebesar <strong>{successDep.totalWeight} kg</strong> senilai <strong>Rp{successDep.totalAmount.toLocaleString('id-ID')}</strong> telah berhasil masuk sistem dengan status <em>MENUNGGU VERIFIKASI</em>.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Input Setoran Baru Lainnya</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Google Form Card Body */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Header Form Card (Google Form style with emerald top strip) */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="h-3 bg-emerald-700 dark:bg-emerald-600 w-full" />
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Bank Sampah Persatuan • KREASI 308
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                SK Lurah Pondok Kelapa No. 184 / 2025
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
              Formulir Penyetoran Sampah Warga & Lembaga
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Silakan isi data penimbangan sampah nasabah di bawah ini. Pastikan sampah telah disortir sesuai kategori (Kardus, Kertas HVS, Botol Plastik PET, Gelas Cup, Besi Padat, Logam Aluminium, Minyak Jelantah, atau Elektronik) sebelum dicatat.
            </p>
            <div className="pt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <span>* Menunjukkan pertanyaan yang wajib diisi</span>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: NASABAH SELECTION */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <label className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>1. Nama Nasabah Penyetor</span>
              <span className="text-rose-600">*</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Pilih dari daftar nasabah resmi yang terdaftar di lingkungan RT 001 - RT 016 RW 08.
            </p>
          </div>

          {/* Quick RT Filter Bar */}
          <div>
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block mb-1.5">
              Saring Cepat Berdasarkan Wilayah RT:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedRtFilter('ALL')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedRtFilter === 'ALL'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                Semua RT ({nasabahList.length})
              </button>
              {rtList.slice(0, 16).map(rt => {
                const count = nasabahList.filter(n => n.rt === rt).length;
                return (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => setSelectedRtFilter(rt)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-all ${
                      selectedRtFilter === rt
                        ? 'bg-emerald-700 text-white font-bold shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {rt} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Select Dropdown */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ketik nama nasabah, nomor telepon, atau ID..."
                value={nasabahSearch}
                onChange={(e) => setNasabahSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <select
              value={selectedNasabahId}
              onChange={(e) => setSelectedNasabahId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              required
            >
              <option value="">-- Pilih Nasabah ({filteredNasabah.length} ditemukan) --</option>
              {filteredNasabah.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name} [{n.id}] - {n.rt || 'RT 003'}/{n.rw || 'RW 08'} - Saldo: Rp{(n.saldo || 0).toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          {/* Highlight card for selected nasabah */}
          {selectedNasabah && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">{selectedNasabah.name}</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    ID: <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">{selectedNasabah.id}</span> · Wilayah: <strong>{selectedNasabah.rt || 'RT 003'} / {selectedNasabah.rw || 'RW 08'}</strong>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase block">Saldo Saat Ini:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  Rp{(selectedNasabah.saldo || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: TANGGAL & JADWAL */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-3">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <label className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>2. Waktu & Tanggal Penimbangan</span>
              <span className="text-rose-600">*</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Penyetoran rutin dilakukan setiap hari Kamis (13.00 - 16.00 WIB) atau jam operasional sekretariat (09.00 - 15.00 WIB).
            </p>
          </div>

          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="datetime-local"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>
        </div>

        {/* SECTION 3: DETAIL ITEM SAMPAH */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <div>
              <label className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>3. Rincian Jenis Sampah & Timbangan</span>
                <span className="text-rose-600">*</span>
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Pilih jenis sampah terpilah dan masukkan bobot timbangan dalam kilogram (kg).
              </p>
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const calc = calculatedRows[idx];
              return (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                      Jenis Sampah #{idx + 1}
                    </label>
                    <select
                      value={item.wasteTypeId}
                      onChange={(e) => updateItem(idx, 'wasteTypeId', e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium"
                      required
                    >
                      {wasteTypes.map(wt => (
                        <option key={wt.id} value={wt.id}>
                          {wt.name} ({wt.category || 'Anorganik'}) - Rp{wt.pricePerKg.toLocaleString('id-ID')}/kg
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                      Berat (Kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0.05"
                        placeholder="0.00"
                        value={item.weight}
                        onChange={(e) => updateItem(idx, 'weight', e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono font-bold"
                        required
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] text-neutral-400">kg</span>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                      Kalkulasi Subtotal
                    </label>
                    <div className="p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 font-mono text-emerald-800 dark:text-emerald-400 font-bold tabular-nums">
                      Rp{(calc?.subtotal || 0).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex justify-end sm:pt-4">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItemRow(idx)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors disabled:opacity-30"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand Total Strip */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-100 dark:bg-neutral-800/80 p-4 rounded-xl">
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Akumulasi Hasil Timbangan:</span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                {items.length} Macam Kategori Sampah Terinput
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase block">Total Berat</span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900 dark:text-white tabular-nums">
                  {Math.round(totalWeight * 100) / 100} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase block font-semibold">Total Nilai Saldo</span>
                <span className="text-lg sm:text-xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  Rp{totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: UPLOAD BUKTI FOTO TIMBANGAN */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <label className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>4. Foto Dokumentasi Bukti Timbangan Asli</span>
              <span className="text-rose-600">*</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Unggah foto hasil timbangan di loket atau penyerahan sampah nasabah sebagai bukti fisik resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Image Preview Box */}
            <div className="relative aspect-4/3 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Bukti Timbangan"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-neutral-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-[11px]">Belum ada foto</span>
                </div>
              )}
            </div>

            {/* Upload Action Box */}
            <div className="sm:col-span-2 space-y-3">
              <label className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-neutral-50/50 dark:bg-neutral-800/30">
                <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  Klik untuk pilih berkas foto dari komputer / ponsel
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  Format JPG, PNG, atau WebP (Foto kamera langsung didukung)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {photoName && (
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg">
                  <span className="truncate max-w-[240px] font-mono text-[11px]">{photoName}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Tersimpan</span>
                </div>
              )}

              {/* Sample Authentic Photo Picker */}
              <div className="pt-1">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1">
                  Atau gunakan foto dokumentasi kegiatan lapangan nyata:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.58.58_f75d5c65.jpeg');
                      setPhotoName('dokumentasi_kegiatan_155858.jpeg');
                    }}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    Foto Kegiatan 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('/assets/aistudio/WhatsApp_Image_2026-10-29_at_16.11.20_2__b1f3ed2a.jpeg');
                      setPhotoName('dokumentasi_lapangan_161120.jpeg');
                    }}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    Foto Tim BSP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: CATATAN TAMBAHAN */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-3">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <label className="text-sm font-bold text-neutral-900 dark:text-white block">
              5. Catatan Khusus Petugas Timbang (Opsional)
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Contoh: Disortir dari rumah warga, setoran gabungan RT, atau kondisi kebersihan sampah.
            </p>
          </div>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ketik catatan tambahan transaksi ini..."
            className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* ACTION BUTTONS BAR */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Kosongkan Formulir
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Menyimpan Setoran...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirim & Catat Setoran Resmi</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
