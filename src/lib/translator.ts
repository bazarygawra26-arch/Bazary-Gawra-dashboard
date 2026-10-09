/**
 * Dynamic Multilingual Translation Engine & Localized Field Fallbacks
 * Handles automated translation for Kurdish Sorani, Arabic, and English.
 */

export interface TranslationResult {
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
}

export interface SellerTranslationResult {
  nameEn: string;
  nameAr: string;
  bazaarEn: string;
  bazaarAr: string;
}

/**
 * Universal Fallback: Get localized field cleanly without ever showing undefined/blank
 */
export function getLocalizedField(
  item: Record<string, any> | null | undefined,
  fieldPrefix: string,
  locale: string = 'ku'
): string {
  if (!item) return '';

  // 1. Try requested locale
  const primaryKey = `${fieldPrefix}_${locale}`;
  if (item[primaryKey] && String(item[primaryKey]).trim() !== '') {
    return String(item[primaryKey]);
  }

  // 2. Try Kurdish (Platform primary bazaar language)
  const kuKey = `${fieldPrefix}_ku`;
  if (item[kuKey] && String(item[kuKey]).trim() !== '') {
    return String(item[kuKey]);
  }

  // 3. Try English
  const enKey = `${fieldPrefix}_en`;
  if (item[enKey] && String(item[enKey]).trim() !== '') {
    return String(item[enKey]);
  }

  // 4. Try Arabic
  const arKey = `${fieldPrefix}_ar`;
  if (item[arKey] && String(item[arKey]).trim() !== '') {
    return String(item[arKey]);
  }

  // 5. Try plain property name if exists (e.g. "bazaar_name", "title")
  if (item[fieldPrefix] && String(item[fieldPrefix]).trim() !== '') {
    return String(item[fieldPrefix]);
  }

  return '';
}

/**
 * Dynamically translate any string via the Next.js translation engine
 */
