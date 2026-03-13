'use client';
import AppLayout from '@/components/layout/AppLayout';
import { budgets, savingsGoals, formatCurrency } from '@/lib/fakeData';
import { Target, PiggyBank, AlertTriangle, CheckCircle, TrendingUp, Plus } from 'lucide-react';

export default function BudgetsPage() {
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalPct = Math.round((totalSpent / totalLimit) * 100);
  const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;

  return (
    <AppLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Budgets & Goals</h1>
          <p className="page-subtitle">Theo dõi ngân sách và mục tiêu tiết kiệm của bạn</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> New Budget
        </button>
      </div>

      {/* Monthly Overview */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0F1C3F, #1a2f5a)', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(75,179,253,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '100px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(167,139,250,0.08)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: '4px' }}>MONTHLY BUDGET OVERVIEW — March 2026</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{formatCurrency(totalSpent, true)}</span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>/ {formatCurrency(totalLimit, true)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: totalPct > 100 ? '#FF6B8A' : '#4BB3FD', fontFamily: 'JetBrains Mono' }}>{totalPct}%</div>
            {overBudgetCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFC94A', fontSize: '0.78rem', fontWeight: 600 }}>
                <AlertTriangle size={14} /> {overBudgetCount} категории превышены
              </div>
            )}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '10px' }}>
          <div style={{ height: '100%', borderRadius: '999px', width: `${Math.min(totalPct, 100)}%`, background: totalPct > 100 ? 'linear-gradient(90deg, #FF6B8A, #D63A5A)' : 'linear-gradient(90deg, #4BB3FD, #2DD4BF)', transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div style={{ marginBottom: '8px' }}>
        <div className="section-header">
          <span className="section-title">Category Budgets</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{budgets.length} categories</span>
        </div>
      </div>
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const isOver = b.spent > b.limit;
          const isWarning = !isOver && pct >= 80;
          const statusColor = isOver ? '#FF6B8A' : isWarning ? '#FFC94A' : '#2DD4BF';
          const statusLabel = isOver ? 'Over Budget' : isWarning ? 'Near Limit' : 'On Track';
          const StatusIcon = isOver ? AlertTriangle : isWarning ? AlertTriangle : CheckCircle;
          return (
            <div key={b.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    {b.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{b.category}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600, color: statusColor }}>
                      <StatusIcon size={11} /> {statusLabel}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.1rem', fontWeight: 700, color: isOver ? '#D63A5A' : 'var(--text-primary)' }}>
                  {pct}%
                </div>
              </div>
              <div className="progress-bar-wrap" style={{ marginBottom: '10px', height: '10px' }}>
                <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: isOver ? '#FF6B8A' : isWarning ? '#FFC94A' : b.color }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Spent: <strong className="font-mono" style={{ color: isOver ? '#D63A5A' : 'var(--text-primary)' }}>{formatCurrency(b.spent, true)}</strong></span>
                <span style={{ color: 'var(--text-secondary)' }}>Limit: <strong className="font-mono">{formatCurrency(b.limit, true)}</strong></span>
              </div>
              {isOver && (
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#D63A5A', fontWeight: 600, background: 'rgba(255,107,138,0.1)', padding: '6px 10px', borderRadius: '8px' }}>
                  ⚠ Over by {formatCurrency(b.spent - b.limit, true)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Savings Goals */}
      <div style={{ marginBottom: '8px' }}>
        <div className="section-header">
          <span className="section-title">🎯 Savings Goals</span>
          <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            <Plus size={14} /> New Goal
          </button>
        </div>
      </div>
      <div className="grid-3">
        {savingsGoals.map((g) => {
          const pct = Math.round((g.saved / g.target) * 100);
          const remaining = g.target - g.saved;
          const targetDate = new Date(g.targetDate);
          const daysLeft = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const monthsLeft = Math.ceil(daysLeft / 30);
          const monthlyNeeded = remaining > 0 ? remaining / Math.max(monthsLeft, 1) : 0;
          return (
            <div key={g.id} className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '3rem', opacity: 0.1 }}>{g.icon}</div>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{g.icon}</div>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{g.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                <span className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: g.color }}>{formatCurrency(g.saved, true)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {formatCurrency(g.target, true)}</span>
              </div>
              <div className="progress-bar-wrap" style={{ marginBottom: '12px', height: '10px' }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}bb)` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 700, color: g.color }}>{pct}% complete</span>
                <span style={{ color: 'var(--text-muted)' }}>{daysLeft} days left</span>
              </div>
              <div style={{ background: 'var(--primary-ultra-light)', borderRadius: '10px', padding: '10px 12px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <TrendingUp size={13} color={g.color} />
                  Save <strong className="font-mono" style={{ color: g.color }}>{formatCurrency(monthlyNeeded, true)}/tháng</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Còn thiếu {formatCurrency(remaining, true)} · Mục tiêu {targetDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
