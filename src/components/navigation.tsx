'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { HelpCircle, List, Plus } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Submit Question',
      icon: Plus,
    },
    {
      href: '/questions',
      label: 'View Questions',
      icon: List,
    },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <HelpCircle className="h-6 w-6" />
              <span className="font-bold text-lg">AI Seminar</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
