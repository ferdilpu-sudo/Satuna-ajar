export type AdminSection = 'overview' | 'users' | 'subscriptions' | 'revenue' | 'ai' | 'system';
export type PaymentKind = 'Langganan' | 'Beli sekali';

export interface AdminMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  helper: string;
}

export interface AdminOverviewMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  monthRevenue: number;
  monthOneTimeRevenue: number;
  mrr: number;
  generations30d: number;
  failedGenerations30d: number;
  aiCost30d: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  aiCost: number;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  plan: 'Gratis' | 'Pro';
  status: 'Aktif' | 'Trial habis' | 'Berisiko';
  documents: number;
  paidGenerations: number;
  joinedAt: string;
  lastActive: string;
}

export interface SubscriptionRow {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  status: 'Aktif' | 'Jatuh tempo' | 'Dibatalkan';
  renewAt: string;
}

export interface OneTimePurchaseRow {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'Berhasil' | 'Gagal' | 'Refund';
  usage: 'Belum digunakan' | 'Sudah digunakan';
  purchasedAt: string;
}

export interface PaymentRow {
  id: string;
  customer: string;
  amount: number;
  status: 'Berhasil' | 'Gagal' | 'Refund';
  paidAt: string;
  provider: string;
  kind: PaymentKind;
  item: string;
}

export interface AdminCommerceData {
  activeSubscriptions: number;
  oneTimeTransactions30d: number;
  oneTimeBuyers30d: number;
  unusedGenerationRights: number;
  monthRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  subscriptions: SubscriptionRow[];
  oneTimePurchases: OneTimePurchaseRow[];
  payments: PaymentRow[];
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  time: string;
}
