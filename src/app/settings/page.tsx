'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { User, Lock, LogOut, Check, Loader2, Save } from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile State
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '' });

  // Password State
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => {
    let cancelled = false;
    setLoadingProfile(true);
    api.get('/users/profile')
      .then(res => {
        if (!cancelled) setProfile({ name: res.data.data.name, email: res.data.data.email });
      })
      .catch((err) => {
        if (err.response?.status === 401) router.push('/login');
      })
      .finally(() => { if (!cancelled) setLoadingProfile(false); });
    return () => { cancelled = true; };
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) return alert('Tên không được để trống!');
    
    setSavingProfile(true);
    try {
      await api.put('/users/profile', { name: profile.name });
      alert('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return alert('Mật khẩu mới không khớp!');
    }
    if (passwords.new.length < 6) {
      return alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
    }

    setSavingPassword(true);
    try {
      await api.put('/users/change-password', {
        oldPassword: passwords.old,
        newPassword: passwords.new,
      });
      alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      handleLogout(); // Logout on password change for security
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi khi đổi mật khẩu');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Quản lý tài khoản cá nhân và bảo mật</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <User size={18} /> Hồ sơ cá nhân
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'security' ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Lock size={18} /> Bảo mật
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontFamily: 'Poppins', fontSize: '1.15rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', color: 'var(--primary)' }}><User size={20} /></div>
              Thông tin chung
            </h2>
            
            {loadingProfile ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div className="input-group">
                    <label className="input-label">Tên hiển thị</label>
                    <input
                      className="input"
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      placeholder="VD: Alex Nguyen"
                      required
                    />
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label">Email (Không thể thay đổi)</label>
                    <input
                      className="input"
                      type="email"
                      value={profile.email}
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                      {savingProfile ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontFamily: 'Poppins', fontSize: '1.15rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', color: '#F59E0B' }}><Lock size={20} /></div>
              Đổi mật khẩu
            </h2>

            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Mật khẩu hiện tại</label>
                  <input
                    className="input"
                    type="password"
                    value={passwords.old}
                    onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Mật khẩu mới</label>
                  <input
                    className="input"
                    type="password"
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Xác nhận mật khẩu mới</label>
                  <input
                    className="input"
                    type="password"
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button type="submit" disabled={savingPassword} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#F59E0B' }}>
                    {savingPassword ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div className="card" style={{ padding: '32px', border: '1px solid rgba(214,58,90,0.3)', background: 'rgba(214,58,90,0.02)' }}>
          <h2 style={{ fontFamily: 'Poppins', fontSize: '1.15rem', marginBottom: '16px', color: '#D63A5A' }}>
            Khu vực nguy hiểm
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Bạn muốn thoát khỏi tài khoản thiết bị này?
          </p>
          <button onClick={handleLogout} className="btn" style={{ background: '#D63A5A', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Đăng xuất ngay
          </button>
        </div>

      </div>
    </AppLayout>
  );
}
