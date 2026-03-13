'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { categoryDefs as initialCategories, transactions, type CategoryDef, type TransactionType } from '@/lib/fakeData';
import { Plus, X, Pencil, Trash2, Tag, TrendingUp, TrendingDown, ArrowLeftRight, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#4BB3FD', '#2DD4BF', '#A78BFA', '#FF6B8A',
  '#FFC94A', '#F97316', '#34D399', '#6366F1',
  '#94A3B8', '#EC4899', '#EF4444', '#10B981',
];

const PRESET_ICONS = [
  '💼', '💻', '📈', '🎁', '🍜', '🚗', '🏠', '🎮',
  '💊', '🛍️', '📚', '⚡', '📦', '✈️', '🎵', '🍕',
  '☕', '🏋️', '🐾', '🎓', '🏥', '🛒', '🎯', '💰',
  '📱', '🔧', '🌿', '🎨', '📷', '🚀',
];

type FilterType = 'all' | TransactionType;

interface FormState {
  name: string;
  type: TransactionType | 'both';
  icon: string;
  color: string;
  description: string;
}

const emptyForm: FormState = {
  name: '', type: 'expense', icon: '📦', color: '#4BB3FD', description: '',
};

export default function SettingsPage() {
  const [categories, setCategories] = useState<CategoryDef[]>(initialCategories);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Count transactions per category
  const txnCount = (catName: string) =>
    transactions.filter(t => t.category === catName).length;

  const filtered = categories.filter(c =>
    filter === 'all' || c.type === filter || c.type === 'both'
  );

  const incomeCount = categories.filter(c => c.type === 'income').length;
  const expenseCount = categories.filter(c => c.type === 'expense').length;
  const bothCount = categories.filter(c => c.type === 'both').length;

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(cat: CategoryDef) {
    setEditingId(cat.id);
    setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color, description: cat.description || '' });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingId) {
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
    } else {
      const newCat: CategoryDef = {
        id: `c${Date.now()}`,
        name: form.name.trim(),
        type: form.type,
        icon: form.icon,
        color: form.color,
        description: form.description,
      };
      setCategories(prev => [...prev, newCat]);
    }
    setShowModal(false);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteConfirmId(null);
  }

  const typeLabel: Record<string, string> = {
    income: 'Income', expense: 'Expense', both: 'Both',
  };
  const typeBadgeStyle: Record<string, { bg: string; color: string }> = {
    income: { bg: 'rgba(45,212,191,0.15)', color: '#0D9469' },
    expense: { bg: 'rgba(255,107,138,0.15)', color: '#D63A5A' },
    both: { bg: 'rgba(75,179,253,0.15)', color: '#1E90DB' },
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Category Manager</h1>
          <p className="page-subtitle">Quản lý các danh mục thu chi của bạn</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> New Category
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Income Categories', count: incomeCount, icon: TrendingUp, color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)' },
          { label: 'Expense Categories', count: expenseCount, icon: TrendingDown, color: '#FF6B8A', bg: 'rgba(255,107,138,0.12)' },
          { label: 'Total Categories', count: categories.length, icon: Tag, color: '#4BB3FD', bg: 'rgba(75,179,253,0.12)' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={s.color} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
                <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.count}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['all', 'income', 'expense'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn"
            style={{
              padding: '7px 18px',
              fontSize: '0.85rem',
              background: filter === f
                ? (f === 'income' ? 'linear-gradient(135deg,#2DD4BF,#0D9469)' : f === 'expense' ? 'linear-gradient(135deg,#FF6B8A,#D63A5A)' : 'linear-gradient(135deg,#4BB3FD,#1E90DB)')
                : 'var(--card-bg)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: filter === f ? 'none' : '1.5px solid var(--border)',
              boxShadow: filter === f ? 'var(--shadow-clay-sm)' : 'none',
            }}
          >
            {f === 'all' ? `All (${categories.length})` : f === 'income' ? `Income (${incomeCount})` : `Expense (${expenseCount})`}
          </button>
        ))}
      </div>

      {/* Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map(cat => {
          const count = txnCount(cat.name);
          const isDeleting = deleteConfirmId === cat.id;
          const badgeStyle = typeBadgeStyle[cat.type];
          return (
            <div
              key={cat.id}
              className="card"
              style={{
                padding: '20px',
                position: 'relative',
                borderLeft: `4px solid ${cat.color}`,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Category Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '14px',
                  background: `${cat.color}18`,
                  border: `2px solid ${cat.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', flexShrink: 0,
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{cat.name}</h3>
                    <span className="badge" style={{ background: badgeStyle.bg, color: badgeStyle.color, fontSize: '0.65rem', padding: '2px 8px' }}>
                      {typeLabel[cat.type]}
                    </span>
                  </div>
                  {cat.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{cat.description}</p>
                  )}
                </div>
              </div>

              {/* Transaction Count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <ArrowLeftRight size={13} />
                  <span>{count > 0 ? `${count} transaction${count > 1 ? 's' : ''}` : 'No transactions yet'}</span>
                </div>

                {/* Color Dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                  <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{cat.color}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isDeleting ? (
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
                    onClick={() => openEditModal(cat)}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    className="btn"
                    style={{
                      flex: 1, padding: '7px', fontSize: '0.8rem',
                      background: count > 0 ? 'rgba(148,163,184,0.1)' : 'rgba(255,107,138,0.1)',
                      color: count > 0 ? 'var(--text-muted)' : '#D63A5A',
                      border: `1.5px solid ${count > 0 ? 'var(--border)' : 'rgba(255,107,138,0.3)'}`,
                      cursor: count > 0 ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => count === 0 && setDeleteConfirmId(cat.id)}
                    title={count > 0 ? `Cannot delete — ${count} transactions use this category` : 'Delete category'}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,107,138,0.3)' }}>
                  <p style={{ fontSize: '0.78rem', color: '#D63A5A', fontWeight: 600, marginBottom: '10px', textAlign: 'center' }}>
                    Xác nhận xóa category này?
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost" style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }} onClick={() => setDeleteConfirmId(null)}>
                      <X size={14} /> Cancel
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }} onClick={() => handleDelete(cat.id)}>
                      <Trash2 size={14} /> Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card empty-state">
              <Tag size={32} style={{ opacity: 0.3 }} />
              <p>Không có category nào</p>
              <button className="btn btn-primary" onClick={openAddModal}><Plus size={16} /> Thêm mới</button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Add/Edit Modal ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '540px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', fontWeight: 700 }}>
                  {editingId ? 'Edit Category' : 'New Category'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {editingId ? 'Chỉnh sửa thông tin danh mục' : 'Tạo danh mục thu chi mới'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            {/* Preview */}
            <div style={{
              background: 'var(--primary-ultra-light)', borderRadius: '16px', padding: '16px',
              display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px',
              border: `2px solid ${form.color}30`,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: '14px', background: `${form.color}20`, border: `2px solid ${form.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {form.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {form.name || 'Category Name'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {form.description || 'Description...'}
                </div>
                <span className="badge" style={{ background: typeBadgeStyle[form.type]?.bg, color: typeBadgeStyle[form.type]?.color, fontSize: '0.65rem', marginTop: '4px' }}>
                  {typeLabel[form.type]}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Category Name *</label>
                <input className="input" placeholder="e.g. Food & Dining" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Type</label>
                <div className="toggle-group">
                  {(['income', 'expense', 'both'] as const).map(t => (
                    <button
                      key={t}
                      className={`toggle-btn ${form.type === t ? (t === 'income' ? 'active-income' : t === 'expense' ? 'active-expense' : '') : ''}`}
                      style={form.type === t && t === 'both' ? { background: 'var(--primary)', color: 'white' } : {}}
                      onClick={() => setForm({ ...form, type: t })}
                    >
                      {t === 'income' ? '↑' : t === 'expense' ? '↓' : '↕'} {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input className="input" placeholder="Optional description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            {/* Color Picker */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    style={{
                      width: 28, height: 28, borderRadius: '8px', background: color,
                      border: form.color === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'pointer', transition: 'transform 0.15s ease', position: 'relative',
                      transform: form.color === color ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {form.color === color && (
                      <Check size={14} color="white" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{ width: 28, height: 28, borderRadius: '8px', border: '1.5px solid var(--border)', cursor: 'pointer', padding: '1px', background: 'none' }}
                  title="Custom color"
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Icon</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                {PRESET_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: '10px', fontSize: '1.1rem',
                      border: form.icon === icon ? `2px solid ${form.color}` : '1.5px solid var(--border)',
                      background: form.icon === icon ? `${form.color}15` : 'var(--card-bg)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      transform: form.icon === icon ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2, opacity: form.name.trim() ? 1 : 0.5, cursor: form.name.trim() ? 'pointer' : 'not-allowed' }}
                onClick={handleSave}
              >
                <Check size={16} /> {editingId ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
