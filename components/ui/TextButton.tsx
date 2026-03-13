'use client';

/**
 * TextButton.tsx
 *
 * Link-style text button for lightweight actions.
 */

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface TextButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    children: ReactNode;
    href?: string;
}

function getClassName(className: string): string {
    return `label admin-text-button inline-flex items-center ${className}`.trim();
}

/**
 * Renders text-button UI as either link or button.
 *
 * @param props - Text button content and interaction props
 * @returns Link or button element with shared text-button styling
 */
export function TextButton({ children, href, className = '', ...props }: TextButtonProps) {
    const mergedClassName = getClassName(className);
    if (href) {
        return (
            <Link href={href} className={mergedClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={mergedClassName} {...props}>
            {children}
        </button>
    );
}
