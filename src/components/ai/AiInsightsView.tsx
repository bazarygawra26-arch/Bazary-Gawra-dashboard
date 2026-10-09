'use client';

import React from 'react';
import { useAdmin } from '@/lib/store';
import { 
  Search, 
  Camera, 
  MapPin, 
  Target
} from 'lucide-react';
import { getLocalizedCity, getLocalizedField } from '@/lib/translator';

export function AiInsightsView() {
  const { t, language, aiQueries, aiScans } = useAdmin();

  const zeroResultQueries = aiQueries.filter(q => q.status === 'zero_results');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#171717]">
          {t.aiInsightsTitle}
        </h1>
        <p className="mt-1 text-xs text-[#737373]">
          {t.aiInsightsSubtitle}
        </p>
      </div>

      {/* Demand Gap Banner (Zero-Result Searches) */}
      {zeroResultQueries.length > 0 && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-indigo-950">
                  {t.unmetDemandGap}
                </h3>
                <span className="rounded-full bg-indigo-200/80 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                  {zeroResultQueries.length} {language === 'ku' ? 'داواکاری بەردەستنەکراو' : language === 'ar' ? 'طلبات غير متوفرة' : 'Unmet Searches'}
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-900/80 leading-relaxed">
                {language === 'ku'
                  ? 'کڕیارانی کوردستان بەدوای ئەم کاڵایانەدا دەگەڕێن بەڵام هێشتا هیچ فرۆشیارێک لە بازاڕەکاندا داینەناون. دەتوانیت پەیوەندی بە فرۆشیارانی ئەم شارانەوە بکەیت.'
                  : language === 'ar'
                  ? 'المشترون في كوردستان يبحثون عن هذه المنتجات لكن لم يقم أي بائع بتوفيرها بعد.'
                  : 'High-intent buyer searches with zero catalog matches in Kurdistan bazaars.'}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {zeroResultQueries.map(q => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs shadow-xs"
                  >
                    <span className="font-bold text-[#171717]">
                      {getLocalizedField(q, 'query_text', language) || q.query_text}
                    </span>
                    <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {getLocalizedCity(q.user_city, language)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Live Searches vs Visual Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live AI Queries Feed */}
        <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-[#171717]">{t.liveAiSearches}</h3>
            </div>
            <span className="rounded-full bg-[#FAF9F6] px-2.5 py-0.5 text-[10px] font-bold text-[#737373]">
              {aiQueries.length} {language === 'ku' ? 'کۆی گشتی' : language === 'ar' ? 'الإجمالي' : 'Total'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {aiQueries.map(query => {
              const queryText = getLocalizedField(query, 'query_text', language) || query.query_text;
              const cityName = getLocalizedCity(query.user_city, language);

              return (
                <div
                  key={query.id}
                  className="rounded-xl border border-[#EAE7DF] p-3 hover:bg-[#FAF9F6] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#171717] leading-relaxed">
                      &quot;{queryText}&quot;
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      query.status === 'converted' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : query.status === 'zero_results'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {query.status === 'converted' 
                        ? (language === 'ku' ? 'کڕدراوە' : language === 'ar' ? 'تم الشراء' : 'Converted') 
                        : query.status === 'zero_results' 
                        ? (language === 'ku' ? 'بێ ئەنجام' : language === 'ar' ? 'بدون نتائج' : 'Zero Results') 
                        : (language === 'ku' ? 'هاوتاکراوە' : language === 'ar' ? 'متطابق' : 'Resolved')}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#737373]">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="h-3 w-3 text-[#657A52]" />
                      {cityName}
                    </span>
                    <span>
                      {query.matched_products_count} {language === 'ku' ? 'کاڵای دۆزراوە' : language === 'ar' ? 'منتج مطابق' : 'matched'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Camera Scans Feed */}
        <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#F4B942]" />
              <h3 className="text-sm font-bold text-[#171717]">{t.visualScans}</h3>
            </div>
            <span className="rounded-full bg-[#FAF9F6] px-2.5 py-0.5 text-[10px] font-bold text-[#737373]">
              {aiScans.length} {language === 'ku' ? 'سکان' : language === 'ar' ? 'مسح' : 'Scans'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {aiScans.map(scan => {
              const productName = getLocalizedField(scan, 'matched_product_name', language) || scan.matched_product_name;
              const sellerName = getLocalizedField(scan, 'matched_seller_name', language) || scan.matched_seller_name;
              const labels = (language === 'ku' && scan.detected_labels_ku)
                ? scan.detected_labels_ku
                : (language === 'ar' && scan.detected_labels_ar)
                ? scan.detected_labels_ar
                : scan.detected_labels;

              return (
                <div
                  key={scan.id}
                  className="flex items-start gap-3 rounded-xl border border-[#EAE7DF] p-3 hover:bg-[#FAF9F6] transition-colors"
                >
                  <img
                    src={scan.scan_image_url}
                    alt="Scanned Item"
                    className="h-16 w-16 shrink-0 rounded-xl object-cover border border-[#EAE7DF]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {Math.round(scan.match_confidence * 100)}٪ {language === 'ku' ? 'هاوتاکراوە' : language === 'ar' ? 'تطابق' : 'Match'}
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        {language === 'ku' ? 'سکانی مۆبایل' : language === 'ar' ? 'مسح هاتف' : 'Mobile Scan'}
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-bold text-[#171717] line-clamp-1">
                      {productName}
                    </h4>
                    <p className="text-[11px] text-[#657A52] font-semibold line-clamp-1">
                      {sellerName}
                    </p>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {labels.map((lbl, idx) => (
                        <span key={idx} className="rounded bg-[#FAF9F6] border border-[#EAE7DF] px-1.5 py-0.5 text-[9px] text-[#737373]">
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