export async function translateText(text: string, toLang: 'en' | 'ar' | 'ku' = 'en'): Promise<string> {
  if (!text || !text.trim()) return '';

  const clean = text.trim();

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, to: toLang }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.translatedText && String(data.translatedText).trim()) {
        return String(data.translatedText).trim();
      }
    }
  } catch (err) {
    console.warn('API translation call failed, using fallback:', err);
  }

  // Fallback: Direct client MyMemory query if API endpoint is unreachable
  try {
    const targetLang = toLang === 'ar' ? 'ar' : toLang === 'ku' ? 'ckb' : 'en';
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      clean
    )}&langpair=ckb|${targetLang}`;
    const directRes = await fetch(myMemoryUrl);
    if (directRes.ok) {
      const d = await directRes.json();
      if (d?.responseData?.translatedText) {
        return String(d.responseData.translatedText).trim();
      }
    }
  } catch (directErr) {
    console.warn('Direct translation fallback error:', directErr);
  }

  return clean;
}

/**
 * Translate multiple strings in one batch request
 */
export async function translateBatch(texts: string[], toLang: 'en' | 'ar' | 'ku' = 'en'): Promise<string[]> {
  if (!texts || texts.length === 0) return [];

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, to: toLang }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.translatedTexts)) {
        return data.translatedTexts;
      }
    }
  } catch (err) {
    console.warn('Batch translation error, falling back to sequential:', err);
  }

  // Fallback sequentially
  return Promise.all(texts.map(t => translateText(t, toLang)));
}

/**
 * Dynamically auto-translate Product Name & Description into English & Arabic
 */
export async function autoTranslateProduct(
  nameKu: string,
  descKu: string
): Promise<TranslationResult> {
  const [nameEn, nameAr] = await Promise.all([
    nameKu ? translateText(nameKu, 'en') : Promise.resolve(''),
    nameKu ? translateText(nameKu, 'ar') : Promise.resolve(''),
  ]);

  const [descEn, descAr] = await Promise.all([
    descKu ? translateText(descKu, 'en') : Promise.resolve(''),
    descKu ? translateText(descKu, 'ar') : Promise.resolve(''),
  ]);

  return {
    nameEn: nameEn || nameKu,
    nameAr: nameAr || nameKu,
    descEn: descEn || descKu,
    descAr: descAr || descKu,
  };
}

/**
 * Dynamically auto-translate Seller Store Name & Bazaar
 */
export async function autoTranslateSeller(
  nameKu: string,
  bazaarName: string
): Promise<SellerTranslationResult> {
  const [nameEn, nameAr] = await Promise.all([
    nameKu ? translateText(nameKu, 'en') : Promise.resolve(''),
    nameKu ? translateText(nameKu, 'ar') : Promise.resolve(''),
  ]);

  const [bazaarEn, bazaarAr] = await Promise.all([
    bazaarName ? translateText(bazaarName, 'en') : Promise.resolve(''),
    bazaarName ? translateText(bazaarName, 'ar') : Promise.resolve(''),
  ]);

  return {
    nameEn: nameEn || nameKu,
    nameAr: nameAr || nameKu,
    bazaarEn: bazaarEn || bazaarName,
    bazaarAr: bazaarAr || bazaarName,
  };
}

/**
 * Helper to check if a field is effectively missing or just an untranslated copy of Kurdish
 */
function isUntranslated(value: any, kurdishOriginal: any): boolean {
  if (!value || typeof value !== 'string') return true;
  const trimmed = value.trim();
  if (trimmed === '') return true;
  // If it's identical to the Kurdish original, it wasn't actually translated yet
  if (kurdishOriginal && trimmed === String(kurdishOriginal).trim()) return true;
  return false;
}

/**
 * Automatically inspects any product payload before saving.
 * If any language (EN or AR) is missing or untranslated, it dynamically translates it on the fly!
 */
export async function ensureMultilingualProduct<T extends Record<string, any>>(productData: T): Promise<T> {
  const result: Record<string, any> = { ...productData };
  const baseName = result.name_ku || result.name_en || result.name_ar || '';
  const baseDesc = result.description_ku || result.description_en || result.description_ar || '';

  if (baseName) {
    // Check if English name is missing or untranslated
    if (isUntranslated(result.name_en, result.name_ku)) {
      result.name_en = (await translateText(baseName, 'en')) || baseName;
    }
    // Check if Arabic name is missing or untranslated
    if (isUntranslated(result.name_ar, result.name_ku)) {
      result.name_ar = (await translateText(baseName, 'ar')) || baseName;
    }
    if (!result.name_ku || result.name_ku.trim() === '') {
      result.name_ku = baseName;
    }
  }

  if (baseDesc) {
    // Check if English description is missing or untranslated
    if (isUntranslated(result.description_en, result.description_ku)) {
      result.description_en = (await translateText(baseDesc, 'en')) || baseDesc;
    }
    // Check if Arabic description is missing or untranslated
    if (isUntranslated(result.description_ar, result.description_ku)) {
      result.description_ar = (await translateText(baseDesc, 'ar')) || baseDesc;
    }
    if (!result.description_ku || result.description_ku.trim() === '') {
      result.description_ku = baseDesc;
    }
  }

  return result as T;
}

/**
 * Automatically inspects any seller payload before saving.
 * If EN or AR store names are missing or untranslated, it dynamically translates them on the fly!
 */
export async function ensureMultilingualSeller<T extends Record<string, any>>(sellerData: T): Promise<T> {
  const result: Record<string, any> = { ...sellerData };
  const baseName = result.name_ku || result.name_en || result.name_ar || '';

  if (baseName) {
    if (isUntranslated(result.name_en, result.name_ku)) {
      result.name_en = (await translateText(baseName, 'en')) || baseName;
    }
    if (isUntranslated(result.name_ar, result.name_ku)) {
      result.name_ar = (await translateText(baseName, 'ar')) || baseName;
    }
    if (!result.name_ku || result.name_ku.trim() === '') {
      result.name_ku = baseName;
    }
  }

  return result as T;
}
