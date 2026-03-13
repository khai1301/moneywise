// ===== MoneyWise Fake Data Layer =====
// Replace with real API calls when backend is ready

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Salary' | 'Freelance' | 'Investment' | 'Bonus'
  | 'Food & Dining' | 'Transport' | 'Housing' | 'Entertainment'
  | 'Healthcare' | 'Shopping' | 'Education' | 'Utilities' | 'Other';

export interface CategoryDef {
  id: string;
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  description?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'E-Wallet';
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  spent: number;
  color: string;
  icon: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  targetDate: string;
  icon: string;
  color: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface DailySpend {
  date: string;
  amount: number;
}

// ===== TRANSACTIONS =====
export const transactions: Transaction[] = [
  { id: 't1', title: 'Monthly Salary', amount: 25000000, type: 'income', category: 'Salary', date: '2026-03-05', paymentMethod: 'Bank Transfer', note: 'March salary from DEHA Vietnam' },
  { id: 't2', title: 'Freelance Project - Website', amount: 8500000, type: 'income', category: 'Freelance', date: '2026-03-04', paymentMethod: 'Bank Transfer', note: 'WordPress development' },
  { id: 't3', title: 'Grab Bike', amount: 35000, type: 'expense', category: 'Transport', date: '2026-03-08', paymentMethod: 'E-Wallet' },
  { id: 't4', title: 'CoopMart Grocery', amount: 680000, type: 'expense', category: 'Food & Dining', date: '2026-03-07', paymentMethod: 'Cash' },
  { id: 't5', title: 'Netflix Subscription', amount: 260000, type: 'expense', category: 'Entertainment', date: '2026-03-07', paymentMethod: 'Credit Card' },
  { id: 't6', title: 'House Rent', amount: 4500000, type: 'expense', category: 'Housing', date: '2026-03-01', paymentMethod: 'Bank Transfer', note: 'March rent payment' },
  { id: 't7', title: 'Pharmacy', amount: 185000, type: 'expense', category: 'Healthcare', date: '2026-03-06', paymentMethod: 'Cash' },
  { id: 't8', title: 'New Shoes', amount: 890000, type: 'expense', category: 'Shopping', date: '2026-03-05', paymentMethod: 'Credit Card' },
  { id: 't9', title: 'Electricity Bill', amount: 420000, type: 'expense', category: 'Utilities', date: '2026-03-03', paymentMethod: 'E-Wallet' },
  { id: 't10', title: 'Online Course - AWS', amount: 1200000, type: 'expense', category: 'Education', date: '2026-03-02', paymentMethod: 'Credit Card', note: 'AWS Solutions Architect' },
  { id: 't11', title: 'Bonus Q1', amount: 5000000, type: 'income', category: 'Bonus', date: '2026-03-01', paymentMethod: 'Bank Transfer' },
  { id: 't12', title: 'Pho Breakfast', amount: 55000, type: 'expense', category: 'Food & Dining', date: '2026-03-09', paymentMethod: 'Cash' },
  { id: 't13', title: 'Parking Fee', amount: 25000, type: 'expense', category: 'Transport', date: '2026-03-09', paymentMethod: 'Cash' },
  { id: 't14', title: 'Stock Dividend', amount: 1800000, type: 'income', category: 'Investment', date: '2026-02-28', paymentMethod: 'Bank Transfer' },
  { id: 't15', title: 'Gaming - Steam', amount: 350000, type: 'expense', category: 'Entertainment', date: '2026-02-27', paymentMethod: 'Credit Card' },
  { id: 't16', title: 'Lunch with Team', amount: 240000, type: 'expense', category: 'Food & Dining', date: '2026-02-26', paymentMethod: 'Cash' },
  { id: 't17', title: 'Water Bill', amount: 85000, type: 'expense', category: 'Utilities', date: '2026-02-25', paymentMethod: 'E-Wallet' },
  { id: 't18', title: 'Freelance - Mobile App', amount: 12000000, type: 'income', category: 'Freelance', date: '2026-02-22', paymentMethod: 'Bank Transfer' },
  { id: 't19', title: 'Doctor Visit', amount: 500000, type: 'expense', category: 'Healthcare', date: '2026-02-20', paymentMethod: 'Cash' },
  { id: 't20', title: 'Book - Clean Code', amount: 320000, type: 'expense', category: 'Education', date: '2026-02-18', paymentMethod: 'E-Wallet' },
];

// ===== BUDGETS =====
export const budgets: Budget[] = [
  { id: 'b1', category: 'Food & Dining', limit: 3000000, spent: 3450000, color: '#FF6B8A', icon: '🍜' },
  { id: 'b2', category: 'Transport', limit: 1500000, spent: 890000, color: '#4BB3FD', icon: '🚗' },
  { id: 'b3', category: 'Entertainment', limit: 1000000, spent: 610000, color: '#A78BFA', icon: '🎮' },
  { id: 'b4', category: 'Shopping', limit: 2000000, spent: 1850000, color: '#FFC94A', icon: '🛍️' },
  { id: 'b5', category: 'Healthcare', limit: 1000000, spent: 685000, color: '#2DD4BF', icon: '💊' },
  { id: 'b6', category: 'Education', limit: 2000000, spent: 1520000, color: '#F97316', icon: '📚' },
];

// ===== SAVINGS GOALS =====
export const savingsGoals: SavingsGoal[] = [
  { id: 'g1', name: 'MacBook Pro M4', target: 45000000, saved: 28500000, targetDate: '2026-09-01', icon: '💻', color: '#4BB3FD' },
  { id: 'g2', name: 'Japan Trip', target: 30000000, saved: 12000000, targetDate: '2026-12-01', icon: '✈️', color: '#A78BFA' },
  { id: 'g3', name: 'Emergency Fund', target: 60000000, saved: 48000000, targetDate: '2026-06-01', icon: '🛡️', color: '#2DD4BF' },
];

// ===== CATEGORIES =====
export const categoryDefs: CategoryDef[] = [
  // Income
  { id: 'c1', name: 'Salary', type: 'income', icon: '💼', color: '#4BB3FD', description: 'Monthly salary & wages' },
  { id: 'c2', name: 'Freelance', type: 'income', icon: '💻', color: '#A78BFA', description: 'Freelance & contract work' },
  { id: 'c3', name: 'Investment', type: 'income', icon: '📈', color: '#2DD4BF', description: 'Dividends, stocks, crypto' },
  { id: 'c4', name: 'Bonus', type: 'income', icon: '🎁', color: '#FFC94A', description: 'Performance bonuses & gifts' },
  // Expense
  { id: 'c5', name: 'Food & Dining', type: 'expense', icon: '🍜', color: '#FF6B8A', description: 'Restaurants, groceries, coffee' },
  { id: 'c6', name: 'Transport', type: 'expense', icon: '🚗', color: '#2DD4BF', description: 'Grab, fuel, parking' },
  { id: 'c7', name: 'Housing', type: 'expense', icon: '🏠', color: '#6366F1', description: 'Rent, electricity, water' },
  { id: 'c8', name: 'Entertainment', type: 'expense', icon: '🎮', color: '#A78BFA', description: 'Games, movies, subscriptions' },
  { id: 'c9', name: 'Healthcare', type: 'expense', icon: '💊', color: '#34D399', description: 'Doctor, medicine, gym' },
  { id: 'c10', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#FFC94A', description: 'Clothes, electronics, misc' },
  { id: 'c11', name: 'Education', type: 'expense', icon: '📚', color: '#F97316', description: 'Courses, books, training' },
  { id: 'c12', name: 'Utilities', type: 'expense', icon: '⚡', color: '#94A3B8', description: 'Internet, phone bills' },
  { id: 'c13', name: 'Other', type: 'both', icon: '📦', color: '#94A3B8', description: 'Miscellaneous' },
];

// ===== 12-MONTH ANALYTICS DATA =====
export const monthlyData: MonthlyData[] = [
  { month: 'Apr', income: 28000000, expense: 18500000, savings: 9500000 },
  { month: 'May', income: 30500000, expense: 19200000, savings: 11300000 },
  { month: 'Jun', income: 27800000, expense: 21000000, savings: 6800000 },
  { month: 'Jul', income: 32000000, expense: 20400000, savings: 11600000 },
  { month: 'Aug', income: 29500000, expense: 22800000, savings: 6700000 },
  { month: 'Sep', income: 31000000, expense: 19500000, savings: 11500000 },
  { month: 'Oct', income: 33500000, expense: 21200000, savings: 12300000 },
  { month: 'Nov', income: 28000000, expense: 23500000, savings: 4500000 },
  { month: 'Dec', income: 38000000, expense: 28000000, savings: 10000000 },
  { month: 'Jan', income: 26500000, expense: 18000000, savings: 8500000 },
  { month: 'Feb', income: 32300000, expense: 20800000, savings: 11500000 },
  { month: 'Mar', income: 40300000, expense: 13689000, savings: 26611000 },
];

// ===== DAILY SPENDING HEATMAP (last 35 days) =====
// Pre-computed static values to avoid SSR/client hydration mismatch (no Math.random())
const HEATMAP_AMOUNTS = [
  320000, 0, 850000, 250000, 1200000, 680000, 0,
  450000, 1800000, 90000, 0, 560000, 720000, 380000,
  0, 1100000, 430000, 670000, 0, 2100000, 340000,
  810000, 0, 490000, 150000, 980000, 0, 730000,
  260000, 1450000, 55000, 0, 890000, 420000, 680000,
];

export const dailySpends: DailySpend[] = Array.from({ length: 35 }, (_, i) => {
  const date = new Date('2026-03-11');
  date.setDate(date.getDate() - (34 - i));
  return {
    date: date.toISOString().split('T')[0],
    amount: HEATMAP_AMOUNTS[i] ?? 0,
  };
});

// ===== COMPUTED SUMMARY =====
export function getSummary() {
  const currentMonthTxns = transactions.filter(t => t.date.startsWith('2026-03'));
  const income = currentMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = currentMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalSaved = savingsGoals.reduce((s, g) => s + g.saved, 0);
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  return { balance: income - expense + 85000000, income, expense, savingsRate, totalSaved };
}

// ===== CATEGORY SPENDING (for donut chart) =====
export function getCategorySpending() {
  const map: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0);
  const colors: Record<string, string> = {
    'Food & Dining': '#FF6B8A',
    'Housing': '#4BB3FD',
    'Transport': '#2DD4BF',
    'Entertainment': '#A78BFA',
    'Shopping': '#FFC94A',
    'Healthcare': '#34D399',
    'Education': '#F97316',
    'Utilities': '#94A3B8',
    'Other': '#E2E8F0',
  };
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: colors[name] || '#94A3B8', pct: Math.round((value / total) * 100) }));
}

