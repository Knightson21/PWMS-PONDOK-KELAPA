import React, { useState, useMemo } from 'react';
import type { User, WasteType, DepositTransaction } from '../../types';
import { api } from '../../services/api';
import { 
  FileSpreadsheet, 
  Download, 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Upload,
  FileText
} from 'lucide-react';

interface GridRow {
  id: string;
  date: string;
  nasabahId: string;
  wasteTypeId: string;
  weight: number;
  photoUrl: string;
  notes: string;
}

interface DepositSpreadsheetGridProps {
  nasabahList: User[];
  wasteTypes: WasteType[];
  onSuccess: (deposits: DepositTransaction[]) => void;
  onSwitchToGoogleForm?: () => void;
}

export const DepositSpreadsheetGrid: React.FC<DepositSpreadsheetGridProps> = ({
  nasabahList,
  wasteTypes,
  onSuccess,
  onSwitchToGoogleForm
}) => {
  const defaultPhoto = '/assets/images/waste_sorting_guide.jpg';

  // Initial seed rows for the spreadsheet
  const [rows, setRows] = useState<GridRow[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const firstNasabah = nasabahList[0]?.id || '';
    const firstWaste = wasteTypes[0]?.id || '';
    return [
      {
        id: 'row-1',
        date: today,
        nasabahId: firstNasabah,
        wasteTypeId: firstWaste,
        weight: 5,
        photoUrl: defaultPhoto,
        notes: 'Penyetoran rutin mingguan'
      },
      {
        id: 'row-2',
        date: today,
        nasabahId: nasabahList[1]?.id || firstNasabah,
        wasteTypeId: wasteTypes[1]?.id || firstWaste,
        weight: 3.5,
        photoUrl: defaultPhoto,
        notes: ''
      },
      {
        id: 'row-3',
        date: today,
        nasabahId: nasabahList[2]?.id || firstNasabah,
        wasteTypeId: wasteTypes[2]?.id || firstWaste,
        weight: 2,
        photoUrl: defaultPhoto,
        notes: ''
      }
    ];
  });

  const [selectedRtFilter, setSelectedRtFilter] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // RT Options for quick filter
  const rtOptions = useMemo(() => {
    const set = new Set<string>();
    nasabahList.forEach(n => {
      if (n.rt) set.add(n.rt);
    });
    for (let i = 1; i <= 16; i++) {
      set.add(`RT ${String(i).padStart(3, '0')}`);
    }
    return Array.from(set).sort();
  }, [nasabahList]);

  // Computed values per row
  const calculatedRows = useMemo(() => {
    return rows.map((r, index) => {
      const nasabah = nasabahList.find(n => n.id === r.nasabahId);
      const wt = wasteTypes.find(w => w.id === r.wasteTypeId);
      const price = wt ? wt.pricePerKg : 0;
      const weight = Number(r.weight) || 0;
      const subtotal = Math.round(weight * price);
      return {
        ...r,
        index,
        nasabah,
        wasteType: wt,
        price,
        subtotal
      };
    });
  }, [rows, nasabahList, wasteTypes]);

  // Totals
  const grandTotalWeight = calculatedRows.reduce((acc, r) => acc + (Number(r.weight) || 0), 0);
  const grandTotalAmount = calculatedRows.reduce((acc, r) => acc + r.subtotal, 0);

  // Add new empty row
  const handleAddRow = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newRow: GridRow = {
      id: `row-${Date.now()}`,
      date: today,
      nasabahId: nasabahList[0]?.id || '',
      wasteTypeId: wasteTypes[0]?.id || '',
      weight: 1,
      photoUrl: defaultPhoto,
      notes: ''
    };
    setRows(prev => [...prev, newRow]);
  };

  // Duplicate a row
  const handleDuplicateRow = (idx: number) => {
    const target = rows[idx];
    if (!target) return;
    const cloned: GridRow = {
      ...target,
      id: `row-${Date.now()}`
    };
    setRows(prev => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, cloned);
      return copy;
    });
  };

  // Remove row
  const handleRemoveRow = (idx: number) => {
    if (rows.length <= 1) {
      setError('Spreadsheet harus menyisakan setidaknya 1 baris.');
      return;
    }
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  // Update cell
  const handleUpdateCell = (idx: number, field: keyof GridRow, val: any) => {
    setRows(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Export to Excel / CSV with UTF-8 BOM
  const handleExportSpreadsheet = () => {
    const headers = [
      'No',
      'Tanggal',
      'ID Nasabah',
      'Nama Nasabah',
      'Wilayah RT',
      'Wilayah RW',
      'Jenis Sampah',
      'Kategori',
      'Berat (Kg)',
      'Tarif Per Kg (Rp)',
      'Subtotal (Rp)',
      'Catatan'
    ];

    const csvRows = calculatedRows.map((r, i) => {
      return [
        i + 1,
        `"${r.date}"`,
        `"${r.nasabah?.id || r.nasabahId}"`,
        `"${r.nasabah?.name || '-'}"`,
        `"${r.nasabah?.rt || '-'}"`,
        `"${r.nasabah?.rw || 'RW 08'}"`,
        `"${r.wasteType?.name || '-'}"`,
        `"${r.wasteType?.category || 'Anorganik'}"`,
        Number(r.weight) || 0,
        r.price,
        r.subtotal,
        `"${r.notes || ''}"`
      ].join(',');
    });

    // Add total row at bottom
    const totalRow = [
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      grandTotalWeight,
      '',
      grandTotalAmount,
      'Rekap Spreadsheet BSP'
    ].join(',');

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows, totalRow].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spreadsheet_setoran_sampah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Batch Save all rows to database
  const handleBatchSave = async () => {
    setError(null);
    setSuccessMsg(null);

    // Validation
    const invalidRows = calculatedRows.filter(r => !r.nasabahId || !r.weight || r.weight <= 0);
    if (invalidRows.length > 0) {
      setError(`Terdapat ${invalidRows.length} baris dengan nasabah belum dipilih atau bobot bernilai 0 kg.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const depositsPayload = rows.map(r => ({
        nasabahId: r.nasabahId,
        items: [
          {
            wasteTypeId: r.wasteTypeId,
            weight: Number(r.weight)
          }
        ],
        photoUrl: r.photoUrl || defaultPhoto,
        notes: r.notes.trim() || undefined
      }));

      const res = await api.batchCreateDeposits(depositsPayload);
      setSuccessMsg(res.message || `Berhasil menyimpan ${res.count} transaksi setoran ke database.`);
      onSuccess(res.deposits);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi batch ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      
      {/* Top Header & Switcher Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Spreadsheet Interaktif Setoran Sampah
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                Live Grid Editor
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Input cepat baris per baris layaknya Excel. Sel terisi otomatis dengan tarif resmi per kg dan kalkulasi subtotal instan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToGoogleForm && (
            <button
              type="button"
              onClick={onSwitchToGoogleForm}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mode Formulir Google Form</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportSpreadsheet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all"
            title="Ekspor tabel saat ini ke format berkas Excel/CSV"
          >
            <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Ekspor Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tambah Baris</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting || rows.length === 0}
            onClick={handleBatchSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Semua Baris (Batch)'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SPREADSHEET MATRIX TABLE CONTAINER */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        
        {/* Spreadsheet Sheet Bar / Formula strip */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase text-[11px] bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
              Sheet1: Setoran_Harian
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-[11px]">Formula Rumus: <code className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-neutral-800 dark:text-neutral-200">= Berat * Tarif_Kg</code></span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span>Filter RT:</span>
            <select
              value={selectedRtFilter}
              onChange={(e) => setSelectedRtFilter(e.target.value)}
              className="py-1 px-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
            >
              <option value="ALL">Semua RT</option>
              {rtOptions.map(rt => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dense Spreadsheet Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border-b border-neutral-200 dark:border-neutral-700 select-none">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center border-r border-neutral-200 dark:border-neutral-700 font-mono text-[11px] bg-neutral-200/60 dark:bg-neutral-800">
                  #
                </th>
                <th className="py-2.5 px-3 w-32 border-r border-neutral-200 dark:border-neutral-700">
                  A · Tanggal
                </th>
                <th className="py-2.5 px-3 min-w-[200px] border-r border-neutral-200 dark:border-neutral-700">
                  B · Nasabah Penyetor *
                </th>
                <th className="py-2.5 px-3 w-24 text-center border-r border-neutral-200 dark:border-neutral-700">
                  C · RT
                </th>
                <th className="py-2.5 px-3 min-w-[180px] border-r border-neutral-200 dark:border-neutral-700">
                  D · Jenis Sampah *
                </th>
                <th className="py-2.5 px-3 w-28 text-right border-r border-neutral-200 dark:border-neutral-700">
                  E · Berat (Kg) *
                </th>
                <th className="py-2.5 px-3 w-28 text-right border-r border-neutral-200 dark:border-neutral-700">
                  F · Tarif/Kg
                </th>
                <th className="py-2.5 px-3 w-32 text-right border-r border-neutral-200 dark:border-neutral-700 bg-emerald-50/50 dark:bg-emerald-950/20">
                  G · Subtotal
                </th>
                <th className="py-2.5 px-3 w-28 border-r border-neutral-200 dark:border-neutral-700 text-center">
                  H · Foto Bukti
                </th>
                <th className="py-2.5 px-3 min-w-[140px] border-r border-neutral-200 dark:border-neutral-700">
                  I · Catatan
                </th>
                <th className="py-2.5 px-3 w-20 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-sans">
              {calculatedRows.map((r, idx) => {
                const isRtMatch = selectedRtFilter === 'ALL' || r.nasabah?.rt === selectedRtFilter;
                if (!isRtMatch) return null;

                return (
                  <tr 
                    key={r.id} 
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors group"
                  >
                    {/* Row Index */}
                    <td className="py-2 px-3 text-center border-r border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-850 font-mono text-neutral-500 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Column A: Tanggal */}
                    <td className="py-1.5 px-2 border-r border-neutral-200 dark:border-neutral-800">
                      <input
                        type="date"
                        value={r.date}
                        onChange={(e) => handleUpdateCell(idx, 'date', e.target.value)}
                        className="w-full py-1 px-1.5 text-xs rounded border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-emerald-600 bg-transparent font-mono"
                      />
                    </td>

                    {/* Column B: Nasabah Penyetor */}
                    <td className="py-1.5 px-2 border-r border-neutral-200 dark:border-neutral-800">
                      <select
                        value={r.nasabahId}
                        onChange={(e) => handleUpdateCell(idx, 'nasabahId', e.target.value)}
                        className="w-full py-1 px-1.5 text-xs rounded border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-emerald-600 bg-transparent font-medium text-neutral-900 dark:text-white"
                      >
                        <option value="">-- Pilih Nasabah --</option>
                        {nasabahList.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.id}) - {n.rt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Column C: Wilayah RT (Auto-filled) */}
                    <td className="py-2 px-3 text-center border-r border-neutral-200 dark:border-neutral-800 font-mono font-bold text-emerald-800 dark:text-emerald-400 text-xs">
                      {r.nasabah?.rt || '-'}
                    </td>

                    {/* Column D: Jenis Sampah */}
                    <td className="py-1.5 px-2 border-r border-neutral-200 dark:border-neutral-800">
                      <select
                        value={r.wasteTypeId}
                        onChange={(e) => handleUpdateCell(idx, 'wasteTypeId', e.target.value)}
                        className="w-full py-1 px-1.5 text-xs rounded border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-emerald-600 bg-transparent"
                      >
                        {wasteTypes.map(wt => (
                          <option key={wt.id} value={wt.id}>
                            {wt.name} ({wt.category || 'Anorganik'})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Column E: Berat (Kg) */}
                    <td className="py-1.5 px-2 border-r border-neutral-200 dark:border-neutral-800 text-right">
                      <input
                        type="number"
                        step="0.05"
                        min="0.05"
                        value={r.weight}
                        onChange={(e) => handleUpdateCell(idx, 'weight', e.target.value)}
                        className="w-full py-1 px-1.5 text-xs text-right font-mono font-bold rounded border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-emerald-600 bg-transparent text-neutral-900 dark:text-white"
                      />
                    </td>

                    {/* Column F: Tarif / Kg */}
                    <td className="py-2 px-3 border-r border-neutral-200 dark:border-neutral-800 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      Rp{r.price.toLocaleString('id-ID')}
                    </td>

                    {/* Column G: Subtotal (Auto) */}
                    <td className="py-2 px-3 border-r border-neutral-200 dark:border-neutral-800 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20">
                      Rp{r.subtotal.toLocaleString('id-ID')}
                    </td>

                    {/* Column H: Foto Bukti */}
                    <td className="py-1.5 px-2 border-r border-neutral-200 dark:border-neutral-800 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <img
                          src={r.photoUrl}
                          alt="Thumbnail"
                          className="w-6 h-6 object-cover rounded border border-neutral-300 dark:border-neutral-700"
                        />
                        <label className="cursor-pointer text-[10px] text-neutral-500 hover:text-emerald-600">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const rd = new FileReader();
                                rd.onloadend = () => handleUpdateCell(idx, 'photoUrl', rd.result as string);
                                rd.readAsDataURL(f);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </td>

                    {/* Column I: Catatan */}
                    <td className="py-1.5 px-2 border-r border-neutral-200 dark:border-neutral-800">
                      <input
                        type="text"
                        placeholder="Catatan..."
                        value={r.notes}
                        onChange={(e) => handleUpdateCell(idx, 'notes', e.target.value)}
                        className="w-full py-1 px-1.5 text-xs rounded border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-emerald-600 bg-transparent text-neutral-600 dark:text-neutral-300"
                      />
                    </td>

                    {/* Column J: Aksi */}
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(idx)}
                          className="p-1 text-neutral-400 hover:text-emerald-600 rounded transition"
                          title="Duplikasi baris ini"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={rows.length <= 1}
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded transition disabled:opacity-30"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOTTOM SPREADSHEET STATUS & TOTALS STRIP */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-850 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              Total Baris: <strong className="text-neutral-900 dark:text-white font-mono">{rows.length}</strong>
            </span>
            <span>·</span>
            <span>
              Format: <strong className="text-emerald-700 dark:text-emerald-400">Excel / Google Sheets CSV</strong>
            </span>
            <span>·</span>
            <span>Status: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Siap Simpan ke Ledger</span></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 uppercase block font-semibold">Total Berat Sampah:</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900 dark:text-white tabular-nums">
                {Math.round(grandTotalWeight * 100) / 100} kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase block font-bold">Total Nilai Tabungan:</span>
              <span className="text-base sm:text-xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                Rp{grandTotalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
