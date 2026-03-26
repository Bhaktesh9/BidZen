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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncCurrentTab = () => {
      const tab = new URLSearchParams(window.location.search).get('tab');
      setCurrentTab(tab);
    };

    syncCurrentTab();
    window.addEventListener('popstate', syncCurrentTab);

    return () => {
      window.removeEventListener('popstate', syncCurrentTab);
    };
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, currentTab]);

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
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="text-2xl font-display font-extrabold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              BidZen
            </Link>
            <div className="hidden md:flex gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    const [, query] = link.href.split('?');
                    const tab = query ? new URLSearchParams(query).get('tab') : null;
                    setCurrentTab(tab);
                  }}
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
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-textPrimary">{user.username}</p>
                <p className="text-xs text-textMuted capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <Button size="sm" variant="logout" onClick={onLogout} className="hidden md:inline-flex">
                Logout
              </Button>
              <button
                type="button"
                className="md:hidden p-2 rounded-smpanel border border-subtle text-textSecondary hover:text-textPrimary hover:bg-elevated"
                aria-label="Toggle menu"
                onClick={() => setIsMobileMenuOpen((previous) => !previous)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {isMobileMenuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          ) : null}
        </div>

        {user && isMobileMenuOpen ? (
          <div className="md:hidden pb-4 pt-2 border-t border-subtle/60">
            <div className="mb-3 px-1">
              <p className="text-sm font-medium text-textPrimary">{user.username}</p>
              <p className="text-xs text-textMuted capitalize">{user.role.replace('_', ' ')}</p>
            </div>
            <div className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    const [, query] = link.href.split('?');
                    const tab = query ? new URLSearchParams(query).get('tab') : null;
                    setCurrentTab(tab);
                  }}
                  className={`block px-3 py-2 rounded-smpanel text-sm border ${
                    isLinkActive(link.href)
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-subtle text-textSecondary hover:text-textPrimary hover:bg-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button size="sm" variant="logout" onClick={onLogout} className="w-full mt-2">
                Logout
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
