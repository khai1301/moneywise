'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { formatCurrency, formatDate } from '@/lib/utils'; 
import { Search, Plus, X, Filter, TrendingUp, TrendingDown, Calendar, CreditCard, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const buildQueryParams = (pageNum: number) => {
    const params = new URLSearchParams({
      page: String(pageNum),
      limit: String(limit),
    });
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (categoryFilter !== 'all') params.set('category_id', categoryFilter);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    return params.toString();
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchTransactions(1);
  };

  const handleClearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', amount: '', type: 'expense' as 'income' | 'expense', categoryId: '',
    date: new Date().toISOString().split('T')[0], note: '', paymentMethod: 'Cash'
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats = res.data.data || [];
      setCategories(cats);
    } catch (error) {
       console.error("Failed to load categories")
    }
  };

  const fetchTransactions = async (pageNum: number) => {
    try {
      setLoading(true);
      const params = buildQueryParams(pageNum);
      const res = await api.get(`/transactions?${params}`);
      setTransactions(res.data.data || []);
      setTotalPages(res.data.pagination?.total_pages || 1);
      setTotalItems(res.data.pagination?.total_items || 0);
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions(page);
  }, [page, router]);

  // Open modal and set default category
  const openModal = () => {
    const expenseCats = categories.filter(c => c.type === 'expense');
    setForm(prev => ({
      ...prev,
      type: 'expense',
      categoryId: expenseCats.length > 0 ? expenseCats[0].id : '',
      date: new Date().toISOString().split('T')[0]
    }));
    setShowModal(true);
  };

  const handleTypeToggle = (type: 'income' | 'expense') => {
    const matchingCats = categories.filter(c => c.type === type);
    setForm({ 
       ...form, 
       type, 
       categoryId: matchingCats.length > 0 ? matchingCats[0].id : '' 
    });
  };

  const handleAddTransaction = async () => {
    if (!form.title || !form.amount || !form.categoryId) {
      alert("Vui lòng điền đủ Title, Amount và Category!");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transactions', {
        title: form.title,
        amount: parseFloat(form.amount),
        type: form.type,
        categoryId: form.categoryId,
        date: new Date(form.date).toISOString(), 
        note: form.note || "",
        paymentMethod: form.paymentMethod
      });
      setShowModal(false);
      setForm({ ...form, title: '', amount: '', note: '' }); 
      setPage(1);
      fetchTransactions(1);
    } catch (err: any) {
      alert(err.response?.data?.error || "Lỗi khi thêm giao dịch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá giao dịch này?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions(page);
    } catch (err) {
      alert('Không thể xoá giao dịch');
    }
  };

  // Filters are now server-side; just calculate page-level income/expense for the summary cards
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);

  return (
    <AppLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Quản lý tất cả thu chi của bạn ({totalItems} giao dịch tìm thấy)</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: '20px' }}>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(45,212,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#2DD4BF" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Income (Current Page)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0D9469' }}>+{formatCurrency(totalIncome, true)}</div>
          </div>
        </div>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,107,138,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={22} color="#FF6B8A" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Expense (Current Page)</div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D63A5A' }}>-{formatCurrency(totalExpense, true)}</div>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="card" style={{
        marginBottom: '20px',
        padding: '0',
        overflow: 'hidden',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
      }}>
        {/* Top strip */}
        <div style={{
          padding: '14px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card-bg)',
        }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
            <Filter size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bộ lọc</span>
          </div>

          {/* Pill-style type filter */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            {(['all', 'income', 'expense'] as const).map(t => {
              const isActive = typeFilter === t;
              const colors = {
                all:     { bg: 'var(--primary)', text: 'white' },
                income:  { bg: '#0D9469',         text: 'white' },
                expense: { bg: '#D63A5A',          text: 'white' },
              };
              return (
                <button key={t} onClick={() => setTypeFilter(t)} style={{
                  padding: '5px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.18s ease',
                  background: isActive ? colors[t].bg : 'transparent',
                  color: isActive ? colors[t].text : 'var(--text-muted)',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}>
                  {t === 'all' ? 'Tất cả' : t === 'income' ? '↑ Thu nhập' : '↓ Chi tiêu'}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

          {/* Category select — custom styled */}
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                width: '100%',
                padding: '7px 32px 7px 12px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--bg)',
                color: categoryFilter !== 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: categoryFilter !== 'all' ? 700 : 400,
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
              }}>
              <option value="all">🏷️ Tất cả danh mục</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.7rem' }}>▾</span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Result count badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--primary-light, rgba(99,102,241,0.08))',
            color: 'var(--primary)',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}>
            <span style={{ opacity: 0.7 }}>📋</span> {totalItems} giao dịch
          </div>
        </div>

        {/* Bottom strip — Date range */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          background: 'var(--bg)',
        }}>
          <Calendar size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Khoảng thời gian</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{
                padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--card-bg)', color: 'var(--text-primary)',
                fontSize: '0.82rem', outline: 'none', cursor: 'pointer', minWidth: '140px',
              }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{
                padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--card-bg)', color: 'var(--text-primary)',
                fontSize: '0.82rem', outline: 'none', cursor: 'pointer', minWidth: '140px',
              }} />
          </div>

          {/* Apply button */}
          <button onClick={handleApplyFilters} style={{
            padding: '7px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
            transition: 'opacity 0.15s',
          }}>
            🔍 Áp dụng
          </button>

          {/* Clear badge */}
          {(typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate) && (
            <button onClick={handleClearFilters} style={{
              padding: '7px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s',
            }}>
              ✕ Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center', width: '60px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => {
                    const catName = t.Category?.name || 'Other';
                    const catColor = t.Category?.color || '#ccc';
                    const catIcon = t.Category?.icon || '📝';
                    const isIncome = t.type === 'income';

                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${catColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                              {catIcon}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
                              {t.note && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.note}</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: `${catColor}15`, color: catColor }}>{catName}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                            title="Xóa giao dịch"
                          >
                            <Trash2 size={16} color="var(--accent-red)" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6}>
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
            
            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px', borderTop: '1px solid var(--border)' }}>
                <button 
                  className="btn btn-ghost" 
                  disabled={page <= 1} 
                  onClick={() => setPage(page - 1)}
                  style={{ opacity: page <= 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} /> Trang trước
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Trang {page} / {totalPages}
                </span>
                <button 
                  className="btn btn-ghost" 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(page + 1)}
                  style={{ opacity: page >= totalPages ? 0.5 : 1 }}
                >
                  Trang sau <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', fontWeight: 700 }}>Thêm Giao Dịch</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Bạn muốn ghi nhận khoản nào?</label>
              <div className="toggle-group">
                <button className={`toggle-btn ${form.type === 'income' ? 'active-income' : ''}`} onClick={() => handleTypeToggle('income')}>
                  💰 Thu Nhập
                </button>
                <button className={`toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`} onClick={() => handleTypeToggle('expense')}>
                  💸 Khoản Chi
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group">
                <label className="input-label">Tiêu đề</label>
                <input className="input" placeholder="VD: Mua cafe..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Số tiền (₫)</label>
                <input className="input" type="number" placeholder="50000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group">
                <label className="input-label">Danh mục</label>
                <select className="input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  {categories.filter(c => c.type === form.type).length === 0 && <option value="" disabled>-- Chưa có danh mục --</option>}
                  {categories.filter(c => c.type === form.type).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Ngày giao dịch</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Phương thức thanh toán</label>
              <select className="input" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as any })}>
                {['Cash', 'Bank Transfer', 'Credit Card', 'E-Wallet'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Ghi chú (Tùy chọn)</label>
              <input className="input" placeholder="Bạn có thể ghi chú thêm..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button disabled={submitting} className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Hủy</button>
              <button disabled={submitting} className="btn btn-primary" style={{ flex: 2, opacity: submitting ? 0.7 : 1 }} onClick={handleAddTransaction}>
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Lưu Giao Dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