// ===== FORMATTERS =====
export function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ₫`;
  if (compact && amount >= 1000) return `${(amount / 1000).toFixed(0)}K ₫`;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ===== CATEGORY COLOR MAP =====
export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Salary': { bg: 'rgba(75,179,253,0.15)', text: '#1E90DB' },
  'Freelance': { bg: 'rgba(167,139,250,0.15)', text: '#7C3AED' },
  'Investment': { bg: 'rgba(45,212,191,0.15)', text: '#0D9469' },
  'Bonus': { bg: 'rgba(255,201,74,0.15)', text: '#D97706' },
  'Food & Dining': { bg: 'rgba(255,107,138,0.15)', text: '#D63A5A' },
  'Transport': { bg: 'rgba(45,212,191,0.15)', text: '#0D9469' },
  'Housing': { bg: 'rgba(99,102,241,0.15)', text: '#4F46E5' },
  'Entertainment': { bg: 'rgba(167,139,250,0.15)', text: '#7C3AED' },
  'Healthcare': { bg: 'rgba(52,211,153,0.15)', text: '#059669' },
  'Shopping': { bg: 'rgba(255,201,74,0.15)', text: '#D97706' },
  'Education': { bg: 'rgba(249,115,22,0.15)', text: '#EA580C' },
  'Utilities': { bg: 'rgba(148,163,184,0.15)', text: '#64748B' },
  'Other': { bg: 'rgba(148,163,184,0.15)', text: '#64748B' },
};
