'use client';

import React from 'react';
import { useAdmin } from '@/lib/store';
import { 
  Apple, 
  UtensilsCrossed, 
  Tv, 
  Smartphone, 
  Sparkles, 
  BookOpen, 
  Layers,
  AlertCircle
} from 'lucide-react';

export function CategoryHealth() {
  const { t, language, products, categories, setCurrentView } = useAdmin();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple': return <Apple className="h-4 w-4 text-emerald-600" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="h-4 w-4 text-amber-600" />;
      case 'Tv': return <Tv className="h-4 w-4 text-blue-600" />;
      case 'Smartphone': return <Smartphone className="h-4 w-4 text-indigo-600" />;
      case 'Sparkles': return <Sparkles className="h-4 w-4 text-purple-600" />;
      case 'BookOpen': return <BookOpen className="h-4 w-4 text-amber-700" />;
      default: return <Layers className="h-4 w-4 text-[#737373]" />;
    }
  };

  const categoryStats = categories.map(cat => {
    const catProducts = products.filter(p => p.category_id === cat.id);
    const totalStock = catProducts.reduce((sum, p) => sum + p.stock_quantity, 0);
    const avgScore = catProducts.length > 0 
      ? Math.round(catProducts.reduce((sum, p) => sum + p.transparency_score, 0) / catProducts.length)
      : 0;

    return {
      ...cat,
      liveCount: catProducts.length,
      totalStock,
      avgScore,
      missingCount: catProducts.filter(p => p.transparency_score < 70).length,
    };
  });

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4B942]/10 text-[#F4B942]">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171717]">{t.categoryHealthTitle}</h3>
              <p className="text-[11px] text-[#737373]">{t.categoryHealthSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('products')}
            className="text-[11px] font-bold text-[#657A52] hover:underline"
          >
            {t.allProducts}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryStats.map(cat => (
            <div
              key={cat.id}
              onClick={() => setCurrentView('products')}
              className="group cursor-pointer rounded-xl border border-[#EAE7DF] p-3 transition-all hover:border-[#657A52] hover:bg-[#FAF9F6]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#EAE7DF] shadow-xs">
                    {getIcon(cat.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717] group-hover:text-[#657A52] transition-colors line-clamp-1">
                      {language === 'ku' ? cat.name_ku : language === 'ar' ? cat.name_ar : cat.name_en}
                    </h4>
                    <p className="text-[10px] text-[#737373]">
                      {cat.liveCount} {t.navProducts} ({cat.totalStock} {t.stockUnits})
                    </p>
                  </div>
                </div>

                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  cat.avgScore >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {cat.avgScore}%
                </span>
              </div>

              {cat.missingCount > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                  <AlertCircle className="h-3 w-3" />
                  <span>{cat.missingCount} listings need warranty audit</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
