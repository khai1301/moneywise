'use client';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '12px', padding: '12px 16px' }}>
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: '0.78rem', color: p.color, fontWeight: 600, margin: 0 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

export function AreaChartComponent({ data, year }: { data: any[]; year: string }) {
  return (
    <div className="chart-card" style={{ marginBottom: '24px' }}>
      <div className="chart-title">Thu nhập vs Chi tiêu — {year}</div>
      <div className="chart-subtitle">Xu hướng thu chi 12 tháng trong năm {year}</div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4BB3FD" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4BB3FD" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FF6B8A" stopOpacity={0.20} />
              <stop offset="95%" stopColor="#FF6B8A" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,179,253,0.1)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9BB4CC' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9BB4CC' }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: 8 }} />
          <Area type="monotone" dataKey="income"  name="Thu nhập" stroke="#4BB3FD" strokeWidth={2.5} fill="url(#gIncome)"  dot={false} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="expense" name="Chi tiêu"  stroke="#FF6B8A" strokeWidth={2.5} fill="url(#gExpense)" dot={false} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data }: { data: any[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
            {data.map((entry: any, i: number) => (
              <Cell key={`cell-${i}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => fmt(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.slice(0, 6).map((c: any) => (
          <div key={c.categoryId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>{c.icon}</span>
              <div style={{ width: 8, height: 8, borderRadius: '2px', background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(c.value)}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '34px', textAlign: 'right' }}>{Number(c.pct).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SavingsBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,179,253,0.1)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9BB4CC' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9BB4CC' }} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="savings" name="Tiết kiệm" radius={[8, 8, 0, 0]} maxBarSize={40}>
          {data.map((entry: any, i: number) => (
            <Cell key={`bar-${i}`} fill={entry.savings < 0 ? '#FF6B8A' : entry.savings > 5000000 ? '#4BB3FD' : '#A78BFA'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
