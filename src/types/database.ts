export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'suspended';
export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock';
export type WarrantyType = 'official_agent' | 'shop_local' | 'replacement' | 'none';
export type DeliveryType = 'same_day' | 'express_kurdistan' | 'pickup_only';
export type ReturnPolicyType = 'exchange_only' | 'money_back' | 'non_returnable';

export type KurdishCity = 'Sulaymaniyah' | 'Erbil' | 'Duhok' | 'Halabja' | 'Kirkuk';

export interface Seller {
  id: string;
  name_ku: string;
  name_en: string;
  name_ar: string;
  owner_name: string;
  phone: string;
  whatsapp: string;
  city: KurdishCity;
  bazaar_name: string;
  address_details: string;
  facade_image_url: string;
  logo_url: string;
  verification_status: VerificationStatus;
  transparency_score: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name_ku: string;
  name_en: string;
  name_ar: string;
  description_ku: string;
  description_en: string;
  description_ar: string;
  price_iqd: number;
  price_usd: number;
  original_price_iqd?: number;
  category_id: string;
  stock_quantity: number;
  status: ProductStatus;
  images: string[];
  primary_image: string;
  
  // Transparency Signals
  warranty_type: WarrantyType;
  warranty_period: string; // e.g. "12 Months", "6 Months", "No Warranty"
  warranty_notes: string;
  
  delivery_type: DeliveryType;
  delivery_cost_iqd: number;
  delivery_time_hours: number;
  
  return_window_days: number;
  return_policy_type: ReturnPolicyType;
  return_conditions: string;
  
  transparency_score: number;
  created_at: string;
  updated_at: string;

  // Sponsorship & Promotion
  is_sponsored?: boolean;
  is_promoted?: boolean;
  promotion_expires_at?: string;

  // Joined fields for display
  seller?: Seller;
}

export interface AiSearchQuery {
  id: string;
  query_text: string;
  query_text_ku?: string;
  query_text_en?: string;
  query_text_ar?: string;
  user_city: KurdishCity;
  matched_products_count: number;
  intent_category: string;
  timestamp: string;
  status: 'resolved' | 'zero_results' | 'converted';
}

export interface AiProductScan {
  id: string;
  scan_image_url: string;
  detected_labels: string[];
  detected_labels_ku?: string[];
  detected_labels_en?: string[];
  detected_labels_ar?: string[];
  match_confidence: number;
  matched_product_name: string;
  matched_product_name_ku?: string;
  matched_product_name_en?: string;
  matched_product_name_ar?: string;
  matched_product_id?: string;
  matched_seller_name: string;
  matched_seller_name_ku?: string;
  matched_seller_name_en?: string;
  matched_seller_name_ar?: string;
  matched_seller_id?: string;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_ku: string;
  name_en: string;
  name_ar: string;
  icon: string;
  item_count?: number;
}

export interface CityInfo {
  id: string;
  name_en: KurdishCity;
  name_ku: string;
  name_ar: string;
  governorate: string;
  bazaars: string[];
  merchant_count?: number;
}
