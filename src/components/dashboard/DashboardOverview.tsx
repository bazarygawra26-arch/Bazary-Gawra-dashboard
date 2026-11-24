'use client';

import React from 'react';
import { useAdmin } from '@/lib/store';
import { ExecutiveKpis } from './ExecutiveKpis';
import { CityBreakdown } from './CityBreakdown';
import { CategoryHealth } from './CategoryHealth';
import { RecentActivity } from './RecentActivity';
import { 
  Plus, 
  Store, 
  ShieldAlert, 
  Download, 
  Sparkles
} from 'lucide-react';
import { downloadCsv } from '@/lib/utils';
import { adminPanelTranslations } from '@/lib/adminPanelTranslations';

interface DashboardOverviewProps {
  onOpenNewProduct: () => void;
  onOpenNewSeller: () => void;
}

export function DashboardOverview({ onOpenNewProduct, onOpenNewSeller }: DashboardOverviewProps) {
  const { t, language, products, setCurrentView } = useAdmin();
  const copy = adminPanelTranslations[language];

  const missingSignals = products.filter(p => p.transparency_score < 70);

  const handleQuickExport = () => {
    const rows = products.map(p => ({
      ID: p.id,
      Title: p.name_en,
      Price_IQD: p.price_iqd,
      Stock: p.stock_quantity,
      Warranty: p.warranty_period,
      TransparencyScore: p.transparency_score,
    }));
    downloadCsv('bazary_gawra_active_inventory', rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-[#202820]">
              {t.navOverview} — {t.appName}
            </h1>
            <span className="rounded-full bg-[#18794E]/10 px-2 py-0.5 text-[10px] font-bold text-[#18794E]">
              {copy.dashboardRegion}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#737373]">
            {t.appSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleQuickExport}
            className="flex items-center gap-1.5 rounded-xl border border-[#EAE7DF] bg-white px-3.5 py-2 text-xs font-bold text-[#202820] hover:bg-[#FAF9F6] shadow-xs transition-colors"
          >
            <Download className="h-4 w-4 text-[#737373]" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-1.5 rounded-xl bg-[#F4B83F] px-4 py-2 text-xs font-bold text-[#202820] hover:bg-[#e0a634] shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addProduct}</span>
          </button>

          <button
            onClick={onOpenNewSeller}
            className="flex items-center gap-1.5 rounded-xl bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#135f3d] shadow-sm transition-all active:scale-95"
          >
            <Store className="h-4 w-4" />
            <span>{t.addMerchant}</span>
          </button>
        </div>
      </div>

      {/* 1. Top Executive KPIs */}
      <ExecutiveKpis />

      {/* 2. Audit Notice if Missing Signals */}
      {missingSignals.length > 0 && (
        <div 
          onClick={() => setCurrentView('products')}
          className="group flex cursor-pointer items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/70 p-4 transition-all hover:bg-amber-50 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {t.auditAlertTitle}
              </h4>
              <p className="text-[11px] text-amber-800">
                {copy.dashboardAuditBody.replace('{count}', String(missingSignals.length))}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-900 group-hover:underline">
            {copy.reviewProducts} ←
          </span>
        </div>
      )}

      {/* 3. Middle Grid: City Breakdown & Category Inventory Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CityBreakdown />
        <CategoryHealth />
      </div>

      {/* 4. Bottom Grid: Recent Activity Stream & Market Intelligence Promo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* AI Assistant Quick Summary Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#171717]">{copy.dashboardAiTitle}</h3>
                <p className="text-[11px] text-[#737373]">{copy.dashboardAiSubtitle}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-[#EAE7DF] bg-[#FAF9F6] p-3 text-xs text-[#737373]">
              {copy.noLiveAiData}
            </div>
          </div>

          <button
            onClick={() => setCurrentView('ai-insights')}
            className="mt-4 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] py-2 text-xs font-bold text-[#171717] hover:bg-white transition-colors"
          >
            {t.aiInsightsTitle} ←
          </button>
        </div>
      </div>
    </div>
  );
}
