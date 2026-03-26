'use client';

import Cookies from 'js-cookie';

const TOKEN_KEY = 'bidzen_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
