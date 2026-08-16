const AUTH_MESSAGES: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Email atau kata sandi tidak sesuai.'],
  [/email not confirmed/i, 'Email belum diverifikasi. Periksa kotak masuk Anda.'],
  [/user already registered/i, 'Email ini sudah terdaftar. Silakan masuk.'],
  [/password.*at least/i, 'Kata sandi belum memenuhi ketentuan keamanan.'],
  [/rate limit|too many requests/i, 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.'],
];

export function friendlyAuthError(message?: string): string {
  const raw = message?.trim() || '';
  const match = AUTH_MESSAGES.find(([pattern]) => pattern.test(raw));
  return match?.[1] || 'Autentikasi gagal. Periksa data Anda lalu coba lagi.';
}
