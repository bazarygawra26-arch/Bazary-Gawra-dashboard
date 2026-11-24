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

  const body = (await req.json()) as {
    action?: string;
    sellerId?: string;
    status?: string;
    reason?: string;
    userId?: string;
    accountStatus?: 'active' | 'suspended';
    role?: string;
    applicationId?: string;
    orderId?: string;
    refundAmount?: number;
    plan?: string;
    productId?: string;
    durationDays?: number;
    categoryData?: { id?: string; name_en: string; name_ku: string; name_ar: string; slug: string; icon?: string; is_active?: boolean };
    locationData?: { id?: string; name_en: string; name_ku: string; name_ar: string; slug: string; governorate?: string; bazaars?: string[] };
    glossaryData?: { id?: string; term_ku: string; term_ar: string; term_en: string; category?: string; status?: string; notes?: string };
  };

  if (!body.action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

  // 1. Seller Verification
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

  // 2. Seller Application Review
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

  // 3. Supplier Application Review
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

  // 4. User Role Change (Super Admin Only)
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

  // 5. User Account Status Change
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

  // 6. Order Status Transition with Audit
  if (body.action === 'order_status') {
    if (!body.orderId || !body.status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }
    const { error } = await admin.client.rpc('admin_update_order_status', {
      p_order_id: body.orderId,
      p_status: body.status,
      p_reason: body.reason || 'Status updated via admin console',
    });
    if (error) {
      // Direct update fallback if RPC is not present
      const { error: directErr } = await admin.client
        .from('orders')
        .update({ status: body.status, updated_at: new Date().toISOString() })
        .eq('id', body.orderId);
      if (directErr) return NextResponse.json({ error: directErr.message }, { status: 400 });

      // Record audit log
      await admin.client.from('admin_audit_logs').insert({
        admin_id: admin.userId,
        action: 'order_status_updated',
        affected_table: 'orders',
        affected_record_id: body.orderId,
        after_data: { status: body.status },
        reason: body.reason || 'Status updated via admin console',
      });
    }
    return NextResponse.json({ success: true });
  }

  // 7. Order Refund Management
  if (body.action === 'order_refund') {
    if (!body.orderId || !body.reason) {
      return NextResponse.json({ error: 'Order ID and refund reason are required' }, { status: 400 });
    }
    const { data: orderData } = await admin.client
      .from('orders')
      .select('total_amount, currency, customer_id')
      .eq('id', body.orderId)
      .maybeSingle();

    const refundAmount = body.refundAmount || orderData?.total_amount || 0;

    // Update order status
    await admin.client.from('orders').update({
      status: 'refunded',
      payment_status: 'refunded',
      updated_at: new Date().toISOString(),
    }).eq('id', body.orderId);

    // Record refund payment entry
    await admin.client.from('payments').insert({
      reference_type: 'refund',
      reference_id: body.orderId,
      payer_id: orderData?.customer_id || null,
      amount: refundAmount,
      currency: orderData?.currency || 'IQD',
      status: 'completed',
      payment_method: 'fastpay',
      is_demo: false,
      notes: `Admin refund: ${body.reason}`,
    });

    // Audit log
    await admin.client.from('admin_audit_logs').insert({
      admin_id: admin.userId,
      action: 'order_refund_issued',
      affected_table: 'orders',
      affected_record_id: body.orderId,
      after_data: { status: 'refunded', refund_amount: refundAmount },
      reason: body.reason,
    });

    return NextResponse.json({ success: true, refundAmount });
  }

  // 8. Subscription Management (Free Starter / Pro Merchant)
  if (body.action === 'subscription_manage') {
    if (!body.sellerId || !body.plan) {
      return NextResponse.json({ error: 'Seller and subscription plan are required' }, { status: 400 });
    }
    const plan = body.plan === 'pro_merchant' ? 'pro_merchant' : 'free_starter';
    const status = body.status || 'active';

    const { data, error } = await admin.client.rpc('admin_manage_merchant_subscription', {
      p_seller_id: body.sellerId,
      p_plan: plan,
      p_status: status,
      p_reason: body.reason || 'Subscription updated by Super Admin',
    });

    if (error) {
      // Fallback direct upsert
      const limit = plan === 'pro_merchant' ? 50 : 5;
      const price = plan === 'pro_merchant' ? 10000 : 0;
      const periodEnd = plan === 'pro_merchant' ? new Date(Date.now() + 30 * 86400000).toISOString() : null;

      const { data: insData, error: insErr } = await admin.client.from('subscriptions').insert({
        seller_id: body.sellerId,
        plan,
        status,
        listing_limit: limit,
        monthly_price_iqd: price,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        notes: body.reason || null,
      }).select('id').single();

      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

      if (plan === 'pro_merchant' && status === 'active' && insData?.id) {
        await admin.client.from('payments').insert({
          reference_type: 'subscription',
          reference_id: insData.id,
          amount: 10000,
          currency: 'IQD',
          status: 'completed',
          payment_method: 'fastpay',
          is_demo: false,
          platform_fee: 10000,
          notes: `Pro Merchant subscription for seller ${body.sellerId}`,
        });
      }

      await admin.client.from('admin_audit_logs').insert({
        admin_id: admin.userId,
        action: 'merchant_subscription_updated',
        affected_table: 'subscriptions',
        affected_record_id: insData?.id || body.sellerId,
        after_data: { seller_id: body.sellerId, plan, status },
        reason: body.reason || 'Subscription updated',
      });
    }

    return NextResponse.json({ success: true });
  }

  // 9. Sponsored Listing Promotion Management
  if (body.action === 'promotion_manage') {
    if (!body.productId || !body.sellerId) {
      return NextResponse.json({ error: 'Product ID and Seller ID are required' }, { status: 400 });
    }
    const duration = body.durationDays || 7;
    const endDate = new Date(Date.now() + duration * 86400000).toISOString();

    const { data: promo, error: promoErr } = await admin.client.from('promotions').insert({
      product_id: body.productId,
      seller_id: body.sellerId,
      type: 'sponsored_listing',
      status: 'active',
      price_iqd: 5000,
      duration_days: duration,
      start_date: new Date().toISOString(),
      end_date: endDate,
    }).select('id').single();

    if (promoErr) return NextResponse.json({ error: promoErr.message }, { status: 400 });

    // Mark product as sponsored
    await admin.client.from('products').update({
      specs: { is_sponsored: true, is_promoted: true, promotion_expires_at: endDate },
    }).eq('id', body.productId);

    // Record financial transaction for sponsored listing
    if (promo?.id) {
      await admin.client.from('payments').insert({
        reference_type: 'promotion',
        reference_id: promo.id,
        amount: 5000,
        currency: 'IQD',
        status: 'completed',
        payment_method: 'fastpay',
        is_demo: false,
        platform_fee: 5000,
        notes: `Sponsored Listing for product ${body.productId}`,
      });
    }

    await admin.client.from('admin_audit_logs').insert({
      admin_id: admin.userId,
      action: 'product_promotion_activated',
      affected_table: 'promotions',
      affected_record_id: promo?.id || body.productId,
      after_data: { product_id: body.productId, end_date: endDate, price_iqd: 5000 },
      reason: body.reason || 'Sponsored promotion activated',
    });

    return NextResponse.json({ success: true, expiresAt: endDate });
  }

  // 10. Category Management (Create, Edit, Toggle)
  if (body.action === 'category_manage') {
    if (!body.categoryData?.name_en || !body.categoryData?.slug) {
      return NextResponse.json({ error: 'Category name and slug are required' }, { status: 400 });
    }
    const cat = body.categoryData;
    let res;
    if (cat.id) {
      res = await admin.client.from('categories').update({
        name_en: cat.name_en,
        name_ku: cat.name_ku || cat.name_en,
        name_ar: cat.name_ar || cat.name_en,
        slug: cat.slug,
        is_active: cat.is_active ?? true,
      }).eq('id', cat.id);
    } else {
      res = await admin.client.from('categories').insert({
        name_en: cat.name_en,
        name_ku: cat.name_ku || cat.name_en,
        name_ar: cat.name_ar || cat.name_en,
        slug: cat.slug,
        is_active: cat.is_active ?? true,
      });
    }
    if (res.error) return NextResponse.json({ error: res.error.message }, { status: 400 });

    await admin.client.from('admin_audit_logs').insert({
      admin_id: admin.userId,
      action: cat.id ? 'category_updated' : 'category_created',
      affected_table: 'categories',
      affected_record_id: cat.id || cat.slug,
      after_data: cat,
      reason: body.reason || 'Category catalog update',
    });

    return NextResponse.json({ success: true });
  }

  // 11. Glossary Management
  if (body.action === 'glossary_manage') {
    if (!body.glossaryData?.term_ku || !body.glossaryData?.term_en) {
      return NextResponse.json({ error: 'Kurdish and English terms are required' }, { status: 400 });
    }
    const g = body.glossaryData;
    let gRes;
    if (g.id) {
      gRes = await admin.client.from('marketplace_glossary').update({
        term_ku: g.term_ku,
        term_ar: g.term_ar,
        term_en: g.term_en,
        category: g.category || 'General',
        status: g.status || 'approved',
        notes: g.notes,
        updated_at: new Date().toISOString(),
      }).eq('id', g.id);
    } else {
      gRes = await admin.client.from('marketplace_glossary').upsert({
        term_ku: g.term_ku,
        term_ar: g.term_ar,
        term_en: g.term_en,
        category: g.category || 'General',
        status: g.status || 'approved',
        notes: g.notes,
      }, { onConflict: 'term_ku' });
    }
    if (gRes.error) return NextResponse.json({ error: gRes.error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
