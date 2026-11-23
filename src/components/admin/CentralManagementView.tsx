'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, FileText, Headphones, PackageCheck, ShieldCheck, Users } from 'lucide-react';

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
  [key: string]: unknown;
};

export function CentralManagementView({ section }: CentralManagementViewProps) {
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
      if (!supabase) {
        if (active) {
          setError('Supabase is not configured.');
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
            if (queryError) setError(queryError.message);
            setRows((data || []) as GenericRow[]);
          }
        }
      }
      if (active) setLoading(false);
    };

    void load();
    const tableBySection: Record<string, string> = {
      notifications: 'notifications',
      orders: 'orders',
      rfqs: 'rfqs',
      quotations: 'quotations',
      'purchase-orders': 'purchase_orders',
      support: 'support_requests',
      audit: 'admin_audit_logs',
      users: 'profiles',
      stores: 'sellers',
      suppliers: 'supplier_applications',
    };
    const tables = section === 'users'
      ? ['profiles', 'sellers', 'supplier_applications']
      : section === 'stores'
        ? ['sellers']
        : [tableBySection[section] || (section === 'suppliers' ? 'supplier_applications' : '')].filter(Boolean);
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
  }, [section]);

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
      setError('Enter a reason before suspending an account.');
      return;
    }
    if (!window.confirm(`${accountStatus === 'suspended' ? 'Suspend' : 'Reactivate'} ${profile.full_name || profile.id}?`)) return;
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
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const changeRole = async (profile: ProfileRow) => {
    const role = roleDrafts[profile.id] || profile.role || 'customer';
    const reason = reasons[profile.id] || '';
    if (role === profile.role) return;
    if (!reason.trim()) {
      setError('Enter a reason before changing a role.');
      return;
    }
    if (!window.confirm(`Change this account role from "${profile.role || 'customer'}" to "${role}"? The role field is single-valued.`)) return;
    try {
      await callAction({ action: 'profile_role_change', userId: profile.id, role, reason });
      setProfiles(current => current.map(item => item.id === profile.id ? { ...item, role } : item));
      setReasons(current => ({ ...current, [profile.id]: '' }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Role change failed');
    }
  };

  const reviewApplication = async (row: GenericRow, status: 'approved' | 'rejected' | 'changes_requested') => {
    const reason = reasons[row.id] || '';
    if (status !== 'approved' && !reason.trim()) {
      setError('A reason is required to reject or request changes.');
      return;
    }
    if (!window.confirm(`${status === 'approved' ? 'Approve' : status === 'rejected' ? 'Reject' : 'Request changes for'} this application?`)) return;
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
      setError(err instanceof Error ? err.message : 'Application decision failed');
    }
  };

  const title: Record<Section, string> = {
    users: 'User Management',
    stores: 'Seller & Store Applications',
    suppliers: 'Suppliers & Business Accounts',
    notifications: 'Notifications',
    orders: 'B2C Orders',
    rfqs: 'B2B RFQs',
    quotations: 'Supplier Quotations',
    'purchase-orders': 'B2B Purchase Orders',
    support: 'Support & Dispute Oversight',
    audit: 'Administrator Audit Log',
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
          <p className="text-xs text-[#737373]">Live platform records and authorized administrative actions.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#EAE7DF] bg-white p-6 text-xs text-[#737373]">Loading records...</div>
      ) : section === 'users' ? (
        <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#EAE7DF] p-3 sm:flex-row">
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, ID, role, or business"
              className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs" />
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter users by status"
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs">
              <option value="all">All account statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} aria-label="Filter users by role"
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs">
              <option value="all">All roles</option>
              {['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin', 'super_admin', 'superadmin'].map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          {profiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#737373]">No user profiles are visible to this administrator.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF9F6] text-[#737373]">
                  <tr>
                    <th className="px-4 py-3 text-start">User</th>
                    <th className="px-4 py-3 text-start">Role</th>
                    <th className="px-4 py-3 text-start">Status</th>
                    <th className="px-4 py-3 text-start">Associated businesses</th>
                    <th className="px-4 py-3 text-start">Action</th>
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
                        <p className="font-bold text-[#171717]">{profile.full_name || 'Unnamed profile'}</p>
                        <p className="text-[10px] text-[#737373]">{profile.id}</p>
                      </td>
                      <td className="px-4 py-3">{profile.role || 'customer'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${(profile.account_status || 'active') === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {profile.account_status || 'active'}
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-[11px] text-[#737373]">{profile.businesses || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="min-w-48 space-y-2">
                          <input value={reasons[profile.id] || ''} onChange={event => setReasons(current => ({ ...current, [profile.id]: event.target.value }))}
                            placeholder="Reason required" className="w-full rounded-lg border border-[#EAE7DF] px-2 py-1.5" />
                          <div className="flex gap-1">
                            {canManageRoles && (
                              <>
                                <select value={roleDrafts[profile.id] ?? profile.role ?? 'customer'} onChange={event => setRoleDrafts(current => ({ ...current, [profile.id]: event.target.value }))}
                                  className="min-w-28 rounded-lg border border-[#EAE7DF] bg-white px-2 py-1.5">
                                  {profile.role && !['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin'].includes(profile.role)
                                    && <option value={profile.role}>{profile.role}</option>}
                                  {['customer', 'seller', 'supplier', 'retailer', 'business_buyer', 'b2b_retailer', 'admin'].map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <button onClick={() => void changeRole(profile)} className="rounded-lg bg-[#657A52] px-2 py-1.5 font-bold text-white">Save role</button>
                              </>
                            )}
                            <button onClick={() => void suspendUser(profile)} className="rounded-lg border border-[#EAE7DF] px-2 py-1.5 font-bold hover:bg-[#FAF9F6]">
                              {profile.account_status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                          </div>
                          {!canManageRoles && <p className="text-[10px] text-[#737373]">Role changes require Super Admin permissions.</p>}
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
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search business, applicant, or ID"
              className="min-w-0 flex-1 rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs" />
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} aria-label="Filter applications by status"
              className="rounded-xl border border-[#EAE7DF] bg-[#FAF9F6] px-3 py-2 text-xs">
              <option value="all">All application statuses</option>
              {['pending', 'approved', 'rejected', 'changes_requested', 'suspended'].map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          {rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#737373]">No applications found. Supplier submissions require the updated client application and database migration.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#FAF9F6] text-[#737373]">
                  <tr>
                    <th className="px-4 py-3 text-start">Business</th>
                    <th className="px-4 py-3 text-start">Applicant / Contact</th>
                    <th className="px-4 py-3 text-start">Application status</th>
                    <th className="px-4 py-3 text-start">Application history</th>
                    <th className="px-4 py-3 text-start">Review action</th>
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
                          <p className="font-bold text-[#171717]">{String(businessName || 'Unnamed business')}</p>
                          <p className="text-[10px] text-[#737373]">{String(row.address || row.description || '')}</p>
                          <p className="font-mono text-[10px] text-[#737373]">{row.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p>{String(row.owner_id || row.applicant_id || '—')}</p>
                          <p className="text-[10px] text-[#737373]">{String(row.phone || row.contact_name || '—')}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">{status}</span>
                          {String(row.application_reason || row.decision_reason || '') && (
                            <p className="mt-1 max-w-xs text-[10px] text-[#737373]">{String(row.application_reason || row.decision_reason)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p>Submitted: {String(row.created_at || '—')}</p>
                          {row.reviewed_at || row.application_reviewed_at ? (
                            <p className="mt-1 text-[10px] text-[#737373]">
                              Reviewed: {String(row.reviewed_at || row.application_reviewed_at)}
                              {' by '}{String(row.reviewed_by || row.application_reviewed_by || 'administrator')}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-48 space-y-2">
                            <input value={reasons[row.id] || ''} onChange={event => setReasons(current => ({ ...current, [row.id]: event.target.value }))}
                              placeholder="Decision reason" className="w-full rounded-lg border border-[#EAE7DF] px-2 py-1.5" />
                            <div className="flex flex-wrap gap-1">
                              <button onClick={() => void reviewApplication(row, 'approved')} className="rounded-lg bg-[#657A52] px-2 py-1.5 font-bold text-white">Approve</button>
                              <button onClick={() => void reviewApplication(row, 'rejected')} className="rounded-lg border border-rose-200 px-2 py-1.5 font-bold text-rose-700">Reject</button>
                              <button onClick={() => void reviewApplication(row, 'changes_requested')} className="rounded-lg border border-[#EAE7DF] px-2 py-1.5 font-bold">Request changes</button>
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
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EAE7DF] bg-white p-8 text-center text-xs text-[#737373]">
          No records are available yet. Apply the central-management Supabase migration to create this section’s tables.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#EAE7DF] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#FAF9F6] text-[#737373]">
                <tr>
                  <th className="px-4 py-3 text-start">Record</th>
                  <th className="px-4 py-3 text-start">Status</th>
                  <th className="px-4 py-3 text-start">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7DF]">
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono">{row.id}</td>
                    <td className="px-4 py-3">{String(row.status ?? row.category ?? '—')}</td>
                    <td className="px-4 py-3">{String(row.created_at ?? '—')}</td>
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
