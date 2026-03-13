/**
 * Card.tsx
 *
 * Reusable Admin card primitive with optional compound sections.
 */

import type { HTMLAttributes, ReactNode } from 'react';

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

function mergeClassNames(baseClassName: string, className?: string): string {
    if (!className) return baseClassName;
    return `${baseClassName} ${className}`.trim();
}

function CardRoot({ children, className, ...props }: CardSectionProps) {
    return (
        <div className={mergeClassNames('admin-card', className)} {...props}>
            {children}
        </div>
    );
}

function CardHeader({ children, className, ...props }: CardSectionProps) {
    return (
        <div className={mergeClassNames('admin-card-header', className)} {...props}>
            {children}
        </div>
    );
}

function CardBody({ children, className, ...props }: CardSectionProps) {
    return (
        <div className={mergeClassNames('admin-card-body', className)} {...props}>
            {children}
        </div>
    );
}

function CardFooter({ children, className, ...props }: CardSectionProps) {
    return (
        <div className={mergeClassNames('admin-card-footer', className)} {...props}>
            {children}
        </div>
    );
}

/**
 * Renders the standard Admin card surface and exposes compound sections.
 *
 * @param props - Card container props and children
 * @returns Card root component with Header, Body, and Footer helpers
 */
export const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
});
