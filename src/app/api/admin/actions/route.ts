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
    .select('role, account_status')
    .eq('id', auth.user.id)
    .maybeSingle();
  const role = String(profile?.role || '').toLowerCase();
  if (profile?.account_status && profile.account_status !== 'active') return null;
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
    status?: string;
    reason?: string;
    userId?: string;
    accountStatus?: 'active' | 'suspended';
    role?: string;
    applicationId?: string;
  };

  if (!body.action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

  if (body.action === 'seller_verification') {
    if (!body.sellerId || !body.status) {
      return NextResponse.json({ error: 'Seller and status are required' }, { status: 400 });
    }
    if (!['verified', 'pending', 'unverified', 'suspended'].includes(body.status)) {
      return NextResponse.json({ error: 'Unsupported verification status' }, { status: 400 });
    }
    const { error } = await admin.client.rpc('admin_update_seller_verification', {
      p_seller_id: body.sellerId,
      p_status: body.status,
      p_reason: body.reason || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'seller_application_review') {
    if (!body.sellerId || !body.status) {
      return NextResponse.json({ error: 'Seller application and decision are required' }, { status: 400 });
    }
    const { error } = await admin.client.rpc('admin_review_seller_application', {
      p_seller_id: body.sellerId,
      p_status: body.status,
      p_reason: body.reason || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'supplier_application_review') {
    if (!body.applicationId || !body.status) {
      return NextResponse.json({ error: 'Supplier application and decision are required' }, { status: 400 });
    }
    const { error } = await admin.client.rpc('admin_review_supplier_application', {
      p_application_id: body.applicationId,
      p_status: body.status,
      p_reason: body.reason || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'profile_role_change') {
    if (admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only a Super Admin may change user roles' }, { status: 403 });
    }
    if (!body.userId || !body.role || !body.reason) {
      return NextResponse.json({ error: 'User, role, and reason are required' }, { status: 400 });
    }
    const { error } = await admin.client.rpc('admin_change_profile_role', {
      p_user_id: body.userId,
      p_role: body.role,
      p_reason: body.reason,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'account_status') {
    if (!body.userId || !body.accountStatus) {
      return NextResponse.json({ error: 'User and account status are required' }, { status: 400 });
    }
    if (body.userId === admin.userId) {
      return NextResponse.json({ error: 'Administrators cannot suspend their own account' }, { status: 403 });
    }
    const { error } = await admin.client.rpc('admin_set_account_status', {
      p_user_id: body.userId,
      p_status: body.accountStatus,
      p_reason: body.reason || null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
