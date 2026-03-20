'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, Pencil, Trash2, X, Loader2, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

const EMOJI_OPTIONS = ['🍜','🏠','🚗','🛍️','💊','🎮','📚','⚡','📦','💼','💻','📈','🎁','✈️','🐾','💰','🎉','🔑','📱','💎'];

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  description: string;
  isSystem: boolean;
}

interface FormState {
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  description: string;
}

const PRESET_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e',
  '#f59e0b','#10b981','#14b8a6','#3b82f6',
  '#64748b','#84cc16','#f97316','#e11d48',
];

const initialForm: FormState = {
  name: '', type: 'expense', icon: '📦', color: '#6366f1', description: ''
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || '📦',
      color: cat.color || '#6366f1',
      description: cat.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi khi lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.isSystem) {
      alert('Không thể xóa danh mục hệ thống!');
      return;
    }
    if (!confirm(`Xóa danh mục "${cat.name}"? Các giao dịch liên quan có thể bị ảnh hưởng.`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa danh mục này');
    }
  };

  const filtered = categories.filter(c => filterType === 'all' || c.type === filterType || c.type === 'both');
  const incomeCount = categories.filter(c => c.type === 'income' || c.type === 'both').length;
  const expenseCount = categories.filter(c => c.type === 'expense' || c.type === 'both').length;

  return (
    <AppLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Quản lý danh mục thu chi của bạn ({categories.length} danh mục)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Thêm Danh Mục
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(45,212,191,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#2DD4BF" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Danh mục Thu Nhập</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0D9469' }}>{incomeCount} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>danh mục</span></div>
          </div>
        </div>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,107,138,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={22} color="#FF6B8A" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Danh mục Chi Tiêu</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D63A5A' }}>{expenseCount} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>danh mục</span></div>
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div style={{ marginBottom: '20px' }}>
        <div className="toggle-group">
          {(['all', 'income', 'expense'] as const).map(t => (
            <button key={t} className={`toggle-btn ${filterType === t ? (t === 'income' ? 'active-income' : t === 'expense' ? 'active-expense' : 'active-income') : ''}`}
              style={filterType === t && t === 'all' ? { background: 'var(--primary)', color: 'white' } : {}}
              onClick={() => setFilterType(t)}>
              {t === 'all' ? '🏷️ Tất cả' : t === 'income' ? '💰 Thu nhập' : '💸 Chi tiêu'}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="animate-spin" size={36} color="var(--primary)" style={{ margin: '0 auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <Tag size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chưa có danh mục nào. Hãy tạo mới!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map(cat => (
            <div key={cat.id} className="card card-sm" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', borderLeft: `4px solid ${cat.color || '#6366f1'}` }}>
              {/* System badge */}
              {cat.isSystem && (
                <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.65rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                  Hệ thống
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${cat.color || '#6366f1'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                  {cat.icon || '📦'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</div>
                  <span className="badge" style={{
                    background: cat.type === 'income' ? 'rgba(13,148,105,0.1)' : cat.type === 'expense' ? 'rgba(214,58,90,0.1)' : 'rgba(99,102,241,0.1)',
                    color: cat.type === 'income' ? '#0D9469' : cat.type === 'expense' ? '#D63A5A' : '#6366f1',
                    fontSize: '0.7rem',
                    marginTop: '4px'
                  }}>
                    {cat.type === 'income' ? '💰 Thu nhập' : cat.type === 'expense' ? '💸 Chi tiêu' : '↕️ Cả hai'}
                  </span>
                </div>
              </div>

              {cat.description && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{cat.description}</p>
              )}

              {/* Actions */}
              {!cat.isSystem && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, padding: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }} onClick={() => openEditModal(cat)}>
                    <Pencil size={13} /> Sửa
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', color: '#D63A5A', borderColor: 'rgba(214,58,90,0.2)' }} onClick={() => handleDelete(cat)} title="Xóa">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins', fontSize: '1.2rem', fontWeight: 700 }}>
                {editingId ? '✏️ Sửa Danh Mục' : '✨ Thêm Danh Mục Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Loại danh mục</label>
              <div className="toggle-group">
                {(['income', 'expense', 'both'] as const).map(t => (
                  <button key={t} className={`toggle-btn ${form.type === t ? (t === 'income' ? 'active-income' : t === 'expense' ? 'active-expense' : 'active-income') : ''}`}
                    style={form.type === t && t === 'both' ? { background: 'var(--primary)', color: 'white' } : {}}
                    onClick={() => setForm({ ...form, type: t })}>
                    {t === 'income' ? '💰 Thu nhập' : t === 'expense' ? '💸 Chi tiêu' : '↕️ Cả hai'}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Tên danh mục *</label>
              <input className="input" placeholder="VD: Ăn uống, Di chuyển..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            {/* Emoji & Color row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group">
                <label className="input-label">Icon (Emoji)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  {EMOJI_OPTIONS.map(emoji => (
                    <button key={emoji} onClick={() => setForm({ ...form, icon: emoji })}
                      style={{ fontSize: '1.2rem', width: 34, height: 34, borderRadius: '8px', border: '2px solid', cursor: 'pointer', background: form.icon === emoji ? `${form.color}30` : 'transparent', borderColor: form.icon === emoji ? form.color : 'transparent' }}>
                      {emoji}
                    </button>
                  ))}
                  <input className="input" maxLength={2} placeholder="✍️" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} style={{ width: 34, height: 34, padding: '0', textAlign: 'center', fontSize: '1rem' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Màu sắc</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  {PRESET_COLORS.map(color => (
                    <button key={color} onClick={() => setForm({ ...form, color })}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: color, border: form.color === color ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === color ? `0 0 0 2px ${color}` : 'none' }} />
                  ))}
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 28, height: 28, padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none' }} title="Chọn màu tùy chỉnh" />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px dashed ${form.color}40`, borderRadius: '12px', marginBottom: '16px', background: `${form.color}08` }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${form.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{form.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: form.color }}>{form.name || 'Tên danh mục...'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Xem trước</div>
              </div>
            </div>

            {/* Description */}
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Mô tả (Tùy chọn)</label>
              <input className="input" placeholder="Ghi chú thêm về danh mục này..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button disabled={submitting} className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Hủy</button>
              <button disabled={submitting} className="btn btn-primary" style={{ flex: 2, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit}>
                {submitting ? <Loader2 className="animate-spin" size={16} /> : (editingId ? <Pencil size={16} /> : <Plus size={16} />)}
                {editingId ? 'Lưu thay đổi' : 'Tạo danh mục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
