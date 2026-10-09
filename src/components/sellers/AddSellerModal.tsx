'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { KurdishCity } from '@/types/database';
import { X, Store, CheckCircle2 } from 'lucide-react';
import { ImageUploadDropzone } from '@/components/common/ImageUploadDropzone';

interface AddSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSellerModal({ isOpen, onClose }: AddSellerModalProps) {
  const { t, addSeller } = useAdmin();

  const [nameKu, setNameKu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+964 770 ');
  const [whatsapp, setWhatsapp] = useState('964770');
  const [city, setCity] = useState<KurdishCity>('Sulaymaniyah');
  const [bazaarName, setBazaarName] = useState('شەقامی مەولەوی (Mawlawi St)');
  const [addressDetails, setAddressDetails] = useState('');
  const [facadeImageUrl, setFacadeImageUrl] = useState('https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSeller({
      name_ku: nameKu || nameEn,
      name_en: nameEn || nameKu,
      name_ar: nameEn || nameKu,
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
              <p className="text-xs text-[#737373]">تۆمارکردنی فرۆشگا و دووکانی فیزیایی لە بازاڕەکانی کوردستان</p>
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
            <label className="font-bold text-[#171717]">ناوی دووکان بە کوردی *</label>
            <input
              type="text"
              dir="rtl"
              value={nameKu}
              onChange={(e) => setNameKu(e.target.value)}
              placeholder="نموونە: فرۆشگای مۆبایلی مەولەوی"
              className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#171717]">ناوی دووکان بە ئینگلیزی (Store Name) *</label>
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
              <label className="font-bold text-[#171717]">ناوی تەواوی خاوەن کار *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="ناوی سیانی خاوەن کار"
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#171717]">پارێزگا / شار *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as KurdishCity)}
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs font-medium text-[#171717] focus:border-[#657A52] focus:outline-none"
              >
                <option value="Sulaymaniyah">سلێمانی (Sulaymaniyah)</option>
                <option value="Erbil">هەولێر (Erbil)</option>
                <option value="Duhok">دهۆک (Duhok)</option>
                <option value="Halabja">هەڵەبجە (Halabja)</option>
                <option value="Kirkuk">کەرکووک (Kirkuk)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#171717]">بازاڕ / گەڕەک *</label>
              <input
                type="text"
                value={bazaarName}
                onChange={(e) => setBazaarName(e.target.value)}
                placeholder="نموونە: شەقامی مەولەوی، قەیسەری"
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#171717]">ژمارەی مۆبایل *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-2.5 text-xs text-[#171717] focus:border-[#657A52] focus:bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="font-bold text-[#171717]">ژمارەی واتسئاپ (بەبێ +) *</label>
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
            <label className="font-bold text-[#171717]">ناونیشانی وردی دووکان</label>
            <input
              type="text"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder="نموونە: نزیک مزگەوتی گەورە، دووکانی ١٨"
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
              className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-5 py-2 font-bold text-white hover:bg-[#536543] shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{t.addMerchant}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
