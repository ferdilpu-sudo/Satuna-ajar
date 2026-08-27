import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getAuthMode, hasSupabaseEnv } from '@/lib/auth/config';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/daftar',
  '/lupa-kata-sandi',
  '/ubah-kata-sandi',
  '/auth/callback',
  '/pricing',
  '/syarat-ketentuan',
  '/kebijakan-refund',
  '/kebijakan-privasi',
  '/faq',
  '/kontak',
  '/api/billing/plans',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function unauthenticatedResponse(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Silakan masuk untuk melanjutkan.', code: 'AUTH_REQUIRED' }, { status: 401 });
  }
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const mode = getAuthMode();
  const publicPath = isPublicPath(request.nextUrl.pathname);
  if (mode === 'disabled') return NextResponse.next({ request });
  if (!hasSupabaseEnv()) {
    if (mode === 'enforce' && !publicPath) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Autentikasi production belum dikonfigurasi.', code: 'AUTH_CONFIGURATION_ERROR' }, { status: 503 });
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'config');
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const authenticated = Boolean(!error && data?.claims?.sub);

  if (authenticated && ['/login', '/daftar'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/workspace', request.url));
  }
  if (!authenticated && mode === 'enforce' && !publicPath) return unauthenticatedResponse(request);

  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
