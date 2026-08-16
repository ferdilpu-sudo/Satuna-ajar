import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNext(value: string | null): string {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/';
}

function getRedirectOrigin(request: Request, fallbackOrigin: string): string {
  if (process.env.NODE_ENV === 'development') {
    return fallbackOrigin;
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return fallbackOrigin;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'));
  const redirectOrigin = getRedirectOrigin(request, url.origin);

  if (code) {
    try {
      const supabase = await createClient();

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(
          new URL(next, redirectOrigin),
        );
      }

      console.error(
        'Supabase code exchange failed:',
        error.message,
      );
    } catch (error) {
      console.error(
        'Supabase auth callback failed:',
        error,
      );
    }
  }

  const loginUrl = new URL('/login', redirectOrigin);
  loginUrl.searchParams.set('error', 'callback');

  return NextResponse.redirect(loginUrl);
}