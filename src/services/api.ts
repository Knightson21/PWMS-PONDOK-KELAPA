import type { 
  User, 
  WasteType, 
  DepositTransaction, 
  Withdrawal, 
  Mutation, 
  AuditLog, 
  PublicStats,
  WilayahRT,
  WilayahConfig,
  RtStatistic,
  WasteSaleRecord,
  TokoProduct
} from '../types';

const TOKEN_KEY = 'pwms_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server');
  }

  return data as T;
}

export const api = {
  // Public
  getPublicStats: () => request<PublicStats>('/api/public/stats'),
  getPublicWasteTypes: () => request<WasteType[]>('/api/public/waste-types'),
  getPublicArticles: () => request<any[]>('/api/public/articles'),
  getPublicProfile: () => request<any>('/api/public/profile'),
  getPublicSOP: () => request<any[]>('/api/public/sop'),
  getPublicProducts: () => request<TokoProduct[]>('/api/public/products'),
  getWilayahConfig: () => request<{ config: WilayahConfig; activeRt: WilayahRT[] }>('/api/wilayah/config'),
  submitPublicSale: (data: {
    sellerName: string;
    sellerRt: string;
    date?: string;
    items: Array<{ wasteTypeId: string; weight: number; pricePerKg: number }>;
    photoUrl?: string;
    notes?: string;
  }) =>
    request<{ sale: WasteSaleRecord; message: string }>('/api/public/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Auth
  login: (phone: string, password: string) => 
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    }),
  getMe: () => request<{ user: User }>('/api/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    }),

  // Nasabah
  getNasabahProfile: () => request<User>('/api/nasabah/profile'),
  getNasabahTransactions: () => request<DepositTransaction[]>('/api/nasabah/transactions'),
  getNasabahWithdrawals: () => request<Withdrawal[]>('/api/nasabah/withdrawals'),
  getNasabahMutations: () => request<Mutation[]>('/api/nasabah/mutations'),

  // Admin Overview
  getAdminOverview: (rt?: string) => request<{
    totalWeightKg: number;
    totalEconomicValueRp: number;
    totalWithdrawalsRp: number;
    currentOutstandingBalance: number;
    totalNasabah: number;
    totalActiveNasabah: number;
    pendingVerificationCount: number;
    recentDeposits: DepositTransaction[];
    recentWithdrawals: Withdrawal[];
  }>(`/api/admin/overview${rt && rt !== 'ALL' ? `?rt=${encodeURIComponent(rt)}` : ''}`),

  // Wilayah RT & RW Management
  getAdminWilayah: () => request<{ config: WilayahConfig; rtList: WilayahRT[] }>('/api/admin/wilayah'),
  updateWilayahConfig: (data: Partial<WilayahConfig>) =>
    request<{ config: WilayahConfig; message: string }>('/api/admin/wilayah/config', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  createWilayahRt: (data: { nomorRt: string; ketuaRt?: string; phone?: string; description?: string }) =>
    request<WilayahRT>('/api/admin/wilayah/rt', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateWilayahRt: (id: string, data: Partial<WilayahRT>) =>
    request<WilayahRT>(`/api/admin/wilayah/rt/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  getRtStatistics: () => request<{
    stats: RtStatistic[];
    totalWeightAllRt: number;
    totalDepositAllRt: number;
    totalNasabahAllRt: number;
    rwConfig: WilayahConfig;
  }>('/api/admin/stats/rt'),

  // Admin Nasabah
  getNasabahList: (q?: string, rt?: string) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (rt && rt !== 'ALL') params.append('rt', rt);
    const qs = params.toString();
    return request<User[]>(`/api/admin/nasabah${qs ? `?${qs}` : ''}`);
  },
  createNasabah: (data: { name: string; phone: string; address: string; rt: string; email?: string; initialPassword?: string; nasabahType?: 'perorangan' | 'lembaga' }) =>
    request<{ user: User; temporaryPassword: string; message: string }>('/api/admin/nasabah', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateNasabah: (id: string, data: Partial<User>) =>
    request<{ user: User; message: string }>(`/api/admin/nasabah/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  resetNasabahPassword: (id: string) =>
    request<{ temporaryPassword: string; message: string }>(`/api/admin/nasabah/${id}/reset-password`, {
      method: 'POST'
    }),

  // Admin Waste Types
  getWasteTypes: () => request<WasteType[]>('/api/admin/waste-types'),
  createWasteType: (data: { name: string; category?: string; pricePerKg: number; unit?: string }) =>
    request<WasteType>('/api/admin/waste-types', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateWasteType: (id: string, data: Partial<WasteType>) =>
    request<WasteType>(`/api/admin/waste-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Admin Deposits
  getDeposits: (status?: string, nasabahId?: string, rt?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (nasabahId) params.append('nasabahId', nasabahId);
    if (rt && rt !== 'ALL') params.append('rt', rt);
    const qs = params.toString();
    return request<DepositTransaction[]>(`/api/admin/deposits${qs ? `?${qs}` : ''}`);
  },
  createDeposit: (data: { nasabahId: string; items: any[]; photoUrl: string; notes?: string }) =>
    request<DepositTransaction>('/api/admin/deposits', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  batchCreateDeposits: (deposits: Array<{ nasabahId: string; items: any[]; photoUrl?: string; notes?: string }>) =>
    request<{ count: number; deposits: DepositTransaction[]; message: string }>('/api/admin/deposits/batch', {
      method: 'POST',
      body: JSON.stringify({ deposits })
    }),
  approveDeposit: (id: string) =>
    request<{ deposit: DepositTransaction; nasabah: User; message: string }>(`/api/admin/deposits/${id}/approve`, {
      method: 'POST'
    }),
  rejectDeposit: (id: string, reason: string) =>
    request<{ deposit: DepositTransaction; message: string }>(`/api/admin/deposits/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),
  correctDeposit: (id: string, data: { reason: string; newItems: any[] }) =>
    request<{ deposit: DepositTransaction; nasabah: User; balanceDelta: number; message: string }>(`/api/admin/deposits/${id}/correct`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Withdrawals
  getWithdrawals: (rt?: string) => {
    const qs = rt && rt !== 'ALL' ? `?rt=${encodeURIComponent(rt)}` : '';
    return request<Withdrawal[]>(`/api/admin/withdrawals${qs}`);
  },
  createWithdrawal: (data: { nasabahId: string; amount: number; notes?: string }) =>
    request<{ withdrawal: Withdrawal; nasabah: User; message: string }>('/api/admin/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Audits & Mutations
  getMutations: (rt?: string) => {
    const qs = rt && rt !== 'ALL' ? `?rt=${encodeURIComponent(rt)}` : '';
    return request<Mutation[]>(`/api/admin/mutations${qs}`);
  },
  getAuditLogs: () => request<AuditLog[]>('/api/admin/audit-logs'),
  getReports: (rt?: string) => {
    const qs = rt && rt !== 'ALL' ? `?rt=${encodeURIComponent(rt)}` : '';
    return request<{
      wasteBreakdown: Record<string, { weight: number; amount: number; count: number }>;
      monthlySummary: Array<{ month: string; weight: number; depositAmount: number; withdrawalAmount: number }>;
      totalDepositsCount: number;
      totalWithdrawalsCount: number;
      rtSummary?: RtStatistic[];
      selectedRt?: string;
    }>(`/api/admin/reports${qs}`);
  },

  // Rekap Transaksi BSP 2026 (Januari - Oktober 2026)
  getRekap2026: (month?: string, rt?: string, q?: string) => {
    const params = new URLSearchParams();
    if (month && month !== 'ALL') params.append('month', month);
    if (rt && rt !== 'ALL') params.append('rt', rt);
    if (q) params.append('q', q);
    const qs = params.toString();
    return request<{
      transactions: any[];
      summary: any;
      availableMonths: string[];
      availableRts: string[];
    }>(`/api/admin/rekap-2026${qs ? `?${qs}` : ''}`);
  },

  // Buku Tabungan Resmi Nasabah
  getNasabahPassbook: (nasabahId: string) =>
    request<{ user: User; entries: any[]; summary: any }>(`/api/admin/nasabah/${nasabahId}/passbook`),
  getMyPassbook: () =>
    request<{ user: User; entries: any[]; summary: any }>('/api/nasabah/passbook'),

  // Nasabah Self-Deposit Submission (Bukan Langsung ACC - Menunggu Verifikasi)
  submitNasabahDeposit: (data: { items: Array<{ wasteTypeId: string; weight: number }>; photoUrl: string; notes?: string }) =>
    request<{ deposit: DepositTransaction; message: string }>('/api/nasabah/deposits', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Raw Waste Sales (Spreadsheet)
  getAdminSales: (params?: { q?: string; rt?: string; startDate?: string; endDate?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.append('q', params.q);
    if (params?.rt && params.rt !== 'ALL') qs.append('rt', params.rt);
    if (params?.startDate) qs.append('startDate', params.startDate);
    if (params?.endDate) qs.append('endDate', params.endDate);
    const query = qs.toString();
    return request<WasteSaleRecord[]>(`/api/admin/sales${query ? `?${query}` : ''}`);
  },
  createAdminSale: (data: {
    sellerName: string;
    sellerRt: string;
    date?: string;
    items: Array<{ wasteTypeId: string; weight: number; pricePerKg: number }>;
    photoUrl?: string;
    notes?: string;
  }) =>
    request<{ sale: WasteSaleRecord; message: string }>('/api/admin/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAdminSale: (
    id: string,
    data: {
      sellerName?: string;
      sellerRt?: string;
      date?: string;
      items?: Array<{ wasteTypeId: string; weight: number; pricePerKg: number }>;
      photoUrl?: string;
      notes?: string;
    }
  ) =>
    request<{ sale: WasteSaleRecord; message: string }>(`/api/admin/sales/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteAdminSale: (id: string) =>
    request<{ message: string }>(`/api/admin/sales/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),

  // Admin Toko Products & Photo Management
  getAdminProducts: () => request<TokoProduct[]>('/api/admin/products'),
  createAdminProduct: (data: Omit<TokoProduct, 'id' | 'updatedAt'>) =>
    request<{ product: TokoProduct; message: string }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAdminProduct: (id: string, data: Partial<TokoProduct>) =>
    request<{ product: TokoProduct; message: string }>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteAdminProduct: (id: string) =>
    request<{ message: string }>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),

  // Admin Profile Org Chart Image
  updateOrgChartImage: (imageUrl: string) =>
    request<{ orgChartImageUrl: string; message: string }>('/api/admin/profile/org-chart', {
      method: 'PUT',
      body: JSON.stringify({ imageUrl })
    }),

  // Admin Database Backup & Restore File Server
  getDatabaseBackup: () =>
    request<{ db: any; stats: any }>('/api/admin/database/backup'),
  restoreDatabase: (data: any) =>
    request<{ message: string }>('/api/admin/database/restore', {
      method: 'POST',
      body: JSON.stringify({ data })
    }),

  // Quick switch demo login
  quickDemoLogin: (nasabahId: string) =>
    request<{ token: string; user: User }>(`/api/admin/quick-switch/${nasabahId}`, {
      method: 'POST'
    })
};
