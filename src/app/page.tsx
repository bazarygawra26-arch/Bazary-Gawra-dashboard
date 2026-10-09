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
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  );
}
