import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { PublicStats, WasteType, OrganizationProfile, SOPItem, TokoProduct } from '../types';
import { 
  Menu, 
  X
} from 'lucide-react';
import { BerandaSection } from '../components/public/BerandaSection';
import { ProfilSection } from '../components/public/ProfilSection';
import { EdukasiSection } from '../components/public/EdukasiSection';
import { TokoSection } from '../components/public/TokoSection';
import { KontakSection } from '../components/public/KontakSection';
import { ThemeToggle } from '../components/ThemeToggle';

export type PublicMenu = 'beranda' | 'profil' | 'edukasi' | 'toko' | 'kontak';

export const PublicLanding: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<PublicMenu>('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [sopList, setSopList] = useState<SOPItem[]>([]);
  const [products, setProducts] = useState<TokoProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const statsData = await api.getPublicStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, wasteData, profileData, sopData, productsData] = await Promise.all([
          api.getPublicStats(),
          api.getPublicWasteTypes(),
          api.getPublicProfile(),
          api.getPublicSOP(),
          api.getPublicProducts()
        ]);
        setStats(statsData);
        setWasteTypes(wasteData);
        setProfile(profileData);
        setSopList(sopData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading public data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleNavigate = (menu: PublicMenu) => {
    setActiveMenu(menu);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: { id: PublicMenu; label: string }[] = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'profil', label: 'PROFIL' },
    { id: 'edukasi', label: 'EDUKASI' },
    { id: 'toko', label: 'TOKO' },
    { id: 'kontak', label: 'KONTAK' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-emerald-500 selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Wordmark */}
          <button 
            onClick={() => handleNavigate('beranda')}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <img 
              src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.12.54_f474b6b5.jpeg" 
              alt="Logo Resmi Bank Sampah Persatuan - Kreasi 308" 
              className="w-10 h-10 object-contain rounded-full shadow-xs border border-amber-400 bg-neutral-900 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="leading-tight text-neutral-900 dark:text-white font-extrabold text-sm sm:text-base">
                Bank Sampah “Persatuan”
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                WMUS · KREASI 308 · RW 08 PONDOK KELAPA
              </span>
            </div>
          </button>

          {/* Desktop 5 Menus */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/80 dark:bg-neutral-800/80 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeMenu === item.id
                    ? 'bg-white dark:bg-neutral-900 text-emerald-800 dark:text-emerald-400 shadow-xs border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Dark Mode Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                  activeMenu === item.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{item.label}</span>
                {activeMenu === item.id && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Dynamic View Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {activeMenu === 'beranda' && (
          <BerandaSection 
            stats={stats} 
            wasteTypes={wasteTypes}
            loading={loading} 
            onNavigate={handleNavigate} 
            onSaleRecorded={refreshStats}
          />
        )}

        {activeMenu === 'profil' && (
          <ProfilSection 
            profile={profile} 
            sopList={sopList} 
          />
        )}

        {activeMenu === 'edukasi' && (
          <EdukasiSection />
        )}

        {activeMenu === 'toko' && (
          <TokoSection 
            products={products}
            loadingProducts={loading}
          />
        )}

        {activeMenu === 'kontak' && (
          <KontakSection />
        )}
      </main>

      {/* Unified Footer */}
      <footer className="mt-16 bg-neutral-900 text-white border-t border-neutral-800">
        {/* Footer Navigation & Credentials */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.12.54_f474b6b5.jpeg" 
                  alt="Logo Bank Sampah Persatuan - Kreasi 308" 
                  className="w-10 h-10 object-contain rounded-full border border-amber-400 bg-neutral-900"
                />
                <div>
                  <span className="text-sm font-bold text-white block leading-tight">
                    Bank Sampah “Persatuan”
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wider">
                    KREASI 308 · PONDOK KELAPA
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Waste Management Unity System (WMUS) — Platform terpadu pengelolaan nasabah, setoran digital, sirkular ekonomi, dan produk daur ulang warga RW 08 Kp. Curug.
              </p>
              <div className="text-[11px] text-neutral-500 space-y-0.5">
                <p>Legalitas: SK Lurah No. 184 Thn 2025</p>
                <p>Kecamatan: Duren Sawit, Jakarta Timur</p>
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Navigasi Menu
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      className={`hover:text-emerald-400 transition-colors ${activeMenu === item.id ? 'text-emerald-400 font-bold' : ''}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Operasional */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Jadwal & Layanan
              </h4>
              <div className="space-y-2 text-xs text-neutral-400">
                <p><strong className="text-white">Penyetoran Warga:</strong><br />Setiap Hari (09.00 - 15.00 WIB)</p>
                <p><strong className="text-white">Hari Pemilahan Sampah:</strong><br />Kamis (13.00 WIB s/d selesai)</p>
                <p><strong className="text-white">Wilayah Layanan:</strong><br />RT 001 s/d RT 016 RW 08</p>
              </div>
            </div>

            {/* Kontak & Sekretariat */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Sekretariat & Kontak
              </h4>
              <div className="space-y-1.5 text-xs text-neutral-400">
                <p>Kp. Curug RW 08 Gang Persatuan No. 50, Pondok Kelapa</p>
                <p className="font-mono text-emerald-400">WA: 0857-7543-7617</p>
                <p className="font-mono text-neutral-400">curugraya308@gmail.com</p>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
            <p>© {new Date().getFullYear()} Bank Sampah “Persatuan” (Kreasi 308). Kelurahan Pondok Kelapa, Duren Sawit, Jakarta Timur.</p>
            <p className="text-neutral-500">Waste Management Unity System (WMUS)</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
