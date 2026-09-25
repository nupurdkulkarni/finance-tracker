import { Category, CurrencyCode, PaymentMethod } from './types';

export const THEME = {
  colors: {
    bg: '#090D16',
    surface: '#111827',
    surfaceLight: '#1F2937',
    card: '#161F30',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardHover: '#1E293B',
    primary: '#6366F1', // Indigo
    primaryLight: '#818CF8',
    primaryDark: '#4338CA',
    secondary: '#EC4899', // Romantic Rose
    secondaryLight: '#F472B6',
    accent: '#F59E0B', // Warm Amber
    accentGold: '#FBBF24',
    success: '#10B981', // Emerald
    danger: '#EF4444', // Red
    info: '#06B6D4', // Cyan
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    textDim: '#64748B',
    partnerA: '#6366F1', // Indigo for User A
    partnerB: '#EC4899', // Pink/Rose for User B
    shared: '#10B981', // Emerald for Both
  },
  gradients: {
    hero: ['#312E81', '#1E1B4B'],
    rose: ['#BE185D', '#831843'],
    couple: ['#4F46E5', '#DB2777'],
    gold: ['#D97706', '#78350F'],
  }
};

export const DEFAULT_CATEGORIES: Omit<Category, 'workspace_id'>[] = [
  { id: 'cat-salary', name: 'Salary', color: '#10B981', icon: 'cash-outline', type: 'income', monthly_budget: 0 },
  { id: 'cat-rent', name: 'Rent', color: '#6366F1', icon: 'home-outline', type: 'expense', monthly_budget: 25000 },
  { id: 'cat-food', name: 'Food', color: '#F59E0B', icon: 'restaurant-outline', type: 'expense', monthly_budget: 12000 },
  { id: 'cat-leisure', name: 'Leisure', color: '#EC4899', icon: 'game-controller-outline', type: 'expense', monthly_budget: 8000 },
  { id: 'cat-travel', name: 'Travel', color: '#06B6D4', icon: 'airplane-outline', type: 'expense', monthly_budget: 15000 },
  { id: 'cat-health', name: 'Health', color: '#EF4444', icon: 'fitness-outline', type: 'expense', monthly_budget: 5000 },
  { id: 'cat-hobby', name: 'Hobby', color: '#8B5CF6', icon: 'color-palette-outline', type: 'expense', monthly_budget: 6000 },
  { id: 'cat-groceries', name: 'Groceries', color: '#14B8A6', icon: 'cart-outline', type: 'expense', monthly_budget: 10000 },
  { id: 'cat-invest', name: 'Investments', color: '#3B82F6', icon: 'trending-up-outline', type: 'investment', monthly_budget: 20000 },
  { id: 'cat-bills', name: 'Bills & Utilities', color: '#64748B', icon: 'receipt-outline', type: 'expense', monthly_budget: 4000 },
];

export const DEFAULT_PAYMENT_METHODS: Omit<PaymentMethod, 'workspace_id'>[] = [
  { id: 'pm-cc', name: 'Credit Card', type: 'card', icon: 'card-outline' },
  { id: 'pm-cash', name: 'Cash', type: 'cash', icon: 'cash-outline' },
  { id: 'pm-bank', name: 'Bank Transfer', type: 'bank', icon: 'business-outline' },
  { id: 'pm-upi', name: 'UPI / Pix', type: 'upi_pix', icon: 'phone-portrait-outline' },
  { id: 'pm-debit', name: 'Debit Card', type: 'debit', icon: 'card' },
];

export const PRESET_AVATARS = [
  { id: 'av-1', label: 'Nu', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', color: '#6366F1' },
  { id: 'av-2', label: 'Pra', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', color: '#EC4899' },
  { id: 'av-3', label: 'Joy', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', color: '#10B981' },
  { id: 'av-4', label: 'Sam', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', color: '#F59E0B' },
  { id: 'av-5', label: 'Alex', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', color: '#8B5CF6' },
  { id: 'av-6', label: 'Taylor', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', color: '#06B6D4' },
];

export const PALETTE_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#64748B', // Slate
  '#D946EF', // Fuchsia
];

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = currency === 'EUR' ? '€' : '₹';
  const formatted = Math.abs(amount).toLocaleString(currency === 'EUR' ? 'de-DE' : 'en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}
