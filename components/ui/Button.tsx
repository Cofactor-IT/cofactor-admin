'use client';

/**
 * Button.tsx
 *
 * Reusable Admin button component adapted from Scout's button pattern.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
}

function getVariantClass(variant: ButtonVariant): string {
    if (variant === 'secondary') return 'admin-button-secondary';
    return 'admin-button-primary';
}

/**
 * Renders a themed button with primary/secondary variants.
 *
 * @param props - Native button props plus variant control
 * @returns Styled button element
 */
export function Button({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    ...props
}: ButtonProps) {
    const baseClass =
        'button rounded-full inline-flex items-center justify-center whitespace-nowrap transition-colors';
    const mergedClassName = `${baseClass} ${getVariantClass(variant)} ${className}`.trim();

    return (
        <button type={type} className={mergedClassName} {...props}>
            {children}
        </button>
    );
}
