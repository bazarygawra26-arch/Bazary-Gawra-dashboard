'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Seller, 
  Product, 
  AiSearchQuery, 
  AiProductScan, 
  Category, 
  CityInfo, 
  VerificationStatus, 
  KurdishCity,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  Promotion,
  Payment,
  Order,
  OrderStatus,
  Rfq,
  Quotation,
  PurchaseOrder,
  MarketplaceGlossaryTerm,
  AdminAuditLog
} from '@/types/database';
import { 
  initialSellers, 
  initialProducts, 
  initialAiQueries, 
  initialAiScans, 
  initialCategories, 
  initialCities,
  initialSubscriptions,
  initialPromotions,
  initialPayments,
  initialGlossaryTerms
} from '@/lib/mockData';
import { SupportedLanguage, translations, TranslationDictionary } from '@/lib/i18n';
import { ADMIN_LANGUAGE_STORAGE_KEY } from '@/lib/adminPanelTranslations';
import { supabase, isSupabaseConfigured, checkSupabaseHealth } from '@/lib/supabase';
import { calculateTransparencyScore } from '@/lib/utils';
import { ensureMultilingualProduct, ensureMultilingualSeller } from '@/lib/translator';

export type AdminView =
  | 'overview'
  | 'users'
  | 'stores'
  | 'sellers'
  | 'suppliers'
  | 'products'
  | 'orders'
  | 'rfqs'
  | 'quotations'
  | 'purchase-orders'
  | 'subscriptions'
  | 'translations'
  | 'notifications'
  | 'support'
  | 'audit'
  | 'ai-insights'
  | 'taxonomy'
  | 'settings';

export type AnalyticsTimeRange = 'today' | '7d' | '30d' | '90d' | 'all';

