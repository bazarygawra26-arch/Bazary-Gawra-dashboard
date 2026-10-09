# Bazary-Gawra-dashboard (بازاڕی گەورە)

> **Operations & Management Admin Dashboard for Bazary Gawra — Kurdistan's AI-Powered Local Marketplace.**
> Built with Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, and Supabase PostgreSQL.

---

## 🌟 Key Features

### 1. 📊 Executive KPI Overview
- **Real-Time Platform Signals**: Live tracking of Active Products, Verified Local Storefronts, AI Queries, and Platform Transparency Average.
- **Kurdistan Geographic Breakdown**: Distribution across Sulaymaniyah (سلێمانی), Erbil (هەولێر), Duhok (دهۆک), Halabja (هەڵەبجە), and Kirkuk (کەرکووک).
- **Category Inventory Health**: Real-time listing density and stock health across 6 marketplace categories.
- **Live Activity Feed**: Real-time logging of merchant registrations, product uploads, and buyer AI queries.

### 2. 🏪 Merchant Management & Bazaar Verification (`/sellers`)
- **Merchant Directory**: Filter by verification status, city, or search by store name/phone.
- **Physical Verification Review**: Shop front / facade photo inspector, bazaar address verification, and internal auditor notes.
- **Instant WhatsApp Link**: One-click direct chat with merchant.
- **Inventory Drawer**: Slide-out drawer to view and add products for specific merchants.

### 3. 📦 Catalog & Transparency Signal Moderation (`/products`)
- **Multilingual Listing Editor**: Native tabbed inputs for Kurdish Sorani (`ckb`/`ku`), Arabic (`ar`), and English (`en`).
- **Transparency Signals Engine**:
  - **Warranty**: Official agent, local shop, replacement, or none.
  - **Delivery**: Same-day city, 24-48h Kurdistan express, or pickup only.
  - **Return Window**: Inspection period & policy condition.
  - **Dynamic Transparency Score**: Live 0–100% calculation.
- **Missing Signals Audit**: Dedicated filter and alert for listings lacking confidence signals.
- **Quick Price & Stock Editor**: Instant updates for pricing (IQD/USD) and inventory.

### 4. 🤖 AI Search & Market Intelligence (`/ai-insights`)
- **Kurdish AI Queries Feed**: Live log of buyer intent searches in Kurdish Sorani.
- **Visual Camera Scans**: Buyer mobile scans with match confidence % and detected labels.
- **Unmet Demand Gap**: Identifies zero-result searches to highlight merchant onboarding opportunities.

### 5. 🌍 Kurdish Cities & Taxonomy (`/taxonomy`)
- Detailed directory of governorates and historical bazaar hubs (Mawlawi St, Saholaka, Qaysari Erbil, Nishtiman, Central Duhok, Old Halabja, Rahimawa Kirkuk).

### 6. ⚡ Supabase PostgreSQL & Migration Studio (`/settings`)
- Live connection health check.
- Complete copy-paste SQL migration script including RLS policies, custom ENUMs, and seed data.
- Full JSON backup and CSV export.

---

## 🎨 Design System & Brand Palette
- **Primary Brand Gold**: `#F4B942`
- **Secondary Sage Green**: `#657A52`
- **Background**: `#FAF9F6`
- **Cards & Surface**: `#FFFFFF` with border `#EAE7DF`
- **Typography**: `Vazirmatn` (Kurdish/Arabic RTL) & `Plus Jakarta Sans` (English LTR)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on v22)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/bazarygawra26-arch/Bazary-Gawra-dashboard.git
cd Bazary-Gawra-dashboard

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001).

### Supabase Setup (Optional)
Copy `.env.local.example` to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
Go to the **Settings** tab in the dashboard and copy the complete PostgreSQL schema migration into the Supabase SQL Editor.
