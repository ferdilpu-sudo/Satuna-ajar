export const PUBLIC_SITE = {
  businessName: 'Satuna Ajar',
  operator: 'Usaha Perseorangan',
  operationalAddress: 'Tanah Abang, Jakarta Pusat, DKI Jakarta, Indonesia',
  email: 'ferdi.lpu@gmail.com',
  phone: '089630941666',
  supportHours: 'Senin–Jumat, 09.00–17.00 WIB',
  currency: 'IDR',
} as const;

export const PUBLIC_LINKS = [
  { href: '/pricing', label: 'Paket & Harga' },
  { href: '/faq', label: 'FAQ' },
  { href: '/syarat-ketentuan', label: 'Syarat & Ketentuan' },
  { href: '/kebijakan-refund', label: 'Refund' },
  { href: '/kebijakan-privasi', label: 'Privasi' },
  { href: '/kontak', label: 'Kontak' },
] as const;
