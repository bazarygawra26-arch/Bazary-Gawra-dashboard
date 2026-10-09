'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { Product, ProductStatus } from '@/types/database';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  AlertTriangle, 
  Download,
  Coins,
  X
} from 'lucide-react';
import { formatIqd, downloadCsv } from '@/lib/utils';

interface ProductsModuleProps {
  onOpenNewProduct: () => void;
  editingProduct: Product | null;
  onSetEditingProduct: (product: Product | null) => void;
}

export function ProductsModule({ onOpenNewProduct, onSetEditingProduct }: ProductsModuleProps) {
  const { 
    t, 
    language, 
    products, 
    sellers, 
    categories, 
    deleteProduct, 
    quickUpdateStockAndPrice 
  } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Edit Modal
  const [quickEditingProduct, setQuickEditingProduct] = useState<Product | null>(null);
  const [quickPrice, setQuickPrice] = useState<number>(0);
  const [quickStock, setQuickStock] = useState<number>(0);

  // Missing signals audit count
  const auditFlaggedProducts = products.filter(p => p.transparency_score < 70);

  // Filtered products
  const filteredProducts = products.filter(prod => {
    let matchesStatus = true;
    if (statusFilter === 'missing_signals') {
      matchesStatus = prod.transparency_score < 70;
    } else if (statusFilter !== 'all') {
      matchesStatus = prod.status === statusFilter;
    }

    const matchesCategory = categoryFilter === 'all' || prod.category_id === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const seller = sellers.find(s => s.id === prod.seller_id);
    const sellerName = seller ? `${seller.name_ku} ${seller.name_en}`.toLowerCase() : '';

    const matchesSearch = !q || 
      prod.name_ku.toLowerCase().includes(q) ||
      prod.name_en.toLowerCase().includes(q) ||
      prod.name_ar.toLowerCase().includes(q) ||
      sellerName.includes(q);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleExportCsv = () => {
    const rows = filteredProducts.map(p => {
      const seller = sellers.find(s => s.id === p.seller_id);
      return {
        ID: p.id,
        Name_KU: p.name_ku,
        Name_EN: p.name_en,
        Seller: seller?.name_en || p.seller_id,
        City: seller?.city || '',
        Price_IQD: p.price_iqd,
        Stock: p.stock_quantity,
        Warranty: p.warranty_period || 'None',
        Delivery: p.delivery_type,
        ReturnDays: p.return_window_days,
        TransparencyScore: p.transparency_score,
        Status: p.status,
      };
    });
    downloadCsv('bazary_gawra_products', rows);
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">{t.statusActive}</span>;
      case 'draft':
        return <span className="rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700">{t.statusDraft}</span>;
      case 'out_of_stock':
        return <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">{t.statusOutOfStock}</span>;
      case 'archived':
        return <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-800">{t.statusArchived}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#171717]">
            {t.productsTitle}
          </h1>
          <p className="mt-1 text-xs text-[#737373]">
            {t.productsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-[#EAE7DF] bg-white px-3.5 py-2 text-xs font-bold text-[#171717] hover:bg-[#FAF9F6] shadow-xs transition-colors"
          >
            <Download className="h-4 w-4 text-[#737373]" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-1.5 rounded-xl bg-[#F4B942] px-4 py-2 text-xs font-bold text-[#171717] hover:bg-[#E2A72E] shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Audit Banner for Missing Transparency Signals */}
      {auditFlaggedProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-900">{t.auditAlertTitle}</h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                {t.auditAlertDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('missing_signals')}
            className="shrink-0 rounded-xl bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-900 transition-colors shadow-xs"
          >
            Filter {auditFlaggedProducts.length} Missing Signal Listings
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#EAE7DF] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] rtl:right-3.5 ltr:left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchProducts}
            className="w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] py-2 text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#F4B942] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4B942]/20 rtl:pl-4 rtl:pr-10 ltr:pl-10 ltr:pr-4"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t.filterByCategory}
            className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#171717] focus:border-[#F4B942] focus:outline-none"
          >
            <option value="all">{t.allProducts}</option>
            <option value="missing_signals">⚠️ {t.auditMissingSignals} ({auditFlaggedProducts.length})</option>
            <option value="active">{t.statusActive}</option>
            <option value="draft">{t.statusDraft}</option>
            <option value="out_of_stock">{t.statusOutOfStock}</option>
            <option value="archived">{t.statusArchived}</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label={t.allCategories}
            className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#171717] focus:border-[#F4B942] focus:outline-none"
          >
            <option value="all">{t.allCategories}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'ku' ? c.name_ku : language === 'ar' ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-[#EAE7DF] bg-[#FAF9F6] text-[#737373]">
              <tr>
                <th className="px-4 py-3.5 font-bold text-start">{t.productTitleCol}</th>
                <th className="px-4 py-3.5 font-bold text-start">{t.productCategoryCol}</th>
                <th className="px-4 py-3.5 font-bold text-start">{t.productSellerCol}</th>
                <th className="px-4 py-3.5 font-bold text-start">{t.productPriceCol}</th>
                <th className="px-4 py-3.5 font-bold text-start">{t.productSignalsCol}</th>
                <th className="px-4 py-3.5 font-bold text-start">{t.productStockCol}</th>
                <th className="px-4 py-3.5 font-bold text-center">{t.productActionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DF]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#737373]">
                    No products found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const seller = sellers.find(s => s.id === product.seller_id);
                  const category = categories.find(c => c.id === product.category_id);
                  const isAuditWarn = product.transparency_score < 70;

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-[#FAF9F6]/80 transition-colors ${
                        isAuditWarn ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Thumbnail & Title */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.primary_image}
                            alt={product.name_en}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover border border-[#EAE7DF]"
                          />
                          <div className="max-w-xs">
                            <h4 className="font-bold text-sm text-[#171717] line-clamp-1">
                              {language === 'ku' ? product.name_ku : language === 'ar' ? product.name_ar : product.name_en}
                            </h4>
                            <p className="text-[11px] text-[#737373] line-clamp-1">
                              {product.name_en}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] px-2.5 py-1 text-[11px] font-semibold text-[#171717]">
                          {category ? (language === 'ku' ? category.name_ku : language === 'ar' ? category.name_ar : category.name_en) : product.category_id}
                        </span>
                      </td>

                      {/* Merchant & City */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#171717]">
                          {seller ? (language === 'ku' ? seller.name_ku : seller.name_en) : 'Direct Merchant'}
                        </div>
                        <p className="text-[11px] text-[#737373]">{seller?.city || 'Sulaymaniyah'}</p>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-sm text-[#171717]">
                          {formatIqd(product.price_iqd, language)}
                        </div>
                      </td>

                      {/* Information Signals */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {/* Warranty Badge */}
                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              product.warranty_type !== 'none' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              <ShieldCheck className="h-3 w-3" />
                              {product.warranty_period || 'No Warranty'}
                            </span>

                            {/* Delivery Badge */}
                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                              <Truck className="h-3 w-3" />
                              {product.delivery_type === 'same_day' ? 'Same Day' : product.delivery_type === 'express_kurdistan' ? '24-48h' : 'Pickup'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-[#737373]">
                              Return: {product.return_window_days > 0 ? `${product.return_window_days}d window` : 'No returns'}
                            </span>
                            <span className={`font-bold ${product.transparency_score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              ({product.transparency_score}% Score)
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stock & Status */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#171717]">
                          {product.stock_quantity} <span className="font-normal text-[#737373] text-[10px]">{t.stockUnits}</span>
                        </div>
                        <div className="mt-1">{getStatusBadge(product.status)}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Edit */}
                          <button
                            onClick={() => {
                              setQuickEditingProduct(product);
                              setQuickPrice(product.price_iqd);
                              setQuickStock(product.stock_quantity);
                            }}
                            className="rounded-lg border border-[#EAE7DF] p-1.5 text-[#737373] hover:border-[#F4B942] hover:bg-[#F4B942]/10 hover:text-[#171717] transition-colors"
                            title={t.quickEdit}
                          >
                            <Coins className="h-4 w-4" />
                          </button>

                          {/* Full Multilingual Editor */}
                          <button
                            onClick={() => onSetEditingProduct(product)}
                            className="rounded-lg border border-[#EAE7DF] p-1.5 text-[#737373] hover:border-[#657A52] hover:bg-[#657A52]/10 hover:text-[#657A52] transition-colors"
                            title={t.fullEdit}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this listing?')) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="rounded-lg border border-[#EAE7DF] p-1.5 text-[#737373] hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title={t.deleteProduct}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK EDIT MODAL (Price & Stock) */}
      {quickEditingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
              <h3 className="text-sm font-extrabold text-[#171717]">{t.quickEdit}</h3>
              <button
                onClick={() => setQuickEditingProduct(null)}
                className="rounded-lg p-1 text-[#737373] hover:bg-[#FAF9F6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs font-bold text-[#171717] line-clamp-1">
              {language === 'ku' ? quickEditingProduct.name_ku : quickEditingProduct.name_en}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#171717]">{t.priceIqdLabel}</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(Number(e.target.value))}
                    step={500}
                    className="w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2 text-xs font-extrabold text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#171717]">{t.stockQuantityLabel}</label>
                <input
                  type="number"
                  value={quickStock}
                  onChange={(e) => setQuickStock(Number(e.target.value))}
                  min={0}
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2 text-xs font-bold text-[#171717] focus:border-[#F4B942] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#EAE7DF] pt-3">
                <button
                  type="button"
                  onClick={() => setQuickEditingProduct(null)}
                  className="rounded-xl border border-[#EAE7DF] px-3 py-1.5 text-xs font-semibold text-[#737373] hover:bg-[#FAF9F6]"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    quickUpdateStockAndPrice(quickEditingProduct.id, quickPrice, quickStock);
                    setQuickEditingProduct(null);
                  }}
                  className="rounded-xl bg-[#F4B942] px-4 py-1.5 text-xs font-bold text-[#171717] hover:bg-[#E2A72E]"
                >
                  {t.saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
