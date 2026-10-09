import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Server-side admin client that bypasses RLS (use in API routes and Server Actions)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  message: string;
  url: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in .env.local (Using local operational mock mode)',
      url: supabaseUrl || 'Not configured',
    };
  }

  try {
    const { error } = await supabase.from('sellers').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Connected to Supabase endpoint, but table query returned: ${error.message}`,
        url: supabaseUrl,
      };
    }
    return {
      connected: true,
      message: 'Supabase connected & schema verified',
      url: supabaseUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      connected: false,
      message,
      url: supabaseUrl,
    };
  }
}
