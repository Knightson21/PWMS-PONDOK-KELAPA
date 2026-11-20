import React from 'react';
import type { DepositTransaction, Withdrawal } from '../types';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  deposit?: DepositTransaction | null;
  withdrawal?: Withdrawal | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ deposit, withdrawal, onClose }) => {
  if (!deposit && !withdrawal) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRupiah = (val: number) => {
    return 'Rp' + Number(val || 0).toLocaleString('id-ID');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (hidden on print) */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Bukti Transaksi Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-emerald-600 hover:bg-neutral-800 dark:hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Struk Body */}
        <div className="p-6 font-mono text-xs text-neutral-800 dark:text-neutral-200 space-y-4 bg-white dark:bg-neutral-900 print:bg-white print:text-neutral-900">
          <div className="text-center border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-3">
            <img 
              src="/assets/images/logo_bank_sampah.png" 
              alt="Logo Bank Sampah Persatuan" 
              className="w-14 h-14 object-contain rounded-full mx-auto mb-2 border border-neutral-300 dark:border-neutral-700 bg-white"
            />
            <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white uppercase">
              Bank Sampah Persatuan
            </h2>
            <p className="text-[11px] font-bold text-emerald-800 font-sans tracking-wide">
              KREASI 308
            </p>
            <p className="text-[10px] text-neutral-600 font-sans">
              Wadah Kreativitas Dari Barang Bekas
            </p>
            <p className="text-[10px] text-emerald-800 font-sans font-semibold">
              SK Kelurahan Pondok Kelapa No. 184 Tahun 2025
            </p>
            <p className="text-[9px] text-neutral-500 font-sans mt-0.5">
              Kp. Curug RT 003/008 Gang Persatuan No. 50, Jakarta Timur 13450 · Telp/WA: 0857-7543-7617
            </p>
          </div>

          {/* Details */}
          {deposit && (
            <>
              <div className="space-y-1 pb-2 border-b border-dashed border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">No. Transaksi</span>
                  <span className="font-bold text-neutral-900">{deposit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tanggal</span>
                  <span>{formatDate(deposit.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ID Nasabah</span>
                  <span className="font-bold">{deposit.nasabahId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nama Nasabah</span>
                  <span className="font-bold text-neutral-900">{deposit.nasabahName}</span>
                </div>
                {deposit.nasabahRt && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Wilayah RT / RW</span>
                    <span className="font-bold text-neutral-800">{deposit.nasabahRt} / {deposit.nasabahRw}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span className="font-bold text-emerald-700">{deposit.status}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2 pb-2 border-b border-dashed border-neutral-200">
                <div className="grid grid-cols-12 text-[11px] font-semibold text-neutral-600 pb-1">
                  <span className="col-span-6">Jenis Sampah</span>
                  <span className="col-span-3 text-right">Berat & Harga</span>
                  <span className="col-span-3 text-right">Subtotal</span>
                </div>
                {deposit.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[11px] items-center">
                    <span className="col-span-6 font-medium text-neutral-900">{item.wasteTypeName}</span>
                    <span className="col-span-3 text-right tabular-nums text-neutral-600">
                      {item.weight} kg @{formatRupiah(item.snapshotPricePerKg)}
                    </span>
                    <span className="col-span-3 text-right font-semibold tabular-nums text-neutral-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">Total Berat:</span>
                  <span className="font-bold tabular-nums">{deposit.totalWeight} kg</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-neutral-200">
                  <span className="font-bold text-neutral-900">Total Nilai Tabungan:</span>
                  <span className="font-bold text-emerald-700 text-base tabular-nums">
                    {formatRupiah(deposit.totalAmount)}
                  </span>
                </div>
              </div>
            </>
          )}

          {withdrawal && (
            <>
              <div className="space-y-1 pb-2 border-b border-dashed border-neutral-200">
                <div className="flex justify-between">
                  <span className="text-neutral-500">No. Penarikan</span>
                  <span className="font-bold text-neutral-900">{withdrawal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Waktu Penyerahan</span>
                  <span>{formatDate(withdrawal.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ID Nasabah</span>
                  <span className="font-bold">{withdrawal.nasabahId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nama Penerima</span>
                  <span className="font-bold text-neutral-900">{withdrawal.nasabahName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Petugas Kasir</span>
                  <span>{withdrawal.adminName}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-100 text-center space-y-1">
                <p className="text-[11px] text-neutral-500">Nominal Penarikan Tunai:</p>
                <p className="text-xl font-bold text-neutral-900 tabular-nums">
                  {formatRupiah(withdrawal.amount)}
                </p>
                <p className="text-[10px] text-neutral-500">STATUS: PENYERAHAN SELESAI</p>
              </div>
            </>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-center font-sans text-[11px] text-neutral-600 border-t border-dashed border-neutral-300">
            <div>
              <p>Nasabah,</p>
              <div className="h-12"></div>
              <p className="font-semibold text-neutral-900 border-t border-neutral-300 pt-1">
                {deposit ? deposit.nasabahName : withdrawal?.nasabahName}
              </p>
            </div>
            <div>
              <p>Petugas Bank Sampah,</p>
              <div className="h-12"></div>
              <p className="font-semibold text-neutral-900 border-t border-neutral-300 pt-1">
                Petugas Kasir
              </p>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-neutral-400 font-sans">
            <p>Terima kasih atas partisipasi Anda dalam menjaga kebersihan lingkungan.</p>
            <p>Sampah Anda adalah Tabungan Masa Depan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
