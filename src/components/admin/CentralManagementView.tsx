'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bell, 
  FileText, 
  Headphones, 
  PackageCheck, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAdmin } from '@/lib/store';
import { adminPanelTranslations, translateAdminRole, translateAdminStatus } from '@/lib/adminPanelTranslations';
import { formatIqd } from '@/lib/utils';
import { SubscriptionPlan, SubscriptionStatus, OrderStatus } from '@/types/database';

type Section = 
  | 'users' 
  | 'stores' 
  | 'suppliers' 
  | 'notifications' 
  | 'orders' 
  | 'rfqs' 
  | 'quotations' 
  | 'purchase-orders' 
  | 'support' 
  | 'audit'
  | 'subscriptions';

interface CentralManagementViewProps {
  section: Section;
}

type ProfileRow = {
  id: string;
  role?: string;
  full_name?: string;
  account_status?: string;
  suspended_reason?: string;
  suspended_at?: string;
  businesses?: string;
};

type GenericRow = {
  id: string;
  items?: GenericItem[];
  customer_display?: string;
  seller_display?: string;
  buyer_display?: string;
  supplier_display?: string;
  [key: string]: unknown;
};

type GenericItem = {
  product_id?: string | null;
  product_name?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  expected_price?: number | null;
  currency?: string | null;
};

function ItemsList({ items, emptyLabel }: { items?: GenericItem[]; emptyLabel: string }) {
  if (!items?.length) return <span className="text-[#A3A3A3]">{emptyLabel}</span>;

  return (
    <ul className="min-w-40 space-y-1">
      {items.map((item, index) => {
        const name = item.product_name || item.product_id || 'Item';
        const price = item.unit_price ?? item.expected_price;
        const priceLabel = price == null ? '' : ` · ${Number(price).toLocaleString()} ${item.currency || 'IQD'}`;
        return (
          <li key={`${name}-${index}`}>
            {name} × {item.quantity ?? '—'}{priceLabel}
          </li>
        );
      })}
    </ul>
  );
}

const displayValue = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value));
const displayAmount = (value: unknown, currency: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  return `${Number.isFinite(amount) ? amount.toLocaleString() : String(value)} ${displayValue(currency || 'IQD')}`;
};

const formatAdminDate = (value: unknown, language: 'ku' | 'ar' | 'en') => {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  const locale = language === 'ku' ? 'ckb-IQ' : language === 'ar' ? 'ar-IQ' : 'en-US';
  return date.toLocaleString(locale);
};

const fillTemplate = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_match, key: string) => values[key] || '');

