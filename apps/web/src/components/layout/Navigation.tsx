'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCivicStore } from '@/store/civicStore';
import { useAuthStore } from '@/store/authStore';

const COUNTRY_META: Record<string, { name: string; flag: string }> = {
  IND: { name: 'India',          flag: '🇮🇳' },
  USA: { name: 'United States',  flag: '🇺🇸' },
  GBR: { name: 'United Kingdom', flag: '🇬🇧' },
  CAN: { name: 'Canada',         flag: '🇨🇦' },
  AUS: { name: 'Australia',      flag: '🇦🇺' },
};

const NAV_LINKS = [
  { href: '/dashboard',  label: 'Dashboard'    },
  { href: '/checklist',  label: 'Checklist'    },
  { href: '/elections',  label: 'Calendar'     },
  { href: '/ask',        label: 'Ask ELECTRA'  },
];

export function Navigation() {
  const pathname = usePathname();
  const router   = useRouter();
  const { countryCode } = useCivicStore();
  const { isAuthenticated, logout } = useAuthStore();

  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Hide nav on auth + onboarding + emergency pages
  const hideOn = ['/login', '/signup', '/onboarding', '/auth/', '/callback', '/emergency', '/verify'];
  if (hideOn.some((p) => pathname?.startsWith(p) || pathname === p)) return null;

  const country = countryCode ? COUNTRY_META[countryCode] : null;

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <>
      {/* Skip to content — WCAG */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-blue-700 focus:font-bold"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-50 transition-all duration-200"
        style={{
          background: scrolled
            ? 'rgba(11,30,45,0.97)'
            : 'rgba(11,30,45,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.12)'
            : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="ELECTRA home"
          >
            <Image
              src="/logo.png"
              alt="ELECTRA logo"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="font-extrabold text-white text-lg tracking-tight hidden sm:inline">
              ELECTRA
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav
            className="hidden md:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Country Pill (Authenticated Only) */}
            {isAuthenticated && (
              country ? (
                <Link
                  href="/onboarding"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 hover:opacity-80"
                  style={{
                    background: 'rgba(0,112,243,0.15)',
                    border: '1px solid rgba(0,112,243,0.3)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                  aria-label={`Currently viewing: ${country.name}. Click to change country.`}
                  title="Click to change country"
                >
                  <span aria-hidden="true">{country.flag}</span>
                  <span className="hidden lg:inline">{country.name}</span>
                  <span className="lg:hidden">{countryCode}</span>
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  🌍 Select country
                </Link>
              )
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="hidden md:block px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden md:block px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:block px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-150 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)' }}
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Emergency — ALWAYS VISIBLE */}
            <Link
              href="/emergency"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                boxShadow: '0 0 16px rgba(220,38,38,0.4)',
              }}
              aria-label="Emergency voter help — click for instant assistance"
            >
              <span aria-hidden="true" className="text-base">🔴</span>
              <span className="hidden sm:inline">Emergency</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              <div className="flex flex-col gap-1.5 w-4" aria-hidden="true">
                <span
                  className="block h-0.5 bg-white rounded transition-all duration-200"
                  style={{ transform: menuOpen ? 'translateY(8px) rotate(45deg)' : 'none' }}
                />
                <span
                  className="block h-0.5 bg-white rounded transition-all duration-200"
                  style={{ opacity: menuOpen ? 0 : 1 }}
                />
                <span
                  className="block h-0.5 bg-white rounded transition-all duration-200"
                  style={{ transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {menuOpen && (
          <div
            id="mobile-menu"
            ref={menuRef}
            className="md:hidden border-t"
            style={{
              background: 'rgba(11,30,45,0.98)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                );
              })}

              <div className="border-t my-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* Country in mobile */}
              <Link
                href="/onboarding"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {country ? `${country.flag} ${country.name}` : '🌍 Select your country'}
              </Link>

              {isAuthenticated ? (
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)' }}
                  >
                    Get Started — Free
                  </Link>
                </>
              )}

              <Link
                href="/emergency"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 mt-2 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}
              >
                🔴 Emergency Help
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
