'use client';

import React from 'react';
import { useAdmin } from '@/lib/store';
import { 
  MapPin, 
  Layers, 
  Apple, 
  UtensilsCrossed, 
  Tv, 
  Smartphone, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';

export function TaxonomyView() {
  const { t, language, cities, categories, sellers, products } = useAdmin();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple': return <Apple className="h-5 w-5 text-emerald-600" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="h-5 w-5 text-amber-600" />;
      case 'Tv': return <Tv className="h-5 w-5 text-blue-600" />;
      case 'Smartphone': return <Smartphone className="h-5 w-5 text-indigo-600" />;
      case 'Sparkles': return <Sparkles className="h-5 w-5 text-purple-600" />;
      case 'BookOpen': return <BookOpen className="h-5 w-5 text-amber-700" />;
      default: return <Layers className="h-5 w-5 text-[#737373]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#171717]">
          {t.taxonomyTitle}
        </h1>
        <p className="mt-1 text-xs text-[#737373]">
          {t.taxonomySubtitle}
        </p>
      </div>

      {/* SECTION 1: Cities & Bazaars in Kurdistan */}
      <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#EAE7DF] pb-3">
          <MapPin className="h-5 w-5 text-[#657A52]" />
          <div>
            <h2 className="text-sm font-bold text-[#171717]">پارێزگاکانی کوردستان و بازاڕە مێژووییەکان</h2>
            <p className="text-[11px] text-[#737373]">ناوەندە چالاکە ناوخۆییەکان و بازاڕە پەسەندکراوەکان</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map(city => {
            const citySellers = sellers.filter(s => s.city === city.name_en);
            const verifiedCitySellers = citySellers.filter(s => s.verification_status === 'verified');

            return (
              <div
                key={city.id}
                className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171717]">
                      {language === 'ku' ? city.name_ku : language === 'ar' ? city.name_ar : city.name_en}
                    </h3>
                    <p className="text-[10px] text-[#737373]">{city.name_en}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {verifiedCitySellers.length} پەسەندکراو
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#737373]">
                    بازاڕە سەرەکییەکان:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {city.bazaars.map((bazaar, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-[#EAE7DF] bg-white px-2 py-0.5 text-[10px] font-medium text-[#171717]"
                      >
                        {bazaar}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#EAE7DF] pt-2 text-[11px] text-[#737373]">
                  <span>کۆی فرۆشیاران:</span>
                  <span className="font-bold text-[#171717]">{citySellers.length} فرۆشگا</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Marketplace Categories */}
      <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#EAE7DF] pb-3">
          <Layers className="h-5 w-5 text-[#F4B942]" />
          <div>
            <h2 className="text-sm font-bold text-[#171717]">پۆلەکانی بازاڕی گەورە</h2>
            <p className="text-[11px] text-[#737373]">پۆلێنکردنی ستاندارد لە سەرجەم پارێزگاکان</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => {
            const catProducts = products.filter(p => p.category_id === cat.id);

            return (
              <div
                key={cat.id}
                className="flex items-center gap-3.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE7DF] shadow-xs">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-extrabold text-[#171717]">
                    {language === 'ku' ? cat.name_ku : language === 'ar' ? cat.name_ar : cat.name_en}
                  </h3>
                  <p className="mt-1 text-[10px] font-bold text-[#657A52]">
                    {catProducts.length} کاڵای چالاک
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
