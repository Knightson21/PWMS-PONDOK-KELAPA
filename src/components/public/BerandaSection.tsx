import React from 'react';
import { 
  Scale, 
  Wallet, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Leaf, 
  Camera,
  MapPin,
  FileText
} from 'lucide-react';
import type { PublicStats, WasteType } from '../../types';
import type { PublicMenu } from '../../pages/PublicLanding';
import { PublicWasteSaleForm } from './PublicWasteSaleForm';

interface BerandaSectionProps {
  stats: PublicStats | null;
  wasteTypes?: WasteType[];
  loading: boolean;
  onNavigate: (menu: PublicMenu) => void;
  onSaleRecorded?: () => void;
}

export const BerandaSection: React.FC<BerandaSectionProps> = ({
  stats,
  wasteTypes = [],
  loading,
  onNavigate,
  onSaleRecorded
}) => {
  const scrollToSaleForm = () => {
    const el = document.getElementById('form-penjualan-sampah');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const formatRupiah = (val: number) => {
    return 'Rp' + Number(val || 0).toLocaleString('id-ID');
  };

  const realDocumentation = [
    {
      img: '/assets/aistudio/WhatsApp_Image_2026-10-29_at_16.11.20_2__b1f3ed2a.jpeg',
      title: 'Tim Pengurus di Depan Sekretariat',
      caption: 'Pengurus & relawan Bank Sampah Persatuan di Sekretariat Kp. Curug RW 08 Gang Persatuan No. 50 dengan spanduk resmi KREASI 308.'
    },
    {
      img: '/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.58.58_f75d5c65.jpeg',
      title: 'Edukasi & Sosialisasi Digital Warga',
      caption: 'Penyampaian materi pemilahan sampah dan simulasi sistem pencatatan digital PWMS bersama ibu-ibu warga Kp. Curug.'
    },
    {
      img: '/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.58.35_058c6651.jpeg',
      title: 'Sosialisasi Tata Kelola Sampah Rumah Tangga',
      caption: 'Pendampingan langsung kepada masyarakat untuk memilah sampah dari sumbernya dan menjadikannya tabungan bernilai ekonomis.'
    },
    {
      img: '/assets/aistudio/WhatsApp_Image_2026-10-29_at_16.11.21_1__9f523dc2.jpeg',
      title: 'Kebersamaan & Komitmen Pengurus',
      caption: 'Solidaritas kader pengelola Bank Sampah Persatuan dalam menjaga kelestarian lingkungan dan pemberdayaan ekonomi sirkular.'
    }
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-950 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-emerald-800/40">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Waste Management Unity System (WMUS)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Selamat Datang di Bank Sampah <span className="text-emerald-400">“Persatuan”</span>
            </h1>

            <p className="text-neutral-200 text-sm sm:text-base leading-relaxed">
              Tempat resmi warga Kp. Curug RW 08 Kelurahan Pondok Kelapa menjual sampah terpilah dan mencatat bukti penjualannya secara langsung tanpa perlu membuat akun. Harga jual mengikuti tarif aktual di lapangan dan ditulis langsung pada formulir di bawah ini.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToSaleForm}
                className="px-5 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Isi Form Penjualan Sampah</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('edukasi')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
              >
                Panduan Edukasi 3R
              </button>
              <button
                onClick={() => onNavigate('profil')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800/60 hover:bg-emerald-700 rounded-xl transition-colors border border-emerald-600/40"
              >
                Profil Bank Sampah
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-neutral-300">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SK Lurah Pondok Kelapa No. 184 Thn 2025</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Timbangan Presisi & Foto Autentik</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Ekonomi Sirkular RW 08</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card with REAL Team Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 dark:border-neutral-800 aspect-[4/3] bg-neutral-900 group">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_16.11.20_2__b1f3ed2a.jpeg"
                alt="Pengurus Resmi Bank Sampah Persatuan - Kreasi 308 Kp Curug RW 08"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-900/30 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="inline-flex items-center gap-2 bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>KREASI 308 · Wadah Kreativitas Barang Bekas</span>
                </div>
                <p className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sekretariat RW 08 Kp. Curug, Pondok Kelapa</span>
                </p>
                <p className="text-xs text-neutral-300">Foto Resmi Pengurus & Relawan Bank Sampah Persatuan</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Formulir Pencatatan Penjualan Sampah Warga (Langsung di Beranda) */}
      <section id="form-penjualan-sampah" className="scroll-mt-24">
        <PublicWasteSaleForm
          wasteTypes={wasteTypes}
          onSaleSuccess={() => onSaleRecorded?.()}
        />
      </section>

      {/* KPI Stats Strip */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Rekap Pencatatan Penjualan Sampah</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Ringkasan data penjualan sampah warga yang tercatat di Bank Sampah Persatuan RW 08</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
            Tercatat Otomatis
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Scale className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Sampah Terjual</p>
            <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1 font-mono tabular-nums">
              {loading ? '...' : `${(stats?.totalWeightKg || 0).toLocaleString('id-ID')} kg`}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Terselamatkan dari TPA</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-300 flex items-center justify-center mb-2">
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Total Nilai Penjualan</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1 font-mono tabular-nums">
              {loading ? '...' : formatRupiah(stats?.totalEconomicValueRp || 0)}
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Akumulasi nilai jual warga</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Warga Penjual Tercatat</p>
            <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1 font-mono tabular-nums">
              {loading ? '...' : (stats?.totalActiveNasabah || 0)}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Partisipasi warga RW 08</p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-400 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Bukti Pencatatan</p>
            <p className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mt-1 font-mono tabular-nums">
              {loading ? '...' : (stats?.totalApprovedTransactions || 0)}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Transaksi tersimpan di spreadsheet</p>
          </div>
        </div>
      </section>

      {/* DOKUMENTASI KEGIATAN NYATA (100% Foto Asli Bank Sampah Persatuan) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Dokumentasi Kegiatan Lapangan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">
              Aktivitas Nyata Pengurus & Warga
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Dokumentasi autentik program pemilahan, edukasi sistem PWMS, dan silaturahmi warga Kp. Curug RW 08.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 w-fit">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dokumentasi Resmi 2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {realDocumentation.map((item, idx) => (
            <div 
              key={idx}
              className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Dokumentasi #0{idx + 1}
                </span>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

