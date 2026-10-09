'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Seller, Product, AiSearchQuery, AiProductScan, Category, CityInfo, VerificationStatus } from '@/types/database';
import { initialSellers, initialProducts, initialAiQueries, initialAiScans, initialCategories, initialCities } from '@/lib/mockData';
import { SupportedLanguage, translations, TranslationDictionary } from '@/lib/i18n';
import { checkSupabaseHealth } from '@/lib/supabase';
import { calculateTransparencyScore } from '@/lib/utils';

export type AdminView = 'overview' | 'sellers' | 'products' | 'ai-insights' | 'taxonomy' | 'settings';

interface AdminContextType {
  // Locale
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  dir: 'rtl' | 'ltr';

  // Navigation
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;

  // Supabase State
  isSupabaseLive: boolean;
  supabaseMessage: string;
  recheckSupabase: () => Promise<void>;

  // Data
  sellers: Seller[];
  products: Product[];
  aiQueries: AiSearchQuery[];
  aiScans: AiProductScan[];
  categories: Category[];
  cities: CityInfo[];

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  updateSellerVerification: (sellerId: string, status: VerificationStatus, notes?: string) => void;
  addSeller: (seller: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) => void;
  updateSeller: (seller: Seller) => void;

  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'transparency_score'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  quickUpdateStockAndPrice: (productId: string, priceIqd: number, stock: number) => void;

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
  const [categories] = useState<Category[]>(initialCategories);
  const [cities] = useState<CityInfo[]>(initialCities);

  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState('Checking database status...');

  // Check Supabase health once on mount
  useEffect(() => {
    let isMounted = true;
    checkSupabaseHealth().then(res => {
      if (isMounted) {
        setIsSupabaseLive(res.connected);
        setSupabaseMessage(res.message);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
  };

  // Sync state helpers
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

  // Seller Actions
  const updateSellerVerification = (sellerId: string, status: VerificationStatus, notes?: string) => {
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
  };

  const addSeller = (data: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) => {
    const newSeller: Seller = {
      ...data,
      id: `sel_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveSellers([newSeller, ...sellers]);
  };

  const updateSeller = (seller: Seller) => {
    const updated = sellers.map(s => (s.id === seller.id ? { ...seller, updated_at: new Date().toISOString() } : s));
    saveSellers(updated);
  };

  // Product Actions
  const addProduct = (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'transparency_score'>) => {
    const score = calculateTransparencyScore({
      warranty_type: data.warranty_type,
      warranty_period: data.warranty_period,
      delivery_type: data.delivery_type,
      delivery_cost_iqd: data.delivery_cost_iqd,
      return_window_days: data.return_window_days,
      return_policy_type: data.return_policy_type,
    });

    const newProd: Product = {
      ...data,
      id: `prod_${Date.now()}`,
      transparency_score: score,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveProducts([newProd, ...products]);
  };

  const updateProduct = (product: Product) => {
    const score = calculateTransparencyScore({
      warranty_type: product.warranty_type,
      warranty_period: product.warranty_period,
      delivery_type: product.delivery_type,
      delivery_cost_iqd: product.delivery_cost_iqd,
      return_window_days: product.return_window_days,
      return_policy_type: product.return_policy_type,
    });

    const updated = products.map(p =>
      p.id === product.id ? { ...product, transparency_score: score, updated_at: new Date().toISOString() } : p
    );
    saveProducts(updated);
  };

  const deleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
  };

  const quickUpdateStockAndPrice = (productId: string, priceIqd: number, stock: number) => {
    const rate = 1500;
    const priceUsd = Math.round(priceIqd / rate);
    const updated = products.map(p =>
      p.id === productId ? { ...p, price_iqd: priceIqd, price_usd: priceUsd, stock_quantity: stock, updated_at: new Date().toISOString() } : p
    );
    saveProducts(updated);
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
