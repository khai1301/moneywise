'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Prevent Recharts SSR issues (even with older rechart version, dynamic is safer on Next 15+)
const DashboardCharts = dynamic(() => import('./charts'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={28} color="var(--primary)" />
    </div>
  )
});

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentDate = new Date();

  // Start of current month
  const startOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const startStr = startOfMonth.toISOString().split('T')[0];

  // End of current month
  const endOfMonth = new Date(currentYear, currentDate.getMonth() + 1, 0);
  const endStr = endOfMonth.toISOString().split('T')[0];

  const [data, setData] = useState({
    recentTxns: [],
    summary: { balance: 0, income: 0, expense: 0, savingsRate: 0 },
    categoryData: [] as any[],
    monthlyData: [] as any[],
  });

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [txnsRes, monthRes, catRes] = await Promise.all([
          api.get('/transactions?limit=5'),
          api.get(`/analytics/monthly?year=${currentYear}`),
          api.get(`/analytics/categories?start=${startStr}&end=${endStr}`)
        ]);

        if (cancelled) return;

        // Process monthly analytics data
        const rawMonthly = monthRes.data.data || [];

        // Find current month stats
        const currentMonthIdx = currentDate.getMonth();
        const cmData = rawMonthly[currentMonthIdx] || { income: 0, expense: 0 };

        const income = cmData.income || 0;
        const expense = cmData.expense || 0;
        const balance = income - expense;
        const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

        // Process category data
        const catData = (catRes.data.data || []).map((c: any, i: number) => {
          const fallbackColors = ['#4BB3FD', '#A78BFA', '#2DD4BF', '#FFC94A', '#FF6B8A', '#34D399'];
          return {
            name: c.name,
            value: c.total,
            color: c.color || fallbackColors[i % fallbackColors.length],
            pct: c.percentage,
            icon: c.icon
          };
        });

        setData({
          recentTxns: txnsRes.data.data || [],
          summary: { balance, income, expense, savingsRate },
          categoryData: catData,
          monthlyData: rawMonthly,
        });

      } catch (err: any) {
        if (!cancelled) {
          if (err.response?.status === 401) {
            router.push('/login');
          }
          console.error("Dashboard fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();

    return () => { cancelled = true; };
  }, [router]);

  const statCards = [
    {
      label: 'Số dư tháng này', value: formatCurrency(data.summary.balance, true),
      icon: Wallet, color: '#4BB3FD', bgColor: 'rgba(75,179,253,0.12)',
      trend: 'Cập nhật', trendDir: data.summary.balance >= 0 ? 'up' : 'down', trendLabel: 'thêm',
    },
    {
      label: 'Tổng thu nhập', value: formatCurrency(data.summary.income, true),
      icon: TrendingUp, color: '#2DD4BF', bgColor: 'rgba(45,212,191,0.12)',
      trend: 'Tháng này', trendDir: 'up', trendLabel: '',
    },
    {
      label: 'Tổng chi tiêu', value: formatCurrency(data.summary.expense, true),
      icon: TrendingDown, color: '#FF6B8A', bgColor: 'rgba(255,107,138,0.12)',
      trend: 'Tháng này', trendDir: 'down', trendLabel: '',
    },
    {
      label: 'Tỷ lệ tiết kiệm', value: `${data.summary.savingsRate}%`,
      icon: PiggyBank, color: '#A78BFA', bgColor: 'rgba(167,139,250,0.12)',
      trend: 'Tối ưu', trendDir: 'up', trendLabel: 'thu chi',
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
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Tổng quan tài chính tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}</p>
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

      <DashboardCharts monthlyData={data.monthlyData} categoryData={data.categoryData} formatCurrency={formatCurrency} />

      <div className="grid-2">
        <div className="card">
          <div className="section-header">
            <span className="section-title">Ngân sách (Budgets)</span>
            <a href="/budgets" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              Quản lý <ChevronRight size={14} />
            </a>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <PiggyBank size={32} style={{ opacity: 0.3 }} />
            <p>Vui lòng xem tại trang Budgets & Goals để theo dõi tiến độ ngân sách chi tiết.</p>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <span className="section-title">Giao dịch gần đây</span>
            <a href="/transactions" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              Xem tất cả <ChevronRight size={14} />
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recentTxns.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bạn chưa tạo giao dịch nào.</span>}
            {data.recentTxns.map((t: any) => {
              const catName = t.Category?.name || 'Chưa phân loại';
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
                    border: `1px solid ${catColor}40`
                  }}>
                    {catIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: catColor }}>{catName}</span>
                      <span style={{ margin: '0 6px', opacity: 0.5 }}>•</span>
                      <span>{new Date(t.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono', fontWeight: 700,
                    fontSize: '0.9rem', flexShrink: 0,
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
