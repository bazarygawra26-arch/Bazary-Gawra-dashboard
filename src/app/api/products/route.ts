import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productData } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    const addPrimaryImage = productData.primary_image || (Array.isArray(productData.images) && productData.images[0]) || '';
    const addImagesList = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : (addPrimaryImage ? [addPrimaryImage] : []);

    const { data: insertedProd, error: insertError } = await supabaseAdmin.from('products').insert({
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
      },
      status: productData.status,
    }).select('id').single();

    if (insertError) {
      console.warn('API /api/products insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    if (insertedProd?.id) {
      const { error: transErr } = await supabaseAdmin.from('product_translations').upsert([
        { product_id: insertedProd.id, lang: 'ku', name: productData.name_ku, description: productData.description_ku || '' },
        { product_id: insertedProd.id, lang: 'en', name: productData.name_en, description: productData.description_en || '' },
        { product_id: insertedProd.id, lang: 'ar', name: productData.name_ar, description: productData.description_ar || '' },
      ], { onConflict: 'product_id,lang' });

      if (transErr) {
        console.warn('API /api/products translations error:', transErr);
      }
    }

    return NextResponse.json({ success: true, id: insertedProd?.id });
  } catch (err: any) {
    console.error('API /api/products POST error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: 'Local storage fallback' });
    }

    if (body.quickUpdate) {
      const { productId, priceIqd } = body;
      await supabaseAdmin.from('products').update({
        price: priceIqd,
        updated_at: new Date().toISOString(),
      }).eq('id', productId);
      return NextResponse.json({ success: true });
    }

    const { product } = body;

    const prodPrimaryImage = product.primary_image || (Array.isArray(product.images) && product.images[0]) || '';
    const prodImagesList = Array.isArray(product.images) && product.images.length > 0 
      ? product.images 
      : (prodPrimaryImage ? [prodPrimaryImage] : []);

    const { error: updateError } = await supabaseAdmin.from('products').update({
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
      specs: {
        images: prodImagesList,
        delivery_type: product.delivery_type,
        warranty_type: product.warranty_type,
      },
      updated_at: new Date().toISOString(),
    }).eq('id', product.id);

    if (updateError) {
      console.warn('API /api/products update error:', updateError);
    }

    // Upsert product_translations using service role key (bypasses RLS)
    const { error: transError } = await supabaseAdmin.from('product_translations').upsert([
      { product_id: product.id, lang: 'ku', name: product.name_ku, description: product.description_ku || '' },
      { product_id: product.id, lang: 'en', name: product.name_en, description: product.description_en || '' },
      { product_id: product.id, lang: 'ar', name: product.name_ar, description: product.description_ar || '' },
    ], { onConflict: 'product_id,lang' });

    if (transError) {
      console.warn('API /api/products translations upsert error:', transError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/products PUT error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !supabaseAdmin) {
      return NextResponse.json({ success: true });
    }

    await supabaseAdmin.from('products').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API /api/products DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
