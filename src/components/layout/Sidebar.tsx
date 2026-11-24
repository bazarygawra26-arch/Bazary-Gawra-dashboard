'use client';

import React from 'react';
import { useAdmin, AdminView } from '@/lib/store';
import { adminPanelTranslations } from '@/lib/adminPanelTranslations';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Sparkles, 
  MapPin, 
  ShieldCheck,
  Users,
  ShoppingCart,
  ClipboardList,
  Bell,
  Headphones,
  ScrollText,
  Building2,
  ClipboardCheck,
  ChevronDown,
  Settings,
  CreditCard,
  Languages,
} from 'lucide-react';

export function Sidebar() {
  const { currentView, setCurrentView, language, t, sellers, products } = useAdmin();
  const copy = adminPanelTranslations[language];

  const pendingSellersCount = sellers.filter(s => s.verification_status === 'pending').length;
  const missingSignalCount = products.filter(p => p.transparency_score < 70).length;

  const navGroups: { id: string; label: string; items: { id: AdminView; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] }[] = [
    {
      id: 'dashboard',
      label: copy.groupDashboard,
      items: [{ id: 'overview', label: t.navOverview, icon: <LayoutDashboard className="h-5 w-5" /> }],
    },
    {
      id: 'businesses',
      label: copy.groupAccounts,
      items: [
        { id: 'users', label: copy.navUsers, icon: <Users className="h-5 w-5" /> },
        {
          id: 'sellers',
          label: copy.navSellerDirectory,
          icon: <Store className="h-5 w-5" />,
          badge: pendingSellersCount || undefined,
          badgeColor: 'bg-[#F4B83F] text-[#202820]',
        },
        {
          id: 'stores',
          label: copy.navSellerApplications,
          icon: <ClipboardCheck className="h-5 w-5" />,
        },
        { id: 'suppliers', label: copy.navSuppliersFactories, icon: <Building2 className="h-5 w-5" /> },
      ],
    },
    {
      id: 'marketplace',
      label: copy.groupMarketplace,
      items: [
        {
          id: 'products',
          label: t.navProducts,
          icon: <Package className="h-5 w-5" />,
          badge: missingSignalCount || undefined,
          badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300',
        },
        { id: 'taxonomy', label: t.navTaxonomy, icon: <MapPin className="h-5 w-5" /> },
        { 
          id: 'translations', 
          label: language === 'ku' ? 'زاراوە و وەرگێڕان' : language === 'ar' ? 'المصطلحات والترجمة' : 'Glossary & Translations', 
          icon: <Languages className="h-5 w-5" /> 
        },
      ],
    },
    {
      id: 'trade',
      label: copy.groupTrade,
      items: [
        { id: 'orders', label: copy.navB2cOrders, icon: <ShoppingCart className="h-5 w-5" /> },
        { id: 'rfqs', label: copy.navRfqs, icon: <ClipboardList className="h-5 w-5" /> },
        { id: 'quotations', label: copy.navQuotations, icon: <ClipboardList className="h-5 w-5" /> },
        { id: 'purchase-orders', label: copy.navPurchaseOrders, icon: <ClipboardCheck className="h-5 w-5" /> },
        { 
          id: 'subscriptions', 
          label: language === 'ku' ? 'بەشداریکردن و داهات' : language === 'ar' ? 'الاشتراكات والإيرادات' : 'Subscriptions & Revenue', 
          icon: <CreditCard className="h-5 w-5" /> 
        },
      ],
    },
    {
      id: 'oversight',
      label: copy.groupOversight,
      items: [
        { id: 'notifications', label: copy.navNotifications, icon: <Bell className="h-5 w-5" /> },
        { id: 'support', label: copy.navSupport, icon: <Headphones className="h-5 w-5" /> },
        { id: 'audit', label: copy.navAudit, icon: <ScrollText className="h-5 w-5" /> },
        { id: 'ai-insights', label: t.navAiInsights, icon: <Sparkles className="h-5 w-5" /> },
        { id: 'settings', label: copy.navSettings, icon: <Settings className="h-5 w-5" /> },
      ],
    },
  ];
  const usedViewIds = new Set<AdminView>();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-e border-[#EAE7DF] bg-[#FFFFFF] p-4 select-none">
      <div className="overflow-y-auto pr-1">
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
              <h1 className="font-extrabold text-base tracking-tight text-[#202820] truncate">
                {t.appName}
              </h1>
              <span className="shrink-0 rounded bg-[#18794E]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#18794E]">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#737373] truncate">{t.adminPortal}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav aria-label={copy.navigationLabel} className="mt-4 space-y-2">
          {navGroups.map((group) => {
            const items = group.items.filter(item => {
              if (usedViewIds.has(item.id)) return false;
              usedViewIds.add(item.id);
              return true;
            });
            const groupIsActive = items.some(item => item.id === currentView);

            return (
              <details key={group.id} open={groupIsActive || undefined} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#737373] hover:bg-[#FAF9F6] [&::-webkit-details-marker]:hidden">
                  <span>{group.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-1 space-y-1">
                  {items.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#18794E] text-white shadow-sm shadow-[#18794E]/25 font-bold'
                            : 'text-[#737373] hover:bg-[#FAF9F6] hover:text-[#202820]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={isActive ? 'text-white' : 'text-[#737373] group-hover:text-[#202820]'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3 mt-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#18794E]" />
          <span className="text-xs font-bold text-[#202820]">{copy.adminName}</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[#737373]">{copy.adminLocation}</p>
        <div className="mt-2 flex items-center justify-between border-t border-[#EAE7DF] pt-2 text-[10px] font-medium text-[#737373]">
          <span>v2.5.0-PRO</span>
          <span className="flex items-center gap-1 text-[#18794E] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#18794E]"></span>
            {copy.statusActive}
          </span>
        </div>
      </div>
    </aside>
  );
}
