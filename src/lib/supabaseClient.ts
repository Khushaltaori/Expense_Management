// Legacy re-export — prefer importing createClient from '@/lib/supabase/client' directly.
// Kept for backward compatibility with existing imports of `supabase`.
import { createClient as createBrowserClient } from '@/lib/supabase/client'

export const supabase = createBrowserClient()