export interface MonetizationMetrics {
  b2cOrderGross: number;
  b2bPoGross: number;
  realizedSubscriptionRevenue: number;
  realizedSponsoredRevenue: number;
  refundsIssued: number;
  netPlatformRevenue: number;
  comparison?: {
    netRevenueGrowth: number | null;
    subscriptionGrowth: number | null;
    ordersGrowth: number | null;
  };
}

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
  subscriptions: Subscription[];
  promotions: Promotion[];
  payments: Payment[];
  orders: Order[];
  rfqs: Rfq[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  glossaryTerms: MarketplaceGlossaryTerm[];
  aiQueries: AiSearchQuery[];
  aiScans: AiProductScan[];
  categories: Category[];
  cities: CityInfo[];

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Time & breakdown filters for BI
  timeFilter: AnalyticsTimeRange;
  setTimeFilter: (range: AnalyticsTimeRange) => void;
  governorateFilter: string;
  setGovernorateFilter: (gov: string) => void;
  monetization: MonetizationMetrics;

  updateSellerVerification: (sellerId: string, status: VerificationStatus, notes?: string) => Promise<void>;
  addSeller: (seller: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSeller: (seller: Seller) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  manageCategory: (categoryData: Partial<Category>) => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'transparency_score'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  quickUpdateStockAndPrice: (productId: string, priceIqd: number, stock: number) => Promise<void>;
  toggleProductSponsor: (productId: string) => Promise<void>;

  // Trade, Subscription & Monetization Actions
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => Promise<void>;
  issueOrderRefund: (orderId: string, amount: number, reason: string) => Promise<void>;
  manageSubscription: (sellerId: string, plan: SubscriptionPlan, status: SubscriptionStatus, reason?: string) => Promise<void>;
  toggleProductPromotion: (productId: string, sellerId: string, durationDays: number, reason?: string) => Promise<void>;
  manageGlossaryTerm: (term: Partial<MarketplaceGlossaryTerm>) => Promise<void>;

  resetDemoData: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

const STORAGE_KEYS = {
  SELLERS: 'bg_admin_sellers_v1',
  PRODUCTS: 'bg_admin_products_v1',
  LANG: ADMIN_LANGUAGE_STORAGE_KEY,
  AI_QUERIES: 'bg_admin_ai_queries_v1',
  SUBSCRIPTIONS: 'bg_admin_subscriptions_v1',
  PAYMENTS: 'bg_admin_payments_v1',
  PROMOTIONS: 'bg_admin_promotions_v1',
  GLOSSARY: 'bg_admin_glossary_v1',
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem(STORAGE_KEYS.LANG) as SupportedLanguage;
        if (savedLang === 'ku' || savedLang === 'ar' || savedLang === 'en') return savedLang;
      } catch {}
    }
    return 'ku';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<AnalyticsTimeRange>('30d');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

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

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialSubscriptions;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialPromotions;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialPayments;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const [glossaryTerms, setGlossaryTerms] = useState<MarketplaceGlossaryTerm[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.GLOSSARY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialGlossaryTerms;
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

  // Helper for auth headers
  const getAdminAuthHeaders = async (contentType = true) => {
    if (!supabase) return contentType ? { 'Content-Type': 'application/json' } : {};
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return {
      ...(contentType ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

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

        const liveCities: CityInfo[] = locData.map((l: { id: string; name_en: string; name_ku: string; name_ar: string; slug: string; governorate?: string; bazaars?: string[] }) => ({
          id: l.slug || l.id,
          name_en: (l.name_en as KurdishCity) || 'Sulaymaniyah',
          name_ku: l.name_ku || l.name_en,
          name_ar: l.name_ar || l.name_en,
          governorate: l.governorate || `${l.name_en} Governorate`,
          bazaars: l.bazaars && l.bazaars.length > 0 ? l.bazaars : [`${l.name_en} Central Bazaar`, `${l.name_en} City Center`],
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

        const liveCategories: Category[] = catData.map((c: any) => ({
          id: c.id,
          slug: c.slug || c.id,
          name_en: c.name_en || c.slug,
          name_ku: c.name_ku || c.name_en || c.slug,
          name_ar: c.name_ar || c.name_en || c.slug,
          icon: getIconForSlug(c.slug || c.id),
          is_active: c.is_active !== false,
        }));
        setCategories(liveCategories);
      }

      // 2. Fetch Sellers
      const { data: dbSellers, error: sellersError } = await supabase.from('sellers').select('*');
      if (!sellersError && dbSellers) {
        const mappedSellers: Seller[] = dbSellers.map((s: Record<string, any>) => ({
          id: s.id,
          name_ku: s.name_ku || s.name_en || 'دووکانی نەناسراو',
          name_en: s.name_en || s.name_ku || 'Store',
          name_ar: s.name_ar || s.name_en || 'متجر',
          owner_name: s.owner_name || s.name_en || 'Merchant Partner',
          owner_id: s.owner_id,
          phone: s.phone || '+964 770 000 0000',
          whatsapp: s.whatsapp || '9647700000000',
          city: (locationMap[s.location_id] || 'Sulaymaniyah') as KurdishCity,
          bazaar_name: s.address || s.bazaar_name || 'Bazaar Marketplace',
          address_details: s.address || 'Central Bazaar Location',
          facade_image_url: s.logo_url || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80',
          logo_url: s.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          verification_status: (s.verification_status as VerificationStatus) || 'unverified',
          application_status: s.application_status,
          transparency_score: s.verification_status === 'verified' ? 95 : 65,
          notes: s.description_en || 'Verified store from live database.',
          is_active: s.is_active !== false,
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString(),
        }));
        setSellers(mappedSellers);
        try { localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(mappedSellers)); } catch {}
      }

      // 3. Fetch Products & Translations
      const [{ data: dbProducts }, { data: dbTrans }] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('product_translations').select('*'),
      ]);

      if (dbProducts && dbProducts.length > 0) {
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
            stock_quantity: Number(
              p.specs?.stock_quantity ??
              p.stock_quantity ??
              p.inventory_quantity ??
              0
            ),
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
            is_sponsored: Boolean(p.specs?.is_sponsored || p.specs?.is_promoted || p.is_sponsored || p.is_promoted),
            is_promoted: Boolean(p.specs?.is_sponsored || p.specs?.is_promoted || p.is_sponsored || p.is_promoted),
            created_at: p.created_at || new Date().toISOString(),
            updated_at: p.updated_at || new Date().toISOString(),
          };
        });
        setProducts(mappedProducts);
        try { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mappedProducts)); } catch {}
      }

      // 4. Fetch Subscriptions, Promotions, Payments
      const [{ data: dbSubs }, { data: dbPromos }, { data: dbPays }, { data: dbOrders }] = await Promise.all([
        supabase.from('subscriptions').select('*').limit(500),
        supabase.from('promotions').select('*').limit(500),
        supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
      ]);

      if (dbSubs && dbSubs.length > 0) {
        setSubscriptions(dbSubs as Subscription[]);
        try { localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(dbSubs)); } catch {}
      }
      if (dbPromos && dbPromos.length > 0) {
        setPromotions(dbPromos as Promotion[]);
        try { localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(dbPromos)); } catch {}
      }
      if (dbPays && dbPays.length > 0) {
        setPayments(dbPays as Payment[]);
        try { localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(dbPays)); } catch {}
      }
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders as Order[]);
      }

      // 5. Fetch Glossary
      const { data: dbGlossary } = await supabase.from('marketplace_glossary').select('*').limit(500);
      if (dbGlossary && dbGlossary.length > 0) {
        setGlossaryTerms(dbGlossary as MarketplaceGlossaryTerm[]);
        try { localStorage.setItem(STORAGE_KEYS.GLOSSARY, JSON.stringify(dbGlossary)); } catch {}
      }

    } catch (err) {
      console.warn('Error loading live Supabase records:', err);
    }
  };

  // Mount check and load
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

  // Supabase Realtime channel setup
  useEffect(() => {
    if (!isSupabaseLive || !supabase) return;

    const liveSupabase = supabase;
    const channel = liveSupabase
      .channel('admin-central-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, () => {
        void loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        void loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        void loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        void loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        void loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => {
        void loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_glossary' }, () => {
        void loadDataFromSupabase();
      })
      .subscribe();

    return () => {
      void liveSupabase.removeChannel(channel);
    };
  }, [isSupabaseLive]);

  // Compute Real Monetization & Revenue with strict rules:
  // - Order value != platform revenue
  // - Only count confirmed completed payments (!is_demo) as realized platform revenue
  // - Exclude demo payments and pending transactions
  // - Separate subscriptions, promotions, and refunds
  const monetization = React.useMemo<MonetizationMetrics>(() => {
    const now = Date.now();
    const periodDays = timeFilter === 'today' ? 1 : timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 3650;
    const cutoff = now - periodDays * 86400000;
    const prevCutoff = cutoff - periodDays * 86400000;

    // Filter payments in current period
    const currentPayments = payments.filter(p => {
      const ts = new Date(p.created_at).getTime();
      return ts >= cutoff && !p.is_demo && p.status === 'completed';
    });

    const previousPayments = payments.filter(p => {
      const ts = new Date(p.created_at).getTime();
      return ts >= prevCutoff && ts < cutoff && !p.is_demo && p.status === 'completed';
    });

    // Realized Revenues
    const realizedSubscriptionRevenue = currentPayments
      .filter(p => p.reference_type === 'subscription')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const realizedSponsoredRevenue = currentPayments
      .filter(p => p.reference_type === 'promotion')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const refundsIssued = payments
      .filter(p => {
        const ts = new Date(p.created_at).getTime();
        return ts >= cutoff && (p.reference_type === 'refund' || p.status === 'refunded');
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const netPlatformRevenue = realizedSubscriptionRevenue + realizedSponsoredRevenue - refundsIssued;

    // Gross order volumes in reporting window
    const currentOrders = orders.filter(o => new Date(o.created_at).getTime() >= cutoff);
    const b2cOrderGross = currentOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const currentPOs = purchaseOrders.filter(po => new Date(po.created_at).getTime() >= cutoff);
    const b2bPoGross = currentPOs.reduce((sum, po) => sum + Number(po.total_amount || 0), 0);

    // Safe growth computation without fake trends
    const prevSubRevenue = previousPayments
      .filter(p => p.reference_type === 'subscription')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const prevNetRevenue = previousPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const calculateGrowth = (curr: number, prev: number): number | null => {
      if (prev === 0) return curr > 0 ? 100 : null;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      b2cOrderGross,
      b2bPoGross,
      realizedSubscriptionRevenue,
      realizedSponsoredRevenue,
      refundsIssued,
      netPlatformRevenue,
      comparison: {
        netRevenueGrowth: calculateGrowth(netPlatformRevenue, prevNetRevenue),
        subscriptionGrowth: calculateGrowth(realizedSubscriptionRevenue, prevSubRevenue),
        ordersGrowth: null,
      },
    };
  }, [payments, orders, purchaseOrders, timeFilter]);

  // Actions
  const updateSellerVerification = async (sellerId: string, status: VerificationStatus, notes?: string) => {
    if (supabase) {
      const response = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: await getAdminAuthHeaders(),
        body: JSON.stringify({
          action: 'seller_verification',
          sellerId,
          status,
          reason: notes,
        }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || 'Seller verification update failed');
      }
    }

    setSellers(prev =>
      prev.map(s => (s.id === sellerId ? { ...s, verification_status: status, notes: notes ?? s.notes, updated_at: new Date().toISOString() } : s))
    );
  };

  const addSeller = async (data: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) => {
    const enriched = await ensureMultilingualSeller(data);
    const newSeller: Seller = {
      ...enriched,
      id: `sel_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSellers(prev => [newSeller, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sellers').insert({
          name_ku: enriched.name_ku,
          name_en: enriched.name_en,
          name_ar: enriched.name_ar,
          phone: enriched.phone,
          whatsapp: enriched.whatsapp,
          address: enriched.bazaar_name,
          logo_url: enriched.facade_image_url,
          verification_status: enriched.verification_status,
          is_active: true,
        });
      } catch (err) {
        console.warn('Supabase seller insert warning:', err);
      }
    }
  };

  const updateSeller = async (seller: Seller) => {
    const enriched = await ensureMultilingualSeller(seller);
    setSellers(prev => prev.map(s => (s.id === seller.id ? { ...enriched, updated_at: new Date().toISOString() } : s)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sellers').update({
          name_ku: enriched.name_ku,
          name_en: enriched.name_en,
          name_ar: enriched.name_ar,
          phone: enriched.phone,
          whatsapp: enriched.whatsapp,
          address: enriched.bazaar_name,
          verification_status: enriched.verification_status,
          updated_at: new Date().toISOString(),
        }).eq('id', seller.id);
      } catch (err) {
        console.warn('Supabase seller update warning:', err);
      }
    }
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    await manageCategory(catData);
  };

  const manageCategory = async (categoryData: Partial<Category>) => {
    const tempId = categoryData.id || `cat_${Date.now()}`;
    const newCat: Category = {
      id: tempId,
      slug: categoryData.slug || (categoryData.name_en || 'category').toLowerCase().replace(/\s+/g, '-'),
      name_en: categoryData.name_en || 'Category',
      name_ku: categoryData.name_ku || categoryData.name_en || 'پۆل',
      name_ar: categoryData.name_ar || categoryData.name_en || 'فئة',
      icon: categoryData.icon || 'Layers',
      is_active: categoryData.is_active ?? true,
    };

    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === tempId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newCat };
        return copy;
      }
      return [...prev, newCat];
    });

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/admin/actions', {
          method: 'POST',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ action: 'category_manage', categoryData: newCat }),
        });
      } catch (err) {
        console.warn('Category manage API error:', err);
      }
    }
  };

  const addProduct = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'transparency_score'>) => {
    const enriched = await ensureMultilingualProduct(data);
    const score = calculateTransparencyScore({
      warranty_type: enriched.warranty_type,
      warranty_period: enriched.warranty_period,
      delivery_type: enriched.delivery_type,
      delivery_cost_iqd: enriched.delivery_cost_iqd,
      return_window_days: enriched.return_window_days,
      return_policy_type: enriched.return_policy_type,
    });

    const newProd: Product = {
      ...enriched,
      id: `prod_${Date.now()}`,
      transparency_score: score,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts(prev => [newProd, ...prev]);

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ productData: enriched }),
        });
      } catch (err) {
        console.warn('API product insert warning:', err);
      }
    }
  };

  const updateProduct = async (product: Product) => {
    const enriched = await ensureMultilingualProduct(product);
    const score = calculateTransparencyScore({
      warranty_type: enriched.warranty_type,
      warranty_period: enriched.warranty_period,
      delivery_type: enriched.delivery_type,
      delivery_cost_iqd: enriched.delivery_cost_iqd,
      return_window_days: enriched.return_window_days,
      return_policy_type: enriched.return_policy_type,
    });

    setProducts(prev => prev.map(p => (p.id === product.id ? { ...enriched, transparency_score: score, updated_at: new Date().toISOString() } : p)));

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/products', {
          method: 'PUT',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ product: enriched }),
        });
      } catch (err) {
        console.warn('API product update warning:', err);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (isSupabaseConfigured) {
      try {
        await fetch(`/api/products?id=${productId}`, {
          method: 'DELETE',
          headers: await getAdminAuthHeaders(false),
        });
      } catch (err) {
        console.warn('API product delete warning:', err);
      }
    }
  };

  const quickUpdateStockAndPrice = async (productId: string, priceIqd: number, stock: number) => {
    const priceUsd = Math.round(priceIqd / 1500);
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, price_iqd: priceIqd, price_usd: priceUsd, stock_quantity: stock, updated_at: new Date().toISOString() } : p))
    );

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/products', {
          method: 'PUT',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ quickUpdate: true, productId, priceIqd, stock }),
        });
      } catch (err) {
        console.warn('API quick update warning:', err);
      }
    }
  };

  const toggleProductSponsor = async (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const nextStatus = !Boolean(target.is_sponsored ?? target.is_promoted);
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, is_sponsored: nextStatus, is_promoted: nextStatus, updated_at: new Date().toISOString() } : p))
    );

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/products', {
          method: 'PUT',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ toggleSponsor: true, productId, isSponsored: nextStatus }),
        });
      } catch (err) {
        console.warn('API toggle sponsor warning:', err);
      }
    }
  };

  // Trade & Order Management Actions
  const updateOrderStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o)));

    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ action: 'order_status', orderId, status, reason: reason || 'Status updated by admin' }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || 'Failed to update order status');
        }
      } catch (err) {
        console.warn('Order status update error:', err);
      }
    }
  };

  const issueOrderRefund = async (orderId: string, amount: number, reason: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'refunded', updated_at: new Date().toISOString() } : o)));

    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ action: 'order_refund', orderId, refundAmount: amount, reason }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || 'Refund issuance failed');
        }
      } catch (err) {
        console.warn('Refund API error:', err);
      }
    }
  };

  const manageSubscription = async (sellerId: string, plan: SubscriptionPlan, status: SubscriptionStatus, reason?: string) => {
    const limit = plan === 'pro_merchant' ? 50 : 5;
    const price = plan === 'pro_merchant' ? 10000 : 0;
    const periodEnd = plan === 'pro_merchant' ? new Date(Date.now() + 30 * 86400000).toISOString() : null;

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      seller_id: sellerId,
      plan,
      status,
      listing_limit: limit,
      monthly_price_iqd: price,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
      auto_renew: true,
      notes: reason,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSubscriptions(prev => [newSub, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const res = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ action: 'subscription_manage', sellerId, plan, status, reason }),
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          throw new Error(err.error || 'Subscription update failed');
        }
      } catch (err) {
        console.warn('Subscription manage error:', err);
      }
    }
  };

  const toggleProductPromotion = async (productId: string, sellerId: string, durationDays: number, reason?: string) => {
    const endDate = new Date(Date.now() + durationDays * 86400000).toISOString();
    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      product_id: productId,
      seller_id: sellerId,
      type: 'sponsored_listing',
      status: 'active',
      price_iqd: 5000,
      duration_days: durationDays,
      start_date: new Date().toISOString(),
      end_date: endDate,
      created_at: new Date().toISOString(),
    };

    setPromotions(prev => [newPromo, ...prev]);
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, is_sponsored: true, is_promoted: true } : p)));

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/admin/actions', {
          method: 'POST',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ action: 'promotion_manage', productId, sellerId, durationDays, reason }),
        });
      } catch (err) {
        console.warn('Promotion manage error:', err);
      }
    }
  };

  const manageGlossaryTerm = async (term: Partial<MarketplaceGlossaryTerm>) => {
    const tempId = term.id || `glo_${Date.now()}`;
    const newTerm: MarketplaceGlossaryTerm = {
      id: tempId,
      term_ku: term.term_ku || '',
      term_ar: term.term_ar || '',
      term_en: term.term_en || '',
      category: term.category || 'General',
      status: term.status || 'approved',
      notes: term.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setGlossaryTerms(prev => {
      const idx = prev.findIndex(g => g.id === tempId || g.term_ku === newTerm.term_ku);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newTerm };
        return copy;
      }
      return [newTerm, ...prev];
    });

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/admin/actions', {
          method: 'POST',
          headers: await getAdminAuthHeaders(),
          body: JSON.stringify({ action: 'glossary_manage', glossaryData: newTerm }),
        });
      } catch (err) {
        console.warn('Glossary manage error:', err);
      }
    }
  };

  const resetDemoData = () => {
    setSellers(initialSellers);
    setProducts(initialProducts);
    setAiQueries(initialAiQueries);
    setSubscriptions(initialSubscriptions);
    setPromotions(initialPromotions);
    setPayments(initialPayments);
    setGlossaryTerms(initialGlossaryTerms);
    try {
      localStorage.removeItem(STORAGE_KEYS.SELLERS);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.AI_QUERIES);
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
      localStorage.removeItem(STORAGE_KEYS.PROMOTIONS);
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      localStorage.removeItem(STORAGE_KEYS.GLOSSARY);
    } catch {}
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
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
        subscriptions,
        promotions,
        payments,
        orders,
        rfqs,
        quotations,
        purchaseOrders,
        glossaryTerms,
        aiQueries,
        aiScans,
        categories,
        cities,
        searchQuery,
        setSearchQuery,
        timeFilter,
        setTimeFilter,
        governorateFilter,
        setGovernorateFilter,
        monetization,
        updateSellerVerification,
        addSeller,
        updateSeller,
        addCategory,
        manageCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        quickUpdateStockAndPrice,
        toggleProductSponsor,
        updateOrderStatus,
        issueOrderRefund,
        manageSubscription,
        toggleProductPromotion,
        manageGlossaryTerm,
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
