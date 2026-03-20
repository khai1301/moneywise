'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ArrowLeftRight, Target, BarChart2,
  DollarSign, LogOut, Settings, Bell, Tag
} from 'lucide-react';

const navItems: { href: string; label: string; icon: React.ElementType; badge?: string }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/budgets', label: 'Budgets & Goals', icon: Target },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <DollarSign size={22} color="white" strokeWidth={2.5} />
        </div>
        <span className="sidebar-logo-text">
          Money<span>Wise</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-title">Main Menu</span>
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
              {badge && <span className="sidebar-badge">{badge}</span>}
            </Link>
          );
        })}

        <span className="sidebar-section-title" style={{ marginTop: '8px' }}>Account</span>
        <button className="sidebar-nav-item" style={{ width: '100%', background: 'none', cursor: 'pointer' }}>
          <Bell size={18} strokeWidth={2} />
          <span>Notifications</span>
          <span className="sidebar-badge" style={{ background: 'var(--accent-yellow)', color: '#92400E' }}>2</span>
        </button>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">KP</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Khai Phan</div>
            <div className="sidebar-user-role">Personal Account</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
