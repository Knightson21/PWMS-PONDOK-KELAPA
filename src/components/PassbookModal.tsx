import React, { useRef } from 'react';
import { X, Printer, BookOpen, CheckCircle, ShieldCheck, Download } from 'lucide-react';
import type { User, PassbookEntry } from '../types';

interface PassbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  entries: PassbookEntry[];
  summary: {
    totalWeightKg: number;
    totalEarned: number;
    totalWithdrawn: number;
    currentBalance: number;
    totalTransactions: number;
    hasPhysicalBook?: boolean;
  };
}

export const PassbookModal: React.FC<PassbookModalProps> = ({
  isOpen,
  onClose,
  user,
  entries,
  summary
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !user) return null;

  const formatRp = (val: number) => {
    return 'Rp' + Number(val || 0).toLocaleString('id-ID');
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Action Bar (Hidden on print) */}
        <div className="px-6 py-4 bg-emerald-900 dark:bg-emerald-950 text-white flex items-center justify-between print:hidden border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base leading-tight">Buku Tabungan Nasabah Resmi</h3>
              <p className="text-xs text-emerald-200">Bank Sampah Persatuan • KREASI 308 (Dokumen Internal)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Buku Tabungan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-6 text-neutral-900 bg-white">
          
          {/* Passbook Header */}
          <div className="border-b-2 border-emerald-900 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/images/logo_bank_sampah.png"
                  alt="Logo Bank Sampah Persatuan"
                  className="w-16 h-16 object-contain rounded-full shadow-sm"
                />
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-emerald-950 uppercase tracking-tight">
                    Bank Sampah Persatuan • KREASI 308
                  </h1>
                  <p className="text-xs font-semibold text-emerald-800 tracking-wide">
                    Wadah Kreativitas Dari Barang Bekas
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    SK Lurah Pondok Kelapa No. 184 Tahun 2025 • Kec. Duren Sawit, Jakarta Timur 13450
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-md uppercase tracking-wider">
                  Buku Tabungan
                </span>
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  ID: <strong className="text-neutral-900">{user.id}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Member Identity Details Box */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-neutral-600 block">Nama Nasabah:</span>
              <strong className="text-sm font-bold text-neutral-900 block mt-0.5">{user.name}</strong>
              {user.username && (
                <span className="text-[11px] text-neutral-600 font-mono">Username: {user.username}</span>
              )}
            </div>

            <div>
              <span className="text-neutral-600 block">Wilayah / RT-RW:</span>
              <strong className="text-sm font-bold text-emerald-800 block mt-0.5">
                {user.rt || 'RT 003'} / {user.rw || 'RW 08'}
              </strong>
              <span className="text-[11px] text-neutral-600">{user.kelurahan || 'Pondok Kelapa'}</span>
            </div>

            <div>
              <span className="text-neutral-600 block">Jenis & Kontak:</span>
              <strong className="text-neutral-800 capitalize block mt-0.5">
                {user.nasabahType === 'lembaga' ? 'Lembaga / Instansi' : 'Perorangan'}
              </strong>
              <span className="text-[11px] font-mono text-neutral-600">{user.phone || '-'}</span>
            </div>
          </div>

          {/* Summary Balance Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-medium text-emerald-800 uppercase block">Saldo Tersedia</span>
              <span className="text-base sm:text-lg font-bold text-emerald-900">{formatRp(summary.currentBalance)}</span>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-medium text-neutral-700 uppercase block">Total Disetor</span>
              <span className="text-base sm:text-lg font-bold text-neutral-800">{summary.totalWeightKg} Kg</span>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-medium text-neutral-700 uppercase block">Akumulasi Nilai</span>
              <span className="text-base sm:text-lg font-bold text-neutral-800">{formatRp(summary.totalEarned)}</span>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-medium text-neutral-700 uppercase block">Total Penarikan</span>
              <span className="text-base sm:text-lg font-bold text-neutral-800">{formatRp(summary.totalWithdrawn)}</span>
            </div>
          </div>

          {/* Passbook Ledger Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                <span>Mutasi Transaksi Buku Tabungan</span>
                <span className="text-neutral-600 font-normal">({entries.length} baris catatan)</span>
              </h4>
              <span className="text-[11px] text-neutral-600 font-mono">
                Satuan: Rupiah (IDR) & Kilogram
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-24">Tanggal</th>
                    <th className="py-2.5 px-3">Uraian / Keterangan</th>
                    <th className="py-2.5 px-3 w-20 text-right">Berat (Kg)</th>
                    <th className="py-2.5 px-3 w-24 text-right">Kredit (+)</th>
                    <th className="py-2.5 px-3 w-24 text-right">Debit (-)</th>
                    <th className="py-2.5 px-3 w-28 text-right bg-emerald-50/50">Saldo</th>
                    <th className="py-2.5 px-3 w-24 text-center">Paraf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-600 italic">
                        Belum ada riwayat transaksi pada buku tabungan ini.
                      </td>
                    </tr>
                  ) : (
                    entries.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition font-mono">
                        <td className="py-2 px-3 text-center text-neutral-600 text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-sans text-neutral-700 whitespace-nowrap">{formatDate(item.date)}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className={`inline-block font-medium ${item.type === 'SETORAN' ? 'text-neutral-900' : 'text-rose-700'}`}>
                            {item.description}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-neutral-700">
                          {item.weightKg ? `${item.weightKg}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                          {item.creditRp ? formatRp(item.creditRp) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-rose-600">
                          {item.debitRp ? formatRp(item.debitRp) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-neutral-900 bg-emerald-50/30">
                          {formatRp(item.runningBalanceRp)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-sans">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Sah</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SOP Compliance & Authentication Footer */}
          <div className="pt-4 border-t border-dashed border-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-700">
            <div>
              <h5 className="font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Ketentuan Buku Tabungan:</span>
              </h5>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-600 text-[11px]">
                <li>Buku tabungan resmi dipegang nasabah dan wajib dibawa saat penyetoran.</li>
                <li>Penimbangan disaksikan langsung oleh nasabah di loket BSP.</li>
                <li>Saldo tabungan dapat ditarik tunai sewaktu-waktu sesuai jam operasional.</li>
              </ul>
            </div>

            <div className="text-right sm:text-right flex flex-col justify-end">
              <p className="text-[11px] text-neutral-600">Pengelola Bank Sampah Persatuan</p>
              <div className="my-2">
                <span className="font-bold text-emerald-950 block text-xs">Rahmatulloh</span>
                <span className="text-[11px] text-neutral-600">Ketua Pengelola KREASI 308</span>
              </div>
              <p className="text-[10px] text-neutral-600 italic">
                Dicetak melalui PWMS BSP • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom footer button bar */}
        <div className="px-6 py-3.5 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between print:hidden">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Dokumen internal operasional Bank Sampah Persatuan.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
