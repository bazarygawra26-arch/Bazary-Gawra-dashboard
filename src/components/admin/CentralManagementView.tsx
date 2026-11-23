'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, FileText, Headphones, PackageCheck, ShieldCheck, Users } from 'lucide-react';
import { useAdmin } from '@/lib/store';
import { adminPanelTranslations, translateAdminRole, translateAdminStatus } from '@/lib/adminPanelTranslations';

type Section = 'users' | 'stores' | 'suppliers' | 'notifications' | 'orders' | 'rfqs' | 'quotations' | 'purchase-orders' | 'support' | 'audit';

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

const displayValue = (value: unknown) => value === null || value === undefined || value === '' ? '—' : String(value);
const displayAmount = (value: unknown, currency: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  return `${Number.isFinite(amount) ? amount.toLocaleString() : String(value)} ${displayValue(currency)}`;
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
}: {
  section: 'orders' | 'rfqs' | 'quotations' | 'purchase-orders';
  rows: GenericRow[];
  language: 'ku' | 'ar' | 'en';
}) {
  const copy = adminPanelTranslations[language];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const columns = section === 'orders'
    ? [
      { key: 'id', label: copy.colOrderId },
      { key: 'customer_display', label: copy.colCustomer },
      { key: 'seller_display', label: copy.colSeller },
      { key: 'total_amount', label: copy.colTotal },
      { key: 'payment_status', label: copy.colPayment },
      { key: 'status', label: copy.colOrderStatus },
      { key: 'created_at', label: copy.colCreated },
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
  const cellContent = (row: GenericRow, key: string) => {
    if (key === 'items') return <ItemsList items={row.items} emptyLabel={copy.noItemDetails} />;
    if (key === 'total_amount' || key === 'unit_price') return displayAmount(row[key], row.currency);
    if (key === 'id' || key === 'rfq_id' || key === 'quotation_id') {
      return <code className="break-all font-mono text-[10px]">{displayValue(row[key])}</code>;
    }
    if (key === 'status' || key === 'payment_status') {
      return (
        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
          {translateAdminStatus(String(row[key] || ''), copy)}
        </span>
      );
    }
    if (key === 'created_at' || key === 'valid_until') {
      return formatAdminDate(row[key], language);
    }
    return displayValue(row[key]);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
      <div className="flex flex-col gap-2 border-b border-[#EAE7DF] p-3 sm:flex-row">
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder={copy.searchRecords}
          className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
        />
        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          aria-label={copy.filterByStatus}
          className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs"
        >
          <option value="all">{copy.allStatuses}</option>
          {statuses.map(status => <option key={status} value={status}>{translateAdminStatus(status, copy)}</option>)}
        </select>
      </div>
      {visibleRows.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#737373]">{copy.noMatchingRecords}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#FAF9F6] text-[#737373]">
              <tr>
                {columns.map(column => <th key={column.key} className="px-4 py-3 text-start">{column.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DF]">
              {visibleRows.map(row => (
                <tr key={row.id} className="align-top">
                  {columns.map(column => (
                    <td key={column.key} className="max-w-xs px-4 py-3 text-[#171717]">
                      {cellContent(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function CentralManagementView({ section }: CentralManagementViewProps) {
  const { language } = useAdmin();
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
            .from('profiles').select('role').eq('id', currentAuth.user.id).maybeSingle();
          setCanManageRoles(['super_admin', 'superadmin'].includes(String(currentProfile?.role || '').toLowerCase()));
        }
        const [profileResult, sellerResult, supplierResult] = await Promise.all([
          supabase.from('profiles')
            .select('id, role, full_name, account_status, suspended_reason, suspended_at')
            .order('id').limit(500),
          supabase.from('sellers').select('owner_id, name_en, application_status'),
          supabase.from('supplier_applications').select('applicant_id, business_name, status'),
        ]);
        const queryErrors = [profileResult.error, sellerResult.error, supplierResult.error]
          .filter((queryError): queryError is NonNullable<typeof queryError> => Boolean(queryError));
        if (queryErrors.length) setError(queryErrors.map(queryError => queryError.message).join(' '));
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
        setProfiles((profileResult.data || []).map(profile => ({
          ...profile,
          businesses: (businessMap.get(profile.id) || []).join(' · ') || '—',
        })) as ProfileRow[]);
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
            .select('id, owner_id, name_en, name_ku, phone, address, verification_status, application_status, application_reason, application_reviewed_at, application_reviewed_by, is_active, created_at')
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
              const itemConfig = section === 'orders'
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
                const partyIds = [...new Set(records.flatMap(record =>
                  ['customer_id', 'seller_id', 'retailer_id', 'supplier_id']
                    .map(key => record[key])
                    .filter((id): id is string => typeof id === 'string' && id.length > 0)
                ))];
                const partyLabels = new Map<string, string>();
                if (partyIds.length > 0) {
                  const [profileResult, sellerResult, supplierResult] = await Promise.all([
                    supabase.from('profiles').select('id, full_name').in('id', partyIds),
                    supabase.from('sellers').select('id, owner_id, name_en').limit(500),
                    supabase.from('supplier_applications').select('id, applicant_id, business_name').limit(500),
                  ]);
                  if (profileResult.error || sellerResult.error || supplierResult.error) {
                    const lookupErrors = [profileResult.error, sellerResult.error, supplierResult.error]
                      .filter((lookupError): lookupError is NonNullable<typeof lookupError> => Boolean(lookupError))
                      .map(lookupError => lookupError.message);
                    setError(current => [current, ...lookupErrors].filter(Boolean).join(' '));
                  }
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
                  return name ? `${name} (${id})` : id;
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
    const tablesBySection: Partial<Record<Section, string[]>> = {
      notifications: ['notifications'],
      orders: ['orders', 'order_items', 'order_status_history'],
      rfqs: ['rfqs', 'rfq_items'],
      quotations: ['quotations'],
      'purchase-orders': ['purchase_orders', 'purchase_order_items'],
      support: ['support_requests'],
      audit: ['admin_audit_logs'],
      users: ['profiles', 'sellers', 'supplier_applications'],
      stores: ['sellers'],
      suppliers: ['supplier_applications'],
    };
    const tables = section === 'users'
      ? ['profiles', 'sellers', 'supplier_applications']
      : section === 'stores'
        ? ['sellers']
        : tablesBySection[section] || [];
    const channel = supabase
      ? tables.reduce(
        (current, table) => current.on('postgres_changes', { event: '*', schema: 'public', table }, () => { void load(); }),
        supabase.channel(`admin-${section}-${Date.now()}`)
      ).subscribe()
      : null;

    return () => {
      active = false;
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, [section, copy.supabaseNotConfigured]);

  const callAction = async (body: Record<string, unknown>) => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const response = await fetch('/api/admin/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const result = await response.json() as { error?: string };
      throw new Error(result.error || 'Action failed');
    }
  };

  const suspendUser = async (profile: ProfileRow) => {
    if (!profile.id) return;
    const accountStatus = profile.account_status === 'suspended' ? 'active' : 'suspended';
    const reason = reasons[profile.id] || '';
    if (accountStatus === 'suspended' && !reason.trim()) {
      setError(copy.enterSuspensionReason);
      return;
    }
    const confirmation = accountStatus === 'suspended'
      ? fillTemplate(copy.confirmSuspend, { name: profile.full_name || profile.id })
      : fillTemplate(copy.confirmReactivate, { name: profile.full_name || profile.id });
    if (!window.confirm(confirmation)) return;
    try {
      await callAction({
        action: 'account_status',
        userId: profile.id,
        accountStatus,
        reason,
      });
      setProfiles(current => current.map(item => item.id === profile.id ? { ...item, account_status: accountStatus } : item));
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
      setProfiles(current => current.map(item => item.id === profile.id ? { ...item, role } : item));
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
    const confirmation = status === 'approved'
      ? copy.confirmApprove
      : status === 'rejected'
        ? copy.confirmReject
        : copy.confirmRequestChanges;
    if (!window.confirm(confirmation)) return;
    const actionBody = section === 'stores'
      ? { action: 'seller_application_review', sellerId: row.id, status, reason }
      : { action: 'supplier_application_review', applicationId: row.id, status, reason };
    try {
      await callAction(actionBody);
      setRows(current => current.map(item => item.id === row.id ? {
        ...item,
        ...(section === 'stores' ? { application_status: status, application_reason: reason } : { status, decision_reason: reason }),
      } : item));
      setReasons(current => ({ ...current, [row.id]: '' }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.applicationDecisionFailed);
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
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#657A52]/10 text-[#657A52]">{icon[section]}</div>
        <div>
          <h1 className="text-xl font-extrabold text-[#171717]">{title[section]}</h1>
          <p className="text-xs text-[#737373]">
            {section === 'suppliers'
              ? copy.suppliersSubtitle
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
      ) : section === 'users' ? (
        <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#EAE7DF] p-3 sm:flex-row">
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.searchUsers}
              className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs" />
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label={copy.filterByStatus}
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs">
              <option value="all">{copy.allAccountStatuses}</option>
              <option value="active">{copy.statusActive}</option>
              <option value="suspended">{copy.statusSuspended}</option>
            </select>
            <select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} aria-label={copy.filterByRole}
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs">
              <option value="all">{copy.allRoles}</option>
              {['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin', 'super_admin', 'superadmin'].map(role => (
                <option key={role} value={role}>{translateAdminRole(role, copy)}</option>
              ))}
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
                  {profiles.filter(profile => {
                    const q = search.trim().toLowerCase();
                    const matchesSearch = !q || `${profile.full_name || ''} ${profile.id} ${profile.role || ''} ${profile.businesses || ''}`.toLowerCase().includes(q);
                    return matchesSearch
                      && (statusFilter === 'all' || (profile.account_status || 'active') === statusFilter)
                      && (roleFilter === 'all' || (profile.role || 'customer').toLowerCase() === roleFilter);
                  }).map(profile => (
                    <tr key={profile.id}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#171717]">{profile.full_name || copy.unnamedProfile}</p>
                        <p className="text-[10px] text-[#737373]">{profile.id}</p>
                      </td>
                      <td className="px-4 py-3">{translateAdminRole(profile.role || 'customer', copy)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${(profile.account_status || 'active') === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {translateAdminStatus(profile.account_status || 'active', copy)}
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-[11px] text-[#737373]">{profile.businesses || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="min-w-48 space-y-2">
                          <input value={reasons[profile.id] || ''} onChange={event => setReasons(current => ({ ...current, [profile.id]: event.target.value }))}
                            placeholder={copy.reasonRequired} className="w-full rounded-lg border border-[#EAE7DF] px-2 py-1.5" />
                          <div className="flex gap-1">
                            {canManageRoles && (
                              <>
                                <select value={roleDrafts[profile.id] ?? profile.role ?? 'customer'} onChange={event => setRoleDrafts(current => ({ ...current, [profile.id]: event.target.value }))}
                                  className="min-w-28 rounded-lg border border-[#EAE7DF] bg-white px-2 py-1.5">
                                  {profile.role && !['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin'].includes(profile.role)
                                    && <option value={profile.role}>{translateAdminRole(profile.role, copy)}</option>}
                                  {['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin'].map(role => (
                                    <option key={role} value={role}>{translateAdminRole(role, copy)}</option>
                                  ))}
                                </select>
                                <button onClick={() => void changeRole(profile)} className="rounded-lg bg-[#657A52] px-2 py-1.5 font-bold text-white">{copy.saveRole}</button>
                              </>
                            )}
                            <button onClick={() => void suspendUser(profile)} className="rounded-lg border border-[#EAE7DF] px-2 py-1.5 font-bold hover:bg-[#FAF9F6]">
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
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder={copy.searchApplications}
              className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs" />
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label={copy.filterByStatus}
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs">
              <option value="all">{copy.allApplicationStatuses}</option>
              {['pending', 'approved', 'rejected', 'changes_requested', 'suspended'].map(status => (
                <option key={status} value={status}>{translateAdminStatus(status, copy)}</option>
              ))}
            </select>
          </div>
          {rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#737373]">
              {section === 'suppliers'
                  ? copy.noSupplierApplications
                  : copy.noSellerApplications}
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
                  {rows.filter(row => {
                    const q = search.trim().toLowerCase();
                    const name = section === 'stores' ? String(row.name_en || row.name_ku || '') : String(row.business_name || '');
                    const status = String(section === 'stores' ? row.application_status || 'pending' : row.status || 'pending');
                    return (!q || `${name} ${row.id} ${row.owner_id || row.applicant_id || ''} ${row.phone || ''}`.toLowerCase().includes(q))
                      && (statusFilter === 'all' || status === statusFilter);
                  }).map(row => {
                    const status = String(section === 'stores' ? row.application_status || 'pending' : row.status || 'pending');
                    const businessName = section === 'stores' ? row.name_en || row.name_ku : row.business_name;
                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#171717]">{String(businessName || copy.unnamedBusiness)}</p>
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
                            <p className="mt-1 max-w-xs text-[10px] text-[#737373]">{String(row.application_reason || row.decision_reason)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p>{copy.submitted} {formatAdminDate(row.created_at, language)}</p>
                          {row.reviewed_at || row.application_reviewed_at ? (
                            <p className="mt-1 text-[10px] text-[#737373]">
                              {copy.reviewed} {formatAdminDate(row.reviewed_at || row.application_reviewed_at, language)}
                              {' '}{copy.reviewedBy} {String(row.reviewed_by || row.application_reviewed_by || copy.administrator)}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-48 space-y-2">
                            <input value={reasons[row.id] || ''} onChange={event => setReasons(current => ({ ...current, [row.id]: event.target.value }))}
                              placeholder={copy.decisionReason} className="w-full rounded-lg border border-[#EAE7DF] px-2 py-1.5" />
                            <div className="flex flex-wrap gap-1">
                              <button onClick={() => void reviewApplication(row, 'approved')} className="rounded-lg bg-[#657A52] px-2 py-1.5 font-bold text-white">{copy.approve}</button>
                              <button onClick={() => void reviewApplication(row, 'rejected')} className="rounded-lg border border-rose-200 px-2 py-1.5 font-bold text-rose-700">{copy.reject}</button>
                              <button onClick={() => void reviewApplication(row, 'changes_requested')} className="rounded-lg border border-[#EAE7DF] px-2 py-1.5 font-bold">{copy.requestChanges}</button>
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
          <MarketplaceRecordsTable section={section} rows={rows} language={language} />
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
                  <th className="px-4 py-3 text-start">{copy.colCreated}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DF]">
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono">{row.id}</td>
                    <td className="px-4 py-3">{translateAdminStatus(String(row.status ?? row.category ?? ''), copy) || '—'}</td>
                    <td className="px-4 py-3">{formatAdminDate(row.created_at, language)}</td>
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
