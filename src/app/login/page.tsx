'use client';
import { useState } from 'react';
import { Mail, Lock, Check, User, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isRegister) {
        await api.post('/auth/register', { name, email, password });
        setIsRegister(false);
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập bằng tài khoản vừa tạo.');
      } else {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Floating Shapes Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        overflow: 'hidden', zIndex: 0, pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute', top: '10%', right: '10%', width: 150, height: 150,
          borderRadius: '50%', background: 'var(--primary)', opacity: 0.15, filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '5%', width: 250, height: 250,
          borderRadius: '50%', background: 'var(--accent-purple)', opacity: 0.1, filter: 'blur(60px)'
        }} />
      </div>
      
      {/* Main Container */}
      <div className="login-container" style={{
        width: '100%',
        maxWidth: '1000px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.08)',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        border: '1px solid rgba(255,255,255,0.8)'
      }}>
        
        {/* Left Panel */}
        <div className="login-left" style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative shapes */}
          <div style={{
            position: 'absolute', top: '-10%', left: '-10%', width: 300, height: 300,
            borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <span style={{ fontSize: '2.5rem' }}>💰</span>
              <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: '2rem', margin: 0 }}>MoneyWise</h1>
            </div>
            <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '2.2rem', lineHeight: 1.2, marginBottom: '24px' }}>
              Take control of your financial future
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Track expenses effortlessly',
                'Set and achieve savings goals',
                'Insightful monthly reports'
              ].map((text, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', opacity: 0.9 }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Check size={14} strokeWidth={3} color="white" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Mini Dashboard Widget */}
          <div style={{
            position: 'relative', zIndex: 1, marginTop: '40px',
            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-lg)',
            padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transform: 'rotate(-2deg)', transition: 'transform 0.3s ease', cursor: 'pointer'
          }} onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(-2deg)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 500 }}>Total Balance</span>
            </div>
            <div style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '2.2rem', marginBottom: '16px', lineHeight: 1 }}>
              $12,450.00
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#A7F3D0', fontWeight: 500 }}>
              <span>↑ +12.5% from last month</span>
            </div>
          </div>
        </div>
        
        {/* Right Panel (Login Form) */}
        <div className="login-right" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 className="page-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>
                {isRegister ? 'Tạo Tài Khoản' : 'Welcome Back'}
              </h2>
              <p className="page-subtitle">
                {isRegister ? 'Đăng ký để sử dụng MoneyWise' : 'Đăng nhập vào tài khoản của bạn'}
              </p>
            </div>
            
            {error && (
              <div style={{ 
                padding: '12px', background: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', borderRadius: '8px', marginBottom: '20px', 
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                border: '1px solid rgba(239,68,68,0.2)'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{ 
                padding: '12px', background: 'rgba(34, 197, 94, 0.1)', 
                color: '#16a34a', borderRadius: '8px', marginBottom: '20px', 
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                border: '1px solid rgba(34,197,94,0.2)'
              }}>
                <Check size={18} />
                <span>{success}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isRegister && (
                <div className="input-group">
                  <label className="input-label">Tên của bạn</label>
                  <div className="input-icon-wrap">
                    <User className="input-icon" size={18} />
                    <input 
                      className="input" 
                      placeholder="Nguyễn Văn A" 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isRegister}
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-icon-wrap">
                  <Mail className="input-icon" size={18} />
                  <input 
                    className="input" 
                    placeholder="name@example.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Password</span>
                  {!isRegister && <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', textTransform: 'none', fontSize: '0.8rem' }}>Forgot?</a>}
                </label>
                <div className="input-icon-wrap">
                  <Lock className="input-icon" size={18} />
                  <input 
                    className="input" 
                    placeholder="Enter your password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Đang xử lý...' : (isRegister ? 'Đăng Ký' : 'Đăng Nhập')}
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                  <span style={{ padding: '0 16px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>
                
                <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}>
                  <img alt="Google" style={{ width: '20px', height: '20px' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCeAhRSwgeKNYW_0LpmiZMFHWh_GidsJzWFMAw1egyJ1JeKi2OAhLiY4GFvMXnuGkaL0v8upZCzlpzpwfyDwpSB9n3RnWfWU1GZslRl8a3NqTcQq9hGP-6rmXvpRJKi-Qqx8BSyTfUgX4erlQzn1P5-FdqkI8XTE3H07Y2GfHIgjeRWNxGp34hwYaY9z4RT8C0vnS0zkb9Tb9xVDkQCM9BL7W9Eki4hEQo5l6vcfdjhAiTTOs4NFr4xPgI0dTq_mNm_V7_fntB"/>
                  Continue with Google
                </button>
              </div>
            </form>
            
            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); setError(''); }} 
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', marginLeft: '6px', cursor: 'pointer' }}
                >
                  {isRegister ? "Đăng Nhập" : "Đăng Ký ngay"}
                </a>
            </div>
          </div>
        </div>
        
      </div>

      {/* Media Queries implementation for React Inline Styles */}
      <style>{`
        .login-container { min-height: 600px; height: 80vh; border-radius: var(--radius-xl); flex-direction: row; }
        .login-left { flex: 1.2; padding: 48px; }
        .login-right { flex: 1; padding: 48px; }
        
        @media (max-width: 992px) {
          .card { padding: 30px 24px !important; }
        }
        @media (max-width: 768px) {
          .login-container { flex-direction: column !important; height: auto !important; min-height: 100vh !important; border-radius: 0 !important; border: none; }
          .login-left { flex: none !important; padding: 32px 24px !important; }
          .login-right { flex: none !important; padding: 32px 16px !important; }
        }
      `}</style>
    </div>
  );
}
