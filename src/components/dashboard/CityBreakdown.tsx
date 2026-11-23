'use client';

import React from 'react';
import { useAdmin } from '@/lib/store';
import { MapPin } from 'lucide-react';
import { KurdishCity } from '@/types/database';
import { adminPanelTranslations } from '@/lib/adminPanelTranslations';
import { getLocalizedCity } from '@/lib/translator';

export function CityBreakdown() {
  const { t, language, sellers, products, setCurrentView } = useAdmin();
  const copy = adminPanelTranslations[language];

  const citiesList: { id: KurdishCity; nameKu: string; nameAr: string; nameEn: string; color: string }[] = [
    { id: 'Sulaymaniyah', nameKu: 'سلێمانی', nameAr: 'السليمانية', nameEn: 'Sulaymaniyah', color: 'bg-[#657A52]' },
    { id: 'Erbil', nameKu: 'هەولێر', nameAr: 'أربيل', nameEn: 'Erbil', color: 'bg-[#F4B942]' },
    { id: 'Duhok', nameKu: 'دهۆک', nameAr: 'دهوك', nameEn: 'Duhok', color: 'bg-sky-600' },
    { id: 'Halabja', nameKu: 'هەڵەبجە', nameAr: 'حلبجة', nameEn: 'Halabja', color: 'bg-emerald-600' },
    { id: 'Kirkuk', nameKu: 'کەرکووک', nameAr: 'كركوك', nameEn: 'Kirkuk', color: 'bg-amber-700' },
  ];

  const totalSellersCount = sellers.length || 1;

  const cityData = citiesList.map(city => {
    const citySellers = sellers.filter(s => s.city === city.id);
    const sellerIds = new Set(citySellers.map(s => s.id));
    const cityProducts = products.filter(p => sellerIds.has(p.seller_id));
    const percentage = Math.round((citySellers.length / totalSellersCount) * 100);

    return {
      ...city,
      localizedName: getLocalizedCity(city.id, language),
      sellersCount: citySellers.length,
      productsCount: cityProducts.length,
      percentage,
      verifiedCount: citySellers.filter(s => s.verification_status === 'verified').length,
    };
  });

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#657A52]/10 text-[#657A52]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171717]">{t.cityDistributionTitle}</h3>
              <p className="text-[11px] text-[#737373]">{t.cityDistributionSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('taxonomy')}
            className="text-[11px] font-bold text-[#657A52] hover:underline"
          >
            {t.navTaxonomy}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {cityData.map(city => (
            <div key={city.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#171717]">
                  {city.localizedName}
                </span>
                <span className="font-semibold text-[#737373]">
                  {city.sellersCount} {copy.sellerCount} · {city.productsCount} {copy.productCount}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAF9F6] border border-[#EAE7DF]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${city.color}`}
                  style={{ width: `${Math.max(8, city.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3 text-start">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#171717]">{copy.mainBazaars}</span>
          <span className="text-[10px] font-bold text-[#657A52]">{copy.leadingSellerCities}</span>
        </div>
        <p className="mt-1 text-[11px] text-[#737373] leading-relaxed">
          {cityData
            .filter(city => city.sellersCount > 0)
            .sort((a, b) => b.sellersCount - a.sellersCount)
            .slice(0, 2)
            .map(city => `${city.localizedName}: ${city.sellersCount}`)
            .join(' · ') || copy.noSellerRecords}
        </p>
      </div>
    </div>
  );
}
