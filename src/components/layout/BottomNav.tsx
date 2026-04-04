'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Wallet, Target, Menu } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/transactions', label: 'Giao dịch', icon: ArrowLeftRight },
    { href: '/wallets', label: 'Ví', icon: Wallet },
    { href: '/budgets', label: 'Ngân sách', icon: Target },
    { href: '/categories', label: 'Menu', icon: Menu }, // Temporarily mapping menu to categories for quick access since we have 5 slots
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
            <div className="bottom-nav-icon-wrap">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
