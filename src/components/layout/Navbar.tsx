'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { 
  Search, 
  Bell, 
  Plus, 
  AlertTriangle,
  Store,
  Package
} from 'lucide-react';

interface NavbarProps {
  onOpenNewProduct: () => void;
  onOpenNewSeller: () => void;
}

export function Navbar({ onOpenNewProduct, onOpenNewSeller }: NavbarProps) {
  const { 
    language, 
    setLanguage, 
    t, 
    searchQuery, 
    setSearchQuery, 
    isSupabaseLive, 
    sellers, 
    products, 
    setCurrentView 
  } = useAdmin();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const pendingSellers = sellers.filter(s => s.verification_status === 'pending');
  const missingSignalProducts = products.filter(p => p.transparency_score < 70);

  const totalAlerts = pendingSellers.length + (missingSignalProducts.length > 0 ? 1 : 0);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#EAE7DF] bg-[#FFFFFF]/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Search Bar */}
      <div className="flex flex-1 items-center max-w-xl">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] rtl:right-3.5 ltr:left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] py-2 text-sm text-[#171717] placeholder:text-[#737373] focus:border-[#F4B942] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4B942]/20 rtl:pl-4 rtl:pr-10 ltr:pl-10 ltr:pr-4"
          />
          <kbd className="hidden sm:inline-block absolute top-1/2 -translate-y-1/2 rounded border border-[#EAE7DF] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#737373] rtl:left-3 ltr:right-3">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 rtl:mr-4 ltr:ml-4">
        {/* Supabase Connection Status Pill */}
        <div 
          className="hidden md:flex items-center gap-1.5 rounded-full border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171717]"
        >
          <div className="relative flex h-2 w-2">
            {isSupabaseLive ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#657A52] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#657A52]"></span>
              </>
            ) : (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F4B942]"></span>
            )}
          </div>
          <span className="font-semibold text-xs">
            {isSupabaseLive ? t.dbConnected : t.dbMock}
          </span>
        </div>

        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
            className="flex items-center gap-1.5 rounded-lg bg-[#F4B942] px-3 py-2 text-xs font-bold text-[#171717] hover:bg-[#E2A72E] shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t.quickAdd}</span>
          </button>

          {showQuickAddMenu && (
            <div className="absolute top-full mt-2 w-48 rounded-xl border border-[#EAE7DF] bg-white p-1.5 shadow-lg z-50 rtl:left-0 ltr:right-0">
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onOpenNewSeller();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FAF9F6]"
              >
                <Store className="h-4 w-4 text-[#657A52]" />
                {t.addMerchant}
              </button>
              <button
                onClick={() => {
                  setShowQuickAddMenu(false);
                  onOpenNewProduct();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#171717] hover:bg-[#FAF9F6]"
              >
                <Package className="h-4 w-4 text-[#F4B942]" />
                {t.addProduct}
              </button>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] p-0.5 text-xs">
          <button
            onClick={() => setLanguage('ku')}
            className={`rounded-md px-2.5 py-1 font-bold transition-colors ${
              language === 'ku' ? 'bg-[#FFFFFF] text-[#171717] shadow-xs' : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            کوردی
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`rounded-md px-2.5 py-1 font-bold transition-colors ${
              language === 'ar' ? 'bg-[#FFFFFF] text-[#171717] shadow-xs' : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            عربي
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`rounded-md px-2.5 py-1 font-bold transition-colors ${
              language === 'en' ? 'bg-[#FFFFFF] text-[#171717] shadow-xs' : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            EN
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] p-2 text-[#737373] hover:bg-white hover:text-[#171717] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F4B942] text-[10px] font-bold text-[#171717]">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full mt-2 w-80 rounded-xl border border-[#EAE7DF] bg-white p-3 shadow-xl z-50 rtl:left-0 ltr:right-0">
              <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-2">
                <span className="font-bold text-xs text-[#171717]">{t.notifications}</span>
                <span className="rounded-full bg-[#FAF9F6] px-2 py-0.5 text-[10px] text-[#737373]">
                  {totalAlerts} نوێ
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {pendingSellers.map(seller => (
                  <div 
                    key={seller.id}
                    onClick={() => {
                      setShowNotifications(false);
                      setCurrentView('sellers');
                    }}
                    className="cursor-pointer rounded-lg border border-[#EAE7DF] p-2 hover:bg-[#FAF9F6] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-[#F4B942]" />
                      <span className="text-xs font-semibold text-[#171717]">
                        {language === 'ku' ? seller.name_ku : seller.name_en}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#737373]">
                      {t.statusPending} - {seller.city} ({seller.bazaar_name})
                    </p>
                  </div>
                ))}

                {missingSignalProducts.length > 0 && (
                  <div 
                    onClick={() => {
                      setShowNotifications(false);
                      setCurrentView('products');
                    }}
                    className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50/50 p-2 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-semibold">{t.auditMissingSignals}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-amber-700">
                      {missingSignalProducts.length} کاڵا پێویستیان بە زانیاری گرەنتی یان گەیاندن هەیە.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2.5 rounded-full border border-[#EAE7DF] bg-white p-1 ps-1 pe-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#657A52] text-xs font-bold text-white shadow-xs">
            BG
          </div>
          <div className="hidden xl:block text-start">
            <p className="text-xs font-bold leading-tight text-[#171717]">بەڕێوەبەری گەورە</p>
            <p className="text-[10px] text-[#737373]">سلێمانی - ناوەندی سەرەکی</p>
          </div>
        </div>
      </div>
    </header>
  );
}
