import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS } from './constants';
import { supabase } from './supabase';
import {
  Bill,
  Category,
  CurrencyCode,
  FinancialGoal,
  PaymentMethod,
  StockInvestment,
  Transaction,
  UserProfile,
  Workspace,
} from './types';

const STORAGE_KEYS = {
  PROFILE: 'nupra_user_profile',
  WORKSPACE: 'nupra_active_workspace',
  WORKSPACES: 'nupra_workspaces_list',
  CATEGORIES: 'nupra_categories',
  PAYMENT_METHODS: 'nupra_payment_methods',
  TRANSACTIONS: 'nupra_transactions',
  GOALS: 'nupra_financial_goals',
  INVESTMENTS: 'nupra_stock_investments',
  BILLS: 'nupra_bills',
  DEMO_INITIALIZED: 'nupra_demo_initialized_v2',
};

// Default Initial Mock Couple State
const MOCK_USER: UserProfile = {
  id: 'usr-nu-01',
  email: 'nu@nuprafinance.app',
  display_name: 'Nu',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  preferred_currency: 'INR',
  partner_email: 'pra@nuprafinance.app',
};

const MOCK_PARTNER: UserProfile = {
  id: 'usr-pra-02',
  email: 'pra@nuprafinance.app',
  display_name: 'Pra',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  preferred_currency: 'INR',
  partner_email: 'nu@nuprafinance.app',
};

const MOCK_COUPLE_WORKSPACE: Workspace = {
  id: 'ws-couple-01',
  name: 'Nu & Pra Shared Space 💍',
  type: 'couple',
  currency: 'INR',
  invite_code: 'NUPRA2026',
  owner_id: 'usr-nu-01',
  partner_id: 'usr-pra-02',
  partner_name: 'Pra',
  partner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
};

