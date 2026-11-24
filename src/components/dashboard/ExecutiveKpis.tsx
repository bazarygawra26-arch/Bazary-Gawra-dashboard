'use client';

import React from 'react';
import { useAdmin, AnalyticsTimeRange } from '@/lib/store';
import { 
  Package, 
  Store, 
  Clock3, 
  ShieldCheck, 
  CreditCard, 
  TrendingUp, 
  ShoppingCart, 
  ClipboardList, 
  Sparkles, 
  RotateCcw,
  Coins,
  AlertCircle
} from 'lucide-react';
import { adminPanelTranslations } from '@/lib/adminPanelTranslations';
import { formatIqd } from '@/lib/utils';

export function ExecutiveKpis() {
  const { 
    t, 
    language, 
    products, 
    sellers, 
    orders, 
    rfqs, 
    quotations, 
    purchaseOrders,
    monetization,
    timeFilter,
    setTimeFilter,
    governorateFilter,
    setGovernorateFilter
  } = useAdmin();
  const copy = adminPanelTranslations[language];

  // Filtered by governorate if selected
  const activeGovernorate = governorateFilter === 'all' ? null : governorateFilter.toLowerCase();
  const filteredSellers = activeGovernorate 
    ? sellers.filter(s => s.city.toLowerCase().includes(activeGovernorate))
    : sellers;

  // Computations
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active');
  const pendingProducts = products.filter(p => p.status === 'draft');
  const outOfStockProducts = products.filter(p => p.stock_quantity <= 0);
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5);
  const sponsoredProducts = products.filter(p => Boolean(p.is_sponsored || p.is_promoted));

  const verifiedSellers = filteredSellers.filter(s => s.verification_status === 'verified');
  const pendingSellers = filteredSellers.filter(s => s.verification_status === 'pending');
  const suspendedSellers = filteredSellers.filter(s => s.verification_status === 'suspended');

  const avgTransparency = Math.round(
    products.reduce((acc, p) => acc + p.transparency_score, 0) / (products.length || 1)
  );

  // Operations
  const pendingOrders = orders.filter(o => o.status === 'submitted' || o.status === 'accepted');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const openRfqs = rfqs.filter(r => r.status === 'open' || r.status === 'submitted');
  const activePOs = purchaseOrders.filter(po => po.status === 'confirmed' || po.status === 'processing');

  const timeOptions: { id: AnalyticsTimeRange; label: string }[] = [
    { id: 'today', label: language === 'ku' ? 'ئەمڕۆ' : language === 'ar' ? 'اليوم' : 'Today' },
    { id: '7d', label: language === 'ku' ? '٧ ڕۆژ' : language === 'ar' ? '٧ أيام' : '7 Days' },
    { id: '30d', label: language === 'ku' ? '٣٠ ڕۆژ' : language === 'ar' ? '٣٠ يوماً' : '30 Days' },
    { id: '90d', label: language === 'ku' ? '٩٠ ڕۆژ' : language === 'ar' ? '٩٠ يوماً' : '90 Days' },
    { id: 'all', label: language === 'ku' ? 'هەموو کات' : language === 'ar' ? 'الكل' : 'All Time' },
  ];

  const govOptions = [
    { id: 'all', label: language === 'ku' ? 'هەموو پارێزگاکان' : language === 'ar' ? 'جميع المحافظات' : 'All Governorates' },
    { id: 'Sulaymaniyah', label: language === 'ku' ? 'سلێمانی' : language === 'ar' ? 'السليمانية' : 'Sulaymaniyah' },
    { id: 'Erbil', label: language === 'ku' ? 'هەولێر' : language === 'ar' ? 'أربيل' : 'Erbil' },
    { id: 'Duhok', label: language === 'ku' ? 'دهۆک' : language === 'ar' ? 'دهوك' : 'Duhok' },
    { id: 'Halabja', label: language === 'ku' ? 'هەڵەبجە' : language === 'ar' ? 'حلبجة' : 'Halabja' },
    { id: 'Kirkuk', label: language === 'ku' ? 'کەرکووک' : language === 'ar' ? 'كركوك' : 'Kirkuk' },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Control Filters (Part 3 BI requirement) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-[#EAE7DF] bg-white p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#737373] ps-1 pe-2 shrink-0">
            {language === 'ku' ? 'مەودای کات:' : language === 'ar' ? 'الفترة الزمنية:' : 'Reporting Period:'}
          </span>
          {timeOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setTimeFilter(opt.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                timeFilter === opt.id
                  ? 'bg-[#18794E] text-white shadow-xs'
                  : 'text-[#737373] hover:bg-[#FAF9F6] hover:text-[#202820]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-[#737373]">
            {language === 'ku' ? 'پارێزگا:' : language === 'ar' ? 'المحافظة:' : 'Region:'}
          </span>
          <select
            value={governorateFilter}
            onChange={e => setGovernorateFilter(e.target.value)}
            className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-1.5 text-xs font-bold text-[#202820] focus:border-[#18794E] focus:outline-hidden"
          >
            {govOptions.map(g => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. FINANCIAL & REALIZED MONETIZATION SECTION (Part 3 & Part 10) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#18794E]" />
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#202820]">
              {language === 'ku' ? 'داهاتی ڕاستەقینەی پلاتفۆرم و جوڵەی دارایی (IQD)' : language === 'ar' ? 'الإيرادات المحققة والحوكمة المالية (دينار)' : 'Realized Platform Monetization & Financial Governance'}
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-[#737373]">
            {language === 'ku' ? 'تەنها پارەدانە پشتڕاستکراوەکان (بێ دیمۆ)' : language === 'ar' ? 'المدفوعات المكتملة فقط بدون التجريبي' : 'Verified completed payments only (Excludes demo)'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Card 1: Net Platform Revenue */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-[#18794E]/10 p-2 text-[#18794E]">
                <TrendingUp className="h-4 w-4" />
              </span>
              {monetization.comparison?.netRevenueGrowth !== null && monetization.comparison?.netRevenueGrowth !== undefined ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  +{monetization.comparison.netRevenueGrowth}%
                </span>
              ) : (
                <span className="text-[9px] font-medium text-[#737373]">{language === 'ku' ? 'بنچینە' : 'Baseline'}</span>
              )}
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#737373]">
              {language === 'ku' ? 'داهاتی سافی پلاتفۆرم' : language === 'ar' ? 'صافي إيرادات المنصة' : 'Net Platform Revenue'}
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#18794E]">
              {formatIqd(monetization.netPlatformRevenue)}
            </p>
            <p className="mt-1 text-[10px] text-[#737373]">
              {language === 'ku' ? 'بەشداریکردن + دەرکەوتنی سپۆنسەر' : 'Subscriptions + Promotions - Refunds'}
            </p>
          </div>

          {/* Card 2: Subscriptions Revenue */}
          <div className="rounded-2xl border border-[#EAE7DF] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-[#F4B83F]/15 p-2 text-[#202820]">
                <CreditCard className="h-4 w-4 text-[#F4B83F]" />
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                10k IQD/mo
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#737373]">
              {language === 'ku' ? 'داهاتی بەشداریکردن' : language === 'ar' ? 'إيرادات الاشتراكات' : 'Subscription Revenue'}
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#202820]">
              {formatIqd(monetization.realizedSubscriptionRevenue)}
            </p>
            <p className="mt-1 text-[10px] text-[#737373]">
              {language === 'ku' ? 'پلانی بازرگانی پیشەگەر (Pro)' : 'Pro Merchant Paid Subscriptions'}
            </p>
          </div>

          {/* Card 3: Sponsored Listing Revenue */}
          <div className="rounded-2xl border border-[#EAE7DF] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-purple-50 p-2 text-purple-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                5k / 7d
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#737373]">
              {language === 'ku' ? 'داهاتی کاڵای سپۆنسەر' : language === 'ar' ? 'إعلانات المنتجات المميزة' : 'Sponsored Ads Revenue'}
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#202820]">
              {formatIqd(monetization.realizedSponsoredRevenue)}
            </p>
            <p className="mt-1 text-[10px] text-[#737373]">
              {language === 'ku' ? `${sponsoredProducts.length} کاڵای چالاککراو` : `${sponsoredProducts.length} Active promotions`}
            </p>
          </div>

          {/* Card 4: Refunds Issued */}
          <div className="rounded-2xl border border-[#EAE7DF] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-rose-50 p-2 text-rose-700">
                <RotateCcw className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                Audit Logged
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#737373]">
              {language === 'ku' ? 'پارەی گەڕاوە (Refunds)' : language === 'ar' ? 'المبالغ المستردة' : 'Refunds Issued'}
            </p>
            <p className="mt-1 text-xl font-extrabold text-rose-700">
              {formatIqd(monetization.refundsIssued)}
            </p>
            <p className="mt-1 text-[10px] text-[#737373]">
              {language === 'ku' ? 'داواکاری گەڕاندنەوەی پەسەندکراو' : 'Approved customer refunds'}
            </p>
          </div>

          {/* Card 5: B2C Orders GMV */}
          <div className="rounded-2xl border border-[#EAE7DF] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <ShoppingCart className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                GMV
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#737373]">
              {language === 'ku' ? 'کۆی بەهای داواکاری B2C' : language === 'ar' ? 'إجمالي طلبات التجزئة B2C' : 'B2C Orders Gross Value'}
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#202820]">
              {formatIqd(monetization.b2cOrderGross)}
            </p>
            <p className="mt-1 text-[10px] text-[#737373]">
              {orders.length} {language === 'ku' ? 'داواکاری تۆمارکراو' : 'recorded orders'}
            </p>
          </div>

          {/* Card 6: B2B Purchase Orders GMV */}
          <div className="rounded-2xl border border-[#EAE7DF] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <ClipboardList className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                B2B PO
              </span>
            </div>
            <p className="mt-3 text-[11px] font-semibold text-[#737373]">
              {language === 'ku' ? 'کۆی بەهای مامەڵەی B2B' : language === 'ar' ? 'إجمالي صفقات B2B' : 'B2B Trade Gross Value'}
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#202820]">
              {formatIqd(monetization.b2bPoGross)}
            </p>
            <p className="mt-1 text-[10px] text-[#737373]">
              {purchaseOrders.length} {language === 'ku' ? 'فەرمانی کڕین' : 'purchase orders'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. CATALOG & STORE HEALTH KPIS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Products KPI */}
        <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4B83F]/15">
              <Package className="h-5 w-5 text-[#202820]" />
            </div>
            <span className="rounded-full border border-[#EAE7DF] bg-[#FAF9F6] px-2 py-0.5 text-[10px] font-bold text-[#737373]">
              {pendingProducts.length} {copy.pendingCount}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#737373]">{t.kpiTotalProducts}</p>
            <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#202820]">
              {activeProducts.length.toLocaleString()}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#737373]">
              <span>{lowStockProducts.length} low stock</span>
              <span>·</span>
              <span className="text-rose-600 font-semibold">{outOfStockProducts.length} out of stock</span>
            </div>
          </div>
        </div>

        {/* Merchants KPI */}
        <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#18794E]/10">
              <Store className="h-5 w-5 text-[#18794E]" />
            </div>
            <span className="rounded-full bg-[#18794E]/10 px-2 py-0.5 text-[10px] font-bold text-[#18794E]">
              {Math.round((verifiedSellers.length / (filteredSellers.length || 1)) * 100)}% Verified
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#737373]">{t.kpiVerifiedMerchants}</p>
            <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-[#202820]">
              {verifiedSellers.length} / {filteredSellers.length}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#737373]">
              <span>{pendingSellers.length} pending review</span>
              {suspendedSellers.length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-rose-600">{suspendedSellers.length} suspended</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pending Applications KPI */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <Clock3 className="h-5 w-5 text-amber-800" />
            </div>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              Action Required
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-amber-900">{copy.pendingApprovalTitle}</p>
            <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-amber-950">
              {pendingSellers.length.toLocaleString()}
            </h3>
            <p className="mt-2 text-[11px] text-amber-800">
              {language === 'ku' ? 'داواکاری نوێی دووکانی بازاڕ' : 'Bazaar storefront applications'}
            </p>
          </div>
        </div>

        {/* Transparency Score KPI */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <ShieldCheck className="h-5 w-5 text-emerald-800" />
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
              {avgTransparency >= 80 ? 'High Trust' : 'Review Needed'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-emerald-900">{t.kpiTransparencyScore}</p>
            <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-emerald-950">
              {avgTransparency}%
            </h3>
            <p className="mt-2 text-[11px] text-emerald-800">
              {language === 'ku' ? 'پێوەری متمانەی گرەنتی و گەیاندن' : 'Warranty, delivery & return policy index'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
