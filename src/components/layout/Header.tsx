'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'FF Minimal' },
    { href: '/works', label: 'Works' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: "Let's Talk" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        {/* Navigation - Spread across */}
        <div className="flex items-center justify-between w-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs md:text-sm transition-colors ${
                  isActive
                    ? 'text-white font-normal'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