const MOCK_PERSONAL_WORKSPACE: Workspace = {
  id: 'ws-personal-01',
  name: 'Nu Personal Finance 👤',
  type: 'personal',
  currency: 'INR',
  owner_id: 'usr-nu-01',
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    workspace_id: 'ws-couple-01',
    created_by: 'usr-nu-01',
    created_by_name: 'Nu',
    created_by_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    paid_by: 'usr-nu-01',
    paid_by_name: 'Nu',
    type: 'income',
    amount: 110000,
    currency: 'INR',
    category_id: 'cat-salary',
    category_name: 'Salary',
    category_color: '#10B981',
    category_icon: 'cash-outline',
    payment_method_id: 'pm-bank',
    payment_method_name: 'Bank Transfer',
    description: 'Tech Lead Monthly Salary',
    transaction_date: '2026-09-01',
    created_at: '2026-09-01T09:00:00Z',
  },
  {
    id: 'tx-2',
    workspace_id: 'ws-couple-01',
    created_by: 'usr-pra-02',
    created_by_name: 'Pra',
    created_by_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    paid_by: 'usr-pra-02',
    paid_by_name: 'Pra',
    type: 'income',
    amount: 95000,
    currency: 'INR',
    category_id: 'cat-salary',
    category_name: 'Salary',
    category_color: '#10B981',
    category_icon: 'cash-outline',
    payment_method_id: 'pm-bank',
    payment_method_name: 'Bank Transfer',
    description: 'Product Designer Monthly Salary',
    transaction_date: '2026-09-01',
    created_at: '2026-09-01T09:15:00Z',
  },
  {
    id: 'tx-3',
    workspace_id: 'ws-couple-01',
    created_by: 'usr-nu-01',
    created_by_name: 'Nu',
    created_by_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    paid_by: 'usr-nu-01',
    paid_by_name: 'Nu',
    type: 'expense',
    amount: 28000,
    currency: 'INR',
    category_id: 'cat-rent',
    category_name: 'Rent',
    category_color: '#6366F1',
    category_icon: 'home-outline',
    payment_method_id: 'pm-bank',
    payment_method_name: 'Bank Transfer',
    description: 'Apartment Monthly Rent',
    transaction_date: '2026-09-03',
    created_at: '2026-09-03T10:00:00Z',
  },
  {
    id: 'tx-4',
    workspace_id: 'ws-couple-01',
    created_by: 'usr-pra-02',
    created_by_name: 'Pra',
    created_by_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    paid_by: 'usr-pra-02',
    paid_by_name: 'Pra',
    type: 'expense',
    amount: 6400,
    currency: 'INR',
    category_id: 'cat-groceries',
    category_name: 'Groceries',
    category_color: '#14B8A6',
    category_icon: 'cart-outline',
    payment_method_id: 'pm-upi',
    payment_method_name: 'UPI / Pix',
    description: 'Organic Mart & Weekly Essentials',
    transaction_date: '2026-09-08',
    created_at: '2026-09-08T18:30:00Z',
  },
  {
    id: 'tx-5',
    workspace_id: 'ws-couple-01',
    created_by: 'usr-nu-01',
    created_by_name: 'Nu',
    created_by_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    paid_by: 'usr-nu-01',
    paid_by_name: 'Nu',
    type: 'expense',
    amount: 4200,
    currency: 'INR',
    category_id: 'cat-food',
    category_name: 'Food',
    category_color: '#F59E0B',
    category_icon: 'restaurant-outline',
    payment_method_id: 'pm-cc',
    payment_method_name: 'Credit Card',
    description: 'Romantic Candlelight Dinner 🍷',
    transaction_date: '2026-09-14',
    created_at: '2026-09-14T21:00:00Z',
  },
  {
    id: 'tx-6',
    workspace_id: 'ws-couple-01',
    created_by: 'usr-pra-02',
    created_by_name: 'Pra',
    created_by_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    paid_by: 'usr-pra-02',
    paid_by_name: 'Pra',
    type: 'expense',
    amount: 3200,
    currency: 'INR',
    category_id: 'cat-leisure',
    category_name: 'Leisure',
    category_color: '#EC4899',
    category_icon: 'game-controller-outline',
    payment_method_id: 'pm-upi',
    payment_method_name: 'UPI / Pix',
    description: 'IMAX Cinema & Dessert night',
    transaction_date: '2026-09-18',
    created_at: '2026-09-18T22:15:00Z',
  },
  {
    id: 'tx-7',
    workspace_id: 'ws-couple-01',
    created_by: 'usr-nu-01',
    created_by_name: 'Nu',
    created_by_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    paid_by: 'usr-nu-01',
    paid_by_name: 'Nu',
    type: 'expense',
    amount: 5800,
    currency: 'INR',
    category_id: 'cat-travel',
    category_name: 'Travel',
    category_color: '#06B6D4',
    category_icon: 'airplane-outline',
    payment_method_id: 'pm-cc',
    payment_method_name: 'Credit Card',
    description: 'Weekend Resort Booking Advance',
    transaction_date: '2026-09-22',
    created_at: '2026-09-22T14:40:00Z',
  },
];

const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    workspace_id: 'ws-couple-01',
    title: 'Dream Europe & Paris Trip ✈️',
    target_amount: 350000,
    current_amount: 220000,
    currency: 'INR',
    target_date: '2027-04-15',
    category: 'Travel',
    icon: 'airplane',
    color: '#06B6D4',
    is_shared: true,
    created_by: 'usr-nu-01',
    created_by_name: 'Nu & Pra',
  },
  {
    id: 'goal-2',
    workspace_id: 'ws-couple-01',
    title: 'Emergency Couple Safety Fund 🛡️',
    target_amount: 500000,
    current_amount: 380000,
    currency: 'INR',
    target_date: '2026-12-31',
    category: 'Safety',
    icon: 'shield-checkmark',
    color: '#10B981',
    is_shared: true,
    created_by: 'usr-pra-02',
    created_by_name: 'Nu & Pra',
  },
  {
    id: 'goal-3',
    workspace_id: 'ws-couple-01',
    title: 'Dream EV / Electric Car 🚗',
    target_amount: 1200000,
    current_amount: 450000,
    currency: 'INR',
    target_date: '2027-10-01',
    category: 'Vehicle',
    icon: 'car-sport',
    color: '#EC4899',
    is_shared: true,
    created_by: 'usr-nu-01',
    created_by_name: 'Nu & Pra',
  },
];

