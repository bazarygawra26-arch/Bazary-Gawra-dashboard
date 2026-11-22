import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getAuthorizedAdmin(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = req.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!url || !anonKey || !token) return null;

  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await client.auth.getUser(token);
  if (authError || !authData.user) return null;

  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle();
  const role = String(profile?.role || '').toLowerCase();
  if (!['admin', 'super_admin', 'superadmin'].includes(role)) return null;

  return client;
}

export async function POST(req: NextRequest) {
  try {
    const adminClient = await getAuthorizedAdmin(req);
    if (!adminClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { productData } = body;

    const addPrimaryImage = productData.primary_image || (Array.isArray(productData.images) && productData.images[0]) || '';
    const addImagesList = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : (addPrimaryImage ? [addPrimaryImage] : []);
    const isSponsoredProduct = Boolean(productData.is_sponsored ?? productData.is_promoted);

    const { data: insertedProd, error: insertError } = await adminClient.from('products').insert({
      seller_id: productData.seller_id,
      category_id: productData.category_id,
      price: productData.price_iqd,
      currency: 'IQD',
      warranty_applicable: productData.warranty_type !== 'none',
      warranty_details: productData.warranty_period,
      delivery_available: productData.delivery_type !== 'pickup_only',
      delivery_info: productData.delivery_type === 'pickup_only' 
        ? 'Pickup only' 
        : (productData.delivery_cost_iqd ? `Delivery ${productData.delivery_cost_iqd.toLocaleString()} IQD` : 'Delivery available'),
      return_days: productData.return_window_days,
      return_policy: productData.return_conditions,
      image_url: addPrimaryImage,
      specs: {
        images: addImagesList,
        delivery_type: productData.delivery_type,
        warranty_type: productData.warranty_type,
        is_sponsored: isSponsoredProduct,
        is_promoted: isSponsoredProduct,
      },
      status: productData.status,
    }).select('id').single();

    if (insertError) {
      console.warn('API /api/products insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    if (insertedProd?.id) {
      const { error: transErr } = await adminClient.from('product_translations').upsert([
        { product_id: insertedProd.id, lang: 'ku', name: productData.name_ku, description: productData.description_ku || '' },
        { product_id: insertedProd.id, lang: 'en', name: productData.name_en, description: productData.description_en || '' },
        { product_id: insertedProd.id, lang: 'ar', name: productData.name_ar, description: productData.description_ar || '' },
      ], { onConflict: 'product_id,lang' });

      if (transErr) {
        console.warn('API /api/products translations error:', transErr);
      }
    }

    return NextResponse.json({ success: true, id: insertedProd?.id });
  } catch (err: unknown) {
    console.error('API /api/products POST error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminClient = await getAuthorizedAdmin(req);
    if (!adminClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();

    if (body.quickUpdate) {
      const { productId, priceIqd, stock } = body;
      const { data: existingData } = await adminClient
        .from('products')
        .select('specs')
        .eq('id', productId)
        .single();
      const nextSpecs = {
        ...(existingData?.specs || {}),
        stock_quantity: Number(stock) || 0,
      };
      await adminClient.from('products').update({
        price: priceIqd,
        specs: nextSpecs,
        updated_at: new Date().toISOString(),
      }).eq('id', productId);
      return NextResponse.json({ success: true });
    }

    if (body.toggleSponsor) {
      const { productId, isSponsored } = body;
      const { data: existingData } = await adminClient.from('products').select('specs').eq('id', productId).single();
      const nextSpecs = {
        ...(existingData?.specs || {}),
        is_sponsored: Boolean(isSponsored),
        is_promoted: Boolean(isSponsored),
      };
      const { error: toggleErr } = await adminClient.from('products').update({
        specs: nextSpecs,
        updated_at: new Date().toISOString(),
      }).eq('id', productId);
      if (toggleErr) {
        console.warn('API /api/products toggleSponsor error:', toggleErr);
        return NextResponse.json({ error: toggleErr.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, isSponsored: Boolean(isSponsored) });
    }

    const { product } = body;

    const prodPrimaryImage = product.primary_image || (Array.isArray(product.images) && product.images[0]) || '';
    const prodImagesList = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : (prodPrimaryImage ? [prodPrimaryImage] : []);
    const isSpon = Boolean(product.is_sponsored ?? product.is_promoted);

    // Merge with existing specs to preserve other custom metadata
    const { data: existingProd } = await adminClient.from('products').select('specs').eq('id', product.id).single();
    const mergedSpecs = {
      ...(existingProd?.specs || {}),
      images: prodImagesList,
      delivery_type: product.delivery_type,
      warranty_type: product.warranty_type,
      is_sponsored: isSpon,
      is_promoted: isSpon,
    };

    const { error: updateError } = await adminClient.from('products').update({
      price: product.price_iqd,
      category_id: product.category_id || undefined,
      seller_id: product.seller_id || undefined,
      warranty_applicable: product.warranty_type !== 'none',
      warranty_details: product.warranty_period,
      delivery_available: product.delivery_type !== 'pickup_only',
      delivery_info: product.delivery_type === 'pickup_only' 
        ? 'Pickup only' 
        : (product.delivery_cost_iqd ? `Delivery ${product.delivery_cost_iqd.toLocaleString()} IQD` : 'Delivery available'),
      return_days: product.return_window_days,
      return_policy: product.return_conditions,
      status: product.status,
      image_url: prodPrimaryImage,
      specs: mergedSpecs,
      updated_at: new Date().toISOString(),
    }).eq('id', product.id);

    if (updateError) {
      console.warn('API /api/products update error:', updateError);
    }

    // Upsert translations using the authenticated administrator client.
    const { error: transError } = await adminClient.from('product_translations').upsert([
      { product_id: product.id, lang: 'ku', name: product.name_ku, description: product.description_ku || '' },
      { product_id: product.id, lang: 'en', name: product.name_en, description: product.description_en || '' },
      { product_id: product.id, lang: 'ar', name: product.name_ar, description: product.description_ar || '' },
    ], { onConflict: 'product_id,lang' });

    if (transError) {
      console.warn('API /api/products translations upsert error:', transError);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('API /api/products PUT error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminClient = await getAuthorizedAdmin(req);
    if (!adminClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: true });
    }

    await adminClient.from('products').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('API /api/products DELETE error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
