'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Client-side wrapper around NextThemesProvider that forwards all props and children.
 *
 * This component re-exports the underlying NextThemesProvider from `next-themes`
 * so the application can import a locally named ThemeProvider while preserving
 * type-safety via `ThemeProviderProps`. All received props are passed through
 * to the underlying provider and `children` are rendered inside it.
 *
 * @param children - React nodes to be rendered within the theme provider.
 * @returns The rendered NextThemesProvider element with forwarded props and children.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
