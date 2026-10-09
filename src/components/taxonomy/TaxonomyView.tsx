'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { 
  MapPin, 
  Layers, 
  Apple, 
  UtensilsCrossed, 
  Tv, 
  Smartphone, 
  Sparkles, 
  BookOpen,
  Plus,
  X,
  Check,
  Globe
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'Layers', label: 'گشتی (Layers)' },
  { id: 'Apple', label: 'خۆراک و میوە (Food/Apple)' },
  { id: 'UtensilsCrossed', label: 'چێشتخانە (Kitchen)' },
  { id: 'Tv', label: 'ئامێری ناوماڵ (Home Appliances)' },
  { id: 'Smartphone', label: 'مۆبایل و تەکنەلۆژیا (Tech)' },
  { id: 'Sparkles', label: 'جوانی و کەلەپوور (Beauty/Crafts)' },
  { id: 'BookOpen', label: 'کتێب و ڕۆشنبیری (Books)' },
];

export function TaxonomyView() {
  const { t, language, cities, categories, sellers, products, addCategory } = useAdmin();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [nameKu, setNameKu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Layers');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple': return <Apple className="h-5 w-5 text-emerald-600" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="h-5 w-5 text-amber-600" />;
      case 'Tv': return <Tv className="h-5 w-5 text-blue-600" />;
      case 'Smartphone': return <Smartphone className="h-5 w-5 text-indigo-600" />;
      case 'Sparkles': return <Sparkles className="h-5 w-5 text-purple-600" />;
      case 'BookOpen': return <BookOpen className="h-5 w-5 text-amber-700" />;
      default: return <Layers className="h-5 w-5 text-[#737373]" />;
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKu.trim() || !nameEn.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedSlug = slug.trim() || nameEn.trim().toLowerCase().replace(/\s+/g, '-');
      await addCategory({
        slug: generatedSlug,
        name_ku: nameKu.trim(),
        name_en: nameEn.trim(),
        name_ar: nameAr.trim() || nameEn.trim(),
        icon: icon,
      });

      // Reset
      setNameKu('');
      setNameEn('');
      setNameAr('');
      setSlug('');
      setIcon('Layers');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#171717]">
          {t.taxonomyTitle}
        </h1>
        <p className="mt-1 text-xs text-[#737373]">
          {t.taxonomySubtitle}
        </p>
      </div>

      {/* SECTION 1: Cities & Bazaars in Kurdistan */}
      <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#EAE7DF] pb-3">
          <MapPin className="h-5 w-5 text-[#657A52]" />
          <div>
            <h2 className="text-sm font-bold text-[#171717]">پارێزگاکانی کوردستان و بازاڕە مێژووییەکان</h2>
            <p className="text-[11px] text-[#737373]">ناوەندە چالاکە ناوخۆییەکان و بازاڕە پەسەندکراوەکان</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map(city => {
            const citySellers = sellers.filter(s => s.city === city.name_en);
            const verifiedCitySellers = citySellers.filter(s => s.verification_status === 'verified');

            return (
              <div
                key={city.id}
                className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#171717]">
                      {language === 'ku' ? city.name_ku : language === 'ar' ? city.name_ar : city.name_en}
                    </h3>
                    <p className="text-[10px] text-[#737373]">{city.name_en}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {verifiedCitySellers.length} پەسەندکراو
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#737373]">
                    بازاڕە سەرەکییەکان:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {city.bazaars.map((bazaar, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-[#EAE7DF] bg-white px-2 py-0.5 text-[10px] font-medium text-[#171717]"
                      >
                        {bazaar}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#EAE7DF] pt-2 text-[11px] text-[#737373]">
                  <span>کۆی فرۆشیاران:</span>
                  <span className="font-bold text-[#171717]">{citySellers.length} فرۆشگا</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Marketplace Categories */}
      <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#F4B942]" />
            <div>
              <h2 className="text-sm font-bold text-[#171717]">
                {language === 'ku' ? 'پۆلەکانی بازاڕی گەورە (بە سێ زمان)' : language === 'ar' ? 'فئات بازاري گەورە (بثلاث لغات)' : 'Marketplace Categories (Trilingual)'}
              </h2>
              <p className="text-[11px] text-[#737373]">
                {language === 'ku' ? 'پۆلێنکردنی فەرمی بە زمانی کوردی، ئینگلیزی و عەرەبی لە داتابەیس' : 'Standard 3-language category taxonomy synchronized with Supabase'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{language === 'ku' ? 'زیادکردنی پۆل' : language === 'ar' ? 'إضافة فئة' : 'Add Category'}</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => {
            const catProducts = products.filter(p => p.category_id === cat.id);

            return (
              <div
                key={cat.id}
                className="flex items-start gap-3.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE7DF] shadow-xs">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-extrabold text-[#171717] truncate">
                      {language === 'ku' ? cat.name_ku : language === 'ar' ? cat.name_ar : cat.name_en}
                    </h3>
                    <span className="text-[10px] font-bold text-[#657A52] shrink-0">
                      {catProducts.length} کاڵا
                    </span>
                  </div>

                  {/* Trilingual Subtitles */}
                  <div className="mt-1 space-y-0.5 text-[10px] text-[#737373]">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-neutral-500">کوردی:</span>
                      <span className="truncate text-neutral-800">{cat.name_ku}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-neutral-500">EN:</span>
                      <span className="truncate text-neutral-800">{cat.name_en}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-neutral-500">عربي:</span>
                      <span className="truncate text-neutral-800">{cat.name_ar}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Category in 3 Languages */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EAE7DF] shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFF5DD] rounded-xl text-[#8C5E00]">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#171717]">
                    {language === 'ku' ? 'زیادکردنی پۆلی نوێ (بە ٣ زمان)' : 'Add Trilingual Category'}
                  </h3>
                  <p className="text-[11px] text-[#737373]">
                    {language === 'ku' ? 'ناوی پۆلەکە بە کوردی، ئینگلیزی و عەرەبی داخڵ بکە' : 'Enter category name in Kurdish, English and Arabic'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  ناوی پۆل بە کوردی (Kurdish Name) *
                </label>
                <input
                  type="text"
                  required
                  value={nameKu}
                  onChange={(e) => setNameKu(e.target.value)}
                  placeholder="نموونە: ئامێری تەندروستی"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#F4B942]"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  English Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Example: Health & Wellness"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#F4B942]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  اسم الفئة بالعربية (Arabic Name)
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: الصحة والعافية"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#F4B942]"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Slug / ناسێنەر
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="health-wellness"
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#F4B942]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    هێما (Icon)
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] focus:bg-white focus:outline-none focus:border-[#F4B942]"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE7DF]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EAE7DF] hover:bg-neutral-50 text-neutral-700 font-bold"
                >
                  پەشیمانبوونەوە
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !nameKu.trim() || !nameEn.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4B942] hover:bg-[#E2A732] text-neutral-950 font-black shadow-xs disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{isSubmitting ? 'خەریکی پاشەکەوتکردنە...' : 'پاشەکەوتکردن'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
