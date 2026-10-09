'use client';

import React from 'react';
import { useAdmin } from '@/lib/store';
import { 
  Search, 
  Camera, 
  MapPin, 
  Target
} from 'lucide-react';

export function AiInsightsView() {
  const { t, aiQueries, aiScans } = useAdmin();

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
                  {zeroResultQueries.length} Unmet Opportunities
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-900/80 leading-relaxed">
                Shoppers in Kurdistan are actively asking the AI assistant for these products, but no local merchants have listed them yet. Reach out to bazaar merchants in these cities!
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {zeroResultQueries.map(q => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs shadow-xs"
                  >
                    <span className="font-bold text-[#171717]">{q.query_text}</span>
                    <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {q.user_city}
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
              {aiQueries.length} Total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {aiQueries.map(query => (
              <div
                key={query.id}
                className="rounded-xl border border-[#EAE7DF] p-3 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-[#171717] leading-relaxed">
                    &quot;{query.query_text}&quot;
                  </p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    query.status === 'converted' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : query.status === 'zero_results'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {query.status}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-[#737373]">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3 w-3 text-[#657A52]" />
                    {query.user_city}
                  </span>
                  <span>{query.matched_products_count} matched results</span>
                </div>
              </div>
            ))}
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
              {aiScans.length} Scans
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {aiScans.map(scan => (
              <div
                key={scan.id}
                className="flex items-start gap-3 rounded-xl border border-[#EAE7DF] p-3 hover:bg-[#FAF9F6] transition-colors"
              >
                <img
                  src={scan.scan_image_url}
                  alt="Scanned Item"
                  className="h-16 w-16 shrink-0 rounded-xl object-cover border border-[#EAE7DF]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {Math.round(scan.match_confidence * 100)}% Match
                    </span>
                    <span className="text-[10px] text-[#737373]">Mobile Scan</span>
                  </div>

                  <h4 className="mt-1 text-xs font-bold text-[#171717] line-clamp-1">
                    {scan.matched_product_name}
                  </h4>
                  <p className="text-[11px] text-[#657A52] font-semibold">
                    {scan.matched_seller_name}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-1">
                    {scan.detected_labels.map((lbl, idx) => (
                      <span key={idx} className="rounded bg-[#FAF9F6] border border-[#EAE7DF] px-1.5 py-0.2 text-[9px] text-[#737373]">
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
