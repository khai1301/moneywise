'use client';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
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
          {p.name}: {formatCurrency ? formatCurrency(p.value, true) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardCharts({ monthlyData, categoryData, formatCurrency }: { monthlyData: any[], categoryData: any[], formatCurrency: any }) {

  // Format monthlyData strings
  const formattedMonthlyData = monthlyData.map(d => {
    let monthName = `Th ${d.month}`;
    return { ...d, monthName };
  });

  return (
    <div className="charts-grid" style={{ marginBottom: '24px' }}>
      <div className="chart-card">
        <div className="chart-title">Thu chi theo tháng</div>
        <div className="chart-subtitle">12 tháng gần nhất trong năm</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={formattedMonthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75,179,253,0.1)" />
            <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#9BB4CC', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9BB4CC', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'Inter', paddingTop: 8 }} />
            <Line type="monotone" dataKey="income" name="Thu nhập" stroke="#4BB3FD" strokeWidth={2.5} dot={{ r: 3, fill: '#4BB3FD' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#FF6B8A" strokeWidth={2.5} dot={{ r: 3, fill: '#FF6B8A' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">Chi tiêu theo danh mục</div>
        <div className="chart-subtitle">Tháng hiện tại</div>
        {categoryData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)' }}>Chưa có giao dịch chi tiêu nào</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData.slice(0, 6)}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.slice(0, 6).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#A78BFA'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v), true)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {categoryData.slice(0, 4).map((c: any) => (
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
  );
}
