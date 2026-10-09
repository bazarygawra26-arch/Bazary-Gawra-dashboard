'use client';

import React from 'react';
import { useAdmin, AdminView } from '@/lib/store';
import { 
  Activity, 
  Store, 
  Package, 
  Search, 
  Camera, 
  Clock
} from 'lucide-react';
import { getLocalizedCity, getLocalizedWarranty, getLocalizedField } from '@/lib/translator';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  meta: string;
  time: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  actionView: AdminView;
}

export function RecentActivity() {
  const { t, language, sellers, products, aiQueries, aiScans, setCurrentView } = useAdmin();

  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'ai_search',
      title: aiQueries[0]?.query_text || 'گەڕانی دەنگی بۆ چایەدەنی لە سلێمانی',
      meta: `${aiQueries[0]?.user_city || 'سلێمانی'} · ${aiQueries[0]?.matched_products_count || 6} کاڵا دۆزرایەوە`,
      time: `12 ${t.minsAgo}`,
      icon: <Search className="h-4 w-4 text-indigo-600" />,
      badge: 'گەڕانی کڕیار بە AI',
      badgeColor: 'bg-indigo-50 text-indigo-700',
      actionView: 'ai-insights',
    },
    {
      id: 'act-2',
      type: 'scan',
      title: `${aiScans[0]?.matched_product_name || 'سکانی وێنەیی کاڵا'} (${Math.round((aiScans[0]?.match_confidence || 0.95) * 100)}٪ هاوتاکراو)`,
      meta: `هاوتاکرا لەگەڵ ${aiScans[0]?.matched_seller_name || 'دووکانی کاک ئەحمەد'}`,
      time: `25 ${t.minsAgo}`,
      icon: <Camera className="h-4 w-4 text-[#F4B942]" />,
      badge: 'سکانی کامێرا',
      badgeColor: 'bg-amber-50 text-amber-700',
      actionView: 'ai-insights',
    },
    {
      id: 'act-3',
      type: 'seller',
      title: `${getLocalizedField(sellers[sellers.length - 1], 'name', language) || 'فرۆشگای کارۆ'} خۆی تۆمارکرد لە ${getLocalizedCity(sellers[sellers.length - 1]?.city, language)}`,
      meta: `${sellers[sellers.length - 1]?.bazaar_name || 'شەقامی مەولەوی'} · چاوەڕوانی پەسەندکردن`,
      time: `1 ${t.hoursAgo}`,
      icon: <Store className="h-4 w-4 text-[#657A52]" />,
      badge: 'تۆمارکردنی فرۆشیار',
      badgeColor: 'bg-[#657A52]/10 text-[#657A52]',
      actionView: 'sellers',
    },
    {
      id: 'act-4',
      type: 'product',
      title: products[0] ? getLocalizedField(products[0], 'name', language) : 'نوێکردنەوەی کاڵا',
      meta: `${getLocalizedWarranty(products[0]?.warranty_period, products[0]?.warranty_type, language)} · نمرەی متمانە ${products[0]?.transparency_score || 95}٪`,
      time: `2 ${t.hoursAgo}`,
      icon: <Package className="h-4 w-4 text-emerald-600" />,
      badge: 'نوێکردنەوەی کاڵا',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      actionView: 'products',
    },
  ];

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
