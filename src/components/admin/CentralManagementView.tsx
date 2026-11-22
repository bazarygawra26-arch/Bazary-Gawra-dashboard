'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, FileText, Headphones, PackageCheck, ShieldCheck, Users } from 'lucide-react';

type Section = 'users' | 'suppliers' | 'notifications' | 'orders' | 'rfqs' | 'quotations' | 'purchase-orders' | 'support' | 'audit';

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
  const [reason, setReason] = useState('');

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
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('id, role, full_name, account_status, suspended_reason, suspended_at')
          .order('id')
          .limit(500);
        if (queryError) setError(queryError.message);
        setProfiles((data || []) as ProfileRow[]);
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
        if (section === 'suppliers') {
          const { data, error: queryError } = await supabase
            .from('sellers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);
          if (queryError) setError(queryError.message);
          setRows((data || []) as GenericRow[]);
        } else
        {
        const table = tableBySection[section];
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
      suppliers: 'sellers',
    };
    const table = tableBySection[section];
    const channel = supabase
      ? supabase.channel(`admin-${section}-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => { void load(); })
        .subscribe()
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
    try {
      await callAction({
        action: 'account_status',
        userId: profile.id,
        accountStatus: profile.account_status === 'suspended' ? 'active' : 'suspended',
        reason,
      });
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const title: Record<Section, string> = {
    users: 'User Management',
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
                    <th className="px-4 py-3 text-start">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DF]">
                  {profiles.map(profile => (
                    <tr key={profile.id}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-[#171717]">{profile.full_name || 'Unnamed profile'}</p>
                        <p className="text-[10px] text-[#737373]">{profile.id}</p>
                      </td>
                      <td className="px-4 py-3">{profile.role || 'customer'}</td>
                      <td className="px-4 py-3">{profile.account_status || 'active'}</td>
                      <td className="px-4 py-3">
                        <input
                          value={reason}
                          onChange={event => setReason(event.target.value)}
                          placeholder="Reason"
                          className="mb-2 block w-40 rounded-lg border border-[#EAE7DF] px-2 py-1"
                        />
                        <button
                          onClick={() => void suspendUser(profile)}
                          className="rounded-lg border border-[#EAE7DF] px-3 py-1.5 font-bold hover:bg-[#FAF9F6]"
                        >
                          {profile.account_status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
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
