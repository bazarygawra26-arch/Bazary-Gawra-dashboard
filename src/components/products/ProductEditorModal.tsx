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
} from 'lucide-react';
import { calculateTransparencyScore } from '@/lib/utils';

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
  const { t, sellers, categories, addProduct, updateProduct } = useAdmin();

  const [activeLangTab, setActiveLangTab] = useState<'ku' | 'en' | 'ar'>('ku');

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
  const [primaryImage, setPrimaryImage] = useState<string>(
    product?.primary_image || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80'
  );

  const [warrantyType, setWarrantyType] = useState<WarrantyType>(product?.warranty_type || 'shop_local');
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>(product?.warranty_period || '6 Months (٦ مانگ)');
  const [warrantyNotes, setWarrantyNotes] = useState<string>(product?.warranty_notes || 'Direct shop replacement warranty');

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(product?.delivery_type || 'same_day');
  const [deliveryCostIqd, setDeliveryCostIqd] = useState<number>(product?.delivery_cost_iqd ?? 3000);
  const [deliveryTimeHours, setDeliveryTimeHours] = useState<number>(product?.delivery_time_hours ?? 6);

  const [returnWindowDays, setReturnWindowDays] = useState<number>(product?.return_window_days ?? 3);
  const [returnPolicyType, setReturnPolicyType] = useState<ReturnPolicyType>(product?.return_policy_type || 'exchange_only');
  const [returnConditions, setReturnConditions] = useState<string>(product?.return_conditions || 'Check item upon delivery');

  const liveScore = calculateTransparencyScore({
    warranty_type: warrantyType,
    warranty_period: warrantyPeriod,
    delivery_type: deliveryType,
    delivery_cost_iqd: deliveryCostIqd,
    return_window_days: returnWindowDays,
    return_policy_type: returnPolicyType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceUsd = Math.round(priceIqd / 1500);

    const dataPayload = {
      seller_id: sellerId || sellers[0]?.id || '',
      name_ku: nameKu || nameEn,
      name_en: nameEn || nameKu,
      name_ar: nameAr || nameKu,
      description_ku: descKu,
      description_en: descEn,
      description_ar: descAr,
      price_iqd: priceIqd,
      price_usd: priceUsd,
      category_id: categoryId || categories[0]?.id || '',
      stock_quantity: stockQuantity,
      status,
      images: [primaryImage],
      primary_image: primaryImage,
      warranty_type: warrantyType,
      warranty_period: warrantyPeriod,
      warranty_notes: warrantyNotes,
      delivery_type: deliveryType,
      delivery_cost_iqd: deliveryCostIqd,
      delivery_time_hours: deliveryTimeHours,
      return_window_days: returnWindowDays,
      return_policy_type: returnPolicyType,
      return_conditions: returnConditions,
    };

    if (product) {
      updateProduct({
        ...product,
        ...dataPayload,
      });
    } else {
      addProduct(dataPayload);
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
            <p className="text-xs text-[#737373]">
              Native Kurdish, Arabic & English listings with mandatory transparency verification
            </p>
          </div>
        </div>

        {/* Live Score Pill */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-1 text-xs">
            <span className="text-[#737373]">Transparency:</span>
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
          <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-2">
            <span className="font-bold text-[#171717]">Multilingual Content</span>
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
                {t.tabEnglish}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('ar')}
                className={`rounded-md px-3 py-1 font-bold transition-colors ${
                  activeLangTab === 'ar' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737373]'
                }`}
              >
                {t.tabArabic}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {activeLangTab === 'ku' && (
              <>
                <div>
                  <label className="font-bold text-[#171717]">{t.titleKurdishLabel} *</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={nameKu}
                    onChange={(e) => setNameKu(e.target.value)}
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
            <label className="font-bold text-[#171717]">Listing Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-medium text-[#171717] focus:border-[#F4B942] focus:outline-none"
            >
              <option value="active">Active (چالاک)</option>
              <option value="draft">Draft (ڕەشنووس)</option>
              <option value="out_of_stock">Out of Stock (نەماوە)</option>
              <option value="archived">Archived (ئەرشیڤ)</option>
            </select>
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
                  placeholder="e.g. 12 Months (١٢ مانگ)"
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#737373]">Warranty Terms</label>
                <input
                  type="text"
                  value={warrantyNotes}
                  onChange={(e) => setWarrantyNotes(e.target.value)}
                  placeholder="e.g. Official service center"
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
                <label className="text-[11px] text-[#737373]">Delivery Time (Hours)</label>
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
                <label className="text-[11px] text-[#737373]">Return Condition</label>
                <input
                  type="text"
                  value={returnConditions}
                  onChange={(e) => setReturnConditions(e.target.value)}
                  placeholder="e.g. In original packaging"
                  className="mt-1 w-full rounded-lg border border-[#EAE7DF] p-1.5 text-xs text-[#171717]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Primary Image */}
        <div>
          <label className="font-bold text-[#171717]">{t.imagesSection}</label>
          <div className="mt-1 flex gap-3">
            <input
              type="text"
              value={primaryImage}
              onChange={(e) => setPrimaryImage(e.target.value)}
              placeholder={t.imageUrlPlaceholder}
              className="flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
              required
            />
            {primaryImage && (
              <img
                src={primaryImage}
                alt="Preview"
                className="h-10 w-10 shrink-0 rounded-xl object-cover border border-[#EAE7DF]"
              />
            )}
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
            className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-6 py-2 font-bold text-white hover:bg-[#536543] shadow-sm transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{t.saveChanges}</span>
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
