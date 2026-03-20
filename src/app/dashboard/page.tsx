'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import {
  monthlyData, formatCurrency, CATEGORY_COLORS, getSummary
} from '@/lib/fakeData';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1.5px solid var(--border-card)',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <p style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: '0.8rem', color: p.color, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value, true)}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    recentTxns: [],
    summary: { balance: 0, income: 0, expense: 0, savingsRate: 0 },
    categoryData: [] as any[],
    monthlyData: monthlyData, // Still using fake historical data for now
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/transactions?limit=100');
        const txns = res.data.data || [];
        
        let income = 0;
        let expense = 0;
        const catMap = new Map();

        txns.forEach((t: any) => {
          if (t.type === 'income') income += t.amount;
          if (t.type === 'expense') {
            expense += t.amount;
            const catName = t.Category?.name || 'Other';
            const catColor = t.Category?.color || CATEGORY_COLORS['Other']?.bg || '#ccc';
            const curr = catMap.get(catName) || { name: catName, value: 0, color: catColor };
            curr.value += t.amount;
            catMap.set(catName, curr);
          }
        });

        const balance = income - expense;
        const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
        
        const catArray = Array.from(catMap.values()).map(c => ({
          ...c,
          pct: expense > 0 ? Math.round((c.value / expense) * 100) : 0
        })).sort((a, b) => b.value - a.value);

        setData({
          recentTxns: txns.slice(0, 6),
          summary: { balance, income, expense, savingsRate },
          categoryData: catArray,
          monthlyData: monthlyData,
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/login');
        }
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  const statCards = [
    {
      label: 'Total Balance', value: formatCurrency(data.summary.balance, true),
      icon: Wallet, color: '#4BB3FD', bgColor: 'rgba(75,179,253,0.12)',
      trend: 'Auto', trendDir: data.summary.balance >= 0 ? 'up' : 'down', trendLabel: 'current',
    },
    {
      label: 'Total Income', value: formatCurrency(data.summary.income, true),
      icon: TrendingUp, color: '#2DD4BF', bgColor: 'rgba(45,212,191,0.12)',
      trend: 'API', trendDir: 'up', trendLabel: 'live data',
    },
    {
      label: 'Total Expense', value: formatCurrency(data.summary.expense, true),
      icon: TrendingDown, color: '#FF6B8A', bgColor: 'rgba(255,107,138,0.12)',
      trend: 'API', trendDir: 'down', trendLabel: 'live data',
    },
    {
      label: 'Savings Rate', value: `${data.summary.savingsRate}%`,
      icon: PiggyBank, color: '#A78BFA', bgColor: 'rgba(167,139,250,0.12)',
      trend: 'API', trendDir: 'up', trendLabel: 'live data',
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
          <p style={{ color: 'var(--text-secondary)' }}>Đang đồng bộ dữ liệu thật từ Server...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard (Live API)</h1>
        <p className="page-subtitle">Dữ liệu thật của bạn được load từ Go Backend Render.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isUp = card.trendDir === 'up';
          const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={card.label} className="stat-card">
              <div
                className="stat-icon"
                style={{ background: card.bgColor }}
              >
                <Icon size={22} color={card.color} strokeWidth={2.5} />
              </div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value font-mono">{card.value}</div>
              <span className={`stat-trend ${isUp ? 'up' : 'down'}`}>
                <TrendIcon size={13} />
                {card.trend} <span style={{ fontWeight: 400, opacity: 0.8 }}>{card.trendLabel}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Income vs Expense (Demo)</div>
          <div className="chart-subtitle">Biểu đồ đang dùng fake data do API Analytics chưa phát triển</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,179,253,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9BB4CC', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9BB4CC', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'Inter', paddingTop: 8 }} />
              <Line type="monotone" dataKey="income" name="Income" stroke="#4BB3FD" strokeWidth={2.5} dot={{ r: 3, fill: '#4BB3FD' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="#FF6B8A" strokeWidth={2.5} dot={{ r: 3, fill: '#FF6B8A' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Spending by Category</div>
          <div className="chart-subtitle">Tính toán tự động từ Giao dịch thật</div>
          {data.categoryData.length === 0 ? (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Chưa có giao dịch chi tiêu nào</div>
          ) : (
             <>
               <ResponsiveContainer width="100%" height={180}>
                 <PieChart>
                   <Pie
                     data={data.categoryData.slice(0, 6)}
                     cx="50%" cy="50%"
                     innerRadius={55} outerRadius={80}
                     paddingAngle={3}
                     dataKey="value"
                   >
                     {data.categoryData.slice(0, 6).map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={entry.color || '#A78BFA'} stroke="none" />
                     ))}
                   </Pie>
                   <Tooltip formatter={(v: unknown) => formatCurrency(v as number, true)} />
                 </PieChart>
               </ResponsiveContainer>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                 {data.categoryData.slice(0, 4).map((c: any) => (
                   <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color || '#A78BFA', flexShrink: 0 }} />
                       <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.name}</span>
                     </div>
                     <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>{c.pct}%</span>
                   </div>
                 ))}
               </div>
             </>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <span className="section-title">Budget Overview (Demo)</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
            Tính năng Ngân sách chưa được tích hợp trong phiên bản MVP1.
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Transactions (Live API)</span>
            <a href="/transactions" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={14} />
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recentTxns.length === 0 && <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Bạn chưa tạo giao dịch nào.</span>}
            {data.recentTxns.map((t: any) => {
              const catName = t.Category?.name || 'Other';
              const catColor = t.Category?.color || '#ccc';
              const catIcon = t.Category?.icon || '📝';
              const isIncome = t.type === 'income';
              
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '12px',
                    background: `${catColor}20`, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}>
                    {catIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ background: `${catColor}15`, color: catColor, padding: '1px 6px', borderRadius: '5px', fontWeight: 600, fontSize: '0.68rem' }}>{catName}</span>
                      <span style={{ marginLeft: '6px' }}>{new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono', fontWeight: 700,
                    fontSize: '0.85rem', flexShrink: 0,
                    color: isIncome ? '#0D9469' : '#D63A5A'
                  }}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount, true)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
