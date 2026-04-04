'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Plus, CreditCard, Landmark, Banknote, Edit3, Trash2, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit';
  balance: number;
  icon: string;
  color: string;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    initialBalance: '',
    icon: 'Wallet',
    color: '#4BB3FD'
  });

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallets');
      setWallets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const openModal = (wallet?: Wallet) => {
    if (wallet) {
      setEditingWallet(wallet);
      setFormData({
        name: wallet.name,
        type: wallet.type,
        initialBalance: wallet.balance.toString(),
        icon: wallet.icon || 'Wallet',
        color: wallet.color || '#4CAF50'
      });
    } else {
      setEditingWallet(null);
      setFormData({
        name: '',
        type: 'cash',
        initialBalance: '',
        icon: 'Wallet',
        color: '#4BB3FD'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWallet(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWallet) {
        await api.put(`/wallets/${editingWallet.id}`, {
          name: formData.name,
          type: formData.type,
          icon: formData.icon,
          color: formData.color,
        });
      } else {
        await api.post('/wallets', {
          name: formData.name,
          type: formData.type,
          icon: formData.icon,
          color: formData.color,
          initialBalance: parseFloat(formData.initialBalance || '0')
        });
      }
      closeModal();
      fetchWallets();
    } catch (error) {
      console.error("Error saving wallet:", error);
      alert("Lỗi khi lưu ví");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa ví này?")) {
      try {
        await api.delete(`/wallets/${id}`);
        fetchWallets();
      } catch (err) {
        console.error(err);
        alert("Lỗi khi xóa ví");
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark size={20} />;
      case 'credit': return <CreditCard size={20} />;
      default: return <Banknote size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank': return 'Ngân hàng';
      case 'credit': return 'Thẻ tín dụng';
      default: return 'Tiền mặt';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Wallets & Accounts</h1>
          <p className="page-subtitle">Quản lý tất cả tài khoản và ví nguồn của bạn</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Thêm ví mới
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none' }}>
        <div style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wallet size={18} /> Tổng tài sản (Net Worth)
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'JetBrains Mono', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {formatCurrency(totalBalance, true)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {wallets.map(wallet => (
          <div key={wallet.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
              background: wallet.color || 'var(--primary)'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '12px',
                  background: `${wallet.color || 'var(--primary)'}15`,
                  color: wallet.color || 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {getTypeIcon(wallet.type)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{wallet.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getTypeLabel(wallet.type)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openModal(wallet)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                  <Edit3 size={16} />
                </button>
                {wallets.length > 1 && (
                  <button onClick={() => handleDelete(wallet.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Số dư hiện tại</div>
              <div style={{
                fontSize: '1.5rem', fontWeight: 700, fontFamily: 'JetBrains Mono',
                color: wallet.balance < 0 ? 'var(--danger)' : 'var(--text-primary)'
              }}>
                {formatCurrency(wallet.balance, true)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', fontWeight: 700 }}>{editingWallet ? 'Chỉnh sửa ví' : 'Thêm ví mới'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Tên ví</label>
                <input
                  className="input"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Techcombank, Tiền mặt..."
                />
              </div>

              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Loại tài khoản</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank">Tài khoản ngân hàng</option>
                  <option value="credit">Thẻ tín dụng (Credit Card)</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Màu sắc nhận diện</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#4BB3FD', '#A78BFA', '#2DD4BF', '#FFC94A', '#FF6B8A', '#34D399', '#ff9f43', '#1dd1a1'].map(color => (
                    <div
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', background: color, cursor: 'pointer',
                        border: formData.color === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                        transition: 'transform 0.15s',
                        transform: formData.color === color ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {!editingWallet && (
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label className="input-label">Số dư ban đầu</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                    placeholder="0"
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Chỉ nhập số dư ban đầu khi tạo mới. Về sau số dư sẽ được tự động tính toán từ các giao dịch.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingWallet ? 'Lưu thay đổi' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
