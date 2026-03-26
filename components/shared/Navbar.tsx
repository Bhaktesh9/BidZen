'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    setCurrentTab(tab);
  }, [pathname]);

  const navigationByRole = {
    super_admin: [
      { href: '/admin?tab=users', label: 'Users' },
      { href: '/admin?tab=teams', label: 'Teams' },
      { href: '/admin?tab=players', label: 'Players' },
    ],
    presenter: [
      { href: '/presenter', label: 'Presenter' },
    ],
    controller: [
      { href: '/controller', label: 'Controller' },
    ],
    team_owner: [
      { href: '/team', label: 'My Team' },
    ],
  };

  const links = user ? navigationByRole[user.role] : [];

  const isLinkActive = (href: string) => {
    const [linkPath, query] = href.split('?');
    if (linkPath !== pathname) return false;
    if (!query) return true;

    const linkParams = new URLSearchParams(query);
    const linkTab = linkParams.get('tab');
    return linkTab === currentTab;
  };

  return (
    <nav className="bg-surface border-b border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-display font-extrabold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              BidZen
            </Link>
            <div className="hidden md:flex gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-1 py-1 text-sm transition-colors ${
                    isLinkActive(link.href)
                      ? 'text-primary'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {link.label}
                  {isLinkActive(link.href) && (
                    <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-gold rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-textPrimary">{user.username}</p>
                <p className="text-xs text-textMuted capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <Button size="sm" variant="logout" onClick={onLogout}>
                Logout
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
