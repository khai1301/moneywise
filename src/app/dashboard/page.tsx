'use client';
import AppLayout from '@/components/layout/AppLayout';
import {
  transactions, monthlyData, getCategorySpending,
  getSummary, formatCurrency, CATEGORY_COLORS
} from '@/lib/fakeData';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

const recentTxns = transactions.slice(0, 6);
const summary = getSummary();
const categoryData = getCategorySpending();

// Budget progress for dashboard (top 4)
const topBudgets = [
  { cat: 'Food & Dining', spent: 3450000, limit: 3000000, color: '#FF6B8A' },
  { cat: 'Housing', spent: 4500000, limit: 5000000, color: '#4BB3FD' },
  { cat: 'Transport', spent: 890000, limit: 1500000, color: '#2DD4BF' },
  { cat: 'Entertainment', spent: 610000, limit: 1000000, color: '#A78BFA' },
];

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
  const statCards = [
    {
      label: 'Total Balance', value: formatCurrency(summary.balance, true),
      icon: Wallet, color: '#4BB3FD', bgColor: 'rgba(75,179,253,0.12)',
      trend: '+12.5%', trendDir: 'up', trendLabel: 'vs last month',
    },
    {
      label: 'Income (Mar)', value: formatCurrency(summary.income, true),
      icon: TrendingUp, color: '#2DD4BF', bgColor: 'rgba(45,212,191,0.12)',
      trend: '+18.3%', trendDir: 'up', trendLabel: 'vs last month',
    },
    {
      label: 'Expense (Mar)', value: formatCurrency(summary.expense, true),
      icon: TrendingDown, color: '#FF6B8A', bgColor: 'rgba(255,107,138,0.12)',
      trend: '-34.2%', trendDir: 'up', trendLabel: 'vs last month',
    },
    {
      label: 'Savings Rate', value: `${summary.savingsRate}%`,
      icon: PiggyBank, color: '#A78BFA', bgColor: 'rgba(167,139,250,0.12)',
      trend: '+8.1%', trendDir: 'up', trendLabel: 'vs last month',
    },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Xin chào, Khai! Đây là tổng quan tài chính của bạn tháng 3/2026.</p>
      </div>

      {/* Stat Cards */}
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

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Line Chart */}
        <div className="chart-card">
          <div className="chart-title">Income vs Expense</div>
          <div className="chart-subtitle">12 tháng gần nhất</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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

        {/* Donut Chart */}
        <div className="chart-card">
          <div className="chart-title">Spending by Category</div>
          <div className="chart-subtitle">Tháng này</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData.slice(0, 6)}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(v: unknown) => formatCurrency(v as number, true)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget + Recent Txns */}
      <div className="grid-2">
        {/* Budget Progress */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Budget Overview</span>
            <a href="/budgets" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={14} />
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {topBudgets.map((b) => {
              const pct = Math.min(Math.round((b.spent / b.limit) * 100), 100);
              const isOver = b.spent > b.limit;
              return (
                <div key={b.cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{b.cat}</span>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono', color: isOver ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                      {formatCurrency(b.spent, true)} / {formatCurrency(b.limit, true)}
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${pct}%`, background: isOver ? 'var(--accent-red)' : b.color }}
                    />
                  </div>
                  {isOver && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--accent-red)', marginTop: '3px', fontWeight: 600 }}>
                      ⚠ Over budget by {formatCurrency(b.spent - b.limit, true)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Transactions</span>
            <a href="/transactions" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={14} />
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTxns.map((t) => {
              const catStyle = CATEGORY_COLORS[t.category] || CATEGORY_COLORS['Other'];
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '12px',
                    background: catStyle.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}>
                    {isIncome ? '💰' : t.category === 'Food & Dining' ? '🍜' : t.category === 'Transport' ? '🚗' : t.category === 'Entertainment' ? '🎮' : t.category === 'Shopping' ? '🛍️' : t.category === 'Healthcare' ? '💊' : t.category === 'Education' ? '📚' : '💸'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ background: catStyle.bg, color: catStyle.text, padding: '1px 6px', borderRadius: '5px', fontWeight: 600, fontSize: '0.68rem' }}>{t.category}</span>
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
