import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const isServer = typeof window === 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = isServer
	? createClient(supabaseUrl, supabaseServiceRoleKey, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
			},
		})
	: supabase;

export { supabaseUrl, supabaseAnonKey };
