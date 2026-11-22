'use client';

import React, { useState, useEffect } from 'react';
import { AdminProvider, useAdmin } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { SellersModule } from '@/components/sellers/SellersModule';
import { ProductsModule } from '@/components/products/ProductsModule';
import { AiInsightsView } from '@/components/ai/AiInsightsView';
import { TaxonomyView } from '@/components/taxonomy/TaxonomyView';
import { SettingsView } from '@/components/settings/SettingsView';
import { ProductEditorModal } from '@/components/products/ProductEditorModal';
import { AddSellerModal } from '@/components/sellers/AddSellerModal';
import { Product } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { CentralManagementView } from '@/components/admin/CentralManagementView';

function AdminLogin({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError(signInError?.message || 'Sign-in failed.');
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    const role = String(profile?.role || '').toLowerCase();
    if (profileError || !['admin', 'super_admin', 'superadmin'].includes(role)) {
      await supabase.auth.signOut();
      setError('This account does not have Super Admin access.');
      setLoading(false);
      return;
    }

    onAuthenticated(data.user);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-lg">
        <h1 className="text-xl font-extrabold text-[#171717]">Bazary Gawra Admin</h1>
        <p className="mt-1 text-xs text-[#737373]">Sign in with an authorized administrator account.</p>
        <label className="mt-5 block text-xs font-bold text-[#171717]" htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-sm focus:border-[#657A52] focus:outline-none" />
        <label className="mt-4 block text-xs font-bold text-[#171717]" htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-sm focus:border-[#657A52] focus:outline-none" />
        {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
        <button type="submit" disabled={loading}
          className="mt-5 w-full rounded-xl bg-[#657A52] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#536543] disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

function AdminDashboardContent() {
  const { currentView } = useAdmin();

  // Global Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedSellerForProduct, setSelectedSellerForProduct] = useState<string | undefined>(undefined);

  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Ctrl+K"], input[placeholder*="بگەڕێ"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewProduct = (sellerId?: string) => {
    setEditingProduct(null);
    setSelectedSellerForProduct(sellerId);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product | null) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleOpenNewSeller = () => {
    setIsSellerModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Navbar
          onOpenNewProduct={() => handleOpenNewProduct()}
          onOpenNewSeller={handleOpenNewSeller}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'overview' && (
            <DashboardOverview
              onOpenNewProduct={() => handleOpenNewProduct()}
              onOpenNewSeller={handleOpenNewSeller}
            />
          )}

          {currentView === 'sellers' && (
            <SellersModule
              onOpenNewSeller={handleOpenNewSeller}
              onOpenNewProductForSeller={(sId) => handleOpenNewProduct(sId)}
            />
          )}

          {currentView === 'products' && (
            <ProductsModule
              onOpenNewProduct={() => handleOpenNewProduct()}
              editingProduct={editingProduct}
              onSetEditingProduct={handleOpenEditProduct}
            />
          )}

          {currentView === 'ai-insights' && <AiInsightsView />}

          {currentView === 'taxonomy' && <TaxonomyView />}

          {currentView === 'settings' && <SettingsView />}

          {['users', 'suppliers', 'orders', 'rfqs', 'quotations', 'purchase-orders', 'notifications', 'support', 'audit'].includes(currentView) && (
            <CentralManagementView
              section={
                currentView as
                  | 'users'
                  | 'suppliers'
                  | 'orders'
                  | 'rfqs'
                  | 'quotations'
                  | 'purchase-orders'
                  | 'notifications'
                  | 'support'
                  | 'audit'
              }
            />
          )}
        </main>
      </div>

      {/* Product Editor Modal (New or Edit) */}
      <ProductEditorModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          setSelectedSellerForProduct(undefined);
        }}
        defaultSellerId={selectedSellerForProduct}
      />

      {/* Add Seller Modal */}
      <AddSellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => Boolean(supabase));

  useEffect(() => {
    const liveSupabase = supabase;
    if (!liveSupabase) {
      return;
    }

    void liveSupabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      if (!sessionUser) {
        setUser(null);
        setChecking(false);
        return;
      }

      const { data: profile } = await liveSupabase
        .from('profiles')
        .select('role')
        .eq('id', sessionUser.id)
        .maybeSingle();
      const role = String(profile?.role || '').toLowerCase();
      if (!['admin', 'super_admin', 'superadmin'].includes(role)) {
        await liveSupabase.auth.signOut();
        setUser(null);
      } else {
        setUser(sessionUser);
      }
      setChecking(false);
    });

    const { data: listener } = liveSupabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setUser(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-xs font-bold text-[#737373]">
        Verifying administrator session...
      </main>
    );
  }

  if (!user) return <AdminLogin onAuthenticated={setUser} />;

  return (
    <AdminProvider>
      <button
        type="button"
        onClick={() => void supabase?.auth.signOut()}
        className="fixed bottom-4 right-4 z-[60] flex items-center gap-1.5 rounded-xl border border-[#EAE7DF] bg-white px-3 py-2 text-xs font-bold text-[#737373] shadow-md"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
      <AdminDashboardContent />
    </AdminProvider>
  );
}
