import { NextRequest, NextResponse } from 'next/server';

// Memory cache to avoid redundant external network queries
const translationCache = new Map<string, string>();

// Specialized Kurdistan Bazaar glossary for terms that need accurate local context
const LOCAL_GLOSSARY: Record<string, { en: string; ar: string; ku: string }> = {
  'چاییکەر': { en: 'Electric Tea Maker', ar: 'صانعة شاي كهربائية', ku: 'چاییکەر' },
  'چاییکەری کارەبایی': { en: 'Electric Samovar & Tea Maker', ar: 'سماور وصانعة شاي كهربائية', ku: 'چاییکەری کارەبایی' },
  'چایەدەنی': { en: 'Electric Tea Kettle', ar: 'غلاية شاي كهربائية', ku: 'چایەدەنی' },
  'قاوەساز': { en: 'Coffee Machine & Espresso Maker', ar: 'ماكينة صنع القهوة والإسبريسو', ku: 'قاوەساز' },
  'ئێرفرایەر': { en: 'Digital Air Fryer', ar: 'قلاية هوائية رقمية بدون زيت', ku: 'ئێرفرایەر' },
  'جارووبەرقی': { en: 'Vacuum Cleaner', ar: 'مكنسة كهربائية', ku: 'جارووبەرقی' },
  'هەنگوینی سروشتی': { en: 'Natural Mountain Honey', ar: 'عسل جبلي طبيعي', ku: 'هەنگوینی سروشتی' },
  'هەنگوین': { en: 'Natural Honey', ar: 'عسل طبيعي', ku: 'هەنگوین' },
  'ڕۆنی کوردی': { en: 'Traditional Kurdish Pure Ghee', ar: 'سمن بلدي كردي أصلي', ku: 'ڕۆنی کوردی' },
  'شاخی هەورامان': { en: 'Hawraman Mountains Organic', ar: 'جبال هورامان الطبيعية', ku: 'شاخی هەورامان' },
  'قەزوان': { en: 'Wild Kurdish Pistachio (Qazwan)', ar: 'بطم كردي طبيعي', ku: 'قەزوان' },
  'دەستکرد و کەلەپوور': { en: 'Handmade Crafts & Heritage', ar: 'حرف يدوية وتراثية', ku: 'دەستکرد و کەلەپوور' },
  'کەلوپەلی چێشتخانە': { en: 'Kitchenware & Supplies', ar: 'أدوات ومستلزمات المطبخ', ku: 'کەلوپەلی چێشتخانە' },
  'ئامێرەکانی ناوماڵ': { en: 'Home Appliances & Electronics', ar: 'أجهزة منزلية وكهربائية', ku: 'ئامێرەکانی ناوماڵ' },
  'کتێب و بڵاوکراوە': { en: 'Books & Literature', ar: 'كتب ومطبوعات', ku: 'کتێب و بڵاوکراوە' },
  'خۆراک و هەنگوین': { en: 'Organic Food & Honey', ar: 'أغذية وعسل طبيعي', ku: 'خۆراک و هەنگوین' },
  'مۆبایل و تەکنەلۆژیا': { en: 'Mobile & Electronics', ar: 'الهواتف والإلكترونيات', ku: 'مۆبایل و تەکنەلۆژیا' },
  'شەقامی مەولەوی': { en: 'Mawlawi Street', ar: 'شارع مولوي', ku: 'شەقامی مەولەوی' },
  'قەیسەری هەولێر': { en: 'Erbil Qaysari Bazaar', ar: 'سوق القيصرية بأربيل', ku: 'قەیسەری هەولێر' },
  'بازاڕی نیشتیمان': { en: 'Nishtiman Bazaar', ar: 'سوق نشتيمان', ku: 'بازاڕی نیشتیمان' },
  'بازاڕی دارتاشەکان': { en: 'Carpenters Bazaar', ar: 'سوق النجارين', ku: 'بازاڕی دارتاشەکان' },
  'بازاڕی گەورە': { en: 'Grand Bazaar', ar: 'السوق الكبير', ku: 'بازاڕی گەورە' },
  'سەهۆڵەکە': { en: 'Saholaka', ar: 'السهولكة', ku: 'سەهۆڵەکە' },
  'سلێمانی': { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
  'هەولێر': { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
  'دهۆک': { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
  'هەڵەبجە': { en: 'Halabja', ar: 'حلبجة', ku: 'هەڵەبجە' },
  'کەرکووک': { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
  'زاخۆ': { en: 'Zakho', ar: 'زاخو', ku: 'زاخۆ' },
  'جلوبەرگی کوردی': { en: 'Traditional Kurdish Clothing', ar: 'أزياء كوردية تقليدية', ku: 'جلوبەرگی کوردی' },
  'فەرشی دەستکرد': { en: 'Handmade Wool Carpet', ar: 'سجاد صوف يدوي', ku: 'فەرشی دەستکرد' },
  'مسی دەستکرد': { en: 'Handmade Copperware', ar: 'نحاسيات يدوية أصلية', ku: 'مسی دەستکرد' },
};

function detectSourceLang(text: string): 'ckb' | 'ar' | 'en' {
  // Check for specific Kurdish Sorani characters
  if (/[ۆێڵەڕژگچپ]/i.test(text)) return 'ckb';
  // Check for general Arabic script characters
  if (/[\u0600-\u06FF]/.test(text)) {
    // If it has Kurdish vowel marks like 'ە' or 'ێ' or 'ۆ' or standard Kurdish words
    if (/[ەێۆڵ]/.test(text)) return 'ckb';
    return 'ar';
  }
  // Default to English if Latin
  return 'en';
}

async function translateSingle(cleanText: string, toLang: 'en' | 'ar' | 'ku' | 'ckb'): Promise<string> {
  if (!cleanText) return '';

  const targetLang = toLang === 'ku' ? 'ckb' : toLang;
  const cacheKey = `${cleanText}__${targetLang}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Direct glossary lookup
  if (LOCAL_GLOSSARY[cleanText]) {
    const gl = LOCAL_GLOSSARY[cleanText];
    const hit = targetLang === 'ar' ? gl.ar : targetLang === 'en' ? gl.en : gl.ku;
    if (hit) {
      translationCache.set(cacheKey, hit);
      return hit;
    }
  }

  // 2. Keyword replacement for known phrases
  let glossaryAssisted = cleanText;
  for (const [kurdishTerm, translations] of Object.entries(LOCAL_GLOSSARY)) {
    if (glossaryAssisted.includes(kurdishTerm)) {
      const rep = targetLang === 'ar' ? translations.ar : targetLang === 'en' ? translations.en : translations.ku;
      glossaryAssisted = glossaryAssisted.replace(new RegExp(kurdishTerm, 'g'), rep);
    }
  }

  // 3. Online dynamic translation engine via MyMemory API
  try {
    const detectedSource = detectSourceLang(cleanText);
    const apiTarget = targetLang === 'ckb' ? 'ckb' : targetLang;

    // Avoid translating into same language
    if (detectedSource === apiTarget) {
      return cleanText;
    }

    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      cleanText
    )}&langpair=${detectedSource}|${apiTarget}`;

    const apiRes = await fetch(myMemoryUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'BazaryGawraPlatform/2.0 (marketplace-translation)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data?.responseData?.translatedText) {
        const translated = String(data.responseData.translatedText).trim();
        // Ignore API error responses or warnings
        if (
          translated &&
          !translated.toUpperCase().includes('MYMEMORY WARNING') &&
          !translated.toUpperCase().includes('QUERY LENGTH LIMIT')
        ) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    console.warn('MyMemory translation query warning:', err);
  }

  // 4. Fallback if API returned empty
  const fallbackText = glossaryAssisted !== cleanText ? glossaryAssisted : cleanText;
  translationCache.set(cacheKey, fallbackText);
  return fallbackText;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const to = body.to || 'en';

    // Support batch translation: { texts: string[], to: 'en' | 'ar' }
    if (Array.isArray(body.texts)) {
      const translatedList = await Promise.all(
        body.texts.map((t: string) => translateSingle(typeof t === 'string' ? t.trim() : '', to))
      );
      return NextResponse.json({ translatedTexts: translatedList });
    }

    // Support single text translation: { text: string, to: 'en' | 'ar' }
    const text = body.text;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ translatedText: '' });
    }

    const translated = await translateSingle(text.trim(), to);
    return NextResponse.json({ translatedText: translated });
  } catch (error) {
    console.error('Translation endpoint error:', error);
    return NextResponse.json({ translatedText: '' }, { status: 200 });
  }
}
