import type { ReactNode } from 'react';
import { BRAND } from '../config.ts';
import { PhoneIcon, SunIcon } from './Icons.tsx';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <a className="brand" href="/" style={{ color: '#fff', textDecoration: 'none' }}>
          <span className="brand__mark"><SunIcon size={18} /></span>
          {BRAND.name}
        </a>
        <a className="site-header__phone" href={BRAND.phoneHref}>
          <PhoneIcon /> <span>Speak to an expert:</span> {BRAND.phone}
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <p>&copy; {new Date().getFullYear()} {BRAND.name}. Savings estimates are illustrative, not a quote.</p>
        <p>
          <a href="/privacy">Privacy</a> &nbsp;·&nbsp; <a href="/terms">Terms</a> &nbsp;·&nbsp;{' '}
          <a href="/do-not-sell">Do not sell my information</a>
        </p>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
