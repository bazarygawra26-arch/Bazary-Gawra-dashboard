'use client';

import React from 'react';
import { useAdmin, AdminView } from '@/lib/store';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Sparkles, 
  MapPin, 
  ShieldCheck
} from 'lucide-react';

export function Sidebar() {
  const { currentView, setCurrentView, t, sellers, products } = useAdmin();

  const pendingSellersCount = sellers.filter(s => s.verification_status === 'pending').length;
  const missingSignalCount = products.filter(p => p.transparency_score < 70).length;

  const navItems: { id: AdminView; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: t.navOverview,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'sellers',
      label: t.navSellers,
      icon: <Store className="h-5 w-5" />,
      badge: pendingSellersCount > 0 ? pendingSellersCount : undefined,
      badgeColor: 'bg-[#F4B942] text-[#171717]',
    },
    {
      id: 'products',
      label: t.navProducts,
      icon: <Package className="h-5 w-5" />,
      badge: missingSignalCount > 0 ? missingSignalCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300',
    },
    {
      id: 'ai-insights',
      label: t.navAiInsights,
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      id: 'taxonomy',
      label: t.navTaxonomy,
      icon: <MapPin className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-e border-[#EAE7DF] bg-[#FFFFFF] p-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-[#EAE7DF]">
            <img
              src="/logo.png"
              alt="Bazary Gawra Logo"
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-[#171717] truncate">
                {t.appName}
              </h1>
              <span className="shrink-0 rounded bg-[#657A52]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#657A52]">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#737373] truncate">{t.adminPortal}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#657A52] text-white shadow-sm shadow-[#657A52]/25 font-bold'
                    : 'text-[#737373] hover:bg-[#FAF9F6] hover:text-[#171717]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-[#737373] group-hover:text-[#171717]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#657A52]" />
          <span className="text-xs font-bold text-[#171717]">ئامرازی متمانەی کوردستان</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[#737373]">
          پشکنینی ڕوونی ئەنجامدراوی بازاڕەکانی سلێمانی، هەولێر، دهۆک و هەڵەبجە.
        </p>
        <div className="mt-2.5 flex items-center justify-between border-t border-[#EAE7DF] pt-2 text-[10px] font-medium text-[#737373]">
          <span>v2.4.0</span>
          <span className="flex items-center gap-1 text-[#657A52] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#657A52]"></span>
            چالاک
          </span>
        </div>
      </div>
    </aside>
  );
}
