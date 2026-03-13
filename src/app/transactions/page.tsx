'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { transactions, formatCurrency, formatDate, CATEGORY_COLORS, type Transaction, type TransactionType, type Category } from '@/lib/fakeData';
import { Search, Plus, X, Filter, TrendingUp, TrendingDown, Calendar, CreditCard } from 'lucide-react';

const ALL_CATEGORIES: Category[] = [
  'Salary', 'Freelance', 'Investment', 'Bonus',
  'Food & Dining', 'Transport', 'Housing', 'Entertainment',
  'Healthcare', 'Shopping', 'Education', 'Utilities', 'Other'
];

const CATEGORY_ICONS: Record<string, string> = {
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Bonus': '🎁',
  'Food & Dining': '🍜', 'Transport': '🚗', 'Housing': '🏠',
  'Entertainment': '🎮', 'Healthcare': '💊', 'Shopping': '🛍️',
  'Education': '📚', 'Utilities': '⚡', 'Other': '📦',
};

interface AddTransactionFormState {
  title: string;
  amount: string;
  type: TransactionType;
  category: Category;
  date: string;
  note: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'E-Wallet';
}

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [localTxns, setLocalTxns] = useState<Transaction[]>(transactions);
  const [form, setForm] = useState<AddTransactionFormState>({
    title: '', amount: '', type: 'expense', category: 'Food & Dining',
    date: '2026-03-11', note: '', paymentMethod: 'Cash'
  });

  const filtered = localTxns.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchType && matchCat;
  });

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  function handleAddTransaction() {
    if (!form.title || !form.amount) return;
    const newTxn: Transaction = {
      id: `t${Date.now()}`,
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      note: form.note,
      paymentMethod: form.paymentMethod,
    };
    setLocalTxns([newTxn, ...localTxns]);
    setShowModal(false);
    setForm({ title: '', amount: '', type: 'expense', category: 'Food & Dining', date: '2026-03-11', note: '', paymentMethod: 'Cash' });
  }

  return (
    <AppLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Quản lý tất cả thu chi của bạn</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(45,212,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#2DD4BF" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Income (filtered)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0D9469' }}>+{formatCurrency(totalIncome, true)}</div>
          </div>
        </div>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,107,138,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={22} color="#FF6B8A" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Expense (filtered)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D63A5A' }}>-{formatCurrency(totalExpense, true)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={16} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: '40px' }} placeholder="Tìm kiếm giao dịch..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="toggle-group">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button key={t} className={`toggle-btn ${typeFilter === t ? (t === 'income' ? 'active-income' : t === 'expense' ? 'active-expense' : 'active-income') : ''}`}
                style={typeFilter === t && t === 'all' ? { background: 'var(--primary)', color: 'white' } : {}}
                onClick={() => setTypeFilter(t)}>
                {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>
          <select className="input" style={{ width: 'auto', minWidth: '150px' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Filter size={14} /> {filtered.length} results
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const catStyle = CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Other'];
                const isIncome = t.type === 'income';
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '10px', background: catStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                          {CATEGORY_ICONS[t.category] || '📦'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
                          {t.note && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.note}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: catStyle.bg, color: catStyle.text }}>{t.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(t.date)}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CreditCard size={12} /> {t.paymentMethod}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem', color: isIncome ? '#0D9469' : '#D63A5A' }}>
                        {isIncome ? '+' : '-'}{formatCurrency(t.amount, true)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <Search size={32} style={{ opacity: 0.3 }} />
                      <p>Không tìm thấy giao dịch nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', fontWeight: 700 }}>Add Transaction</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Type</label>
              <div className="toggle-group">
                <button className={`toggle-btn ${form.type === 'income' ? 'active-income' : ''}`} onClick={() => setForm({ ...form, type: 'income' })}>
                  💰 Income
                </button>
                <button className={`toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`} onClick={() => setForm({ ...form, type: 'expense' })}>
                  💸 Expense
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input className="input" placeholder="e.g. Grab Bike" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Amount (₫)</label>
                <input className="input" type="number" placeholder="e.g. 50000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })}>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Payment Method</label>
              <select className="input" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as any })}>
                {['Cash', 'Bank Transfer', 'Credit Card', 'E-Wallet'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Note (optional)</label>
              <input className="input" placeholder="Ghi chú..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAddTransaction}>
                <Plus size={16} /> Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
