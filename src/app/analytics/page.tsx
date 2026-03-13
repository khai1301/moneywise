'use client';
import AppLayout from '@/components/layout/AppLayout';
import {
  monthlyData, dailySpends, getCategorySpending,
  getSummary, formatCurrency
} from '@/lib/fakeData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Brain, TrendingUp, TrendingDown, Flame, PiggyBank } from 'lucide-react';

const summary = getSummary();
const categoryData = getCategorySpending();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1.5px solid var(--border-card)', borderRadius: '12px', padding: '12px 16px', boxShadow: 'var(--shadow-card)' }}>
      <p style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: '0.78rem', color: p.color, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value, true)}
        </p>
      ))}
    </div>
  );
};

function getHeatmapColor(amount: number): string {
  if (amount === 0) return 'rgba(75,179,253,0.06)';
  if (amount < 200000) return 'rgba(75,179,253,0.2)';
  if (amount < 500000) return 'rgba(75,179,253,0.45)';
  if (amount < 1000000) return 'rgba(75,179,253,0.7)';
  return 'rgba(75,179,253,0.95)';
}

const topCategory = categoryData[0];
const avgDaily = Math.round(summary.expense / 9);

const insights = [
  {
    icon: '🎯', color: '#FF6B8A', bg: 'rgba(255,107,138,0.1)',
    title: 'Food budget exceeded',
    desc: `Chi tiêu ăn uống vượt ngân sách ${formatCurrency(450000, true)} trong tháng này. Hãy cân nhắc nấu ăn ở nhà nhiều hơn.`,
  },
  {
    icon: '💡', color: '#FFC94A', bg: 'rgba(255,201,74,0.1)',
    title: 'Great savings rate!',
    desc: `Tỷ lệ tiết kiệm ${summary.savingsRate}% tháng này vượt mục tiêu 25%. Duy trì thói quen này để đạt mục tiêu MacBook sớm hơn.`,
  },
  {
    icon: '📈', color: '#4BB3FD', bg: 'rgba(75,179,253,0.1)',
    title: 'Income trend positive',
    desc: `Thu nhập tháng 3 tăng 18.3% so với tháng trước nhờ dự án freelance mới. Hãy cân nhắc đầu tư phần dư.`,
  },
];

export default function AnalyticsPage() {
  const kpiCards = [
    { label: 'Avg Daily Spend', value: formatCurrency(avgDaily, true), icon: Flame, color: '#FF6B8A', bg: 'rgba(255,107,138,0.12)' },
    { label: 'Top Category', value: topCategory?.name || '—', icon: TrendingDown, color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
    { label: 'Savings Rate', value: `${summary.savingsRate}%`, icon: PiggyBank, color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)' },
    { label: 'Income Growth', value: '+18.3%', icon: TrendingUp, color: '#4BB3FD', bg: 'rgba(75,179,253,0.12)' },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="page-subtitle">Phân tích sâu về tài chính cá nhân của bạn</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="stat-card">
              <div className="stat-icon" style={{ background: k.bg }}>
                <Icon size={22} color={k.color} strokeWidth={2.5} />
              </div>
              <div className="stat-label">{k.label}</div>
              <div className="stat-value font-mono" style={{ fontSize: '1.3rem' }}>{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Area Chart — 12 Month */}
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div className="chart-title">Income vs Expense — 12 Months</div>
        <div className="chart-subtitle">Xu hướng thu chi 12 tháng gần nhất</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4BB3FD" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4BB3FD" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B8A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FF6B8A" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,179,253,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9BB4CC', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9BB4CC', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'Inter', paddingTop: 8 }} />
            <Area type="monotone" dataKey="income" name="Income" stroke="#4BB3FD" strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="expense" name="Expense" stroke="#FF6B8A" strokeWidth={2.5} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap + Category Donut */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        {/* Daily Spending Heatmap */}
        <div className="chart-card">
          <div className="chart-title">Daily Spending Heatmap</div>
          <div className="chart-subtitle">35 ngày gần nhất — màu đậm = chi nhiều hơn</div>
          <div className="heatmap-grid" style={{ marginTop: '8px' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, padding: '4px 0 6px' }}>{d}</div>
            ))}
            {dailySpends.map((d) => (
              <div
                key={d.date}
                className="heatmap-cell"
                title={`${d.date}: ${formatCurrency(d.amount, true)}`}
                style={{ background: getHeatmapColor(d.amount), border: '1px solid rgba(75,179,253,0.1)' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>Less</span>
            {[0.06, 0.2, 0.45, 0.7, 0.95].map(op => (
              <div key={op} style={{ width: 14, height: 14, borderRadius: '3px', background: `rgba(75,179,253,${op})` }} />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Category Donut */}
        <div className="chart-card">
          <div className="chart-title">Spending by Category</div>
          <div className="chart-subtitle">Tổng chi theo danh mục</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => formatCurrency(v as number, true)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categoryData.map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '3px', background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(c.value, true)}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '30px', textAlign: 'right' }}>{c.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div className="chart-title">Monthly Savings</div>
        <div className="chart-subtitle">Số tiền tiết kiệm mỗi tháng</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,179,253,0.1)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9BB4CC', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9BB4CC', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="savings" name="Savings" radius={[8, 8, 0, 0]} maxBarSize={40}>
              {monthlyData.map((entry, i) => (
                <Cell key={i} fill={entry.savings < 0 ? '#FF6B8A' : entry.savings > 10000000 ? '#4BB3FD' : '#A78BFA'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Insights */}
      <div style={{ marginBottom: '8px' }}>
        <div className="section-header">
          <span className="section-title"><Brain size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Smart Insights</span>
        </div>
      </div>
      <div className="grid-3">
        {insights.map((ins, i) => (
          <div key={i} className="insight-card">
            <div className="insight-icon" style={{ background: ins.bg }}>
              <span style={{ fontSize: '1.3rem' }}>{ins.icon}</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{ins.title}</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