const INITIAL_STOCK_INVESTMENTS: StockInvestment[] = [
  {
    id: 'inv-1',
    workspace_id: 'ws-couple-01',
    user_id: 'usr-nu-01',
    user_name: 'Nu',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    asset_name: 'NIFTY 50 Index Mutual Fund',
    ticker: 'NIFTY50',
    asset_type: 'sip',
    invested_amount: 25000,
    current_value: 29500,
    currency: 'INR',
    purchase_date: '2026-09-05',
    notes: 'Monthly SIP investment for long-term compound growth',
  },
  {
    id: 'inv-2',
    workspace_id: 'ws-couple-01',
    user_id: 'usr-pra-02',
    user_name: 'Pra',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    asset_name: 'Tata Consultancy Services',
    ticker: 'TCS',
    asset_type: 'stock',
    invested_amount: 20000,
    current_value: 22400,
    currency: 'INR',
    purchase_date: '2026-09-10',
    notes: 'Bluechip tech holding',
  },
  {
    id: 'inv-3',
    workspace_id: 'ws-couple-01',
    user_id: 'usr-nu-01',
    user_name: 'Nu',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    asset_name: 'S&P 500 US Tech ETF',
    ticker: 'MON100',
    asset_type: 'etf',
    invested_amount: 15000,
    current_value: 17200,
    currency: 'INR',
    purchase_date: '2026-09-12',
    notes: 'US equity diversification',
  },
  {
    id: 'inv-4',
    workspace_id: 'ws-couple-01',
    user_id: 'usr-pra-02',
    user_name: 'Pra',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    asset_name: 'HDFC Small Cap Growth Fund',
    ticker: 'HDFCSMALL',
    asset_type: 'mutual_fund',
    invested_amount: 10000,
    current_value: 11800,
    currency: 'INR',
    purchase_date: '2026-09-15',
    notes: 'High growth thematic fund',
  },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'bill-1',
    workspace_id: 'ws-couple-01',
    title: 'High-Speed Fiber WiFi & OTT',
    amount: 1499,
    currency: 'INR',
    due_date: '2026-09-28',
    is_paid: false,
    category_id: 'cat-bills',
    category_name: 'Bills & Utilities',
    category_color: '#64748B',
    assigned_to: 'usr-nu-01',
    assigned_to_name: 'Nu',
    notes: 'Auto-debit setup on Credit Card',
  },
  {
    id: 'bill-2',
    workspace_id: 'ws-couple-01',
    title: 'Electricity & Utility Board Bill',
    amount: 3250,
    currency: 'INR',
    due_date: '2026-09-30',
    is_paid: false,
    category_id: 'cat-bills',
    category_name: 'Bills & Utilities',
    category_color: '#64748B',
    assigned_to: 'usr-pra-02',
    assigned_to_name: 'Pra',
    notes: 'Apartment electricity consumption',
  },
  {
    id: 'bill-3',
    workspace_id: 'ws-couple-01',
    title: 'Couple Gym & Health Membership',
    amount: 5000,
    currency: 'INR',
    due_date: '2026-09-05',
    is_paid: true,
    paid_by: 'usr-nu-01',
    paid_by_name: 'Nu',
    paid_at: '2026-09-04T12:00:00Z',
    category_id: 'cat-health',
    category_name: 'Health',
    category_color: '#EF4444',
  },
];

