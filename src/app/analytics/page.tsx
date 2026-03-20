'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/layout/AppLayout';
import { TrendingUp, TrendingDown, PiggyBank, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

// Dynamically import charts to avoid Turbopack SSR panic with Recharts
const AreaChartComponent = dynamic(
  () => import('./charts').then(m => m.AreaChartComponent),
  { ssr: false, loading: () => <ChartLoader h={280} /> }
);
const DonutChart = dynamic(
  () => import('./charts').then(m => m.DonutChart),
  { ssr: false, loading: () => <ChartLoader h={200} /> }
);
const SavingsBarChart = dynamic(
  () => import('./charts').then(m => m.SavingsBarChart),
  { ssr: false, loading: () => <ChartLoader h={280} /> }
);

function ChartLoader({ h }: { h: number }) {
  return (
    <div style={{ height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={28} color="var(--primary)" />
    </div>
  );
}

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const FALLBACK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6', '#3b82f6'];

export default function AnalyticsPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [loadingCat, setLoadingCat] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingMonthly(true);
    api.get(`/analytics/monthly?year=${year}`)
      .then(res => { if (!cancelled) setMonthlyData(res.data.data || []); })
      .catch(err => { if (err?.response?.status === 401) router.push('/login'); })
      .finally(() => { if (!cancelled) setLoadingMonthly(false); });
    return () => { cancelled = true; };
  }, [year]);

  useEffect(() => {
    let cancelled = false;
    setLoadingCat(true);
    api.get(`/analytics/categories?start=${year}-01-01&end=${year}-12-31`)
      .then(res => {
        if (!cancelled) {
          const data = (res.data.data || []).map((c: any, i: number) => ({
            ...c,
            color: c.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          }));
          setCategoryData(data);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingCat(false); });
    return () => { cancelled = true; };
  }, [year]);

  const totalIncome  = monthlyData.reduce((s, m) => s + (m.income  || 0), 0);
  const totalExpense = monthlyData.reduce((s, m) => s + (m.expense || 0), 0);
  const totalSavings = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0.0';
  const avgMonthly   = totalExpense / 12;
  const topCat       = categoryData[0];

  const kpi = [
    { label: 'Tổng thu nhập',   value: fmt(totalIncome),  color: '#4BB3FD', bg: 'rgba(75,179,253,0.12)',   Icon: TrendingUp },
    { label: 'Tổng chi tiêu',   value: fmt(totalExpense), color: '#FF6B8A', bg: 'rgba(255,107,138,0.12)', Icon: TrendingDown },
    { label: 'Tiết kiệm',       value: fmt(totalSavings), color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)',  Icon: PiggyBank },
    { label: 'Tỉ lệ tiết kiệm', value: `${savingsRate}%`,  color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', Icon: TrendingUp },
  ];

  return (
    <AppLayout>
      {/* Header + year selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Phân tích thu chi — dữ liệu thực từ hệ thống</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Năm:</span>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            style={{
              appearance: 'none', padding: '7px 14px', borderRadius: '10px',
              border: '1px solid var(--border)', background: 'var(--card-bg)',
              color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem'
            }}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={String(y)} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {kpi.map(({ label, value, color, bg, Icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} strokeWidth={2.5} /></div>
            <div className="stat-label">{label}</div>
            <div className="stat-value font-mono" style={{ fontSize: '1.15rem' }}>
              {loadingMonthly ? '...' : value}
            </div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      {loadingMonthly ? (
        <div className="chart-card" style={{ marginBottom: '24px' }}><ChartLoader h={280} /></div>
      ) : (
        <AreaChartComponent data={monthlyData} year={year} />
      )}

      {/* Side by side */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        {/* Donut */}
        <div className="chart-card">
          <div className="chart-title">Chi tiêu theo Danh Mục</div>
          <div className="chart-subtitle">Tổng chi phân loại cả năm {year}</div>
          {loadingCat ? (
            <ChartLoader h={200} />
          ) : categoryData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Chưa có dữ liệu chi tiêu
            </div>
          ) : (
            <DonutChart data={categoryData} />
          )}
        </div>

        {/* Savings bar */}
        <div className="chart-card">
          <div className="chart-title">Tiết kiệm hàng tháng</div>
          <div className="chart-subtitle">Thu nhập trừ chi tiêu mỗi tháng</div>
          {loadingMonthly ? <ChartLoader h={280} /> : <SavingsBarChart data={monthlyData} />}
        </div>
      </div>

      {/* Summary stats */}
      <div className="card" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-around' }}>
          {[
            { label: 'Chi tiêu TB/tháng',      value: fmt(avgMonthly),             color: '#FF6B8A' },
            { label: 'Danh mục chi nhiều nhất', value: topCat ? `${topCat.icon} ${topCat.name}` : '—', color: topCat?.color || 'var(--primary)' },
            { label: 'Tổng tiết kiệm',          value: fmt(Math.max(0, totalSavings)), color: '#2DD4BF' },
            { label: 'Số danh mục',             value: `${categoryData.length}`,    color: 'var(--primary)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{label}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
