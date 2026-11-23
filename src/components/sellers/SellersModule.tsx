'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { Seller, VerificationStatus, KurdishCity } from '@/types/database';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Package, 
  Plus, 
  Eye, 
  ShieldCheck, 
  X,
  Edit2,
  Download,
  Languages,
  Loader2
} from 'lucide-react';
import { downloadCsv, formatIqd } from '@/lib/utils';
import { ImageUploadDropzone } from '@/components/common/ImageUploadDropzone';
import { getLocalizedField, autoTranslateSeller, getLocalizedCity, getLocalizedWarranty } from '@/lib/translator';

interface SellersModuleProps {
  onOpenNewSeller: () => void;
  onOpenNewProductForSeller?: (sellerId: string) => void;
}

export function SellersModule({ onOpenNewSeller, onOpenNewProductForSeller }: SellersModuleProps) {
  const { t, language, sellers, products, updateSellerVerification, updateSeller } = useAdmin();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [verifyingSeller, setVerifyingSeller] = useState<Seller | null>(null);
  const [selectedDrawerSeller, setSelectedDrawerSeller] = useState<Seller | null>(null);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [isTranslatingEdit, setIsTranslatingEdit] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Filtered sellers
  const filteredSellers = sellers.filter(seller => {
    const matchesStatus = statusFilter === 'all' || seller.verification_status === statusFilter;
    const matchesCity = cityFilter === 'all' || seller.city === cityFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      seller.id.toLowerCase().includes(q) ||
      seller.name_ku.toLowerCase().includes(q) ||
      seller.name_en.toLowerCase().includes(q) ||
      seller.name_ar.toLowerCase().includes(q) ||
      seller.owner_name.toLowerCase().includes(q) ||
      seller.phone.includes(q) ||
      seller.bazaar_name.toLowerCase().includes(q);

    return matchesStatus && matchesCity && matchesSearch;
  });

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            {t.statusVerified}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            {t.statusPending}
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-800">
            <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            {t.statusSuspended}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-gray-50 border border-gray-200 px-2.5 py-0.5 text-xs font-bold text-gray-700">
            <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
            {t.statusUnverified}
          </span>
        );
    }
  };

  const handleExportCsv = () => {
    const rows = filteredSellers.map(s => ({
      ID: s.id,
      Name_Kurdish: s.name_ku,
      Name_English: s.name_en,
      City: s.city,
      Bazaar: s.bazaar_name,
      Owner: s.owner_name,
      Phone: s.phone,
      WhatsApp: s.whatsapp,
      Status: s.verification_status,
      TransparencyScore: s.transparency_score,
      CreatedAt: s.created_at,
    }));
    downloadCsv('bazary_gawra_merchants', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#171717]">
            {t.merchantsTitle}
          </h1>
          <p className="mt-1 text-xs text-[#737373]">
            {t.merchantsSubtitle}
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
            onClick={onOpenNewSeller}
            className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#536543] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addMerchant}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#EAE7DF] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] rtl:right-3.5 ltr:left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchMerchants}
            className="w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] py-2 text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#657A52] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#657A52]/20 rtl:pl-4 rtl:pr-10 ltr:pl-10 ltr:pr-4"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t.filterByStatus}
            className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#171717] focus:border-[#657A52] focus:outline-none"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="verified">{t.statusVerified}</option>
            <option value="pending">{t.statusPending}</option>
            <option value="unverified">{t.statusUnverified}</option>
            <option value="suspended">{t.statusSuspended}</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            aria-label={t.filterByCity}
            className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#171717] focus:border-[#657A52] focus:outline-none"
          >
            <option value="all">{t.allCities}</option>
            <option value="Sulaymaniyah">{getLocalizedCity('Sulaymaniyah', language)}</option>
            <option value="Erbil">{getLocalizedCity('Erbil', language)}</option>
            <option value="Duhok">{getLocalizedCity('Duhok', language)}</option>
            <option value="Halabja">{getLocalizedCity('Halabja', language)}</option>
            <option value="Kirkuk">{getLocalizedCity('Kirkuk', language)}</option>
          </select>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-[#EAE7DF] bg-[#FAF9F6] text-[#737373]">
              <tr>
                <th className="px-4 py-3.5 font-bold text-start whitespace-nowrap min-w-[190px]">Seller ID</th>
                <th className="px-4 py-3.5 font-bold text-start min-w-[200px]">{t.merchantName}</th>
                <th className="px-4 py-3.5 font-bold text-start whitespace-nowrap min-w-[130px]">{t.merchantCityBazaar}</th>
                <th className="px-4 py-3.5 font-bold text-start whitespace-nowrap min-w-[140px]">{t.merchantContact}</th>
                <th className="px-4 py-3.5 font-bold text-start whitespace-nowrap min-w-[110px]">{t.merchantProducts}</th>
                <th className="px-4 py-3.5 font-bold text-start whitespace-nowrap min-w-[140px]">{t.merchantTrust}</th>
                <th className="px-4 py-3.5 font-bold text-center whitespace-nowrap min-w-[120px]">{t.merchantActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DF]">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#737373]">
                    هیچ فرۆشیارێک نەدۆزرایەوە بەپێی ئەم فلتەرە.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => {
                  const sellerProducts = products.filter(p => p.seller_id === seller.id);

                  return (
                    <tr key={seller.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                      <td className="px-4 py-3.5 align-top">
                        <code className="block max-w-[190px] break-all font-mono text-[10px] text-[#737373]" title={seller.id}>
                          {seller.id || '—'}
                        </code>
                      </td>
                      {/* Name & Facade Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={seller.facade_image_url || seller.logo_url}
                            alt={seller.name_en}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover border border-[#EAE7DF]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-sm text-[#171717]">
                                {getLocalizedField(seller, 'name', language)}
                              </span>
                              {seller.verification_status === 'verified' && (
                                <ShieldCheck className="h-4 w-4 text-[#657A52]" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#737373]">{seller.owner_name}</p>
                          </div>
                        </div>
                      </td>

                      {/* City & Bazaar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-[#171717]">
                          <MapPin className="h-3.5 w-3.5 text-[#657A52]" />
                          <span>{getLocalizedCity(seller.city, language)}</span>
                        </div>
                        <p className="text-[11px] text-[#737373]">{seller.bazaar_name}</p>
                      </td>

                      {/* Contact Channels */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${seller.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="h-3 w-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${seller.phone}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-50 border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Call Phone"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{seller.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Products Count */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDrawerSeller(seller)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] px-2.5 py-1 text-xs font-bold text-[#171717] hover:border-[#657A52] hover:bg-white transition-colors"
                        >
                          <Package className="h-3.5 w-3.5 text-[#F4B942]" />
                          <span>{sellerProducts.length} کاڵا</span>
                        </button>
                      </td>

                      {/* Trust & Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="whitespace-nowrap">{getStatusBadge(seller.verification_status)}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#737373] whitespace-nowrap">
                            <span>نمرەی متمانە:</span>
                            <span className="font-bold text-[#171717]">{seller.transparency_score}٪</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* Verification Review Modal Button */}
                          <button
                            onClick={() => {
                              setVerifyingSeller(seller);
                              setAdminNotes(seller.notes || '');
                            }}
                            className="rounded-lg border border-[#EAE7DF] p-1.5 text-[#737373] hover:border-[#657A52] hover:bg-[#657A52]/10 hover:text-[#657A52] transition-colors"
                            title={t.verifySeller}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>

                          {/* Inventory Drawer Button */}
                          <button
                            onClick={() => setSelectedDrawerSeller(seller)}
                            className="rounded-lg border border-[#EAE7DF] p-1.5 text-[#737373] hover:border-[#F4B942] hover:bg-[#F4B942]/10 hover:text-[#171717] transition-colors"
                            title={t.viewInventory}
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Seller Profile */}
                          <button
                            onClick={() => setEditingSeller(seller)}
                            className="rounded-lg border border-[#EAE7DF] p-1.5 text-[#737373] hover:border-gray-400 hover:bg-gray-100 hover:text-[#171717] transition-colors"
                            title={t.editSeller}
                          >
                            <Edit2 className="h-4 w-4" />
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

      {/* MODAL 1: Merchant Verification & Shop Facade Review */}
      {verifyingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#657A52]/10 text-[#657A52]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#171717]">
                    {t.verificationDetails}
                  </h3>
                  <p className="text-xs text-[#737373]">
                    {getLocalizedField(verifyingSeller, 'name', language)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerifyingSeller(null)}
                className="rounded-lg p-1.5 text-[#737373] hover:bg-[#FAF9F6] hover:text-[#171717]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Shop Facade Photo Banner */}
              <div>
                <p className="text-xs font-bold text-[#171717] mb-1.5">{t.shopFacade}</p>
                <div className="relative overflow-hidden rounded-xl border border-[#EAE7DF] bg-[#FAF9F6]">
                  <img
                    src={verifyingSeller.facade_image_url}
                    alt="Shop Front"
                    className="h-56 w-full object-cover"
                  />
                  <div className="absolute bottom-2 rtl:right-2 ltr:left-2 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                    پشکنینی فیزیایی دووکان
                  </div>
                </div>
              </div>

              {/* Physical Address & Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3">
                  <span className="text-[#737373] font-medium">{t.bazaarLocation}</span>
                  <p className="mt-1 font-bold text-[#171717]">
                    {getLocalizedCity(verifyingSeller.city, language)} — {verifyingSeller.bazaar_name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#737373]">{verifyingSeller.address_details}</p>
                </div>

                <div className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3">
                  <span className="text-[#737373] font-medium">{t.merchantContact}</span>
                  <p className="mt-1 font-bold text-[#171717]">
                    {verifyingSeller.owner_name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-[#737373]">{verifyingSeller.phone}</span>
                    <a
                      href={`https://wa.me/${verifyingSeller.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      (واتسئاپ)
                    </a>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-bold text-[#171717]">{t.verificationNotes}</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="تێبینیەکانی پشکنین، سەردانی مەیدانی، یان مۆڵەت بنووسە..."
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center justify-between border-t border-[#EAE7DF] pt-4 gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateSellerVerification(verifyingSeller.id, 'suspended', adminNotes);
                      setVerifyingSeller(null);
                    }}
                    className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-colors"
                  >
                    {t.confirmSuspend}
                  </button>
                  <button
                    onClick={() => {
                      updateSellerVerification(verifyingSeller.id, 'unverified', adminNotes);
                      setVerifyingSeller(null);
                    }}
                    className="rounded-xl border border-[#EAE7DF] bg-white px-3 py-2 text-xs font-semibold text-[#737373] hover:bg-[#FAF9F6]"
                  >
                    پەسەندنەکراو
                  </button>
                </div>

                <button
                  onClick={() => {
                    updateSellerVerification(verifyingSeller.id, 'verified', adminNotes);
                    setVerifyingSeller(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-4 py-2 text-xs font-bold text-white hover:bg-[#536543] shadow-sm transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.confirmVerify}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: Merchant Inventory Drawer */}
      {selectedDrawerSeller && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="relative flex h-full w-full max-w-lg flex-col bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#171717]">
                    {getLocalizedField(selectedDrawerSeller, 'name', language)}
                  </h3>
                  {selectedDrawerSeller.verification_status === 'verified' && (
                    <ShieldCheck className="h-4 w-4 text-[#657A52]" />
                  )}
                </div>
                <p className="text-xs text-[#737373]">
                  {getLocalizedCity(selectedDrawerSeller.city, language)} — {selectedDrawerSeller.bazaar_name}
                </p>
              </div>

              <button
                onClick={() => setSelectedDrawerSeller(null)}
                className="rounded-lg p-1.5 text-[#737373] hover:bg-[#FAF9F6] hover:text-[#171717]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inventory List */}
            <div className="mt-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#171717]">
                  کاڵاکانی فرۆشگا ({products.filter(p => p.seller_id === selectedDrawerSeller.id).length} دانە)
                </span>
                {onOpenNewProductForSeller && (
                  <button
                    onClick={() => {
                      const id = selectedDrawerSeller.id;
                      setSelectedDrawerSeller(null);
                      onOpenNewProductForSeller(id);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-[#657A52] hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>زیادکردنی کاڵا</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {products.filter(p => p.seller_id === selectedDrawerSeller.id).length === 0 ? (
                  <p className="py-8 text-center text-xs text-[#737373]">
                    ئەم فرۆشیارە هێشتا هیچ کاڵایەکی نییە.
                  </p>
                ) : (
                  products
                    .filter(p => p.seller_id === selectedDrawerSeller.id)
                    .map(product => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 rounded-xl border border-[#EAE7DF] p-3 hover:bg-[#FAF9F6] transition-colors"
                      >
                        <img
                          src={product.primary_image}
                          alt={product.name_en || product.name_ku}
                          className="h-12 w-12 rounded-lg object-cover border border-[#EAE7DF]"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-[#171717] line-clamp-1">
                            {getLocalizedField(product, 'name', language)}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                            <span className="font-extrabold text-[#657A52]">
                              {formatIqd(product.price_iqd, language)}
                            </span>
                            <span className="text-[#737373]">· {product.stock_quantity} لە کۆگا</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                            <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-semibold text-emerald-800">
                              {getLocalizedWarranty(product.warranty_period, product.warranty_type, language)}
                            </span>
                            <span className="text-[#737373]">
                              نمرەی متمانە: {product.transparency_score}٪
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="border-t border-[#EAE7DF] pt-4">
              <a
                href={`https://wa.me/${selectedDrawerSeller.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>پەیوەندی بە فرۆشیار لە واتسئاپ ({selectedDrawerSeller.whatsapp})</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Merchant Profile */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <h3 className="text-base font-extrabold text-[#171717]">{t.editSeller}</h3>
              <button
                onClick={() => setEditingSeller(null)}
                className="rounded-lg p-1.5 text-[#737373] hover:bg-[#FAF9F6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingSeller) return;
                setIsTranslatingEdit(true);

                let updated = { ...editingSeller };
                const baseName = updated.name_ku || updated.name_en || updated.name_ar || '';
                const needEn = !updated.name_en || updated.name_en.trim() === '' || updated.name_en === baseName;
                const needAr = !updated.name_ar || updated.name_ar.trim() === '' || updated.name_ar === baseName;

                if ((needEn || needAr) && baseName) {
                  try {
                    const transRes = await autoTranslateSeller(baseName, updated.bazaar_name);
                    if (needEn) updated.name_en = transRes.nameEn || baseName;
                    if (needAr) updated.name_ar = transRes.nameAr || baseName;
                  } catch (err) {
                    console.warn('Auto translate during seller edit submit warning:', err);
                  }
                }

                try {
                  await updateSeller(updated);
                } finally {
                  setIsTranslatingEdit(false);
                }
                setEditingSeller(null);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#171717]">ناوی دووکان / فرۆشگا بە کوردی *</label>
                  {editingSeller.name_ku && (
                    <button
                      type="button"
                      disabled={isTranslatingEdit}
                      onClick={async () => {
                        setIsTranslatingEdit(true);
                        try {
                          const res = await autoTranslateSeller(editingSeller.name_ku, editingSeller.bazaar_name);
                          setEditingSeller({
                            ...editingSeller,
                            name_en: res.nameEn,
                            name_ar: res.nameAr,
                          });
                        } catch {} finally {
                          setIsTranslatingEdit(false);
                        }
                      }}
                      className="flex items-center gap-1 rounded-lg border border-[#657A52]/30 bg-[#657A52]/10 px-2 py-0.5 text-[11px] font-bold text-[#657A52] hover:bg-[#657A52]/20 transition-colors disabled:opacity-50"
                    >
                      {isTranslatingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      <span>وەرگێڕان بۆ ئینگلیزی و عەرەبی</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  dir="rtl"
                  value={editingSeller.name_ku}
                  onChange={(e) => setEditingSeller({ ...editingSeller, name_ku: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#171717]">ناوی دووکان بە ئینگلیزی (Store Name) *</label>
                  <input
                    type="text"
                    value={editingSeller.name_en}
                    onChange={(e) => setEditingSeller({ ...editingSeller, name_en: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717]">ناوی دووکان بە عەرەبی (اسم المتجر) *</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingSeller.name_ar}
                    onChange={(e) => setEditingSeller({ ...editingSeller, name_ar: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#171717]">ناوی خاوەن کار</label>
                  <input
                    type="text"
                    value={editingSeller.owner_name}
                    onChange={(e) => setEditingSeller({ ...editingSeller, owner_name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717]">شار / پارێزگا</label>
                  <select
                    value={editingSeller.city}
                    onChange={(e) => setEditingSeller({ ...editingSeller, city: e.target.value as KurdishCity })}
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs focus:border-[#657A52] focus:bg-white focus:outline-none"
                  >
                    <option value="Sulaymaniyah">سلێمانی</option>
                    <option value="Erbil">هەولێر</option>
                    <option value="Duhok">دهۆک</option>
                    <option value="Halabja">هەڵەبجە</option>
                    <option value="Kirkuk">کەرکووک</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#171717]">ژمارەی مۆبایل</label>
                  <input
                    type="text"
                    value={editingSeller.phone}
                    onChange={(e) => setEditingSeller({ ...editingSeller, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717]">ژمارەی واتسئاپ</label>
                  <input
                    type="text"
                    value={editingSeller.whatsapp}
                    onChange={(e) => setEditingSeller({ ...editingSeller, whatsapp: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#171717]">ناونیشانی بازاڕ و شوێنی دووکان</label>
                <input
                  type="text"
                  value={editingSeller.bazaar_name}
                  onChange={(e) => setEditingSeller({ ...editingSeller, bazaar_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#171717]">{t.shopFacade}</label>
                <div className="mt-2">
                  <ImageUploadDropzone
                    images={editingSeller.facade_image_url ? [editingSeller.facade_image_url] : []}
                    primaryImage={editingSeller.facade_image_url}
                    onImagesChange={(imgs) => setEditingSeller({ ...editingSeller, facade_image_url: imgs[0] || '' })}
                    onPrimaryImageChange={(primary) => setEditingSeller({ ...editingSeller, facade_image_url: primary })}
                    bucket="seller-facades"
                    maxFiles={1}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#EAE7DF] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSeller(null)}
                  className="rounded-xl border border-[#EAE7DF] bg-white px-4 py-2 font-semibold text-[#737373] hover:bg-[#FAF9F6]"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isTranslatingEdit}
                  className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-5 py-2 font-bold text-white hover:bg-[#536543] shadow-sm disabled:opacity-75 transition-all"
                >
                  {isTranslatingEdit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>وەرگێڕانی خۆکار...</span>
                    </>
                  ) : (
                    <span>{t.saveChanges}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
