'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { formatCurrency, formatDate } from '@/lib/fakeData'; 
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

  // Local Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
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
      const res = await api.get(`/transactions?page=${pageNum}&limit=${limit}`);
      setTransactions(res.data.data || []);
      setTotalPages(res.data.pagination.total_pages || 1);
      setTotalItems(res.data.pagination.total_items || 0);
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

  // Lọc local trên trang hiện tại
  const filtered = transactions.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchCat = categoryFilter === 'all' || (t.Category && t.Category.id === categoryFilter);
    return matchSearch && matchType && matchCat;
  });

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

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

      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-icon-wrap" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={16} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: '40px' }} placeholder="Tìm kiếm trong trang hiện tại..." value={search} onChange={e => setSearch(e.target.value)} />
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
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Filter size={14} /> {filtered.length} kết quả
          </div>
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
                  {filtered.map(t => {
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
                  {filtered.length === 0 && (
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
