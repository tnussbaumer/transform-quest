import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Untyped client — all query results are cast explicitly at each call site
// using the types defined in src/types/database.ts.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
