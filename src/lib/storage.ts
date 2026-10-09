import { supabase } from './supabase';

export interface PresetImageOption {
  category: string;
  label_ku: string;
  label_en: string;
  label_ar: string;
  url: string;
  images: string[];
}

export const CURATED_PRODUCT_PRESETS: PresetImageOption[] = [
  {
    category: 'books',
    label_ku: 'کتێب و ئەدەبیات',
    label_en: 'Books & Kurdish Literature',
    label_ar: 'الكتب والأدب الكوردي',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    category: 'local-food-honey',
    label_ku: 'هەنگوینی سروشتی و خۆراک',
    label_en: 'Organic Natural Honey & Kurdish Food',
    label_ar: 'عسل جبلي طبيعي وأغذية محلية',
    url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    category: 'kitchen-home',
    label_ku: 'ئامێری چێشتخانە و قاوە',
    label_en: 'Kitchen Espresso & Appliances',
    label_ar: 'أجهزة المطبخ وماكينات القهوة',
    url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    category: 'electronics',
    label_ku: 'ئەلیکترۆنیات و مۆبایل',
    label_en: 'Mobile & Tech Electronics',
    label_ar: 'الهواتف الذكية والتكنولوجيا',
    url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    category: 'handmade-crafts',
    label_ku: 'دەستکرد و کەلەپوور',
    label_en: 'Handmade Kelim & Heritage Crafts',
    label_ar: 'الحرف اليدوية والسجاد التراثي',
    url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

/**
 * Uploads an image file to Supabase Storage if configured,
 * otherwise falls back cleanly to a Base64 data URL so the user is never blocked.
 */
export async function uploadImageFile(file: File, bucket = 'product-images'): Promise<string> {
  // 1. Try uploading to Supabase Storage
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload attempt error, using base64 fallback:', err);
    }
  }

  // 2. Reliable Client-side Data URL Fallback
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file data.'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error.'));
    reader.readAsDataURL(file);
  });
}
