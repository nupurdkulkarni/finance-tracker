export type CurrencyCode = 'INR' | 'EUR';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  preferred_currency: CurrencyCode;
  partner_email?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'couple';
  currency: CurrencyCode;
  invite_code?: string;
  owner_id: string;
  partner_id?: string;
  partner_name?: string;
  partner_avatar?: string;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense' | 'investment';
  monthly_budget?: number;
}

export interface PaymentMethod {
  id: string;
  workspace_id: string;
  name: string;
  type: 'card' | 'cash' | 'upi_pix' | 'bank' | 'debit' | 'other';
  icon: string;
}

export interface Transaction {
  id: string;
  workspace_id: string;
  created_by: string;
  created_by_name?: string;
  created_by_avatar?: string;
  paid_by: string;
  paid_by_name?: string;
  type: 'income' | 'expense' | 'investment' | 'bill';
  amount: number;
  currency: CurrencyCode;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  payment_method_id?: string;
  payment_method_name?: string;
  description: string;
  transaction_date: string;
  is_bill?: boolean;
  is_paid?: boolean;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  workspace_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  currency: CurrencyCode;
  target_date?: string;
  category?: string;
  icon?: string;
  color: string;
  is_shared: boolean;
  created_by: string;
  created_by_name?: string;
}

export interface StockInvestment {
  id: string;
  workspace_id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  asset_name: string;
  ticker?: string;
  asset_type: 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'sip';
  invested_amount: number;
  current_value: number;
  currency: CurrencyCode;
  purchase_date: string;
  notes?: string;
}

export interface Bill {
  id: string;
  workspace_id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  due_date: string;
  is_paid: boolean;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  paid_by?: string;
  paid_by_name?: string;
  payment_method_id?: string;
  notes?: string;
  paid_at?: string;
}

export interface FilterOptions {
  searchQuery: string;
  period: 'this_month' | 'last_month' | 'this_year' | 'all';
  type: 'all' | 'expense' | 'income' | 'investment' | 'bill';
  categoryId?: string;
  paidBy: 'all' | 'me' | 'partner';
  paymentMethodId?: string;
}
