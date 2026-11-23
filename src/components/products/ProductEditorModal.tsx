'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { Product, WarrantyType, DeliveryType, ReturnPolicyType, ProductStatus } from '@/types/database';
import { 
  X, 
  Package, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CheckCircle2,
  Sparkles,
  Languages,
  Loader2,
} from 'lucide-react';
import { calculateTransparencyScore } from '@/lib/utils';
import { ImageUploadDropzone } from '@/components/common/ImageUploadDropzone';
import { autoTranslateProduct } from '@/lib/translator';
import { adminPanelTranslations } from '@/lib/adminPanelTranslations';

interface ProductEditorModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  defaultSellerId?: string;
}

function ProductEditorForm({
  product,
  onClose,
  defaultSellerId,
}: {
  product: Product | null;
  onClose: () => void;
  defaultSellerId?: string;
}) {
  const { t, language, sellers, categories, addProduct, updateProduct } = useAdmin();
  const copy = adminPanelTranslations[language];

  const [activeLangTab, setActiveLangTab] = useState<'ku' | 'en' | 'ar'>('ku');
  const [isTranslating, setIsTranslating] = useState(false);

  const [nameKu, setNameKu] = useState(product?.name_ku || '');
  const [nameEn, setNameEn] = useState(product?.name_en || '');
  const [nameAr, setNameAr] = useState(product?.name_ar || '');
  const [descKu, setDescKu] = useState(product?.description_ku || '');
  const [descEn, setDescEn] = useState(product?.description_en || '');
  const [descAr, setDescAr] = useState(product?.description_ar || '');

  const [priceIqd, setPriceIqd] = useState<number>(product?.price_iqd ?? 75000);
  const [sellerId, setSellerId] = useState<string>(product?.seller_id || defaultSellerId || (sellers[0]?.id || ''));
  const [categoryId, setCategoryId] = useState<string>(product?.category_id || (categories[0]?.id || ''));
  const [stockQuantity, setStockQuantity] = useState<number>(product?.stock_quantity ?? 15);
  const [status, setStatus] = useState<ProductStatus>(product?.status || 'active');
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0
      ? product.images
      : product?.primary_image
        ? [product.primary_image]
        : []
  );
  const [primaryImage, setPrimaryImage] = useState<string>(
    product?.primary_image || (product?.images && product.images[0]) || ''
  );
  const [isSponsored, setIsSponsored] = useState<boolean>(
    Boolean(product?.is_sponsored ?? product?.is_promoted ?? false)
  );

  const [warrantyType, setWarrantyType] = useState<WarrantyType>(product?.warranty_type || 'shop_local');
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>(product?.warranty_period || '١ ساڵ گرەنتی ناوخۆیی دووکان');
  const [warrantyNotes, setWarrantyNotes] = useState<string>(product?.warranty_notes || 'گرەنتی گۆڕینەوە لە شوێنی خۆی');

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(product?.delivery_type || 'same_day');
  const [deliveryCostIqd, setDeliveryCostIqd] = useState<number>(product?.delivery_cost_iqd ?? 3000);
  const [deliveryTimeHours, setDeliveryTimeHours] = useState<number>(product?.delivery_time_hours ?? 6);

  const [returnWindowDays, setReturnWindowDays] = useState<number>(product?.return_window_days ?? 3);
  const [returnPolicyType, setReturnPolicyType] = useState<ReturnPolicyType>(product?.return_policy_type || 'exchange_only');
  const [returnConditions, setReturnConditions] = useState<string>(product?.return_conditions || 'پشکنینی کاڵا لە کاتی وەرگرتندا');

  // Auto-translate on blur if English or Arabic are empty
  const handleNameKuBlur = async () => {
    if (!nameKu || nameKu.trim() === '') return;
    if (!nameEn || nameEn === nameKu || !nameAr || nameAr === nameKu) {
      setIsTranslating(true);
      try {
        const res = await autoTranslateProduct(nameKu, descKu);
        if (!nameEn || nameEn === nameKu) setNameEn(res.nameEn);
        if (!nameAr || nameAr === nameKu) setNameAr(res.nameAr);
      } catch (err) {
        console.warn('Auto translate on blur warning:', err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleDescKuBlur = async () => {
    if (!descKu || descKu.trim() === '') return;
    if (!descEn || descEn === descKu || !descAr || descAr === descKu) {
      setIsTranslating(true);
      try {
        const res = await autoTranslateProduct(nameKu, descKu);
        if (!descEn || descEn === descKu) setDescEn(res.descEn);
        if (!descAr || descAr === descKu) setDescAr(res.descAr);
      } catch (err) {
        console.warn('Auto translate on blur warning:', err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  // Auto-translate from Kurdish into English and Arabic manually if requested
  const handleAutoTranslate = async () => {
    if (!nameKu && !descKu) return;
    setIsTranslating(true);
    try {
      const res = await autoTranslateProduct(nameKu, descKu);
      setNameEn(res.nameEn);
      setNameAr(res.nameAr);
      if (res.descEn) setDescEn(res.descEn);
      if (res.descAr) setDescAr(res.descAr);
    } finally {
      setIsTranslating(false);
    }
  };

  // AI Assistant Feature to quickly fill descriptions & 100% transparency signals
  const handleAiAutoFill = async () => {
    const baseTitle = nameKu || 'چاییکەری کارەبایی کاراجا ٣.٥ لیتر';
    if (!nameKu) setNameKu(baseTitle);

    setIsTranslating(true);
    try {
      const res = await autoTranslateProduct(
        baseTitle,
        descKu || 'کاڵایەکی پلە یەک و باوەڕپێکراو لە بازاڕی سلێمانی و هەولێر. لە ستیلی دژە ژەنگ دروستکراوە بە تایبەتمەندی کوژانەوەی خۆکار و گەرمڕاگرتنی بەردەوام.'
      );
      setNameEn(res.nameEn);
      setNameAr(res.nameAr);
      setDescKu('کاڵایەکی پلە یەک و باوەڕپێکراو لە بازاڕی سلێمانی و هەولێر. لە ستیلی دژە ژەنگ دروستکراوە بە تایبەتمەندی کوژانەوەی خۆکار و گەرمڕاگرتنی بەردەوام.');
      setDescEn(res.descEn);
      setDescAr(res.descAr);
    } finally {
      setIsTranslating(false);
    }

    setWarrantyType('shop_local');
    setWarrantyPeriod('١ ساڵ گرەنتی ناوخۆیی دووکان');
    setWarrantyNotes('گرەنتی فەرمی گۆڕینەوە لە شوێنی دووکان لە کاتی هەر کێشەیەکدا');

    setDeliveryType('same_day');
    setDeliveryCostIqd(3000);
    setDeliveryTimeHours(4);

    setReturnWindowDays(3);
    setReturnPolicyType('money_back');
    setReturnConditions('پشکنینی کاڵا لە کاتی وەرگرتن بە مافی گەڕاندنەوە');
  };

  const liveScore = calculateTransparencyScore({
    warranty_type: warrantyType,
    warranty_period: warrantyPeriod,
    delivery_type: deliveryType,
    delivery_cost_iqd: deliveryCostIqd,
    return_window_days: returnWindowDays,
    return_policy_type: returnPolicyType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTranslating(true);

    let finalNameEn = nameEn;
    let finalNameAr = nameAr;
    let finalDescEn = descEn;
    let finalDescAr = descAr;

    const baseName = nameKu || nameEn || nameAr;
    const baseDesc = descKu || descEn || descAr;

    // AUTOMATIC TRANSLATION: If EN or AR are empty or identical to Kurdish, translate dynamically now!
    const needEn = !finalNameEn || finalNameEn.trim() === '' || finalNameEn === baseName;
    const needAr = !finalNameAr || finalNameAr.trim() === '' || finalNameAr === baseName;
    const needDescEn = !finalDescEn || finalDescEn.trim() === '' || finalDescEn === baseDesc;
    const needDescAr = !finalDescAr || finalDescAr.trim() === '' || finalDescAr === baseDesc;

    if (needEn || needAr || (baseDesc && (needDescEn || needDescAr))) {
      try {
        const transRes = await autoTranslateProduct(baseName, baseDesc);
        if (needEn) finalNameEn = transRes.nameEn || baseName;
        if (needAr) finalNameAr = transRes.nameAr || baseName;
        if (needDescEn) finalDescEn = transRes.descEn || baseDesc;
        if (needDescAr) finalDescAr = transRes.descAr || baseDesc;
      } catch (err) {
        console.warn('Auto-translate during submit fallback:', err);
      }
    }

    const priceUsd = Math.round(priceIqd / 1500);
    const finalImages = images.length > 0 ? images : (primaryImage ? [primaryImage] : []);
    const finalPrimary = primaryImage || (finalImages[0] || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80');

    const dataPayload = {
      seller_id: sellerId || sellers[0]?.id || '',
      name_ku: baseName,
      name_en: finalNameEn || baseName,
      name_ar: finalNameAr || baseName,
      description_ku: baseDesc,
      description_en: finalDescEn || baseDesc,
      description_ar: finalDescAr || baseDesc,
      price_iqd: priceIqd,
      price_usd: priceUsd,
      category_id: categoryId || categories[0]?.id || '',
      stock_quantity: stockQuantity,
      status,
      images: finalImages.length > 0 ? finalImages : [finalPrimary],
      primary_image: finalPrimary,
      warranty_type: warrantyType,
      warranty_period: warrantyPeriod,
      warranty_notes: warrantyNotes,
      delivery_type: deliveryType,
      delivery_cost_iqd: deliveryCostIqd,
      delivery_time_hours: deliveryTimeHours,
      return_window_days: returnWindowDays,
      return_policy_type: returnPolicyType,
      return_conditions: returnConditions,
      is_sponsored: isSponsored,
      is_promoted: isSponsored,
    };

    try {
      if (product) {
        await updateProduct({
          ...product,
          ...dataPayload,
        });
      } else {
        await addProduct(dataPayload);
      }
    } finally {
      setIsTranslating(false);
    }

    onClose();
  };

  return (
    <div className="relative w-full max-w-3xl rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4B942]/10 text-[#F4B942]">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#171717]">
              {product ? t.editorTitleEdit : t.editorTitleNew}
            </h3>
            <p className="text-xs text-[#737373]">{copy.productDetailsThreeLanguages}</p>
          </div>
        </div>

        {/* Live Score Pill & AI Assistant */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiAutoFill}
            disabled={isTranslating}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs active:scale-95 disabled:opacity-50"
            title={copy.aiFill}
          >
            {isTranslating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            )}
            <span>{copy.aiFill}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-1 text-xs">
            <span className="text-[#737373]">{copy.trustScore}:</span>
            <span className={`font-extrabold ${liveScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {liveScore}%
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#737373] hover:bg-[#FAF9F6] hover:text-[#171717]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-6 text-xs">
        {/* SECTION 1: Multilingual Details Tabs */}
        <div className="rounded-xl border border-[#EAE7DF] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE7DF] pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#171717]">{copy.productDetailsThreeLanguages}</span>
              {/* Quick Auto-Translate to AR & EN Button */}
              {nameKu && (
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={isTranslating}
                  className="flex items-center gap-1 rounded-lg border border-[#657A52]/30 bg-[#657A52]/10 px-2 py-0.5 text-[11px] font-bold text-[#657A52] hover:bg-[#657A52]/20 transition-colors disabled:opacity-50"
                  title={copy.autoTranslateHint}
                >
                  {isTranslating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Languages className="h-3 w-3" />
                  )}
                  <span>{copy.translateEnglishArabic}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-[#FAF9F6] p-0.5 border border-[#EAE7DF]">
              <button
                type="button"
                onClick={() => setActiveLangTab('ku')}
                className={`rounded-md px-3 py-1 font-bold transition-colors ${
                  activeLangTab === 'ku' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737373]'
                }`}
              >
                {t.tabKurdish}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`rounded-md px-3 py-1 font-bold transition-colors ${
                  activeLangTab === 'en' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737373]'
                }`}
              >
                {t.tabEnglish} {nameEn && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('ar')}
                className={`rounded-md px-3 py-1 font-bold transition-colors ${
                  activeLangTab === 'ar' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737373]'
                }`}
              >
                {t.tabArabic} {nameAr && '✓'}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {activeLangTab === 'ku' && (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#171717]">{t.titleKurdishLabel} *</label>
                    <span className="text-[10px] text-[#657A52] font-semibold">✨ {copy.autoTranslateHint}</span>
                  </div>
                  <input
                    type="text"
                    dir="rtl"
                    value={nameKu}
                    onChange={(e) => setNameKu(e.target.value)}
                    onBlur={handleNameKuBlur}
                    placeholder="نموونە: چاییکەری کارەبایی کاراجا ٣.٥ لیتر"
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717]">{t.descKurdishLabel}</label>
                  <textarea
                    dir="rtl"
                    value={descKu}
                    onChange={(e) => setDescKu(e.target.value)}
                    onBlur={handleDescKuBlur}
                    rows={3}
                    placeholder="تایبەتمەندی و وەسفی کاڵا بە زمانی کوردی سۆرانی بنووسە..."
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                  />
                </div>
              </>
            )}

            {activeLangTab === 'en' && (
              <>
                <div>
                  <label className="font-bold text-[#171717]">{t.titleEnglishLabel} *</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Karaca Electric Samovar 3.5L Stainless Steel"
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717]">{t.descEnglishLabel}</label>
                  <textarea
                    dir="ltr"
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    rows={3}
                    placeholder="Detailed specifications and features in English..."
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                  />
                </div>
              </>
            )}

            {activeLangTab === 'ar' && (
              <>
                <div>
                  <label className="font-bold text-[#171717]">{t.titleArabicLabel}</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: سماور وصانعة الشاي الكهربائية ٣.٥ لتر"
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717]">{t.descArabicLabel}</label>
                  <textarea
                    dir="rtl"
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    rows={3}
                    placeholder="الوصف والمواصفات بالعربية..."
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: Pricing, Stock, Seller & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-[#171717]">{t.priceIqdLabel} *</label>
            <div className="relative mt-1">
              <input
                type="number"
                value={priceIqd}
                onChange={(e) => setPriceIqd(Number(e.target.value))}
                step={500}
                className="w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-extrabold text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#171717]">{t.stockQuantityLabel} *</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              min={0}
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-bold text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-[#171717]">{t.sellerLabel} *</label>
            <select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-medium text-[#171717] focus:border-[#F4B942] focus:outline-none"
              required
            >
              {sellers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name_ku} ({s.city} - {s.bazaar_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#171717]">{t.categoryLabel} *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-medium text-[#171717] focus:border-[#F4B942] focus:outline-none"
              required
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name_ku} ({c.name_en})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#171717]">{copy.statusLabel} *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-medium text-[#171717] focus:border-[#F4B942] focus:outline-none"
            >
              <option value="active">{t.statusActive}</option>
              <option value="draft">{t.statusDraft}</option>
              <option value="out_of_stock">{t.statusOutOfStock}</option>
              <option value="archived">{t.statusArchived}</option>
            </select>
          </div>
        </div>

        {/* SECTION 2.5: Product Sponsorship & Promotion */}
        <div className={`rounded-xl border p-4 transition-all ${
          isSponsored 
            ? 'border-[#F4B942] bg-gradient-to-r from-[#FFFDF7] to-[#FFF9E6] shadow-xs' 
            : 'border-[#EAE7DF] bg-[#FAF9F6]'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSponsored ? 'bg-[#F4B942] text-white shadow-sm' : 'bg-neutral-200 text-neutral-500'
              }`}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#171717]">{t.isSponsored}</span>
                  {isSponsored && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4B942]/20 border border-[#F4B942]/40 text-[#8C5E00] text-[10px] font-black">
                      <Sparkles className="w-2.5 h-2.5 fill-[#8C5E00]" />
                      {t.sponsoredBadge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-[#737373] leading-relaxed">
                  {t.sponsoredDesc}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isSponsored}
              onClick={() => setIsSponsored(!isSponsored)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSponsored ? 'bg-[#F4B942]' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isSponsored ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* SECTION 3: Information Signals (Warranty, Delivery, Returns) */}
        <div className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-[#657A52]" />
            <h4 className="font-bold text-xs text-[#171717]">{t.transparencySection}</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Warranty Signals */}
            <div className="rounded-xl border border-[#EAE7DF] bg-white p-3 space-y-2">
              <span className="font-bold text-[#171717] flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#657A52]" />
                {t.warranty}
              </span>
              <div>
                <label className="text-[11px] text-[#737373]">{t.warrantyTypeLabel}</label>
                <select
                  value={warrantyType}
                  onChange={(e) => setWarrantyType(e.target.value as WarrantyType)}
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                >
                  <option value="official_agent">{t.warrantyOfficial}</option>
                  <option value="shop_local">{t.warrantyShop}</option>
                  <option value="replacement">{t.warrantyReplacement}</option>
                  <option value="none">{t.warrantyNone}</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#737373]">{t.warrantyPeriodLabel}</label>
                <input
                  type="text"
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                  placeholder={copy.exampleWarrantyPeriod}
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#737373]">{copy.warrantyConditions}</label>
                <input
                  type="text"
                  value={warrantyNotes}
                  onChange={(e) => setWarrantyNotes(e.target.value)}
                  placeholder={copy.exampleWarrantyConditions}
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
            </div>

            {/* Delivery Signals */}
            <div className="rounded-xl border border-[#EAE7DF] bg-white p-3 space-y-2">
              <span className="font-bold text-[#171717] flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-blue-600" />
                {t.delivery}
              </span>
              <div>
                <label className="text-[11px] text-[#737373]">{t.deliveryTypeLabel}</label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                >
                  <option value="same_day">{t.deliverySameDay}</option>
                  <option value="express_kurdistan">{t.deliveryExpress}</option>
                  <option value="pickup_only">{t.deliveryPickup}</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#737373]">{t.deliveryCostLabel}</label>
                <input
                  type="number"
                  value={deliveryCostIqd}
                  onChange={(e) => setDeliveryCostIqd(Number(e.target.value))}
                  step={500}
                  placeholder="3000"
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#737373]">{copy.deliveryTimeHours}</label>
                <input
                  type="number"
                  value={deliveryTimeHours}
                  onChange={(e) => setDeliveryTimeHours(Number(e.target.value))}
                  min={1}
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
            </div>

            {/* Return Policy Signals */}
            <div className="rounded-xl border border-[#EAE7DF] bg-white p-3 space-y-2">
              <span className="font-bold text-[#171717] flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                {t.returnPolicy}
              </span>
              <div>
                <label className="text-[11px] text-[#737373]">{t.returnTypeLabel}</label>
                <select
                  value={returnPolicyType}
                  onChange={(e) => setReturnPolicyType(e.target.value as ReturnPolicyType)}
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                >
                  <option value="money_back">{t.returnPolicyMoneyBack}</option>
                  <option value="exchange_only">{t.returnPolicyExchange}</option>
                  <option value="non_returnable">{t.returnPolicyNone}</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#737373]">{t.returnWindowLabel}</label>
                <input
                  type="number"
                  value={returnWindowDays}
                  onChange={(e) => setReturnWindowDays(Number(e.target.value))}
                  min={0}
                  placeholder="3"
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#737373]">{copy.returnConditions}</label>
                <input
                  type="text"
                  value={returnConditions}
                  onChange={(e) => setReturnConditions(e.target.value)}
                  placeholder={copy.exampleReturnConditions}
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Product Image Upload */}
        <div>
          <label className="font-bold text-[#171717]">{t.uploadImageLabel}</label>
          <div className="mt-2">
            <ImageUploadDropzone
              images={images}
              primaryImage={primaryImage}
              onImagesChange={setImages}
              onPrimaryImageChange={setPrimaryImage}
              bucket="product-images"
              maxFiles={6}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-2.5 border-t border-[#EAE7DF] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#EAE7DF] bg-white px-4 py-2 font-semibold text-[#737373] hover:bg-[#FAF9F6]"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isTranslating}
            className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-6 py-2 font-bold text-white hover:bg-[#536543] shadow-sm transition-all disabled:opacity-75"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{copy.translatingAndSaving}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{t.saveChanges}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ProductEditorModal({ product, isOpen, onClose, defaultSellerId }: ProductEditorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <ProductEditorForm
        key={product?.id || `new_${defaultSellerId || ''}`}
        product={product}
        onClose={onClose}
        defaultSellerId={defaultSellerId}
      />
    </div>
  );
}
