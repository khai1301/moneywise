'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Plus, Pencil, Trash2, X, Loader2, Target,
  AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const getMonthLabel = (m: string) => {
  const [y, mo] = m.split('-');
  return `Tháng ${mo}/${y}`;
};

interface Category { id: string; name: string; icon: string; color: string; type: string }

interface BudgetItem {
  id: string; categoryId: string; amount: number; month: string; note: string;
  spent: number; remaining: number; percentage: number;
  category: { id: string; name: string; icon: string; color: string };
}

const emptyForm = { categoryId: '', amount: '', month: '', note: '' };

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [cycleStart, setCycleStart] = useState('');
  const [cycleEnd, setCycleEnd] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );

  const prevMonth = () => {
    const d = new Date(`${selectedMonth}-01`);
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const d = new Date(`${selectedMonth}-01`);
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?month=${selectedMonth}`);
      setBudgets(res.data.data || []);
      setCycleStart(res.data.start || '');
      setCycleEnd(res.data.end || '');
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories((res.data.data || []).filter((c: Category) => c.type === 'expense' || c.type === 'both'));
    } catch {}
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, month: selectedMonth, categoryId: categories[0]?.id || '' });
    setShowModal(true);
  };
  const openEdit = (b: BudgetItem) => {
    setEditingId(b.id);
    setForm({ categoryId: b.categoryId, amount: String(b.amount), month: b.month, note: b.note || '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.categoryId || !form.amount || !form.month) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { categoryId: form.categoryId, amount: parseFloat(form.amount), month: form.month, note: form.note };
      if (editingId) await api.put(`/budgets/${editingId}`, payload);
      else await api.post('/budgets', payload);
      setShowModal(false);
      fetchBudgets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi khi lưu ngân sách');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa ngân sách "${name}"?`)) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa');
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget  = budgets.filter(b => b.percentage >= 100).length;

  const barColor = (pct: number) => pct >= 100 ? '#D63A5A' : pct >= 80 ? '#F59E0B' : '#0D9469';

  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Kiểm soát chi tiêu theo ngân sách hàng tháng</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Thêm Ngân Sách</button>
      </div>

      {/* Month Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '10px 20px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><ChevronLeft size={20} /></button>
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', minWidth: '130px', textAlign: 'center' }}>{getMonthLabel(selectedMonth)}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><ChevronRight size={20} /></button>
        </div>
        {cycleStart && cycleEnd && (
          <span style={{ background: 'var(--primary-light, rgba(99,102,241,0.1))', color: 'var(--primary)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            Hiệu lực: {new Date(cycleStart).toLocaleDateString('vi-VN')} - {new Date(cycleEnd).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Tổng ngân sách',   value: fmt(totalBudget),                        color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)',  icon: '🎯' },
          { label: 'Đã chi tiêu',      value: fmt(totalSpent),                         color: '#D63A5A',        bg: 'rgba(214,58,90,0.1)',   icon: '💸' },
          { label: 'Còn lại',          value: fmt(Math.max(0, totalBudget - totalSpent)), color: '#0D9469',      bg: 'rgba(13,148,105,0.1)', icon: '💚' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className="card card-sm" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
              <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert */}
      {overBudget > 0 && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', background: 'rgba(214,58,90,0.08)', border: '1px solid rgba(214,58,90,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="#D63A5A" />
          <span style={{ color: '#D63A5A', fontWeight: 600, fontSize: '0.88rem' }}>Có {overBudget} danh mục đã vượt ngân sách tháng này!</span>
        </div>
      )}

      {/* Budget Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="animate-spin" size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <Target size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chưa có ngân sách nào cho {getMonthLabel(selectedMonth)}.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openCreate}><Plus size={16} /> Tạo ngân sách đầu tiên</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {budgets.map(b => {
            const clampedPct = Math.min(b.percentage, 100);
            const color = barColor(b.percentage);
            return (
              <div key={b.id} className="card card-sm" style={{ padding: '20px 24px', borderLeft: `4px solid ${b.category?.color || 'var(--primary)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${b.category?.color || '#6366f1'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      {b.category?.icon || '📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.category?.name}</div>
                      {b.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.note}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEdit(b)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', padding: '5px 10px', color: 'var(--text-muted)' }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(b.id, b.category?.name)} style={{ background: 'none', border: '1px solid rgba(214,58,90,0.2)', borderRadius: '8px', cursor: 'pointer', padding: '5px 10px', color: '#D63A5A' }}><Trash2 size={14} /></button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.82rem', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Đã chi: <strong style={{ color }}>{fmt(b.spent)}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Ngân sách: <strong style={{ color: 'var(--text-primary)' }}>{fmt(b.amount)}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Còn lại: <strong style={{ color: b.remaining < 0 ? '#D63A5A' : '#0D9469' }}>{fmt(b.remaining)}</strong></span>
                </div>

                <div>
                  <div style={{ height: '10px', borderRadius: '20px', background: 'var(--bg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{
                      height: '100%', width: `${clampedPct}%`,
                      background: b.percentage >= 100
                        ? 'linear-gradient(90deg, #F59E0B, #D63A5A)'
                        : b.percentage >= 80
                          ? 'linear-gradient(90deg, #10b981, #F59E0B)'
                          : `linear-gradient(90deg, ${b.category?.color || 'var(--primary)'}, #10b981)`,
                      borderRadius: '20px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color, fontWeight: 700 }}>{b.percentage.toFixed(1)}%</span>
                    {b.percentage >= 100 && (
                      <span style={{ color: '#D63A5A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}><AlertTriangle size={11} /> Vượt {fmt(b.spent - b.amount)}</span>
                    )}
                    {b.percentage >= 80 && b.percentage < 100 && (
                      <span style={{ color: '#F59E0B', fontWeight: 600 }}>⚠️ Sắp hết</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins', fontSize: '1.2rem', fontWeight: 700 }}>{editingId ? '✏️ Sửa Ngân Sách' : '🎯 Thêm Ngân Sách'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={22} /></button>
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Danh mục Chi tiêu *</label>
              <select className="input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Hạn mức ngân sách *</label>
              <input className="input" type="number" placeholder="500000" min="1000" step="10000"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                {form.amount ? `= ${fmt(Number(form.amount))}` : 'Nhập số tiền bằng VNĐ'}
              </span>
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Tháng áp dụng *</label>
              <input className="input" type="month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Ghi chú (tùy chọn)</label>
              <input className="input" placeholder="VD: Giảm ăn ngoài xuống..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button disabled={submitting} className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Hủy</button>
              <button disabled={submitting} className="btn btn-primary" style={{ flex: 2, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit}>
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
                {editingId ? 'Lưu thay đổi' : 'Tạo ngân sách'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
