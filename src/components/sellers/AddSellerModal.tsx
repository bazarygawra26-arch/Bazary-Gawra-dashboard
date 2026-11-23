'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { KurdishCity } from '@/types/database';
import { X, Store, CheckCircle2, Languages, Loader2 } from 'lucide-react';
import { ImageUploadDropzone } from '@/components/common/ImageUploadDropzone';
import { autoTranslateSeller, getLocalizedCity } from '@/lib/translator';
import { adminPanelTranslations } from '@/lib/adminPanelTranslations';

interface AddSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSellerModal({ isOpen, onClose }: AddSellerModalProps) {
  const { t, language, addSeller } = useAdmin();
  const copy = adminPanelTranslations[language];

  const [nameKu, setNameKu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+964 770 ');
  const [whatsapp, setWhatsapp] = useState('964770');
  const [city, setCity] = useState<KurdishCity>('Sulaymaniyah');
  const [bazaarName, setBazaarName] = useState('شەقامی مەولەوی (Mawlawi St)');
  const [addressDetails, setAddressDetails] = useState('');
  const [facadeImageUrl, setFacadeImageUrl] = useState('https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleNameKuBlur = async () => {
    if (!nameKu || nameKu.trim() === '') return;
    if (!nameEn || nameEn === nameKu || !nameAr || nameAr === nameKu) {
      setIsTranslating(true);
      try {
        const res = await autoTranslateSeller(nameKu, bazaarName);
        if (!nameEn || nameEn === nameKu) setNameEn(res.nameEn);
        if (!nameAr || nameAr === nameKu) setNameAr(res.nameAr);
      } catch (err) {
        console.warn('Auto translate seller on blur warning:', err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleAutoTranslate = async () => {
    if (!nameKu) return;
    setIsTranslating(true);
    try {
      const res = await autoTranslateSeller(nameKu, bazaarName);
      setNameEn(res.nameEn);
      setNameAr(res.nameAr);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTranslating(true);

    let finalNameEn = nameEn;
    let finalNameAr = nameAr;
    const baseName = nameKu || nameEn || nameAr;

    // AUTOMATIC TRANSLATION: If EN or AR are empty or identical to Kurdish, auto-translate now!
    const needEn = !finalNameEn || finalNameEn.trim() === '' || finalNameEn === baseName;
    const needAr = !finalNameAr || finalNameAr.trim() === '' || finalNameAr === baseName;

    if (needEn || needAr) {
      try {
        const res = await autoTranslateSeller(baseName, bazaarName);
        if (needEn) finalNameEn = res.nameEn || baseName;
        if (needAr) finalNameAr = res.nameAr || baseName;
      } catch (err) {
        console.warn('Auto-translate seller on submit fallback:', err);
      }
    }

    try {
      await addSeller({
        name_ku: baseName,
        name_en: finalNameEn || baseName,
        name_ar: finalNameAr || baseName,
        owner_name: ownerName,
        phone,
        whatsapp,
        city,
        bazaar_name: bazaarName,
        address_details: addressDetails,
        facade_image_url: facadeImageUrl,
        logo_url: facadeImageUrl,
        verification_status: 'pending',
        transparency_score: 60,
        notes: 'New merchant self-registered through onboarding.',
      });
    } finally {
      setIsTranslating(false);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#657A52]/10 text-[#657A52]">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#171717]">{t.addMerchant}</h3>
              <p className="text-xs text-[#737373]">{copy.newSellerSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#737373] hover:bg-[#FAF9F6] hover:text-[#171717]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#171717]">{copy.sellerNameKurdish} *</label>
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
            <input
              type="text"
              dir="rtl"
              value={nameKu}
              onChange={(e) => setNameKu(e.target.value)}
              onBlur={handleNameKuBlur}
              placeholder={copy.sellerNameKurdishExample}
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#171717]">{copy.sellerNameEnglish} *</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Mawlawi Mobile Store"
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="font-bold text-[#171717]">{copy.ownerFullName} *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder={copy.ownerNameExample}
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#171717]">{copy.provinceCity} *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as KurdishCity)}
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-medium text-[#171717] focus:border-[#657A52] focus:outline-none"
              >
                <option value="Sulaymaniyah">{getLocalizedCity('Sulaymaniyah', language)}</option>
                <option value="Erbil">{getLocalizedCity('Erbil', language)}</option>
                <option value="Duhok">{getLocalizedCity('Duhok', language)}</option>
                <option value="Halabja">{getLocalizedCity('Halabja', language)}</option>
                <option value="Kirkuk">{getLocalizedCity('Kirkuk', language)}</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#171717]">{copy.bazaarNeighborhood} *</label>
              <input
                type="text"
                value={bazaarName}
                onChange={(e) => setBazaarName(e.target.value)}
                placeholder={copy.bazaarExample}
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#171717]">{copy.phoneLabel} *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="font-bold text-[#171717]">{copy.whatsappWithoutPlus} *</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="9647701234567"
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#171717]">{copy.addressDetails}</label>
            <input
              type="text"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder={copy.addressExample}
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-[#171717]">{t.shopFacade}</label>
            <div className="mt-2">
              <ImageUploadDropzone
                images={facadeImageUrl ? [facadeImageUrl] : []}
                primaryImage={facadeImageUrl}
                onImagesChange={(imgs) => setFacadeImageUrl(imgs[0] || '')}
                onPrimaryImageChange={(primary) => setFacadeImageUrl(primary)}
                bucket="seller-facades"
                maxFiles={1}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#EAE7DF] pt-4">
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
              className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-5 py-2 font-bold text-white hover:bg-[#536543] shadow-sm disabled:opacity-75 transition-all"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{copy.translatingSaving}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.addMerchant}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
