'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ToastContainer } from '@/components/shared/Toast';
import { setToken } from '@/lib/token';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>
  >([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      addToast('Please enter username and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const message =
          isJson && typeof payload === 'object' && payload !== null && 'message' in payload
            ? String((payload as { message?: string }).message || 'Login failed')
            : 'Login failed. Please check server configuration and try again.';
        addToast(message, 'error');
        return;
      }

      if (!isJson || typeof payload !== 'object' || payload === null) {
        addToast('Invalid response from server', 'error');
        return;
      }

      const data = payload as { token: string; user: { role: string } };
      setToken(data.token);
      addToast('Login successful!', 'success');

      // Redirect based on role
      setTimeout(() => {
        const redirectMap: Record<string, string> = {
          super_admin: '/admin',
          presenter: '/presenter',
          controller: '/controller',
          team_owner: '/team',
        };
        const nextPath = redirectMap[data.user.role] || '/';
        router.replace(nextPath);
        window.location.href = nextPath;
      }, 500);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(99,179,237,0.08)_0%,transparent_65%)] pointer-events-none" />
      
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Icon & Branding */}
        <div className="hidden md:flex flex-col items-center justify-center relative">
          <div className="relative w-80 h-80">
            {/* Animated background circles */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute inset-10 bg-gradient-to-tr from-primary/5 to-transparent rounded-full" />
            
            {/* Main icon container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-gold to-primary rounded-full opacity-20 blur-xl animate-spin" style={{ animationDuration: '8s' }} />
                
                {/* Icon */}
                <Image
                  src="/icon.png"
                  alt="BidZen"
                  width={192}
                  height={192}
                  priority
                  className="relative w-48 h-48 rounded-3xl border border-subtle/50 bg-base/30 p-2 drop-shadow-2xl hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Branding Text */}
          <div className="text-center mt-12">
            <h1 className="text-5xl font-display font-extrabold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent mb-2">BidZen</h1>
            <p className="text-lg text-textSecondary mb-2">Live Auction Platform</p>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-gold rounded-full mx-auto" />
            <p className="text-sm text-textMuted mt-4 max-w-xs">Experience the thrill of real-time competitive bidding</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <Card className="rounded-2xl border border-subtle relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
            
            {/* Mobile header - icon on mobile */}
            <div className="md:hidden text-center mb-6 pt-4">
              <Image
                src="/icon.png"
                alt="BidZen"
                width={80}
                height={80}
                priority
                className="h-20 w-20 rounded-2xl border border-subtle/50 bg-base/30 p-1 drop-shadow-md mx-auto mb-3"
              />
              <h2 className="text-3xl font-display font-extrabold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">BidZen</h2>
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-8">
                <h2 className="hidden md:block text-2xl font-display font-bold text-textPrimary mb-2">Welcome Back</h2>
                <p className="hidden md:block text-sm text-textMuted">Sign in to your account to begin</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="bz-label block mb-2 font-semibold">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bz-input border-subtle/50 focus:border-primary/50 transition-colors"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="bz-label block mb-2 font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bz-input pr-12 border-subtle/50 focus:border-primary/50 transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-primary transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.85 2.9-5.03 5.2-6.4" />
                          <path d="M1 1l22 22" />
                          <path d="M9.53 9.53a3.5 3.5 0 0 0 4.95 4.95" />
                          <path d="M14.47 14.47 9.53 9.53" />
                          <path d="M21 12c-.53 1.5-1.42 2.86-2.57 4" />
                          <path d="M12 4c3.73 0 7 2.01 9 5" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-8 bg-gradient-to-r from-primary to-gold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Enter the Arena
                </Button>
              </form>

              <p className="text-xs text-textMuted text-center mt-6 py-4 border-t border-subtle/30">
                Contact administrator for account creation
              </p>
            </div>
          </Card>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
