'use client';

import React from 'react';
import { useAdmin, AdminView } from '@/lib/store';
import { Activity, Store, Package, Clock } from 'lucide-react';
import { getLocalizedCity, getLocalizedField } from '@/lib/translator';
import { adminPanelTranslations, translateAdminStatus } from '@/lib/adminPanelTranslations';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  meta: string;
  time: string;
  timestamp: number;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  actionView: AdminView;
}

export function RecentActivity() {
  const { t, language, sellers, products, setCurrentView } = useAdmin();
  const copy = adminPanelTranslations[language];

  const formatTimestamp = (timestamp: string) =>
    new Intl.DateTimeFormat(language === 'en' ? 'en' : language === 'ar' ? 'ar' : 'ckb', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));

  const recentSellers = [...sellers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map((seller): ActivityItem => ({
      id: `seller-${seller.id}`,
      type: 'seller',
      title: getLocalizedField(seller, 'name', language) || copy.recentSellerFallback,
      meta: `${getLocalizedCity(seller.city, language)} · ${translateAdminStatus(seller.verification_status, copy)}`,
      time: formatTimestamp(seller.created_at),
      timestamp: new Date(seller.created_at).getTime(),
      icon: <Store className="h-4 w-4 text-[#657A52]" />,
      badge: copy.sellerRegisteredBadge,
      badgeColor: 'bg-[#657A52]/10 text-[#657A52]',
      actionView: 'sellers',
    }));

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map((product): ActivityItem => ({
      id: `product-${product.id}`,
      type: 'product',
      title: getLocalizedField(product, 'name', language) || copy.recentProductFallback,
      meta: `${copy.statusPrefix}: ${translateAdminStatus(product.status, copy)}`,
      time: formatTimestamp(product.created_at),
      timestamp: new Date(product.created_at).getTime(),
      icon: <Package className="h-4 w-4 text-emerald-600" />,
      badge: copy.marketplaceProductBadge,
      badgeColor: 'bg-emerald-50 text-emerald-700',
      actionView: 'products',
    }));

  const activities = [...recentSellers, ...recentProducts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  return (
    <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717]/5 text-[#171717]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#171717]">{t.recentActivityTitle}</h3>
            <p className="text-[11px] text-[#737373]">{t.recentActivitySubtitle}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 divide-y divide-[#EAE7DF]">
        {activities.map(act => (
          <div
            key={act.id}
            onClick={() => setCurrentView(act.actionView)}
            className="group flex cursor-pointer items-start justify-between py-3.5 transition-colors hover:bg-[#FAF9F6] px-2 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#EAE7DF] bg-white shadow-xs">
                {act.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#737373]">
                    <Clock className="h-3 w-3" />
                    {act.time}
                  </span>
                </div>
                <h4 className="mt-1 text-xs font-bold text-[#171717] group-hover:text-[#657A52] transition-colors line-clamp-1">
                  {act.title}
                </h4>
                <p className="text-[11px] text-[#737373]">{act.meta}</p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-[#737373] group-hover:text-[#657A52] rtl:rotate-180">
              →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
