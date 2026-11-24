'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { MarketplaceGlossaryTerm } from '@/types/database';
import { 
  Languages, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  BookOpen, 
  Edit2, 
  Check,
  RefreshCw
} from 'lucide-react';
import { adminPanelTranslations } from '@/lib/adminPanelTranslations';
import { ensureMultilingualProduct, ensureMultilingualSeller } from '@/lib/translator';

export function TranslationManagementView() {
  const { 
    language, 
    products, 
    sellers, 
    updateProduct, 
    updateSeller, 
    glossaryTerms, 
    manageGlossaryTerm 
  } = useAdmin();
  const copy = adminPanelTranslations[language];

  const [activeTab, setActiveTab] = useState<'glossary' | 'missing' | 'scanner'>('glossary');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal for new/edit glossary term
  const [editingTerm, setEditingTerm] = useState<Partial<MarketplaceGlossaryTerm> | null>(null);
  const [formKu, setFormKu] = useState('');
  const [formAr, setFormAr] = useState('');
  const [formEn, setFormEn] = useState('');
  const [formCat, setFormCat] = useState('General');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);

  // Missing translation detection
  const untranslatedProducts = products.filter(
    p => !p.name_en || p.name_en === p.name_ku || !p.name_ar || p.name_ar === p.name_ku || !p.description_en || !p.description_ar
  );

  const untranslatedSellers = sellers.filter(
    s => !s.name_en || s.name_en === s.name_ku || !s.name_ar || s.name_ar === s.name_ku
  );

  const handleOpenAddTerm = () => {
    setEditingTerm({});
    setFormKu('');
    setFormAr('');
    setFormEn('');
    setFormCat('General');
    setFormNotes('');
  };

  const handleOpenEditTerm = (term: MarketplaceGlossaryTerm) => {
    setEditingTerm(term);
    setFormKu(term.term_ku);
    setFormAr(term.term_ar);
    setFormEn(term.term_en);
    setFormCat(term.category || 'General');
    setFormNotes(term.notes || '');
  };

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKu.trim() || !formEn.trim()) return;
    setIsSaving(true);
    try {
      await manageGlossaryTerm({
        id: editingTerm?.id,
        term_ku: formKu.trim(),
        term_ar: formAr.trim() || formEn.trim(),
        term_en: formEn.trim(),
        category: formCat,
        notes: formNotes.trim(),
        status: 'approved',
      });
      setEditingTerm(null);
    } catch (err) {
      console.error('Failed to save glossary term:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFixAllMissingTranslations = async () => {
    setIsAutoTranslating(true);
    try {
      // 1. Enrich products
      for (const p of untranslatedProducts) {
        const enriched = await ensureMultilingualProduct(p);
        await updateProduct(enriched);
      }
      // 2. Enrich sellers
      for (const s of untranslatedSellers) {
        const enriched = await ensureMultilingualSeller(s);
        await updateSeller(enriched);
      }
    } catch (err) {
      console.error('Error auto-translating missing records:', err);
    } finally {
      setIsAutoTranslating(false);
    }
  };

  const filteredGlossary = glossaryTerms.filter(g => {
    const matchesSearch = 
      !searchTerm ||
      g.term_ku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.term_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.term_en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || g.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = ['all', ...new Set(glossaryTerms.map(g => g.category || 'General'))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-[#202820]">
              {language === 'ku' ? 'بەڕێوەبردنی وەرگێڕان و زاراوەکانی بازاڕ' : language === 'ar' ? 'إدارة الترجمة ومصطلحات السوق' : 'Translation & Bazaar Glossary Management'}
            </h1>
            <span className="rounded-full bg-[#18794E]/10 px-2 py-0.5 text-[10px] font-bold text-[#18794E]">
              TRILINGUAL (KU · AR · EN)
            </span>
          </div>
          <p className="mt-1 text-xs text-[#737373]">
            {language === 'ku'
              ? 'چاودێری و وردبینیکردنی وەرگێڕانی کوردی سۆرانی، عەرەبی و ئینگلیزی، ڕێکخستنی زاراوە کەلەپوورییەکان و چارەسەری کاڵا وەرنەگێڕدراوەکان.'
              : language === 'ar'
                ? 'مراجعة الترجمات الكردية والعربية والإنجليزية، وإدارة القاموس المتخصص وحل النصوص غير المترجمة.'
                : 'Review Kurdish Sorani, Arabic, and English translations, manage local bazaar terminology, and resolve missing catalog translations.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {untranslatedProducts.length + untranslatedSellers.length > 0 && (
            <button
              onClick={handleFixAllMissingTranslations}
              disabled={isAutoTranslating}
              className="flex items-center gap-1.5 rounded-xl bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#135f3d] shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isAutoTranslating ? 'animate-spin' : ''}`} />
              <span>
                {language === 'ku'
                  ? `وەرگێڕانی خۆکاری هەموو کەموکوڕییەکان (${untranslatedProducts.length + untranslatedSellers.length})`
                  : language === 'ar'
                    ? `ترجمة آلية للمحتوى المتبقي (${untranslatedProducts.length + untranslatedSellers.length})`
                    : `Auto-Translate All Missing (${untranslatedProducts.length + untranslatedSellers.length})`}
              </span>
            </button>
          )}

          <button
            onClick={handleOpenAddTerm}
            className="flex items-center gap-1.5 rounded-xl bg-[#F4B83F] px-4 py-2 text-xs font-bold text-[#202820] hover:bg-[#e0a634] shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{language === 'ku' ? 'زیادکردنی زاراوە' : language === 'ar' ? 'إضافة مصطلح' : 'Add Term'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EAE7DF] gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('glossary')}
          className={`pb-3 transition-colors ${
            activeTab === 'glossary'
              ? 'border-b-2 border-[#18794E] text-[#18794E]'
              : 'text-[#737373] hover:text-[#202820]'
          }`}
        >
          {language === 'ku' ? `قاموسی زاراوە ناوخۆییەکان (${glossaryTerms.length})` : language === 'ar' ? `قاموس المصطلحات المحلية (${glossaryTerms.length})` : `Marketplace Glossary (${glossaryTerms.length})`}
        </button>
        <button
          onClick={() => setActiveTab('missing')}
          className={`pb-3 flex items-center gap-1.5 transition-colors ${
            activeTab === 'missing'
              ? 'border-b-2 border-[#18794E] text-[#18794E]'
              : 'text-[#737373] hover:text-[#202820]'
          }`}
        >
          <span>{language === 'ku' ? 'کاڵا و دووکانە وەرنەگێڕدراوەکان' : language === 'ar' ? 'السجلات غير المكتملة' : 'Missing Translations Audit'}</span>
          {(untranslatedProducts.length + untranslatedSellers.length > 0) && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800 font-extrabold">
              {untranslatedProducts.length + untranslatedSellers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Glossary Table */}
      {activeTab === 'glossary' && (
        <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white shadow-xs">
          <div className="flex flex-col gap-2 border-b border-[#EAE7DF] p-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-2.5 h-4 w-4 text-[#737373]" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={language === 'ku' ? 'گەڕان لە زاراوە کوردی، عەرەبی یان ئینگلیزییەکان...' : 'Search Kurdish, Arabic, or English terms...'}
                className="w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] py-2 pe-3 ps-9 text-xs focus:border-[#18794E] focus:outline-hidden"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202820]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF9F6] text-[#737373]">
                <tr>
                  <th className="px-4 py-3 text-start">{language === 'ku' ? 'زاراوەی کوردی سۆرانی' : 'Kurdish (Sorani)'}</th>
                  <th className="px-4 py-3 text-start">{language === 'ar' ? 'المصطلح العربي' : 'Arabic (ar)'}</th>
                  <th className="px-4 py-3 text-start">English (en)</th>
                  <th className="px-4 py-3 text-start">{language === 'ku' ? 'پۆل' : 'Category'}</th>
                  <th className="px-4 py-3 text-start">{language === 'ku' ? 'بارودۆخ' : 'Status'}</th>
                  <th className="px-4 py-3 text-end">{language === 'ku' ? 'کردارەکان' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DF]">
                {filteredGlossary.map(term => (
                  <tr key={term.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#202820] font-kurdish">{term.term_ku}</td>
                    <td className="px-4 py-3 text-[#202820]">{term.term_ar}</td>
                    <td className="px-4 py-3 font-medium text-[#202820]">{term.term_en}</td>
                    <td className="px-4 py-3 text-[#737373]">
                      <span className="rounded-lg bg-[#FAF9F6] border border-[#EAE7DF] px-2 py-0.5 text-[10px] font-semibold">
                        {term.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        {term.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        onClick={() => handleOpenEditTerm(term)}
                        className="rounded-lg border border-[#EAE7DF] p-1.5 text-[#737373] hover:bg-white hover:text-[#202820] transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Missing Translations Detection */}
      {activeTab === 'missing' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-900">
                  {language === 'ku' ? 'وردبینی تۆمارە وەرنەگێڕدراوەکان' : 'Missing Multilingual Content Audit'}
                </h3>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  {language === 'ku'
                    ? `کۆی گشتی ${untranslatedProducts.length} کاڵا و ${untranslatedSellers.length} دووکان پێویستیان بە وەرگێڕانی تەواوەتی هەیە بۆ هەرسێ زمانی کوردی، عەرەبی و ئینگلیزی.`
                    : `Identified ${untranslatedProducts.length} products and ${untranslatedSellers.length} storefronts lacking completed trilingual entries.`}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
            <div className="p-4 border-b border-[#EAE7DF] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#202820]">
                {language === 'ku' ? 'کاڵا پێویست بە وەرگێڕانەکان' : 'Products Requiring Localization'}
              </h3>
              <span className="text-xs text-[#737373]">
                {untranslatedProducts.length} items
              </span>
            </div>
            {untranslatedProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-700 font-bold">
                ✓ {language === 'ku' ? 'هەموو کاڵاکان بە تەواوی وەرگێڕدراون بۆ هەرسێ زمان!' : 'All catalog listings are fully localized in Kurdish, Arabic, and English!'}
              </div>
            ) : (
              <div className="divide-y divide-[#EAE7DF]">
                {untranslatedProducts.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#FAF9F6]">
                    <div>
                      <p className="font-bold text-xs text-[#202820]">{p.name_ku || p.name_en}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-[#737373]">
                        <span className="rounded bg-amber-50 text-amber-800 px-1.5 py-0.2 font-semibold">
                          EN: {p.name_en || 'Missing'}
                        </span>
                        <span className="rounded bg-amber-50 text-amber-800 px-1.5 py-0.2 font-semibold">
                          AR: {p.name_ar || 'Missing'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        const enriched = await ensureMultilingualProduct(p);
                        await updateProduct(enriched);
                      }}
                      className="flex items-center gap-1 rounded-xl border border-[#18794E] px-3 py-1.5 text-xs font-bold text-[#18794E] hover:bg-[#18794E] hover:text-white transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{language === 'ku' ? 'وەرگێڕانی زیرەک' : 'Auto-Translate'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editingTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-xl">
            <h2 className="text-base font-extrabold text-[#202820]">
              {editingTerm.id ? (language === 'ku' ? 'دەستکاریکردنی زاراوە' : 'Edit Glossary Term') : (language === 'ku' ? 'زیادکردنی زاراوەی نوێ' : 'Add New Glossary Term')}
            </h2>
            <form onSubmit={handleSaveTerm} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">Kurdish Sorani (کوردی سۆرانی) *</label>
                <input
                  value={formKu}
                  onChange={e => setFormKu(e.target.value)}
                  placeholder="e.g. چاییکەری کارەبایی"
                  required
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">Arabic (العربية) *</label>
                <input
                  value={formAr}
                  onChange={e => setFormAr(e.target.value)}
                  placeholder="e.g. صانعة شاي كهربائية"
                  required
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">English (en) *</label>
                <input
                  value={formEn}
                  onChange={e => setFormEn(e.target.value)}
                  placeholder="e.g. Electric Samovar & Tea Maker"
                  required
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">Category</label>
                <input
                  value={formCat}
                  onChange={e => setFormCat(e.target.value)}
                  placeholder="Kitchenware, Organic Food, Electronics..."
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">Notes & Context</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Traditional cultural context or bazaar usage..."
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE7DF]">
                <button
                  type="button"
                  onClick={() => setEditingTerm(null)}
                  className="rounded-xl border border-[#EAE7DF] px-4 py-2 text-xs font-bold text-[#737373] hover:bg-[#FAF9F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#135f3d] disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
