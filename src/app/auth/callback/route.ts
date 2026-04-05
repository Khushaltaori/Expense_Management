import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('[auth/callback] code present:', !!code, '| origin:', origin)

  if (!code) {
    console.error('[auth/callback] No code in URL params. Full URL:', request.url)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession failed:', exchangeError.message, exchangeError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  // Exchange succeeded — get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('[auth/callback] getUser failed after exchange:', userError?.message)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
  }

  console.log('[auth/callback] Auth success for user:', user.id, user.email)

  // Try to read role from profiles table (non-fatal if it fails)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.warn('[auth/callback] Could not read profile (table may not exist yet):', profileError.message)
  }

  const role = profile?.role ?? 'employee'
  console.log('[auth/callback] User role:', role)

  // Role → route mapping — fall back to /dashboard if sub-route doesn't exist yet
  const roleRoutes: Record<string, string> = {
    admin: '/dashboard',
    manager: '/dashboard',
    employee: '/dashboard',
  }

  const redirectPath = roleRoutes[role] ?? '/dashboard'
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  const finalUrl = isLocalEnv
    ? `${origin}${redirectPath}`
    : forwardedHost
    ? `https://${forwardedHost}${redirectPath}`
    : `${origin}${redirectPath}`

  console.log('[auth/callback] Redirecting to:', finalUrl)
  return NextResponse.redirect(finalUrl)
}

