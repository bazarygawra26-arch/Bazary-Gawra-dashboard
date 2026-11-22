import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type AdminContext = {
  client: SupabaseClient;
  userId: string;
  role: 'admin' | 'super_admin';
};

async function authorizeAdmin(req: NextRequest): Promise<AdminContext | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!url || !anonKey || !token) return null;

  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth, error: authError } = await client.auth.getUser(token);
  if (authError || !auth?.user) return null;

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .maybeSingle();
  const role = String(profile?.role || '').toLowerCase();
  if (role === 'super_admin' || role === 'superadmin') {
    return { client, userId: auth.user.id, role: 'super_admin' };
  }
  if (role === 'admin') {
    return { client, userId: auth.user.id, role: 'admin' };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const admin = await authorizeAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    action?: string;
    sellerId?: string;
    status?: 'verified' | 'pending' | 'unverified' | 'suspended';
    reason?: string;
    userId?: string;
    accountStatus?: 'active' | 'suspended';
  };

  if (!body.action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

  if (body.action === 'seller_verification') {
    if (!body.sellerId || !body.status) {
      return NextResponse.json({ error: 'Seller and status are required' }, { status: 400 });
    }
    const { data: before } = await admin.client.from('sellers').select('*').eq('id', body.sellerId).single();
    const { error } = await admin.client
      .from('sellers')
      .update({
        verification_status: body.status,
        is_active: body.status !== 'suspended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.sellerId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.client.from('admin_audit_logs').insert({
      admin_id: admin.userId,
      action: `seller_${body.status}`,
      affected_table: 'sellers',
      affected_record_id: body.sellerId,
      before_data: before,
      after_data: { verification_status: body.status, is_active: body.status !== 'suspended' },
      reason: body.reason || null,
    });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'account_status') {
    if (!body.userId || !body.accountStatus) {
      return NextResponse.json({ error: 'User and account status are required' }, { status: 400 });
    }
    if (body.userId === admin.userId) {
      return NextResponse.json({ error: 'Administrators cannot suspend their own account' }, { status: 403 });
    }
    const { data: before } = await admin.client.from('profiles').select('*').eq('id', body.userId).single();
    const update = {
      account_status: body.accountStatus,
      suspended_reason: body.accountStatus === 'suspended' ? (body.reason || null) : null,
      suspended_at: body.accountStatus === 'suspended' ? new Date().toISOString() : null,
      suspended_by: body.accountStatus === 'suspended' ? admin.userId : null,
    };
    const { error } = await admin.client.from('profiles').update(update).eq('id', body.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.client.from('admin_audit_logs').insert({
      admin_id: admin.userId,
      action: `account_${body.accountStatus}`,
      affected_table: 'profiles',
      affected_record_id: body.userId,
      before_data: before,
      after_data: update,
      reason: body.reason || null,
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
