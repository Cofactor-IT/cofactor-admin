/**
 * layout.tsx
 *
 * Root layout for the Admin app.
 */

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Merriweather, Rethink_Sans } from 'next/font/google';
import './globals.css';

const rethinkSans = Rethink_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-rethink-sans',
    weight: ['400', '500', '600', '700'],
});

const merriweather = Merriweather({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-merriweather',
    weight: ['400', '700'],
});

export const metadata: Metadata = {
    title: 'Cofactor Admin',
    description: 'Internal operations platform for Cofactor.',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
    },
};

export const viewport: Viewport = {
    themeColor: '#1B2A4A',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${rethinkSans.variable} ${merriweather.variable} admin-root`}>
                {children}
            </body>
        </html>
    );
}
