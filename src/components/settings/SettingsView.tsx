'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/store';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  Download, 
  FileCode2,
  RotateCcw
} from 'lucide-react';

export function SettingsView() {
  const { 
    t, 
    isSupabaseLive, 
    supabaseMessage, 
    recheckSupabase, 
    sellers, 
    products, 
    resetDemoData 
  } = useAdmin();

  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const sqlMigrationScript = `-- ============================================================
-- BAZARY GAWRA (بازاڕی گەورە) - SUPABASE POSTGRESQL SCHEMA
-- Platform: Kurdistan Local Marketplace & Merchant Operations
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('verified', 'pending', 'unverified', 'suspended');
    CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived', 'out_of_stock');
    CREATE TYPE warranty_type AS ENUM ('official_agent', 'shop_local', 'replacement', 'none');
    CREATE TYPE delivery_type AS ENUM ('same_day', 'express_kurdistan', 'pickup_only');
    CREATE TYPE return_policy_type AS ENUM ('exchange_only', 'money_back', 'non_returnable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. SELLERS TABLE
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ku TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    city TEXT NOT NULL, -- 'Sulaymaniyah', 'Erbil', 'Duhok', 'Halabja', 'Kirkuk'
    bazaar_name TEXT NOT NULL,
    address_details TEXT,
    facade_image_url TEXT,
    logo_url TEXT,
    verification_status verification_status DEFAULT 'pending',
    transparency_score INT DEFAULT 50,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    name_ku TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_ku TEXT,
    description_en TEXT,
    description_ar TEXT,
    price_iqd BIGINT NOT NULL,
    price_usd NUMERIC(10,2) NOT NULL,
    original_price_iqd BIGINT,
    category_id TEXT NOT NULL,
    stock_quantity INT DEFAULT 0,
    status product_status DEFAULT 'active',
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    primary_image TEXT NOT NULL,
    
    -- Transparency Signals
    warranty_type warranty_type DEFAULT 'shop_local',
    warranty_period TEXT,
    warranty_notes TEXT,
    delivery_type delivery_type DEFAULT 'same_day',
    delivery_cost_iqd BIGINT DEFAULT 3000,
    delivery_time_hours INT DEFAULT 24,
    return_window_days INT DEFAULT 3,
    return_policy_type return_policy_type DEFAULT 'exchange_only',
    return_conditions TEXT,
    transparency_score INT DEFAULT 85,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI SEARCH QUERIES
CREATE TABLE IF NOT EXISTS public.ai_search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    user_city TEXT NOT NULL,
    matched_products_count INT DEFAULT 0,
    intent_category TEXT,
    status TEXT DEFAULT 'resolved',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI PRODUCT SCANS
CREATE TABLE IF NOT EXISTS public.ai_product_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_image_url TEXT NOT NULL,
    detected_labels TEXT[] DEFAULT ARRAY[]::TEXT[],
    match_confidence NUMERIC(4,3) NOT NULL,
    matched_product_name TEXT,
    matched_seller_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_product_scans ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES (Public read, authenticated write)
DO $$ BEGIN
    CREATE POLICY "Allow public read on sellers" ON public.sellers FOR SELECT USING (true);
    CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
    CREATE POLICY "Allow public read on ai_queries" ON public.ai_search_queries FOR SELECT USING (true);
    CREATE POLICY "Allow public read on ai_scans" ON public.ai_product_scans FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigrationScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRecheck = async () => {
    setIsChecking(true);
    await recheckSupabase();
    setIsChecking(false);
  };

  const handleExportFullJson = () => {
    const data = {
      sellers,
      products,
      exportedAt: new Date().toISOString(),
      platform: 'Bazary Gawra Admin',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bazary_gawra_backup_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#171717]">
          {t.settingsTitle}
        </h1>
        <p className="mt-1 text-xs text-[#737373]">
          {t.settingsSubtitle}
        </p>
      </div>

      {/* Supabase Connection Health Card */}
      <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isSupabaseLive ? 'bg-[#657A52]/10 text-[#657A52]' : 'bg-[#F4B942]/10 text-[#F4B942]'
            }`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#171717]">
                  {t.supabaseConfigTitle}
                </h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isSupabaseLive 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {isSupabaseLive ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Live Connected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                      Local Persistent Mode
                    </>
                  )}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#737373] leading-relaxed">
                {supabaseMessage}
              </p>
            </div>
          </div>

          <button
            onClick={handleRecheck}
            disabled={isChecking}
            className="flex items-center gap-1.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-4 py-2 text-xs font-bold text-[#171717] hover:bg-white shadow-xs transition-colors shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Verifying...' : 'Check Health'}</span>
          </button>
        </div>

        {/* Credentials Info Helper */}
        <div className="mt-4 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] p-3 text-xs">
          <p className="text-[#171717] font-semibold">How to connect to your Supabase project:</p>
          <p className="mt-1 text-[#737373] leading-relaxed">
            Create or edit <code className="rounded bg-white px-1 py-0.5 border border-[#EAE7DF]">.env.local</code> in the project directory and paste:
          </p>
          <pre className="mt-2 rounded-lg bg-[#171717] p-2.5 text-[11px] text-white overflow-x-auto font-mono">
            NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co&#10;NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
          </pre>
        </div>
      </div>

      {/* SQL Migration Generator Card */}
      <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#EAE7DF] pb-4">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-[#657A52]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#171717]">
                PostgreSQL Database Schema & Migration Script
              </h3>
              <p className="text-[11px] text-[#737373]">
                Copy & paste directly into Supabase SQL Editor to set up all tables and RLS security policies
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 rounded-xl bg-[#657A52] px-4 py-2 text-xs font-bold text-white hover:bg-[#536543] shadow-sm transition-all"
          >
            <Copy className="h-4 w-4" />
            <span>{copied ? t.copiedToClipboard : t.copySqlScript}</span>
          </button>
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-[#EAE7DF] bg-[#171717] p-4 text-[11px] text-[#FAF9F6] font-mono leading-relaxed">
          <pre>{sqlMigrationScript}</pre>
        </div>
      </div>

      {/* Operational Maintenance & Backups */}
      <div className="rounded-2xl border border-[#EAE7DF] bg-white p-5 shadow-xs">
        <h3 className="text-sm font-extrabold text-[#171717]">Data Backup & Maintenance</h3>
        <p className="text-xs text-[#737373]">Export full platform records or restore initial demo data</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleExportFullJson}
            className="flex items-center gap-1.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-4 py-2 text-xs font-bold text-[#171717] hover:bg-white transition-colors"
          >
            <Download className="h-4 w-4 text-[#657A52]" />
            <span>Export Full JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset catalog to Kurdish marketplace initial demo state?')) {
                resetDemoData();
                alert(t.seedSuccess);
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>{t.seedSampleData}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
