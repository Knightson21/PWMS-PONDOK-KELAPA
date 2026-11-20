import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Leaf,
  Camera,
  ZoomIn,
  X
} from 'lucide-react';
import type { OrganizationProfile, SOPItem } from '../../types';

interface ProfilSectionProps {
  profile: OrganizationProfile | null;
  sopList: SOPItem[];
}

export const ProfilSection: React.FC<ProfilSectionProps> = ({ profile, sopList }) => {
  const [activeSopTab, setActiveSopTab] = useState<number>(1);
  const [zoomOrgChart, setZoomOrgChart] = useState<boolean>(false);

  const pengurus = profile?.kepengurusan || [
    { jabatan: 'Ketua', nama: ['Rahmatulloh'] },
    { jabatan: 'Sekretaris', nama: ['Sapnah Musa', 'Pipit Rohmanah'] },
    { jabatan: 'Bendahara', nama: ['Agustina Widyastuti', 'Neneng Kusniawati'] },
    { jabatan: 'Humas', nama: ['Sri Rahayu', 'Rini Rahmawati'] },
    { jabatan: 'Pelaksana', nama: ['Salamah', 'Anna Septarina'] },
    { jabatan: 'Pemilah', nama: ['Nurhikmah', 'Sutiati', 'Robiatul Adawiyah'] }
  ];

  const findRole = (keyword: string) =>
    pengurus.find((p) => p.jabatan.toLowerCase().includes(keyword.toLowerCase()));

  const ketua = findRole('ketua') || pengurus[0];
  const sekretaris = findRole('sekretaris') || pengurus[1];
  const bendahara = findRole('bendahara') || pengurus[2];
  const bidangRoles = [
    findRole('humas'),
    findRole('pelaksana'),
    findRole('pemilah')
  ].filter(Boolean) as Array<{ jabatan: string; nama: string[] }>;

  const fallbackBidang = bidangRoles.length > 0 ? bidangRoles : pengurus.slice(3);

  return (
    <div className="space-y-14 py-6 sm:py-10">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-emerald-800 via-teal-900 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-200">
            <Award className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Legalitas Resmi · SK Lurah Pondok Kelapa No. 184 Tahun 2025</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-balance">
            Profil Bank Sampah “Persatuan”
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Mengenal lebih dekat peran, sejarah, visi-misi, struktur kepengurusan, serta kontribusi nyata Bank Sampah “Persatuan” (Kreasi 308) dalam mereduksi sampah dan memperkuat kepedulian lingkungan warga Kp. Curug RW 08.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <Leaf className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* Latar Belakang & Sejarah */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Authentic Logo Card */}
          <div className="lg:col-span-4 flex flex-col items-center text-center p-6 bg-gradient-to-b from-emerald-50 to-emerald-100/60 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl border border-emerald-200 dark:border-neutral-700">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.12.54_f474b6b5.jpeg"
              alt="Logo Resmi Bank Sampah Persatuan - Kreasi 308"
              referrerPolicy="no-referrer"
              className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-full shadow-lg border-4 border-amber-400 bg-neutral-950"
            />
            <h3 className="text-xl font-black text-neutral-900 dark:text-white mt-4 tracking-tight">
              KREASI 308
            </h3>
            <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 mt-1 uppercase tracking-wider">
              Wadah Kreativitas Dari Barang Bekas
            </p>
            <div className="mt-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Kp. Curug RT 003 / RW 08</span>
            </div>
          </div>

          {/* Sejarah Text */}
          <div className="lg:col-span-8 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
                Latar Belakang & Sejarah
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white text-balance">
                Lahir Dari Kepedulian Warga Menjaga Kebersihan Kp. Curug
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <p>
                {profile?.sejarah ||
                  'Sejarah berdirinya Bank Sampah Persatuan bermula dari keprihatinan para tokoh masyarakat dan warga terhadap timbulan sampah yang terus meningkat dan belum terkelola optimal di wilayah Kp. Curug RW 08, Kelurahan Pondok Kelapa, Duren Sawit, Jakarta Timur.'}
              </p>
              <p>
                Melihat potensi besar barang bekas yang terbuang sia-sia, pengurus berinisiatif mendirikan <strong>Bank Sampah “Persatuan”</strong> sekaligus wadah kreasi warga bernama <strong>KREASI 308 (Wadah Kreativitas Dari Barang Bekas)</strong>. Tujuannya adalah membantu mengurangi sampah organik dan anorganik dari sumbernya (rumah tangga), serta mengolahnya menjadi produk kerajinan yang memiliki nilai jual sebagai Usaha Peningkatan Pendapatan Keluarga (UP2K).
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 space-y-1.5">
                <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Landasan Hukum & Legalitas Pemerintah:</span>
                </p>
                <p>
                  Awal mula berdiri, Bank Sampah Persatuan disahkan melalui <strong>Surat Keputusan (SK) Lurah Pondok Kelapa Nomor: 175 Tahun 2019</strong>. Seiring berkembangnya operasional dan cakupan layanan, SK ini diperbaharui secara resmi menjadi <strong>SK Lurah Pondok Kelapa Nomor: 184 Tahun 2025</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi, Misi & Tujuan */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
            Arah & Landasan Gerak
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white text-balance">
            Visi, Misi, dan Tujuan Organisasi
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Prinsip pokok yang menjadi panduan operasional Bank Sampah Persatuan dalam mengabdi kepada masyarakat dan lingkungan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Visi */}
          <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Visi Kami</h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {profile?.visi ||
                'Mewujudkan lingkungan RW 08 yang bersih, hijau, sehat, dan mandiri secara ekonomi melalui pengelolaan sampah terpadu berbasis peran aktif masyarakat.'}
            </p>
          </div>

          {/* Misi */}
          <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Misi Kami</h3>
            <ul className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 space-y-2 leading-relaxed">
              {(
                profile?.misi || [
                  'Membangun kesadaran warga dalam memilah sampah dari sumbernya.',
                  'Mengembangkan program daur ulang anorganik dan pengolahan kompos organik.',
                  'Memberdayakan ekonomi keluarga melalui program UP2K Kreasi 308.'
                ]
              ).map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tujuan */}
          <div className="bg-white dark:bg-neutral-900 p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Tujuan Utama</h3>
            <ul className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 space-y-2 leading-relaxed">
              {(
                (profile as any)?.tujuan || [
                  'Mengurangi volume sampah ke TPA Bantar Gebang.',
                  'Memberikan nilai ekonomi langsung dari penjualan sampah terpilah warga.',
                  'Menjadi wadah inovasi kerajinan barang bekas bernilai jual tinggi.'
                ]
              ).map((t: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BAGAN STRUKTUR ORGANISASI RESMI (Bentuk Bagan Hierarki / Gambar Unggahan Admin) */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors space-y-8">
        {/* Header + Team Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-2">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
              Struktur Organisasi · SK Lurah Pondok Kelapa No. 184 Tahun 2025
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white text-balance">
              Bagan Struktur Kepengurusan Bank Sampah Persatuan
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Susunan hierarki kepengurusan resmi Bank Sampah Persatuan RW 08 Kp. Curug sesuai dokumen profil resmi organisasi.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm aspect-[16/10] bg-neutral-900">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_16.11.21_1__9f523dc2.jpeg"
                alt="Pengurus Resmi Bank Sampah Persatuan KREASI 308"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 text-center flex items-center justify-center gap-1">
              <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Foto Pengurus & Relawan Bank Sampah Persatuan RW 08</span>
            </p>
          </div>
        </div>

        {/* Bagan Diagram Area */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
          {profile?.orgChartImageUrl ? (
            /* Custom Uploaded Bagan Image from Admin */
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setZoomOrgChart(true)}
                className="group relative w-full rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-center cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <img
                  src={profile.orgChartImageUrl}
                  alt="Bagan Struktur Kepengurusan Bank Sampah Persatuan"
                  referrerPolicy="no-referrer"
                  className="max-h-[640px] w-auto object-contain rounded-xl"
                />
                <span className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/85 text-white text-xs font-semibold shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Perbesar Bagan</span>
                </span>
              </button>
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Klik gambar bagan untuk melihat ukuran penuh.
              </p>
            </div>
          ) : (
            /* Official Hierarchical Organizational Chart Diagram (Tree with Connectors) */
            <div className="rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 overflow-x-auto">
              <div className="min-w-[680px] max-w-4xl mx-auto flex flex-col items-center">
                {/* Chart Header Banner */}
                <div className="text-center mb-8">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    Bagan Kepengurusan Resmi
                  </p>
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    BANK SAMPAH “PERSATUAN” · KREASI 308 (RW 08 PONDOK KELAPA)
                  </h3>
                </div>

                {/* LEVEL 1: KETUA */}
                {ketua && (
                  <div className="flex flex-col items-center">
                    <div className="w-64 rounded-2xl bg-emerald-800 text-white border-2 border-emerald-600 shadow-md overflow-hidden text-center">
                      <div className="px-4 py-1.5 bg-emerald-900/70 border-b border-emerald-700 text-[11px] font-bold uppercase tracking-widest text-emerald-200">
                        {ketua.jabatan}
                      </div>
                      <div className="px-4 py-3.5">
                        {ketua.nama.map((n, i) => (
                          <p key={i} className="text-base font-extrabold tracking-tight">
                            {n}
                          </p>
                        ))}
                      </div>
                    </div>
                    {/* Vertical Stem Down from Ketua */}
                    <div className="w-0.5 h-8 bg-emerald-600/70 dark:bg-emerald-500/60" />
                  </div>
                )}

                {/* LEVEL 2: SEKRETARIS & BENDAHARA */}
                {(sekretaris || bendahara) && (
                  <div className="w-full max-w-2xl flex flex-col items-center">
                    {/* Horizontal Connector Bar spanning Sekretaris & Bendahara */}
                    <div className="relative w-full grid grid-cols-2 gap-8">
                      <div
                        className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-emerald-600/70 dark:bg-emerald-500/60"
                        aria-hidden="true"
                      />
                      {/* Center vertical line continuing down to Level 3 */}
                      <div
                        className="absolute top-0 bottom-[-32px] left-1/2 -translate-x-1/2 w-0.5 bg-emerald-600/70 dark:bg-emerald-500/60"
                        aria-hidden="true"
                      />

                      {[sekretaris, bendahara].filter(Boolean).map((role, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-0.5 h-6 bg-emerald-600/70 dark:bg-emerald-500/60" />
                          <div className="w-full max-w-[260px] rounded-xl bg-white dark:bg-neutral-900 border-2 border-emerald-500/50 dark:border-emerald-700 shadow-xs overflow-hidden text-center">
                            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/70 border-b border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                              {role!.jabatan}
                            </div>
                            <div className="px-4 py-3 space-y-1">
                              {role!.nama.map((n, i) => (
                                <p
                                  key={i}
                                  className="text-sm font-bold text-neutral-900 dark:text-white"
                                >
                                  {i + 1}. {n}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Spacer matching vertical stem down to Level 3 */}
                    <div className="h-8" />
                  </div>
                )}

                {/* LEVEL 3: HUMAS, PELAKSANA, PEMILAH */}
                {fallbackBidang.length > 0 && (
                  <div className="w-full relative grid grid-cols-3 gap-6">
                    {/* Horizontal Connector Bar spanning across 3 columns (16.66% to 83.33%) */}
                    <div
                      className="absolute top-0 left-[16.666%] right-[16.666%] h-0.5 bg-emerald-600/70 dark:bg-emerald-500/60"
                      aria-hidden="true"
                    />

                    {fallbackBidang.map((role, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-emerald-600/70 dark:bg-emerald-500/60" />
                        <div className="w-full rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xs overflow-hidden text-center">
                          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
                            {role.jabatan}
                          </div>
                          <div className="px-4 py-3 space-y-1.5">
                            {role.nama.map((n, i) => (
                              <p
                                key={i}
                                className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white"
                              >
                                {i + 1}. {n}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SOP Operasional Tabbed Section */}
      <section className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-3xl mb-8 space-y-2">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
            Standar Prosedur
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white text-balance">
            Standar Operasional Prosedur (SOP)
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Ketentuan baku penimbangan, pencatatan, operasional harian, dan mekanisme penyetoran sampah di Bank Sampah Persatuan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SOP Tabs */}
          <div className="lg:col-span-4 space-y-2">
            {sopList.map((item) => (
              <button
                key={item.nomor}
                onClick={() => setActiveSopTab(item.nomor)}
                className={`w-full text-left p-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                  activeSopTab === item.nomor
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      activeSopTab === item.nomor
                        ? 'bg-white text-emerald-800'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {item.nomor}
                  </span>
                  <span className="truncate">{item.judul}</span>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-70" />
              </button>
            ))}
          </div>

          {/* SOP Detail View */}
          <div className="lg:col-span-8">
            {sopList
              .filter((s) => s.nomor === activeSopTab)
              .map((item) => (
                <div
                  key={item.nomor}
                  className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xs space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700 pb-4">
                    <span className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                      {item.nomor}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        Standar Operasional Prosedur Resmi
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                        {item.judul}
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {item.poin.map((p, pIdx) => (
                      <li
                        key={pIdx}
                        className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Org Chart Image Lightbox Modal */}
      {zoomOrgChart && profile?.orgChartImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
          onClick={() => setZoomOrgChart(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Bagan Struktur Organisasi"
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
                Bagan Struktur Kepengurusan Bank Sampah Persatuan
              </h3>
              <button
                type="button"
                onClick={() => setZoomOrgChart(false)}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                aria-label="Tutup pratinjau bagan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
              <img
                src={profile.orgChartImageUrl}
                alt="Bagan Struktur Kepengurusan Bank Sampah Persatuan"
                referrerPolicy="no-referrer"
                className="max-h-[78vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
