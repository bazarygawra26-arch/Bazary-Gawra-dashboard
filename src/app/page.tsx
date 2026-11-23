'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import type { SupportedLanguage } from '@/lib/i18n';
import { ADMIN_LANGUAGE_STORAGE_KEY, adminPanelTranslations } from '@/lib/adminPanelTranslations';

function AdminLogin({
  onAuthenticated,
  language,
  onLanguageChange,
  recoveryMode,
  recoveryError,
  recoveryNotice,
  onRecoveryComplete,
}: {
  onAuthenticated: (user: User) => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  recoveryMode: boolean;
  recoveryError: string;
  recoveryNotice: string;
  onRecoveryComplete: () => void;
}) {
  const copy = adminPanelTranslations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const languagePicker = (
    <div role="group" aria-label={copy.selectLanguage} className="mb-5 flex justify-end gap-1">
      {([
        ['ku', 'کوردی'],
        ['ar', 'عربي'],
        ['en', 'English'],
      ] as const).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={language === value}
          onClick={() => onLanguageChange(value)}
          className={`rounded-md border px-2.5 py-1 text-xs font-bold ${
            language === value
              ? 'border-[#657A52] bg-[#657A52] text-white'
              : 'border-[#EAE7DF] text-[#737373] hover:bg-[#FAF9F6]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  useEffect(() => {
    if (recoveryMode && supabase) {
      void supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) setEmail(data.user.email);
      });
    }
  }, [recoveryMode]);

  const handleResetPassword = async () => {
    if (!supabase) {
      setError(copy.supabaseNotConfigured);
      return;
    }
    if (!email.trim()) {
      setError(copy.enterEmailFirst);
      return;
    }

    setResetting(true);
    setError('');
    setNotice('');
    const redirectTo = `${window.location.origin}/`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setNotice(copy.resetEmailSent);
    }
    setResetting(false);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setError(copy.supabaseNotConfigured);
      return;
    }

    setLoading(true);
    setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError(signInError?.message || copy.signInFailed);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, account_status')
      .eq('id', data.user.id)
      .maybeSingle();
    const role = String(profile?.role || '').toLowerCase();
    if (profileError) {
      await supabase.auth.signOut();
      setError(copy.profileVerificationFailed.replace('{error}', profileError.message));
      setLoading(false);
      return;
    }
    if (!profile) {
      await supabase.auth.signOut();
      setError(copy.missingAdminProfile);
      setLoading(false);
      return;
    }
    if (!['admin', 'super_admin', 'superadmin'].includes(role)) {
      await supabase.auth.signOut();
      setError(copy.notAdministrator);
      setLoading(false);
      return;
    }
    if (profile.account_status && profile.account_status !== 'active') {
      await supabase.auth.signOut();
      setError(copy.inactiveAdministrator);
      setLoading(false);
      return;
    }

    onAuthenticated(data.user);
    setLoading(false);
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setError(copy.supabaseNotConfigured);
      return;
    }
    if (password.length < 8) {
      setError(copy.minimumPasswordLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(copy.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    window.history.replaceState(null, '', window.location.pathname);
    setPassword('');
    setConfirmPassword('');
    onRecoveryComplete();
    setLoading(false);
  };

  if (recoveryMode) {
    return (
      <main lang={language} dir={language === 'en' ? 'ltr' : 'rtl'} className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
        <form onSubmit={handleUpdatePassword} className="w-full max-w-sm rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-lg">
          {languagePicker}
          <h1 className="text-xl font-extrabold text-[#171717]">{copy.chooseNewPassword}</h1>
          <p className="mt-1 text-xs text-[#737373]">{copy.passwordSetupSubtitle}</p>
          <label className="mt-5 block text-xs font-bold text-[#171717]" htmlFor="new-password">{copy.newPasswordLabel}</label>
          <input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-sm focus:border-[#657A52] focus:outline-none" />
          <label className="mt-4 block text-xs font-bold text-[#171717]" htmlFor="confirm-password">{copy.confirmPasswordLabel}</label>
          <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-sm focus:border-[#657A52] focus:outline-none" />
          {(error || recoveryError) && (
            <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {error || recoveryError}
            </p>
          )}
          <button type="submit" disabled={loading || Boolean(recoveryError)}
            className="mt-5 w-full rounded-xl bg-[#657A52] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#536543] disabled:opacity-60">
            {loading ? copy.updatingPassword : copy.saveNewPassword}
          </button>
          {recoveryError && (
            <button type="button" onClick={() => window.location.reload()}
              className="mt-3 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-[#657A52] hover:bg-white">
              {copy.returnToSignIn}
            </button>
          )}
        </form>
      </main>
    );
  }

  return (
    <main lang={language} dir={language === 'en' ? 'ltr' : 'rtl'} className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-lg">
        {languagePicker}
        <h1 className="text-xl font-extrabold text-[#171717]">{copy.loginTitle}</h1>
        <p className="mt-1 text-xs text-[#737373]">{copy.loginSubtitle}</p>
        <label className="mt-5 block text-xs font-bold text-[#171717]" htmlFor="admin-email">{copy.emailLabel}</label>
        <input id="admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-sm focus:border-[#657A52] focus:outline-none" />
        <label className="mt-4 block text-xs font-bold text-[#171717]" htmlFor="admin-password">{copy.passwordLabel}</label>
        <input id="admin-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-sm focus:border-[#657A52] focus:outline-none" />
        {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
        {notice && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{notice}</p>}
        {recoveryNotice && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{recoveryNotice}</p>}
        {recoveryError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{recoveryError}</p>}
        <button type="submit" disabled={loading}
          className="mt-5 w-full rounded-xl bg-[#657A52] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#536543] disabled:opacity-60">
          {loading ? copy.signingIn : copy.signIn}
        </button>
        <button
          type="button"
          onClick={() => void handleResetPassword()}
          disabled={resetting}
          className="mt-3 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-[#657A52] hover:bg-white disabled:opacity-60"
        >
          {resetting ? copy.sendingResetEmail : copy.resetPassword}
        </button>
      </form>
    </main>
  );
}

function AdminDashboardContent() {
  const { currentView, language, dir } = useAdmin();

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
    <div lang={language} dir={dir} className="flex min-h-screen bg-[#FAF9F6]">
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

          {['users', 'stores', 'suppliers', 'orders', 'rfqs', 'quotations', 'purchase-orders', 'notifications', 'support', 'audit'].includes(currentView) && (
            <CentralManagementView
              section={
                currentView as
                  | 'users'
                  | 'stores'
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
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem(ADMIN_LANGUAGE_STORAGE_KEY);
        if (savedLanguage === 'ku' || savedLanguage === 'ar' || savedLanguage === 'en') {
          return savedLanguage;
        }
      } catch {}
    }
    return 'ku';
  });
  const copy = adminPanelTranslations[language];
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => Boolean(supabase));
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryNotice, setRecoveryNotice] = useState('');
  const recoveryActiveRef = useRef(false);

  const handleLanguageChange = (nextLanguage: SupportedLanguage) => {
    setLanguage(nextLanguage);
    try {
      localStorage.setItem(ADMIN_LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  useEffect(() => {
    const liveSupabase = supabase;
    if (!liveSupabase) {
      return;
    }

    let active = true;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const errorCode = hashParams.get('error_code');
    const authError = hashParams.get('error');
    if (errorCode === 'otp_expired' || authError === 'access_denied') {
      void Promise.resolve().then(() => {
        if (!active) return;
        setRecoveryError(copy.resetLinkExpired);
        setChecking(false);
      });
      window.history.replaceState(null, '', window.location.pathname);
    }

    const { data: listener } = liveSupabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryActiveRef.current = true;
        setUser(null);
        setRecoveryError('');
        setRecoveryMode(true);
        setChecking(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    void liveSupabase.auth.getSession().then(async ({ data }) => {
      if (!active || errorCode === 'otp_expired' || authError === 'access_denied') return;
      const sessionUser = data.session?.user ?? null;
      if (!sessionUser) {
        setUser(null);
        setChecking(false);
        return;
      }

      const { data: profile } = await liveSupabase
        .from('profiles')
        .select('role, account_status')
        .eq('id', sessionUser.id)
        .maybeSingle();
      if (!active || recoveryActiveRef.current) return;
      const role = String(profile?.role || '').toLowerCase();
      if (!['admin', 'super_admin', 'superadmin'].includes(role) || (profile?.account_status && profile.account_status !== 'active')) {
        await liveSupabase.auth.signOut();
        setUser(null);
      } else {
        setUser(sessionUser);
      }
      setChecking(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [copy.resetLinkExpired, language]);

  useEffect(() => {
    if (!user || !supabase) return;
    const liveSupabase = supabase;
    const channel = liveSupabase
      .channel(`admin-access-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, async () => {
        const { data: profile } = await liveSupabase
          .from('profiles')
          .select('role, account_status')
          .eq('id', user.id)
          .maybeSingle();
        const role = String(profile?.role || '').toLowerCase();
        if (!['admin', 'super_admin', 'superadmin'].includes(role) || profile?.account_status === 'suspended') {
          await liveSupabase.auth.signOut();
          setUser(null);
        }
      })
      .subscribe();

    return () => {
      void liveSupabase.removeChannel(channel);
    };
  }, [user]);

  if (checking) {
    return (
      <main lang={language} dir={language === 'en' ? 'ltr' : 'rtl'} className="flex min-h-screen items-center justify-center bg-[#FAF9F6] text-xs font-bold text-[#737373]">
        {copy.verifyingSession}
      </main>
    );
  }

  if (!user) {
    return (
      <AdminLogin
        onAuthenticated={setUser}
        language={language}
        onLanguageChange={handleLanguageChange}
        recoveryMode={recoveryMode}
        recoveryError={recoveryError}
        recoveryNotice={recoveryNotice}
        onRecoveryComplete={() => {
          recoveryActiveRef.current = false;
          setRecoveryMode(false);
          setRecoveryError('');
          setRecoveryNotice(copy.passwordUpdatedNotice);
        }}
      />
    );
  }

  return (
    <AdminProvider>
      <button
        type="button"
        onClick={() => void supabase?.auth.signOut()}
        className="fixed bottom-4 right-4 z-[60] flex items-center gap-1.5 rounded-xl border border-[#EAE7DF] bg-white px-3 py-2 text-xs font-bold text-[#737373] shadow-md"
      >
        <LogOut className="h-3.5 w-3.5" />
        {copy.signOut}
      </button>
      <AdminDashboardContent />
    </AdminProvider>
  );
}
