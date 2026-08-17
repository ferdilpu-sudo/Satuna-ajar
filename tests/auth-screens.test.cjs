const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('login dan daftar tersedia sebagai route auth terpisah dari app shell', () => {
  assert.match(read('app/(auth)/login/page.tsx'), /Masuk ke ruang kerja Anda/);
  assert.match(read('app/(auth)/daftar/page.tsx'), /Buat akun Satuna Ajar/);
});

test('login memakai layout compact agar muat pada viewport desktop', () => {
  const loginPage = read('app/(auth)/login/page.tsx');
  const shell = read('components/auth/AuthShell.tsx');
  const loginForm = read('components/auth/LoginForm.tsx');
  assert.match(loginPage, /compact/);
  assert.match(shell, /compact \? 'lg:py-6'/);
  assert.match(loginForm, /className="space-y-4"/);
});

test('auth screen memakai Satuna Ajar dan benefit khusus pekerjaan guru', () => {
  const shell = read('components/auth/AuthShell.tsx');
  assert.match(shell, /Satuna Ajar membantu guru/);
  assert.match(shell, /Perangkat ajar lebih cepat/);
  assert.match(shell, /Kurikulum Merdeka/);
});


test('copy auth berbicara dalam bahasa manfaat yang lebih natural', () => {
  const registerPage = read('app/(auth)/daftar/page.tsx');
  const register = read('components/auth/RegisterForm.tsx');
  const shell = read('components/auth/AuthShell.tsx');
  assert.match(registerPage, /Simpan perangkat ajar Anda dengan aman/);
  assert.match(register, /Coba gratis/);
  assert.match(shell, /AI yang tetap dalam kendali Anda/);
  assert.match(shell, /Anda tetap memegang keputusan akhir/);
  assert.doesNotMatch(shell, /Anda membantu kami menjaga ruang kerja guru/);
});

test('login terhubung ke Google OAuth dan email password Supabase', () => {
  const login = read('components/auth/LoginForm.tsx');
  assert.match(login, /signInWithOAuth/);
  assert.match(login, /provider: 'google'/);
  assert.match(login, /signInWithPassword/);
  assert.match(login, /href="\/lupa-kata-sandi"/);
  assert.match(login, /href="\/daftar"/);
});

test('registration terhubung ke signup Supabase dengan metadata nama', () => {
  const register = read('components/auth/RegisterForm.tsx');
  assert.match(register, /signInWithOAuth/);
  assert.match(register, /signUp/);
  assert.match(register, /full_name: name/);
  assert.match(register, /emailRedirectTo/);
  assert.match(register, /Buat hingga 3 dokumen dengan AI/);
  assert.match(register, /href="\/login"/);
});

test('password recovery memakai callback session sebelum update password', () => {
  const request = read('components/auth/PasswordResetRequestForm.tsx');
  const update = read('components/auth/UpdatePasswordForm.tsx');
  assert.match(request, /resetPasswordForEmail/);
  assert.match(request, /\/auth\/callback\?next=\/ubah-kata-sandi/);
  assert.match(update, /updateUser\(\{ password \}\)/);
});

test('auth callback menukar authorization code menjadi session', () => {
  const callback = read('app/auth/callback/route.ts');
  assert.match(callback, /exchangeCodeForSession\(code\)/);
  assert.match(callback, /safeNext/);
});

test('middleware memakai claims dan mendukung auth enforce', () => {
  const middleware = read('lib/supabase/middleware.ts');
  const config = read('lib/auth/config.ts');
  assert.match(middleware, /auth\.getClaims\(\)/);
  assert.match(middleware, /AUTH_REQUIRED/);
  assert.match(middleware, /AUTH_CONFIGURATION_ERROR/);
  assert.match(config, /'disabled' \| 'optional' \| 'enforce'/);
});

test('settings menyediakan account status dan logout', () => {
  const account = read('components/settings/AccountSection.tsx');
  assert.match(account, /auth\.getUser\(\)/);
  assert.match(account, /auth\.signOut\(\)/);
  assert.match(account, /Akun Satuna/);
});
