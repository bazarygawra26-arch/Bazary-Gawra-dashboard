export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'suspended';
export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock';
export type WarrantyType = 'official_agent' | 'shop_local' | 'replacement' | 'none';
export type DeliveryType = 'same_day' | 'express_kurdistan' | 'pickup_only';
export type ReturnPolicyType = 'exchange_only' | 'money_back' | 'non_returnable';

export type KurdishCity = 'Sulaymaniyah' | 'Erbil' | 'Duhok' | 'Halabja' | 'Kirkuk';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'seller'
  | 'supplier'
  | 'retailer'
  | 'business_buyer'
  | 'b2b_retailer'
  | 'customer';

export type AccountStatus = 'active' | 'suspended';

export interface Seller {
  id: string;
  name_ku: string;
  name_en: string;
  name_ar: string;
  owner_name: string;
  owner_id?: string;
  phone: string;
  whatsapp: string;
  city: KurdishCity;
  bazaar_name: string;
  address_details: string;
  facade_image_url: string;
  logo_url: string;
  verification_status: VerificationStatus;
  application_status?: 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'suspended';
  application_reason?: string;
  transparency_score: number;
  notes: string;
  is_active?: boolean;
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

export type SubscriptionPlan = 'free_starter' | 'pro_merchant';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending_payment';

export interface Subscription {
  id: string;
  seller_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  listing_limit: number;
  monthly_price_iqd: number;
  current_period_start: string;
  current_period_end?: string | null;
  auto_renew: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  seller?: Seller;
}

export type PromotionType = 'sponsored_listing' | 'banner' | 'featured_store';
export type PromotionStatus = 'active' | 'expired' | 'scheduled' | 'cancelled';

export interface Promotion {
  id: string;
  product_id: string;
  seller_id: string;
  type: PromotionType;
  status: PromotionStatus;
  price_iqd: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  created_at: string;
  product?: Product;
  seller?: Seller;
}

export type PaymentReferenceType = 'b2c_order' | 'b2b_purchase_order' | 'subscription' | 'promotion' | 'refund';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'fastpay' | 'fib' | 'zaincash' | 'bank_transfer' | 'demo';

export interface Payment {
  id: string;
  reference_type: PaymentReferenceType;
  reference_id?: string;
  payer_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  is_demo: boolean;
  platform_fee: number;
  notes?: string;
  created_at: string;
  payer_name?: string;
}

export type OrderStatus = 'submitted' | 'accepted' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name?: string;
  quantity: number;
  unit_price: number;
  currency: string;
  created_at?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by?: string;
  reason?: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  seller_id?: string;
  status: OrderStatus;
  payment_status?: string;
  currency: string;
  total_amount: number;
  delivery_address?: string;
  delivery_notes?: string;
  items?: OrderItem[];
  customer_display?: string;
  seller_display?: string;
  created_at: string;
  updated_at: string;
}

export interface RfqItem {
  id: string;
  rfq_id: string;
  product_name?: string;
  quantity: number;
  expected_price?: number;
  currency: string;
  created_at?: string;
}

export interface Rfq {
  id: string;
  retailer_id?: string;
  supplier_id?: string;
  status: 'submitted' | 'open' | 'quoted' | 'closed' | 'cancelled';
  notes?: string;
  items?: RfqItem[];
  buyer_display?: string;
  supplier_display?: string;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  supplier_id?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  unit_price: number;
  quantity: number;
  currency: string;
  terms?: string;
  valid_until?: string;
  supplier_display?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id?: string | null;
  product_name?: string;
  quantity: number;
  unit_price: number;
  currency: string;
  created_at?: string;
}

export interface PurchaseOrder {
  id: string;
  rfq_id?: string;
  quotation_id?: string;
  retailer_id?: string;
  supplier_id?: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  currency: string;
  total_amount: number;
  terms?: string;
  items?: PurchaseOrderItem[];
  buyer_display?: string;
  supplier_display?: string;
  created_at: string;
  updated_at: string;
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

export interface AiSearchEvent {
  id: string;
  query_text: string;
  user_id?: string;
  source_language?: string;
  detected_category?: string;
  detected_budget_iqd?: number;
  detected_location?: string;
  matching_products_count: number;
  is_zero_result: boolean;
  event_type: 'text_search' | 'camera_scan' | 'voice_query';
  detected_labels?: string[];
  match_confidence?: number;
  created_at: string;
}

export interface MarketplaceGlossaryTerm {
  id: string;
  term_ku: string;
  term_ar: string;
  term_en: string;
  category?: string;
  notes?: string;
  status: 'approved' | 'pending_review' | 'suggested';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_ku: string;
  name_en: string;
  name_ar: string;
  icon: string;
  item_count?: number;
  is_active?: boolean;
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

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: string;
  affected_table?: string;
  affected_record_id?: string;
  before_data?: Record<string, unknown>;
  after_data?: Record<string, unknown>;
  reason?: string;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  requester_id?: string;
  requester_name?: string;
  subject: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  related_order_id?: string;
  created_at: string;
  updated_at: string;
}
