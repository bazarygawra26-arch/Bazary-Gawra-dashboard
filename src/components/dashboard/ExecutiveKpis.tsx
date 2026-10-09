'use client';

import React from 'react';
import { useAdmin } from '@/lib/store';
import { Package, Store, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';

export function ExecutiveKpis() {
  const { t, products, sellers, aiQueries, aiScans } = useAdmin();

  // Computations
  const activeProducts = products.filter(p => p.status === 'active');
  const verifiedSellers = sellers.filter(s => s.verification_status === 'verified');
  const totalAiInteractions = aiQueries.length + aiScans.length;

  const avgTransparency = Math.round(
    products.reduce((acc, p) => acc + p.transparency_score, 0) / (products.length || 1)
  );

  const kpis = [
    {
      title: t.kpiTotalProducts,
      value: activeProducts.length.toLocaleString(),
      subtitle: t.kpiActiveProductsSubtitle,
      trend: '+14.2%',
      trendUp: true,
      icon: <Package className="h-5 w-5 text-[#F4B942]" />,
      bgColor: 'bg-[#F4B942]/10',
      borderColor: 'border-[#F4B942]/30',
      badge: 'سۆپابەیسی ڕاستەوخۆ',
    },
    {
      title: t.kpiVerifiedMerchants,
      value: `${verifiedSellers.length} / ${sellers.length}`,
      subtitle: `${Math.round((verifiedSellers.length / (sellers.length || 1)) * 100)}٪ فرۆشگای پەسەندکراو`,
      trend: '+8.5%',
      trendUp: true,
      icon: <Store className="h-5 w-5 text-[#657A52]" />,
      bgColor: 'bg-[#657A52]/10',
      borderColor: 'border-[#657A52]/30',
      badge: 'پشکنینی بازاڕ',
    },
    {
      title: t.kpiAiQueries,
      value: totalAiInteractions.toLocaleString(),
      subtitle: `${aiQueries.length} گەڕانی مەبەست · ${aiScans.length} سکانی وێنەیی`,
      trend: '+28.4%',
      trendUp: true,
      icon: <Sparkles className="h-5 w-5 text-indigo-600" />,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      badge: 'مۆتۆری زیرەک',
    },
    {
      title: t.kpiTransparencyScore,
      value: `${avgTransparency}%`,
      subtitle: t.kpiTransparencySubtitle,
      trend: avgTransparency >= 80 ? '+5.0%' : '-2.1%',
      trendUp: avgTransparency >= 80,
      icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: avgTransparency >= 80 ? 'متمانەی بەرز' : 'پێویستی بە وردبینییە',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="group relative flex flex-col justify-between rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs transition-all hover:border-[#D8D3C8] hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bgColor}`}>
                {kpi.icon}
              </div>
              <span className="rounded-full border border-[#EAE7DF] bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-bold text-[#737373]">
                {kpi.badge}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-[#737373]">{kpi.title}</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#171717]">
                {kpi.value}
              </h2>
              <p className="mt-1 text-[11px] text-[#737373] line-clamp-1">{kpi.subtitle}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#EAE7DF] pt-3 text-[11px]">
            <span className="text-[#737373]">{t.kpiVsLastMonth}</span>
            <div className={`flex items-center gap-0.5 font-bold ${kpi.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{kpi.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
