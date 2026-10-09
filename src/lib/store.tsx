'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Seller, Product, AiSearchQuery, AiProductScan, Category, CityInfo, VerificationStatus, KurdishCity } from '@/types/database';
import { initialSellers, initialProducts, initialAiQueries, initialAiScans, initialCategories, initialCities } from '@/lib/mockData';
import { SupportedLanguage, translations, TranslationDictionary } from '@/lib/i18n';
import { supabase, isSupabaseConfigured, checkSupabaseHealth } from '@/lib/supabase';
import { calculateTransparencyScore } from '@/lib/utils';
import { ensureMultilingualProduct, ensureMultilingualSeller } from '@/lib/translator';

export type AdminView = 'overview' | 'sellers' | 'products' | 'ai-insights' | 'taxonomy' | 'settings';

interface AdminContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  dir: 'rtl' | 'ltr';

  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;

  isSupabaseLive: boolean;
  supabaseMessage: string;
  recheckSupabase: () => Promise<void>;

  sellers: Seller[];
  products: Product[];
  aiQueries: AiSearchQuery[];
  aiScans: AiProductScan[];
  categories: Category[];
  cities: CityInfo[];

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  updateSellerVerification: (sellerId: string, status: VerificationStatus, notes?: string) => Promise<void>;
  addSeller: (seller: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSeller: (seller: Seller) => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'transparency_score'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  quickUpdateStockAndPrice: (productId: string, priceIqd: number, stock: number) => Promise<void>;

  resetDemoData: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

const STORAGE_KEYS = {
  SELLERS: 'bg_admin_sellers_v1',
  PRODUCTS: 'bg_admin_products_v1',
  LANG: 'bg_admin_lang_v1',
  AI_QUERIES: 'bg_admin_ai_queries_v1',
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem(STORAGE_KEYS.LANG) as SupportedLanguage;
        if (savedLang && (savedLang === 'ku' || savedLang === 'ar' || savedLang === 'en')) {
          return savedLang;
        }
      } catch {}
    }
    return 'ku';
  });

  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sellers, setSellers] = useState<Seller[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SELLERS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialSellers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialProducts;
  });

  const [aiQueries, setAiQueries] = useState<AiSearchQuery[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.AI_QUERIES);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialAiQueries;
  });

  const [aiScans] = useState<AiProductScan[]>(initialAiScans);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [cities, setCities] = useState<CityInfo[]>(initialCities);

  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState('Checking database status...');

  // Fetch live data from Supabase
  const loadDataFromSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 1. Fetch Locations & Categories
      const [{ data: locData }, { data: catData }] = await Promise.all([
        supabase.from('locations').select('*'),
        supabase.from('categories').select('*'),
      ]);

      const locationMap: Record<string, KurdishCity> = {};
      if (locData && locData.length > 0) {
        locData.forEach((l: { id: string; name_en: string }) => {
          locationMap[l.id] = (l.name_en as KurdishCity) || 'Sulaymaniyah';
        });

        const liveCities: CityInfo[] = locData.map((l: { id: string; name_en: string; name_ku: string; name_ar: string; slug: string }) => ({
          id: l.slug || l.id,
          name_en: (l.name_en as KurdishCity) || 'Sulaymaniyah',
          name_ku: l.name_ku || l.name_en,
          name_ar: l.name_ar || l.name_en,
          governorate: `${l.name_en} Governorate`,
          bazaars: [`${l.name_en} Central Bazaar`, `${l.name_en} City Center`],
        }));
        setCities(liveCities);
      }

      if (catData && catData.length > 0) {
        const getIconForSlug = (slug: string) => {
          const s = (slug || '').toLowerCase();
          if (s.includes('food') || s.includes('honey')) return 'Apple';
          if (s.includes('kitchen')) return 'UtensilsCrossed';
          if (s.includes('appliance')) return 'Tv';
          if (s.includes('electronic') || s.includes('tech') || s.includes('mobile')) return 'Smartphone';
          if (s.includes('book')) return 'BookOpen';
          if (s.includes('craft') || s.includes('heritage') || s.includes('beauty')) return 'Sparkles';
          return 'Layers';
        };

        // Filter out subcategories (c.parent_id) and redundant duplicates, exactly matching client side
        const excludedSlugs = new Set(['clothing', 'food-honey', 'local-products', 'handmade']);
        const topLevelCats = catData.filter((c: any) => 
          !c.parent_id && 
          c.is_active !== false && 
          !excludedSlugs.has(c.slug)
        );

        const liveCategories: Category[] = topLevelCats.map((c: any) => ({
          id: c.id,
          slug: c.slug || c.id,
          name_en: c.name_en || c.slug,
          name_ku: c.name_ku || c.name_en || c.slug,
          name_ar: c.name_ar || c.name_en || c.slug,
          icon: getIconForSlug(c.slug || c.id),
        }));
        setCategories(liveCategories);
      }

      // 2. Fetch Sellers
      const { data: dbSellers } = await supabase.from('sellers').select('*');
      if (dbSellers && dbSellers.length > 0) {
        const mappedSellers: Seller[] = dbSellers.map((s: Record<string, any>) => ({
          id: s.id,
          name_ku: s.name_ku || s.name_en || 'دووکانی نەناسراو',
          name_en: s.name_en || s.name_ku || 'Store',
          name_ar: s.name_ar || s.name_en || 'متجر',
          owner_name: s.owner_name || s.name_en || 'Merchant Partner',
          phone: s.phone || '+964 770 000 0000',
          whatsapp: s.whatsapp || '9647700000000',
          city: (locationMap[s.location_id] || 'Sulaymaniyah') as KurdishCity,
          bazaar_name: s.address || s.bazaar_name || 'Bazaar Marketplace',
          address_details: s.address || 'Central Bazaar Location',
          facade_image_url: s.logo_url || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80',
          logo_url: s.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          verification_status: (s.verification_status as VerificationStatus) || 'unverified',
          transparency_score: s.verification_status === 'verified' ? 95 : 65,
          notes: s.description_en || 'Verified store from live database.',
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString(),
        }));
        setSellers(mappedSellers);
      }

      // 3. Fetch Products & Translations
      const [{ data: dbProducts }, { data: dbTrans }] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('product_translations').select('*'),
      ]);

      if (dbProducts && dbProducts.length > 0) {
        // Group translations by product_id
        const transMap: Record<string, Record<string, { name: string; description?: string }>> = {};
        if (dbTrans) {
          dbTrans.forEach((t: { product_id: string; lang: string; name: string; description?: string }) => {
            if (!transMap[t.product_id]) transMap[t.product_id] = {};
            transMap[t.product_id][t.lang] = { name: t.name, description: t.description };
          });
        }

        const mappedProducts: Product[] = dbProducts.map((p: Record<string, any>) => {
          const trans = transMap[p.id] || {};
          const ku = trans['ku'] || {};
          const en = trans['en'] || {};
          const ar = trans['ar'] || {};

          const priceIqd = Number(p.price) || 25000;
          const priceUsd = Math.round(priceIqd / 1500);

          const warrantyType = p.warranty_applicable
            ? (p.warranty_months >= 12 ? 'official_agent' : 'shop_local')
            : 'none';

          const returnDays = p.return_days || 3;
          const returnPolicyType = returnDays > 0 ? 'money_back' : 'non_returnable';

          const score = calculateTransparencyScore({
            warranty_type: warrantyType,
            warranty_period: p.warranty_details || `${p.warranty_months || 0} Months`,
            delivery_type: p.delivery_available ? 'same_day' : 'pickup_only',
            delivery_cost_iqd: 3000,
            return_window_days: returnDays,
            return_policy_type: returnPolicyType,
          });

          return {
            id: p.id,
            seller_id: p.seller_id,
            name_ku: ku.name || p.slug || 'کاڵا',
            name_en: en.name || p.slug || 'Product',
            name_ar: ar.name || p.slug || 'منتج',
            description_ku: ku.description || '',
            description_en: en.description || '',
            description_ar: ar.description || '',
            price_iqd: priceIqd,
            price_usd: priceUsd,
            category_id: p.category_id,
            stock_quantity: 12,
            status: p.status === 'active' ? 'active' : 'draft',
            images: (Array.isArray(p.specs?.images) && p.specs.images.length > 0)
              ? p.specs.images
              : [p.image_url || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80'],
            primary_image: p.image_url || (Array.isArray(p.specs?.images) && p.specs.images[0]) || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
            warranty_type: warrantyType,
            warranty_period: p.warranty_details || (p.warranty_months ? `${p.warranty_months} Months` : 'No Warranty'),
            warranty_notes: p.warranty_details || '',
            delivery_type: p.delivery_available ? 'same_day' : 'pickup_only',
            delivery_cost_iqd: 3000,
            delivery_time_hours: 24,
            return_window_days: returnDays,
            return_policy_type: returnPolicyType,
            return_conditions: p.return_policy || 'Inspect upon receipt',
            transparency_score: score,
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at || new Date().toISOString(),
          };
        });
        setProducts(mappedProducts);
      }
    } catch (err) {
      console.warn('Error loading live Supabase records:', err);
    }
  };

  // Check Supabase health and load live data on mount
  useEffect(() => {
    let isMounted = true;
    checkSupabaseHealth().then(res => {
      if (isMounted) {
        setIsSupabaseLive(res.connected);
        setSupabaseMessage(res.message);
        if (res.connected) {
          loadDataFromSupabase();
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Background Automatic Translation Engine:
  // Detects any products or sellers without full translations and dynamically enriches them in the background!
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      // 1. Scan products
      const untranslatedProducts = products.filter(
        p => !p.name_en || p.name_en === p.name_ku || !p.name_ar || p.name_ar === p.name_ku
      );

      if (untranslatedProducts.length > 0) {
        const enrichedList = await Promise.all(
          products.map(async p => {
            if (!p.name_en || p.name_en === p.name_ku || !p.name_ar || p.name_ar === p.name_ku) {
              return await ensureMultilingualProduct(p);
            }
            return p;
          })
        );
        if (isMounted) {
          saveProducts(enrichedList);
        }
      }

      // 2. Scan sellers
      const untranslatedSellers = sellers.filter(
        s => !s.name_en || s.name_en === s.name_ku || !s.name_ar || s.name_ar === s.name_ku
      );

      if (untranslatedSellers.length > 0) {
        const enrichedSellersList = await Promise.all(
          sellers.map(async s => {
            if (!s.name_en || s.name_en === s.name_ku || !s.name_ar || s.name_ar === s.name_ku) {
              return await ensureMultilingualSeller(s);
            }
            return s;
          })
        );
        if (isMounted) {
          saveSellers(enrichedSellersList);
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [products.length, sellers.length]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch {}
  };

  const recheckSupabase = async () => {
    const res = await checkSupabaseHealth();
    setIsSupabaseLive(res.connected);
    setSupabaseMessage(res.message);
    if (res.connected) {
      await loadDataFromSupabase();
    }
  };

  const saveSellers = (updated: Seller[]) => {
    setSellers(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(updated));
    } catch {}
  };

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    } catch {}
  };

  // Live Supabase Mutation: Seller Verification
  const updateSellerVerification = async (sellerId: string, status: VerificationStatus, notes?: string) => {
    const updated = sellers.map(s => {
      if (s.id === sellerId) {
        return {
          ...s,
          verification_status: status,
          notes: notes !== undefined ? notes : s.notes,
          transparency_score: status === 'verified' ? Math.max(s.transparency_score, 85) : s.transparency_score,
          updated_at: new Date().toISOString(),
        };
      }
      return s;
    });
    saveSellers(updated);

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('sellers')
          .update({
            verification_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sellerId);
      } catch (err) {
        console.warn('Supabase seller verification update warning:', err);
      }
    }
  };

  const addSeller = async (data: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) => {
    // AUTOMATIC TRANSLATION: Dynamically translate seller name and details into EN & AR
    const enrichedData = await ensureMultilingualSeller(data);

    const newSeller: Seller = {
      ...enrichedData,
      id: `sel_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveSellers([newSeller, ...sellers]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sellers').insert({
          name_ku: enrichedData.name_ku,
          name_en: enrichedData.name_en,
          name_ar: enrichedData.name_ar,
          phone: enrichedData.phone,
          whatsapp: enrichedData.whatsapp,
          address: enrichedData.bazaar_name,
          logo_url: enrichedData.facade_image_url,
          verification_status: enrichedData.verification_status,
          is_active: true,
        });
      } catch (err) {
        console.warn('Supabase seller insert warning:', err);
      }
    }
  };

  const updateSeller = async (seller: Seller) => {
    // AUTOMATIC TRANSLATION: Ensure all seller languages are translated automatically
    const enrichedSeller = await ensureMultilingualSeller(seller);

    const updated = sellers.map(s => (s.id === seller.id ? { ...enrichedSeller, updated_at: new Date().toISOString() } : s));
    saveSellers(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sellers').update({
          name_ku: enrichedSeller.name_ku,
          name_en: enrichedSeller.name_en,
          name_ar: enrichedSeller.name_ar,
          phone: enrichedSeller.phone,
          whatsapp: enrichedSeller.whatsapp,
          address: enrichedSeller.bazaar_name,
          verification_status: enrichedSeller.verification_status,
          updated_at: new Date().toISOString(),
        }).eq('id', seller.id);
      } catch (err) {
        console.warn('Supabase seller update warning:', err);
      }
    }
  };

  const addProduct = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'transparency_score'>) => {
    // AUTOMATIC TRANSLATION: Dynamically translate product title and description into EN & AR
    const enrichedData = await ensureMultilingualProduct(data);

    const score = calculateTransparencyScore({
      warranty_type: enrichedData.warranty_type,
      warranty_period: enrichedData.warranty_period,
      delivery_type: enrichedData.delivery_type,
      delivery_cost_iqd: enrichedData.delivery_cost_iqd,
      return_window_days: enrichedData.return_window_days,
      return_policy_type: enrichedData.return_policy_type,
    });

    const newProd: Product = {
      ...enrichedData,
      id: `prod_${Date.now()}`,
      transparency_score: score,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveProducts([newProd, ...products]);

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productData: enrichedData }),
        });
      } catch (err) {
        console.warn('API product insert warning:', err);
      }
    }
  };

  const updateProduct = async (product: Product) => {
    // AUTOMATIC TRANSLATION: Ensure multilingual title and description are translated
    const enrichedProduct = await ensureMultilingualProduct(product);

    const score = calculateTransparencyScore({
      warranty_type: enrichedProduct.warranty_type,
      warranty_period: enrichedProduct.warranty_period,
      delivery_type: enrichedProduct.delivery_type,
      delivery_cost_iqd: enrichedProduct.delivery_cost_iqd,
      return_window_days: enrichedProduct.return_window_days,
      return_policy_type: enrichedProduct.return_policy_type,
    });

    const updated = products.map(p =>
      p.id === product.id ? { ...enrichedProduct, transparency_score: score, updated_at: new Date().toISOString() } : p
    );
    saveProducts(updated);

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: enrichedProduct }),
        });
      } catch (err) {
        console.warn('API product update warning:', err);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);

    if (isSupabaseConfigured) {
      try {
        await fetch(`/api/products?id=${productId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('API product delete warning:', err);
      }
    }
  };

  const quickUpdateStockAndPrice = async (productId: string, priceIqd: number, stock: number) => {
    const rate = 1500;
    const priceUsd = Math.round(priceIqd / rate);
    const updated = products.map(p =>
      p.id === productId ? { ...p, price_iqd: priceIqd, price_usd: priceUsd, stock_quantity: stock, updated_at: new Date().toISOString() } : p
    );
    saveProducts(updated);

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quickUpdate: true, productId, priceIqd }),
        });
      } catch (err) {
        console.warn('API quick update warning:', err);
      }
    }
  };

  const resetDemoData = () => {
    saveSellers(initialSellers);
    saveProducts(initialProducts);
    setAiQueries(initialAiQueries);
    try {
      localStorage.removeItem(STORAGE_KEYS.SELLERS);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.AI_QUERIES);
    } catch {}
  };

  const dir = language === 'en' ? 'ltr' : 'rtl';
  const t = translations[language];

  return (
    <AdminContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir,
        currentView,
        setCurrentView,
        isSupabaseLive,
        supabaseMessage,
        recheckSupabase,
        sellers,
        products,
        aiQueries,
        aiScans,
        categories,
        cities,
        searchQuery,
        setSearchQuery,
        updateSellerVerification,
        addSeller,
        updateSeller,
        addProduct,
        updateProduct,
        deleteProduct,
        quickUpdateStockAndPrice,
        resetDemoData,
      }}
    >
      <div dir={dir} className="min-h-screen bg-[#FAF9F6] text-[#171717] antialiased">
        {children}
      </div>
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
