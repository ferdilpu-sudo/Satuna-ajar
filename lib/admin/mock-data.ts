import type {
  AdminMetric,
  AdminUserRow,
  OneTimePurchaseRow,
  PaymentRow,
  RevenuePoint,
  SubscriptionRow,
  SystemAlert,
} from '@/types/admin';

export const overviewMetrics: AdminMetric[] = [
  { label: 'Pendapatan bulan ini', value: 'Rp 18,4 jt', change: '+12,8%', trend: 'up', helper: 'langganan + beli sekali' },
  { label: 'MRR', value: 'Rp 15,1 jt', change: '+9,4%', trend: 'up', helper: 'pendapatan berulang' },
  { label: 'Beli sekali', value: '275', change: '+18,2%', trend: 'up', helper: 'transaksi 30 hari' },
  { label: 'Konversi berbayar', value: '24,3%', change: '+2,8%', trend: 'up', helper: 'trial ke pembayaran' },
];

export const monetizationMix = {
  totalRevenue: 18_400_000,
  recurringRevenue: 15_100_000,
  oneTimeRevenue: 3_300_000,
  oneTimeTransactions: 275,
  oneTimeBuyers: 100,
  unusedGenerationRights: 21,
  exampleGenerationPrice: 12_000,
};

export const revenueTrend: RevenuePoint[] = [
  { label: 'Feb', revenue: 8.2, aiCost: 1.8 }, { label: 'Mar', revenue: 9.4, aiCost: 2.0 },
  { label: 'Apr', revenue: 10.8, aiCost: 2.2 }, { label: 'Mei', revenue: 12.7, aiCost: 2.5 },
  { label: 'Jun', revenue: 14.9, aiCost: 2.8 }, { label: 'Jul', revenue: 16.3, aiCost: 3.0 },
  { label: 'Agu', revenue: 18.4, aiCost: 3.1 },
];

export const users: AdminUserRow[] = [
  { id: 'u1', name: 'Ayu Lestari', email: 'ayu@example.com', plan: 'Pro', status: 'Aktif', documents: 42, paidGenerations: 0, joinedAt: '12 Mei 2026', lastActive: '8 menit lalu' },
  { id: 'u2', name: 'Bagus Pranoto', email: 'bagus@example.com', plan: 'Gratis', status: 'Trial habis', documents: 5, paidGenerations: 2, joinedAt: '15 Agu 2026', lastActive: '2 jam lalu' },
  { id: 'u3', name: 'Dina Rahma', email: 'dina@example.com', plan: 'Pro', status: 'Aktif', documents: 28, paidGenerations: 0, joinedAt: '2 Jun 2026', lastActive: 'Hari ini' },
  { id: 'u4', name: 'Fajar Nugraha', email: 'fajar@example.com', plan: 'Pro', status: 'Berisiko', documents: 16, paidGenerations: 1, joinedAt: '21 Jun 2026', lastActive: '6 hari lalu' },
  { id: 'u5', name: 'Rina Oktavia', email: 'rina@example.com', plan: 'Gratis', status: 'Aktif', documents: 4, paidGenerations: 2, joinedAt: '16 Agu 2026', lastActive: '1 jam lalu' },
];

export const subscriptions: SubscriptionRow[] = [
  { id: 's1', customer: 'Ayu Lestari', plan: 'Satuna Pro Bulanan', amount: 59000, status: 'Aktif', renewAt: '12 Sep 2026' },
  { id: 's2', customer: 'Dina Rahma', plan: 'Satuna Pro Tahunan', amount: 590000, status: 'Aktif', renewAt: '2 Jun 2027' },
  { id: 's3', customer: 'Fajar Nugraha', plan: 'Satuna Pro Bulanan', amount: 59000, status: 'Jatuh tempo', renewAt: '15 Agu 2026' },
  { id: 's4', customer: 'Nadia Putri', plan: 'Satuna Pro Bulanan', amount: 59000, status: 'Dibatalkan', renewAt: '31 Agu 2026' },
];

export const oneTimePurchases: OneTimePurchaseRow[] = [
  { id: 'OTP-2084', customer: 'Bagus Pranoto', product: '1x Generasi AI', amount: 12000, status: 'Berhasil', usage: 'Sudah digunakan', purchasedAt: '17 Agu · 10:14' },
  { id: 'OTP-2083', customer: 'Rina Oktavia', product: '1x Generasi AI', amount: 12000, status: 'Berhasil', usage: 'Belum digunakan', purchasedAt: '17 Agu · 09:58' },
  { id: 'OTP-2082', customer: 'Hendra Saputra', product: '1x Generasi AI', amount: 12000, status: 'Gagal', usage: 'Belum digunakan', purchasedAt: '17 Agu · 09:31' },
  { id: 'OTP-2081', customer: 'Siti Amelia', product: '1x Generasi AI', amount: 12000, status: 'Berhasil', usage: 'Sudah digunakan', purchasedAt: '17 Agu · 08:47' },
  { id: 'OTP-2080', customer: 'Arif Maulana', product: '1x Generasi AI', amount: 12000, status: 'Refund', usage: 'Belum digunakan', purchasedAt: '16 Agu · 22:20' },
];

export const payments: PaymentRow[] = [
  { id: 'PAY-1048', customer: 'Ayu Lestari', amount: 59000, status: 'Berhasil', paidAt: '17 Agu · 09:42', provider: 'Xendit', kind: 'Langganan', item: 'Satuna Pro Bulanan' },
  { id: 'PAY-1047', customer: 'Bagus Pranoto', amount: 12000, status: 'Berhasil', paidAt: '17 Agu · 09:18', provider: 'Xendit', kind: 'Beli sekali', item: '1x Generasi AI' },
  { id: 'PAY-1046', customer: 'Fajar Nugraha', amount: 59000, status: 'Gagal', paidAt: '17 Agu · 07:51', provider: 'Xendit', kind: 'Langganan', item: 'Satuna Pro Bulanan' },
  { id: 'PAY-1045', customer: 'Rina Oktavia', amount: 12000, status: 'Berhasil', paidAt: '16 Agu · 21:13', provider: 'Xendit', kind: 'Beli sekali', item: '1x Generasi AI' },
  { id: 'PAY-1044', customer: 'Hendra Saputra', amount: 12000, status: 'Refund', paidAt: '16 Agu · 20:28', provider: 'Xendit', kind: 'Beli sekali', item: '1x Generasi AI' },
];

export const systemAlerts: SystemAlert[] = [
  { id: 'a1', severity: 'critical', title: 'Pembayaran gagal meningkat', detail: '7 pembayaran gagal dalam 6 jam terakhir, termasuk transaksi beli sekali.', time: '12 menit lalu' },
  { id: 'a2', severity: 'warning', title: 'Biaya Gemini naik 11%', detail: 'Rata-rata biaya per dokumen naik dari Rp1.420 menjadi Rp1.576.', time: '48 menit lalu' },
  { id: 'a3', severity: 'info', title: 'Pembelian sekali tumbuh', detail: 'Transaksi 1x generate naik 18,2% dibanding 30 hari sebelumnya.', time: '2 jam lalu' },
];

export const aiUsage = {
  documentsThisMonth: 6842,
  successfulRequests: 98.7,
  estimatedCost: 3110000,
  costPerDocument: 1576,
  tokensMillions: 42.8,
};