function MarketplaceRecordsTable({
  section,
  rows,
  language,
  onUpdateOrderStatus,
  onIssueRefund,
}: {
  section: 'orders' | 'rfqs' | 'quotations' | 'purchase-orders';
  rows: GenericRow[];
  language: 'ku' | 'ar' | 'en';
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus, reason: string) => Promise<void>;
  onIssueRefund?: (orderId: string, amount: number, reason: string) => Promise<void>;
}) {
  const copy = adminPanelTranslations[language];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals for Order Action
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<GenericRow | null>(null);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<GenericRow | null>(null);
  const [actionStatus, setActionStatus] = useState<OrderStatus>('processing');
  const [actionReason, setActionReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns =
    section === 'orders'
      ? [
          { key: 'id', label: copy.colOrderId },
          { key: 'customer_display', label: copy.colCustomer },
          { key: 'seller_display', label: copy.colSeller },
          { key: 'total_amount', label: copy.colTotal },
          { key: 'payment_status', label: copy.colPayment },
          { key: 'status', label: copy.colOrderStatus },
          { key: 'created_at', label: copy.colCreated },
          { key: 'actions', label: copy.colAction },
        ]
      : section === 'rfqs'
      ? [
          { key: 'id', label: copy.colRfqId },
          { key: 'buyer_display', label: copy.colBuyer },
          { key: 'supplier_display', label: copy.colSupplier },
          { key: 'items', label: copy.colRequestedItems },
          { key: 'status', label: copy.colRfqStatus },
          { key: 'created_at', label: copy.colSubmitted },
        ]
      : section === 'quotations'
      ? [
          { key: 'id', label: copy.colQuotationId },
          { key: 'rfq_id', label: copy.colLinkedRfq },
          { key: 'supplier_display', label: copy.colSupplier },
          { key: 'quantity', label: copy.colQuantity },
          { key: 'unit_price', label: copy.colUnitPrice },
          { key: 'valid_until', label: copy.colValidUntil },
          { key: 'terms', label: copy.colTerms },
          { key: 'status', label: copy.colQuotationStatus },
        ]
      : [
          { key: 'id', label: copy.colPurchaseOrderId },
          { key: 'rfq_id', label: copy.colLinkedRfq },
          { key: 'quotation_id', label: copy.colLinkedQuotation },
          { key: 'buyer_display', label: copy.colBuyer },
          { key: 'supplier_display', label: copy.colSupplier },
          { key: 'items', label: copy.colItems },
          { key: 'total_amount', label: copy.colTotal },
          { key: 'terms', label: copy.colTerms },
          { key: 'status', label: copy.colPurchaseOrderStatus },
        ];

  const statuses = [...new Set(rows.map(row => String(row.status || '')).filter(Boolean))];
  const visibleRows = rows.filter(row => {
    const matchesSearch = !search.trim() || JSON.stringify(row).toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (statusFilter === 'all' || String(row.status || '') === statusFilter);
  });

  const handleConfirmStatusChange = async () => {
    if (!selectedOrderForAction || !onUpdateOrderStatus) return;
    setIsSubmitting(true);
    try {
      await onUpdateOrderStatus(selectedOrderForAction.id, actionStatus, actionReason || 'Status update via console');
      setSelectedOrderForAction(null);
      setActionReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRefund = async () => {
    if (!selectedOrderForRefund || !onIssueRefund) return;
    if (!refundReason.trim()) {
      alert('A refund reason is required for audit compliance.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onIssueRefund(selectedOrderForRefund.id, refundAmount, refundReason);
      setSelectedOrderForRefund(null);
      setRefundReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cellContent = (row: GenericRow, key: string) => {
    if (key === 'items') return <ItemsList items={row.items} emptyLabel={copy.noItemDetails} />;
    if (key === 'total_amount' || key === 'unit_price') return displayAmount(row[key], row.currency);
    if (key === 'id' || key === 'rfq_id' || key === 'quotation_id') {
      return <code className="break-all font-mono text-[10px]">{displayValue(row[key])}</code>;
    }
    if (key === 'status' || key === 'payment_status') {
      const val = String(row[key] || '').toLowerCase();
      const isGood = ['delivered', 'completed', 'paid', 'accepted'].includes(val);
      const isBad = ['cancelled', 'failed', 'refunded', 'rejected'].includes(val);
      return (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isGood ? 'bg-emerald-50 text-emerald-800' : isBad ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'
        }`}>
          {translateAdminStatus(String(row[key] || ''), copy)}
        </span>
      );
    }
    if (key === 'created_at' || key === 'valid_until') {
      return formatAdminDate(row[key], language);
    }
    if (key === 'actions' && section === 'orders') {
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedOrderForAction(row);
              setActionStatus((row.status as OrderStatus) || 'processing');
            }}
            className="rounded-lg border border-[#EAE7DF] bg-[#FAF9F6] px-2.5 py-1 text-[11px] font-bold text-[#202820] hover:bg-white"
          >
            Update
          </button>
          {row.status !== 'refunded' && (
            <button
              onClick={() => {
                setSelectedOrderForRefund(row);
                setRefundAmount(Number(row.total_amount || 0));
              }}
              className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
            >
              Refund
            </button>
          )}
        </div>
      );
    }
    return displayValue(row[key]);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white shadow-xs">
      <div className="flex flex-col gap-2 border-b border-[#EAE7DF] p-3 sm:flex-row">
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder={copy.searchRecords}
          className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
        />
        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          aria-label={copy.filterByStatus}
          className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202820]"
        >
          <option value="all">{copy.allStatuses}</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {translateAdminStatus(status, copy)}
            </option>
          ))}
        </select>
      </div>

      {visibleRows.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#737373]">{copy.noMatchingRecords}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#FAF9F6] text-[#737373]">
              <tr>
                {columns.map(column => (
                  <th key={column.key} className="px-4 py-3 text-start">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DF]">
              {visibleRows.map(row => (
                <tr key={row.id} className="align-top hover:bg-[#FAF9F6]/50">
                  {columns.map(column => (
                    <td key={column.key} className="max-w-xs px-4 py-3 text-[#202820]">
                      {cellContent(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Status Modal */}
      {selectedOrderForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-[#202820]">
              Update Order Status (#{selectedOrderForAction.id.slice(0, 8)})
            </h3>
            <p className="mt-1 text-xs text-[#737373]">
              Select authorized lifecycle status transition. A mandatory audit log will be created.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">New Status</label>
                <select
                  value={actionStatus}
                  onChange={e => setActionStatus(e.target.value as OrderStatus)}
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
                >
                  <option value="submitted">Submitted</option>
                  <option value="accepted">Accepted</option>
                  <option value="processing">Processing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">Reason / Admin Note</label>
                <textarea
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                  placeholder="e.g. Verified bazaar courier dispatched"
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE7DF]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForAction(null)}
                  className="rounded-xl border border-[#EAE7DF] px-4 py-2 text-xs font-bold text-[#737373]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleConfirmStatusChange()}
                  className="rounded-xl bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#135f3d]"
                >
                  {isSubmitting ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {selectedOrderForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-rose-800">
              Issue Order Refund (#{selectedOrderForRefund.id.slice(0, 8)})
            </h3>
            <p className="mt-1 text-xs text-[#737373]">
              Refunds are recorded as verified negative revenue entries and logged in the immutable audit registry.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">Refund Amount (IQD)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={e => setRefundAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#737373]">Refund Reason *</label>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="e.g. Merchant out of stock / Customer return approved"
                  required
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE7DF]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForRefund(null)}
                  className="rounded-xl border border-[#EAE7DF] px-4 py-2 text-xs font-bold text-[#737373]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleConfirmRefund()}
                  className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800"
                >
                  {isSubmitting ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CentralManagementView({ section }: CentralManagementViewProps) {
  const { 
    language, 
    subscriptions, 
    manageSubscription, 
    sellers, 
    payments, 
    updateOrderStatus, 
    issueOrderRefund 
  } = useAdmin();
  const copy = adminPanelTranslations[language];

  const [rows, setRows] = useState<GenericRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canManageRoles, setCanManageRoles] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [roleDrafts, setRoleDrafts] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  // Subscription Plan Change Modal
  const [editingSubSellerId, setEditingSubSellerId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('pro_merchant');
  const [selectedSubStatus, setSelectedSubStatus] = useState<SubscriptionStatus>('active');
  const [subReason, setSubReason] = useState('');
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (active) setError('');
      if (!supabase) {
        if (active) {
          setError(copy.supabaseNotConfigured);
          setLoading(false);
        }
        return;
      }

      if (section === 'users') {
        const { data: currentAuth } = await supabase.auth.getUser();
        if (currentAuth.user) {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentAuth.user.id)
            .maybeSingle();
          setCanManageRoles(['super_admin', 'superadmin'].includes(String(currentProfile?.role || '').toLowerCase()));
        }
        const [profileResult, sellerResult, supplierResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, role, full_name, account_status, suspended_reason, suspended_at')
            .order('id')
            .limit(500),
          supabase.from('sellers').select('owner_id, name_en, application_status'),
          supabase.from('supplier_applications').select('applicant_id, business_name, status'),
        ]);

        const queryErrors = [profileResult.error, sellerResult.error, supplierResult.error].filter(
          (queryError): queryError is NonNullable<typeof queryError> => Boolean(queryError)
        );
        if (queryErrors.length) setError(queryErrors.map(q => q.message).join(' '));

        const businessMap = new Map<string, string[]>();
        for (const seller of sellerResult.data || []) {
          if (!seller.owner_id) continue;
          const names = businessMap.get(seller.owner_id) || [];
          names.push(`Store: ${seller.name_en || 'Unnamed'} (${seller.application_status || 'status unavailable'})`);
          businessMap.set(seller.owner_id, names);
        }
        for (const supplier of supplierResult.data || []) {
          const names = businessMap.get(supplier.applicant_id) || [];
          names.push(`Supplier: ${supplier.business_name} (${supplier.status})`);
          businessMap.set(supplier.applicant_id, names);
        }
        setProfiles(
          (profileResult.data || []).map(profile => ({
            ...profile,
            businesses: (businessMap.get(profile.id) || []).join(' · ') || '—',
          })) as ProfileRow[]
        );
      } else if (section === 'subscriptions') {
        // Subscriptions are managed directly through store and Supabase
        setLoading(false);
        return;
      } else {
        const tableBySection: Record<string, string> = {
          notifications: 'notifications',
          orders: 'orders',
          rfqs: 'rfqs',
          quotations: 'quotations',
          'purchase-orders': 'purchase_orders',
          support: 'support_requests',
          audit: 'admin_audit_logs',
        };

        if (section === 'stores') {
          const { data, error: queryError } = await supabase
            .from('sellers')
            .select(
              'id, owner_id, name_en, name_ku, phone, address, verification_status, application_status, application_reason, application_reviewed_at, application_reviewed_by, is_active, created_at'
            )
            .order('created_at', { ascending: false })
            .limit(500);
          if (queryError) setError(queryError.message);
          setRows((data || []) as GenericRow[]);
        } else {
          const table = section === 'suppliers' ? 'supplier_applications' : tableBySection[section];
          if (table) {
            const { data, error: queryError } = await supabase
              .from(table)
              .select('*')
              .order('created_at', { ascending: false })
              .limit(500);
            if (queryError) {
              setError(queryError.message);
              setRows([]);
            } else {
              let records = (data || []) as GenericRow[];
              const itemConfig =
                section === 'orders'
                  ? { table: 'order_items', foreignKey: 'order_id' }
                  : section === 'rfqs'
                  ? { table: 'rfq_items', foreignKey: 'rfq_id' }
                  : section === 'purchase-orders'
                  ? { table: 'purchase_order_items', foreignKey: 'purchase_order_id' }
                  : null;

              if (itemConfig && records.length > 0) {
                const { data: itemData, error: itemError } = await supabase
                  .from(itemConfig.table)
                  .select('*')
                  .in(itemConfig.foreignKey, records.map(record => record.id));
                if (itemError) {
                  setError(current => [current, itemError.message].filter(Boolean).join(' '));
                } else {
                  const itemsByRecord = new Map<string, GenericItem[]>();
                  for (const item of (itemData || []) as GenericRow[]) {
                    const recordId = String(item[itemConfig.foreignKey] || '');
                    const recordItems = itemsByRecord.get(recordId) || [];
                    recordItems.push(item as GenericItem);
                    itemsByRecord.set(recordId, recordItems);
                  }
                  records = records.map(record => ({
                    ...record,
                    items: itemsByRecord.get(record.id) || [],
                  }));
                }
              }

              if (['orders', 'rfqs', 'quotations', 'purchase-orders'].includes(section)) {
                const partyIds = [
                  ...new Set(
                    records.flatMap(record =>
                      ['customer_id', 'seller_id', 'retailer_id', 'supplier_id']
                        .map(key => record[key])
                        .filter((id): id is string => typeof id === 'string' && id.length > 0)
                    )
                  ),
                ];
                const partyLabels = new Map<string, string>();
                if (partyIds.length > 0) {
                  const [profileResult, sellerResult, supplierResult] = await Promise.all([
                    supabase.from('profiles').select('id, full_name').in('id', partyIds),
                    supabase.from('sellers').select('id, owner_id, name_en').limit(500),
                    supabase.from('supplier_applications').select('id, applicant_id, business_name').limit(500),
                  ]);
                  for (const profile of profileResult.data || []) {
                    if (profile.full_name) partyLabels.set(profile.id, profile.full_name);
                  }
                  for (const seller of sellerResult.data || []) {
                    if (seller.name_en) {
                      partyLabels.set(seller.id, seller.name_en);
                      if (seller.owner_id) partyLabels.set(seller.owner_id, seller.name_en);
                    }
                  }
                  for (const supplier of supplierResult.data || []) {
                    if (supplier.business_name) {
                      partyLabels.set(supplier.id, supplier.business_name);
                      if (supplier.applicant_id) partyLabels.set(supplier.applicant_id, supplier.business_name);
                    }
                  }
                }

                const partyLabel = (id: unknown) => {
                  if (typeof id !== 'string' || !id) return '—';
                  const name = partyLabels.get(id);
                  return name ? `${name} (${id.slice(0, 8)})` : id;
                };

                records = records.map(record => ({
                  ...record,
                  customer_display: partyLabel(record.customer_id),
                  seller_display: partyLabel(record.seller_id),
                  buyer_display: partyLabel(record.retailer_id),
                  supplier_display: partyLabel(record.supplier_id),
                }));
              }

              setRows(records);
            }
          }
        }
      }
      if (active) setLoading(false);
    };

    void load();
  }, [section, copy.supabaseNotConfigured]);

  const callAction = async (payload: Record<string, unknown>) => {
    if (!supabase) throw new Error(copy.supabaseNotConfigured);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const response = await fetch('/api/admin/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok || result.error) {
      throw new Error(result.error || copy.actionFailed);
    }
  };

  const suspendUser = async (profile: ProfileRow) => {
    const isSuspended = profile.account_status === 'suspended';
    const accountStatus = isSuspended ? 'active' : 'suspended';
    const reason = reasons[profile.id] || '';
    if (!isSuspended && !reason.trim()) {
      setError(copy.enterSuspensionReason);
      return;
    }
    const template = isSuspended ? copy.confirmReactivateUser : copy.confirmSuspendUser;
    const confirmation = fillTemplate(template, { name: profile.full_name || profile.id });
    if (!window.confirm(confirmation)) return;
    try {
      await callAction({
        action: 'account_status',
        userId: profile.id,
        accountStatus,
        reason,
      });
      setProfiles(current =>
        current.map(item => (item.id === profile.id ? { ...item, account_status: accountStatus } : item))
      );
      setReasons(current => ({ ...current, [profile.id]: '' }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.actionFailed);
    }
  };

  const changeRole = async (profile: ProfileRow) => {
    const role = roleDrafts[profile.id] || profile.role || 'customer';
    const reason = reasons[profile.id] || '';
    if (role === profile.role) return;
    if (!reason.trim()) {
      setError(copy.enterRoleChangeReason);
      return;
    }
    const confirmation = fillTemplate(copy.confirmRoleChange, {
      oldRole: translateAdminRole(profile.role || 'customer', copy),
      newRole: translateAdminRole(role, copy),
    });
    if (!window.confirm(confirmation)) return;
    try {
      await callAction({ action: 'profile_role_change', userId: profile.id, role, reason });
      setProfiles(current => (current.map(item => (item.id === profile.id ? { ...item, role } : item))));
      setReasons(current => ({ ...current, [profile.id]: '' }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.roleChangeFailed);
    }
  };

  const reviewApplication = async (row: GenericRow, status: 'approved' | 'rejected' | 'changes_requested') => {
    const reason = reasons[row.id] || '';
    if (status !== 'approved' && !reason.trim()) {
      setError(copy.reasonRequiredForDecision);
      return;
    }
    const confirmation =
      status === 'approved'
        ? copy.confirmApprove
        : status === 'rejected'
        ? copy.confirmReject
        : copy.confirmRequestChanges;
    if (!window.confirm(confirmation)) return;
    const actionBody =
      section === 'stores'
        ? { action: 'seller_application_review', sellerId: row.id, status, reason }
        : { action: 'supplier_application_review', applicationId: row.id, status, reason };
    try {
      await callAction(actionBody);
      setRows(current =>
        current.map(item =>
          item.id === row.id
            ? {
                ...item,
                ...(section === 'stores'
                  ? { application_status: status, application_reason: reason }
                  : { status, decision_reason: reason }),
              }
            : item
        )
      );
      setReasons(current => ({ ...current, [row.id]: '' }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.applicationDecisionFailed);
    }
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubSellerId) return;
    setIsUpdatingSub(true);
    try {
      await manageSubscription(editingSubSellerId, selectedPlan, selectedSubStatus, subReason);
      setEditingSubSellerId(null);
      setSubReason('');
    } catch (err) {
      console.error('Failed to update subscription:', err);
    } finally {
      setIsUpdatingSub(false);
    }
  };

  const title: Record<Section, string> = {
    users: copy.titleUsers,
    stores: copy.titleApplications,
    suppliers: copy.titleSuppliers,
    notifications: copy.titleNotifications,
    orders: copy.titleOrders,
    rfqs: copy.titleRfqs,
    quotations: copy.titleQuotations,
    'purchase-orders': copy.titlePurchaseOrders,
    support: copy.titleSupport,
    audit: copy.titleAudit,
    subscriptions: language === 'ku' ? 'بەڕێوەبردنی بەشداریکردن و داهاتی پلاتفۆرم' : 'Merchant Subscriptions & Monetization',
  };

  const icon: Record<Section, React.ReactNode> = {
    users: <Users className="h-5 w-5" />,
    stores: <ShieldCheck className="h-5 w-5" />,
    suppliers: <ShieldCheck className="h-5 w-5" />,
    notifications: <Bell className="h-5 w-5" />,
    orders: <PackageCheck className="h-5 w-5" />,
    rfqs: <FileText className="h-5 w-5" />,
    quotations: <FileText className="h-5 w-5" />,
    'purchase-orders': <PackageCheck className="h-5 w-5" />,
    support: <Headphones className="h-5 w-5" />,
    audit: <ShieldCheck className="h-5 w-5" />,
    subscriptions: <CreditCard className="h-5 w-5" />,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18794E]/10 text-[#18794E]">
          {icon[section]}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#202820]">{title[section]}</h1>
          <p className="text-xs text-[#737373]">
            {section === 'suppliers'
              ? copy.suppliersSubtitle
              : section === 'subscriptions'
              ? (language === 'ku' ? 'پلانی فرۆشیاران (Free Starter: 5 کاڵا | Pro Merchant: 50 کاڵا، ١٠,٠٠٠ دینار/مانگ)' : 'Merchant plans: Free Starter (5 listings) and Pro Merchant (50 listings, 10,000 IQD/mo)')
              : copy.pageSubtitle}
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#EAE7DF] bg-white p-6 text-xs text-[#737373]">{copy.loading}</div>
      ) : section === 'subscriptions' ? (
        /* PART 10: Subscriptions & Revenue Management View */
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white shadow-xs">
            <div className="p-4 border-b border-[#EAE7DF] flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#202820]">
                {language === 'ku' ? 'تۆماری بەشداریکردنی فرۆشیاران' : 'Merchant Subscription Directory'}
              </h2>
              <span className="text-xs text-[#737373]">
                {sellers.length} registered storefronts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF9F6] text-[#737373]">
                  <tr>
                    <th className="px-4 py-3 text-start">Storefront</th>
                    <th className="px-4 py-3 text-start">Plan</th>
                    <th className="px-4 py-3 text-start">Monthly Fee</th>
                    <th className="px-4 py-3 text-start">Listing Limit</th>
                    <th className="px-4 py-3 text-start">Status</th>
                    <th className="px-4 py-3 text-start">Period End</th>
                    <th className="px-4 py-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DF]">
                  {sellers.map(s => {
                    const sub = subscriptions.find(sub => sub.seller_id === s.id);
                    const plan = sub?.plan || 'free_starter';
                    const isPro = plan === 'pro_merchant';
                    const limit = sub?.listing_limit || (isPro ? 50 : 5);
                    const fee = sub?.monthly_price_iqd ?? (isPro ? 10000 : 0);

                    return (
                      <tr key={s.id} className="hover:bg-[#FAF9F6]/60">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#202820]">{s.name_en || s.name_ku}</p>
                          <p className="text-[10px] text-[#737373]">{s.city} · {s.bazaar_name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isPro ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {isPro ? 'Pro Merchant' : 'Free Starter'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#202820]">
                          {formatIqd(fee)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold text-[#202820]">{limit}</span> listings
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {sub?.status || 'active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#737373]">
                          {sub?.current_period_end ? formatAdminDate(sub.current_period_end, language) : 'Continuous'}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <button
                            onClick={() => {
                              setEditingSubSellerId(s.id);
                              setSelectedPlan(isPro ? 'free_starter' : 'pro_merchant');
                              setSelectedSubStatus('active');
                            }}
                            className="rounded-xl border border-[#18794E] px-3 py-1 text-xs font-bold text-[#18794E] hover:bg-[#18794E] hover:text-white transition-colors"
                          >
                            Change Plan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Financial Ledger */}
          <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white shadow-xs">
            <div className="p-4 border-b border-[#EAE7DF] flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#202820]">
                  {language === 'ku' ? 'تۆماری دارایی و پارەدانەکان' : 'Financial Transactions & Realized Payments'}
                </h2>
                <p className="text-[11px] text-[#737373]">
                  Immutable ledger of confirmed subscription payments, sponsored promotions, and refunds.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF9F6] text-[#737373]">
                  <tr>
                    <th className="px-4 py-3 text-start">Transaction ID</th>
                    <th className="px-4 py-3 text-start">Type</th>
                    <th className="px-4 py-3 text-start">Amount (IQD)</th>
                    <th className="px-4 py-3 text-start">Method</th>
                    <th className="px-4 py-3 text-start">Status</th>
                    <th className="px-4 py-3 text-start">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DF]">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-[#FAF9F6]/50">
                      <td className="px-4 py-3 font-mono text-[11px] text-[#737373]">{p.id}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-[#FAF9F6] border border-[#EAE7DF] px-2 py-0.5 text-[10px] font-bold text-[#202820]">
                          {p.reference_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-[#202820]">
                        {formatIqd(p.amount)}
                      </td>
                      <td className="px-4 py-3 uppercase text-[10px] font-semibold text-[#737373]">
                        {p.payment_method}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#737373]">{formatAdminDate(p.created_at, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Plan Modal */}
          {editingSubSellerId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl border border-[#EAE7DF] bg-white p-6 shadow-xl">
                <h3 className="text-base font-extrabold text-[#202820]">
                  Manage Merchant Plan
                </h3>
                <form onSubmit={handleSaveSubscription} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#737373]">Select Tier</label>
                    <select
                      value={selectedPlan}
                      onChange={e => setSelectedPlan(e.target.value as SubscriptionPlan)}
                      className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
                    >
                      <option value="free_starter">Free Starter (0 IQD · Up to 5 listings)</option>
                      <option value="pro_merchant">Pro Merchant (10,000 IQD/mo · Up to 50 listings)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#737373]">Status</label>
                    <select
                      value={selectedSubStatus}
                      onChange={e => setSelectedSubStatus(e.target.value as SubscriptionStatus)}
                      className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#737373]">Reason *</label>
                    <textarea
                      value={subReason}
                      onChange={e => setSubReason(e.target.value)}
                      placeholder="e.g. Upgraded to Pro Merchant plan upon cash payment"
                      required
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE7DF]">
                    <button
                      type="button"
                      onClick={() => setEditingSubSellerId(null)}
                      className="rounded-xl border border-[#EAE7DF] px-4 py-2 text-xs font-bold text-[#737373]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingSub}
                      className="rounded-xl bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#135f3d]"
                    >
                      {isUpdatingSub ? 'Saving...' : 'Save Plan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : section === 'users' ? (
        <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#EAE7DF] p-3 sm:flex-row">
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={copy.searchUsers}
              className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
            />
            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
              aria-label={copy.filterByStatus}
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202820]"
            >
              <option value="all">{copy.allAccountStatuses}</option>
              <option value="active">{copy.statusActive}</option>
              <option value="suspended">{copy.statusSuspended}</option>
            </select>
            <select
              value={roleFilter}
              onChange={event => setRoleFilter(event.target.value)}
              aria-label={copy.filterByRole}
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202820]"
            >
              <option value="all">{copy.allRoles}</option>
              {['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin', 'super_admin', 'superadmin'].map(
                role => (
                  <option key={role} value={role}>
                    {translateAdminRole(role, copy)}
                  </option>
                )
              )}
            </select>
          </div>
          {profiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#737373]">{copy.noVisibleProfiles}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF9F6] text-[#737373]">
                  <tr>
                    <th className="px-4 py-3 text-start">{copy.colUser}</th>
                    <th className="px-4 py-3 text-start">{copy.colRole}</th>
                    <th className="px-4 py-3 text-start">{copy.colStatus}</th>
                    <th className="px-4 py-3 text-start">{copy.colBusinesses}</th>
                    <th className="px-4 py-3 text-start">{copy.colAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DF]">
                  {profiles
                    .filter(profile => {
                      const q = search.trim().toLowerCase();
                      const matchesSearch =
                        !q ||
                        `${profile.full_name || ''} ${profile.id} ${profile.role || ''} ${profile.businesses || ''}`
                          .toLowerCase()
                          .includes(q);
                      return (
                        matchesSearch &&
                        (statusFilter === 'all' || (profile.account_status || 'active') === statusFilter) &&
                        (roleFilter === 'all' || (profile.role || 'customer').toLowerCase() === roleFilter)
                      );
                    })
                    .map(profile => (
                      <tr key={profile.id}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#202820]">{profile.full_name || copy.unnamedProfile}</p>
                          <p className="text-[10px] text-[#737373]">{profile.id}</p>
                        </td>
                        <td className="px-4 py-3">{translateAdminRole(profile.role || 'customer', copy)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                              (profile.account_status || 'active') === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {translateAdminStatus(profile.account_status || 'active', copy)}
                          </span>
                        </td>
                        <td className="max-w-xs px-4 py-3 text-[11px] text-[#737373]">{profile.businesses || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="min-w-48 space-y-2">
                            <input
                              value={reasons[profile.id] || ''}
                              onChange={event => setReasons(current => ({ ...current, [profile.id]: event.target.value }))}
                              placeholder={copy.reasonRequired}
                              className="w-full rounded-lg border border-[#EAE7DF] px-2 py-1.5"
                            />
                            <div className="flex gap-1">
                              {canManageRoles && (
                                <>
                                  <select
                                    value={roleDrafts[profile.id] ?? profile.role ?? 'customer'}
                                    onChange={event =>
                                      setRoleDrafts(current => ({ ...current, [profile.id]: event.target.value }))
                                    }
                                    className="min-w-28 rounded-lg border border-[#EAE7DF] bg-white px-2 py-1.5"
                                  >
                                    {profile.role &&
                                      !['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin'].includes(
                                        profile.role
                                      ) && <option value={profile.role}>{translateAdminRole(profile.role, copy)}</option>}
                                    {['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin'].map(
                                      role => (
                                        <option key={role} value={role}>
                                          {translateAdminRole(role, copy)}
                                        </option>
                                      )
                                    )}
                                  </select>
                                  <button
                                    onClick={() => void changeRole(profile)}
                                    className="rounded-lg bg-[#18794E] px-2.5 py-1.5 font-bold text-white hover:bg-[#135f3d]"
                                  >
                                    {copy.saveRole}
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => void suspendUser(profile)}
                                className="rounded-lg border border-[#EAE7DF] px-2.5 py-1.5 font-bold hover:bg-[#FAF9F6]"
                              >
                                {profile.account_status === 'suspended' ? copy.reactivate : copy.suspend}
                              </button>
                            </div>
                            {!canManageRoles && <p className="text-[10px] text-[#737373]">{copy.roleChangeRequiresSuperAdmin}</p>}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : section === 'stores' || section === 'suppliers' ? (
        <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#EAE7DF] p-3 sm:flex-row">
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={copy.searchApplications}
              className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#18794E] focus:outline-hidden"
            />
            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
              aria-label={copy.filterByStatus}
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202820]"
            >
              <option value="all">{copy.allApplicationStatuses}</option>
              {['pending', 'approved', 'rejected', 'changes_requested', 'suspended'].map(status => (
                <option key={status} value={status}>
                  {translateAdminStatus(status, copy)}
                </option>
              ))}
            </select>
          </div>
          {rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#737373]">
              {section === 'suppliers' ? copy.noSupplierApplications : copy.noSellerApplications}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF9F6] text-[#737373]">
                  <tr>
                    <th className="px-4 py-3 text-start">{copy.colBusiness}</th>
                    <th className="px-4 py-3 text-start">{copy.colApplicantContact}</th>
                    <th className="px-4 py-3 text-start">{copy.colApplicationStatus}</th>
                    <th className="px-4 py-3 text-start">{copy.colApplicationHistory}</th>
                    <th className="px-4 py-3 text-start">{copy.colReviewAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DF]">
                  {rows
                    .filter(row => {
                      const q = search.trim().toLowerCase();
                      const name = section === 'stores' ? String(row.name_en || row.name_ku || '') : String(row.business_name || '');
                      const status = String(section === 'stores' ? row.application_status || 'pending' : row.status || 'pending');
                      return (
                        (!q || `${name} ${row.id} ${row.owner_id || row.applicant_id || ''} ${row.phone || ''}`.toLowerCase().includes(q)) &&
                        (statusFilter === 'all' || status === statusFilter)
                      );
                    })
                    .map(row => {
                      const status = String(section === 'stores' ? row.application_status || 'pending' : row.status || 'pending');
                      const businessName = section === 'stores' ? row.name_en || row.name_ku : row.business_name;
                      return (
                        <tr key={row.id}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-[#202820]">{String(businessName || copy.unnamedBusiness)}</p>
                            <p className="text-[10px] text-[#737373]">{String(row.address || row.description || '')}</p>
                            <p className="font-mono text-[10px] text-[#737373]">{row.id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p>{String(row.owner_id || row.applicant_id || '—')}</p>
                            <p className="text-[10px] text-[#737373]">{String(row.phone || row.contact_name || '—')}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
                              {translateAdminStatus(status, copy)}
                            </span>
                            {String(row.application_reason || row.decision_reason || '') && (
                              <p className="mt-1 max-w-xs text-[10px] text-[#737373]">
                                {String(row.application_reason || row.decision_reason)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p>
                              {copy.submitted} {formatAdminDate(row.created_at, language)}
                            </p>
                            {row.reviewed_at || row.application_reviewed_at ? (
                              <p className="mt-1 text-[10px] text-[#737373]">
                                {copy.reviewed} {formatAdminDate(row.reviewed_at || row.application_reviewed_at, language)}{' '}
                                {copy.reviewedBy} {String(row.reviewed_by || row.application_reviewed_by || copy.administrator)}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            <div className="min-w-48 space-y-2">
                              <input
                                value={reasons[row.id] || ''}
                                onChange={event => setReasons(current => ({ ...current, [row.id]: event.target.value }))}
                                placeholder={copy.decisionReason}
                                className="w-full rounded-lg border border-[#EAE7DF] px-2 py-1.5"
                              />
                              <div className="flex flex-wrap gap-1">
                                <button
                                  onClick={() => void reviewApplication(row, 'approved')}
                                  className="rounded-lg bg-[#18794E] px-2 py-1.5 font-bold text-white hover:bg-[#135f3d]"
                                >
                                  {copy.approve}
                                </button>
                                <button
                                  onClick={() => void reviewApplication(row, 'rejected')}
                                  className="rounded-lg border border-rose-200 px-2 py-1.5 font-bold text-rose-700 hover:bg-rose-50"
                                >
                                  {copy.reject}
                                </button>
                                <button
                                  onClick={() => void reviewApplication(row, 'changes_requested')}
                                  className="rounded-lg border border-[#EAE7DF] px-2 py-1.5 font-bold hover:bg-[#FAF9F6]"
                                >
                                  {copy.requestChanges}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : section === 'orders' || section === 'rfqs' || section === 'quotations' || section === 'purchase-orders' ? (
        rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#EAE7DF] bg-white p-8 text-center text-xs text-[#737373]">
            No live records yet. Orders, RFQs, quotations, and purchase orders will appear here after users create them in the client application.
          </div>
        ) : (
          <MarketplaceRecordsTable 
            section={section} 
            rows={rows} 
            language={language}
            onUpdateOrderStatus={updateOrderStatus}
            onIssueRefund={issueOrderRefund}
          />
        )
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EAE7DF] bg-white p-8 text-center text-xs text-[#737373]">
          {copy.noRecords}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF9F6] text-[#737373]">
                <tr>
                  <th className="px-4 py-3 text-start">{copy.colRecord}</th>
                  <th className="px-4 py-3 text-start">{copy.colStatus}</th>
                  <th className="px-4 py-3 text-start">Details / Reason</th>
                  <th className="px-4 py-3 text-start">{copy.colCreated}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DF]">
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono text-[11px]">{row.id}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#202820]">
                        {translateAdminStatus(String(row.status ?? row.action ?? row.category ?? ''), copy) || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-[11px] text-[#737373]">
                      {String(row.reason || row.title || row.body || row.notes || '—')}
                    </td>
                    <td className="px-4 py-3 text-[#737373]">{formatAdminDate(row.created_at, language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