export class DataService {
  private static instance: DataService;
  private currentProfile: UserProfile = MOCK_USER;
  private currentPartner: UserProfile = MOCK_PARTNER;
  private currentWorkspace: Workspace = MOCK_COUPLE_WORKSPACE;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async initialize(): Promise<void> {
    const isInit = await AsyncStorage.getItem(STORAGE_KEYS.DEMO_INITIALIZED);
    if (!isInit) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(MOCK_USER));
      await AsyncStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(MOCK_COUPLE_WORKSPACE));
      await AsyncStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify([MOCK_COUPLE_WORKSPACE, MOCK_PERSONAL_WORKSPACE]));
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      await AsyncStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(DEFAULT_PAYMENT_METHODS));
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
      await AsyncStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(INITIAL_STOCK_INVESTMENTS));
      await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
      await AsyncStorage.setItem(STORAGE_KEYS.DEMO_INITIALIZED, 'true');
    }

    const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (savedProfile) this.currentProfile = JSON.parse(savedProfile);

    const savedWs = await AsyncStorage.getItem(STORAGE_KEYS.WORKSPACE);
    if (savedWs) this.currentWorkspace = JSON.parse(savedWs);
  }

  public async getProfile(): Promise<UserProfile> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : this.currentProfile;
  }

  public async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    const updated = { ...current, ...profile };
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    this.currentProfile = updated;

    if (supabase && supabase.auth) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from('profiles').upsert({
            id: session.user.id,
            display_name: updated.display_name,
            avatar_url: updated.avatar_url,
            preferred_currency: updated.preferred_currency,
            partner_email: updated.partner_email,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.log('Supabase profile sync note:', e);
      }
    }

    return updated;
  }

  public async getWorkspaces(): Promise<Workspace[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKSPACES);
    return data ? JSON.parse(data) : [MOCK_COUPLE_WORKSPACE, MOCK_PERSONAL_WORKSPACE];
  }

  public async getActiveWorkspace(): Promise<Workspace> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKSPACE);
    return data ? JSON.parse(data) : this.currentWorkspace;
  }

  public async setActiveWorkspace(workspace: Workspace): Promise<void> {
    this.currentWorkspace = workspace;
    await AsyncStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(workspace));
  }

  public async getCategories(): Promise<Category[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const list: Category[] = data ? JSON.parse(data) : DEFAULT_CATEGORIES as Category[];
    return list;
  }

  public async addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const categories = await this.getCategories();
    const newCat: Category = { ...cat, id: `cat-${Date.now()}` };
    const updated = [newCat, ...categories];
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return newCat;
  }

  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return data ? JSON.parse(data) : DEFAULT_PAYMENT_METHODS as PaymentMethod[];
  }

  public async getTransactions(): Promise<Transaction[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  }

  public async addTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const transactions = await this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));

    if (supabase) {
      try {
        await supabase.from('transactions').insert({
          workspace_id: newTx.workspace_id,
          created_by: newTx.created_by,
          paid_by: newTx.paid_by,
          type: newTx.type,
          amount: newTx.amount,
          currency: newTx.currency,
          category_id: newTx.category_id,
          payment_method_id: newTx.payment_method_id,
          description: newTx.description,
          transaction_date: newTx.transaction_date,
        });
      } catch (e) {
        console.log('Supabase offline or transaction sync pending:', e);
      }
    }

    return newTx;
  }

  public async deleteTransaction(id: string): Promise<void> {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  }

  public async getFinancialGoals(): Promise<FinancialGoal[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : INITIAL_GOALS;
  }

  public async addFinancialGoal(goal: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> {
    const goals = await this.getFinancialGoals();
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    const updated = [newGoal, ...goals];
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
    return newGoal;
  }

  public async contributeToGoal(goalId: string, amount: number, contributorName: string): Promise<FinancialGoal | null> {
    const goals = await this.getFinancialGoals();
    const goalIndex = goals.findIndex((g) => g.id === goalId);
    if (goalIndex === -1) return null;

    const goal = goals[goalIndex];
    const updatedGoal: FinancialGoal = {
      ...goal,
      current_amount: Math.min(goal.target_amount * 1.5, Number(goal.current_amount) + Number(amount)),
    };
    goals[goalIndex] = updatedGoal;
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));

    // Also record as a savings/investment transaction!
    await this.addTransaction({
      workspace_id: goal.workspace_id,
      created_by: this.currentProfile.id,
      created_by_name: contributorName,
      created_by_avatar: this.currentProfile.avatar_url,
      paid_by: this.currentProfile.id,
      paid_by_name: contributorName,
      type: 'investment',
      amount: amount,
      currency: goal.currency,
      category_name: `Goal: ${goal.title}`,
      category_color: goal.color,
      category_icon: goal.icon || 'trophy-outline',
      description: `Savings contribution to "${goal.title}"`,
      transaction_date: new Date().toISOString().split('T')[0],
    });

    return updatedGoal;
  }

  public async getStockInvestments(): Promise<StockInvestment[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    return data ? JSON.parse(data) : INITIAL_STOCK_INVESTMENTS;
  }

  public async addStockInvestment(inv: Omit<StockInvestment, 'id'>): Promise<StockInvestment> {
    const investments = await this.getStockInvestments();
    const newInv: StockInvestment = {
      ...inv,
      id: `inv-${Date.now()}`,
    };
    const updated = [newInv, ...investments];
    await AsyncStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(updated));

    // Also record transaction in ledger
    await this.addTransaction({
      workspace_id: inv.workspace_id,
      created_by: inv.user_id,
      created_by_name: inv.user_name,
      created_by_avatar: inv.user_avatar,
      paid_by: inv.user_id,
      paid_by_name: inv.user_name,
      type: 'investment',
      amount: inv.invested_amount,
      currency: inv.currency,
      category_name: 'Investments',
      category_color: '#3B82F6',
      category_icon: 'trending-up-outline',
      description: `Stock/Fund Investment in ${inv.asset_name} (${inv.ticker || inv.asset_type.toUpperCase()})`,
      transaction_date: inv.purchase_date,
    });

    return newInv;
  }

  public async getBills(): Promise<Bill[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BILLS);
    return data ? JSON.parse(data) : INITIAL_BILLS;
  }

  public async addBill(bill: Omit<Bill, 'id'>): Promise<Bill> {
    const bills = await this.getBills();
    const newBill: Bill = {
      ...bill,
      id: `bill-${Date.now()}`,
    };
    const updated = [newBill, ...bills];
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(updated));
    return newBill;
  }

  public async markBillAsPaid(billId: string, paidByUserId: string, paidByName: string): Promise<Bill | null> {
    const bills = await this.getBills();
    const idx = bills.findIndex((b) => b.id === billId);
    if (idx === -1) return null;

    const bill = bills[idx];
    const updatedBill: Bill = {
      ...bill,
      is_paid: true,
      paid_by: paidByUserId,
      paid_by_name: paidByName,
      paid_at: new Date().toISOString(),
    };
    bills[idx] = updatedBill;
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));

    // Record as paid expense transaction
    await this.addTransaction({
      workspace_id: bill.workspace_id,
      created_by: paidByUserId,
      created_by_name: paidByName,
      paid_by: paidByUserId,
      paid_by_name: paidByName,
      type: 'expense',
      amount: bill.amount,
      currency: bill.currency,
      category_id: bill.category_id,
      category_name: bill.category_name || 'Bills & Utilities',
      category_color: bill.category_color || '#64748B',
      category_icon: 'receipt-outline',
      description: `Bill Paid: ${bill.title}`,
      transaction_date: new Date().toISOString().split('T')[0],
      is_bill: true,
      is_paid: true,
    });

    return updatedBill;
  }
}
