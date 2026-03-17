/**
 * AdminShell.tsx
 *
 * Shared authenticated page shell with fixed Admin sidebar and page header.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SignOutButton } from './SignOutButton';

type AdminRoute =
    | '/dashboard'
    | '/submissions'
    | '/scouts'
    | '/crm'
    | '/pipeline'
    | '/templates'
    | '/auth/signup'
    | '/settings/audit-log';

interface AdminShellProps {
    pageTitle: string;
    activePath: AdminRoute;
    userName: string;
    userRole: 'ANALYST' | 'IT' | 'IT_ADMIN';
    pageActions?: ReactNode;
    children: ReactNode;
}

interface NavItemDefinition {
    href: Exclude<AdminRoute, '/auth/signup'>;
    label: string;
}

const NAV_ITEMS: NavItemDefinition[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/submissions', label: 'Submissions' },
    { href: '/scouts', label: 'Scouts' },
    { href: '/crm', label: 'CRM' },
    { href: '/pipeline', label: 'Deal Pipeline' },
    { href: '/templates', label: 'Email Templates' },
];

function getUserInitials(userName: string): string {
    const parts = userName
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
    if (parts.length === 0) return 'CA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function navItemClass(isActive: boolean): string {
    if (isActive) return 'admin-nav-item admin-nav-item-active';
    return 'admin-nav-item';
}

function utilityItemClass(isActive: boolean): string {
    if (isActive) return 'admin-sidebar-utility-link admin-sidebar-utility-link-active';
    return 'admin-sidebar-utility-link';
}

function navIconClassName(isActive: boolean): string {
    if (isActive) return 'admin-nav-icon text-[var(--white)]';
    return 'admin-nav-icon text-[rgba(255,255,255,0.8)]';
}

function DashboardIcon(props: { isActive: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={navIconClassName(props.isActive)}
        >
            <rect
                x="3.5"
                y="3.5"
                width="5.25"
                height="5.25"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="11.25"
                y="3.5"
                width="5.25"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="3.5"
                y="11.25"
                width="5.25"
                height="5.25"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="11.25"
                y="14"
                width="5.25"
                height="2.5"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    );
}

function FileStackIcon(props: { isActive: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={navIconClassName(props.isActive)}
        >
            <path d="M5.5 3.5h6l3 3v10h-9Z" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11.5 3.5v3h3" stroke="currentColor" strokeWidth="1.6" />
            <path
                d="M7.25 10h5.5M7.25 13h5.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function UsersIcon(props: { isActive: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={navIconClassName(props.isActive)}
        >
            <path
                d="M6.75 9.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM13.5 8a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M2.75 15.75a4 4 0 0 1 8 0M11 15.75a3 3 0 0 1 6 0"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ContactCardIcon(props: { isActive: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={navIconClassName(props.isActive)}
        >
            <rect
                x="3.5"
                y="4.5"
                width="13"
                height="11"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M6.5 9.25h7M6.5 12h4.5M7.75 7.25a1 1 0 1 1 0-.01"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function PipelineIcon(props: { isActive: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={navIconClassName(props.isActive)}
        >
            <rect
                x="3.5"
                y="4.5"
                width="4"
                height="11"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="8.5"
                y="7"
                width="3"
                height="8.5"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="12.5"
                y="9.5"
                width="4"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    );
}

function MailTemplateIcon(props: { isActive: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={navIconClassName(props.isActive)}
        >
            <rect
                x="3.5"
                y="5"
                width="13"
                height="10"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="m4.75 6.5 5.25 4 5.25-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function AuditTrailIcon(props: { isActive: boolean }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={navIconClassName(props.isActive)}
        >
            <path
                d="M10 4.25a5.75 5.75 0 1 0 5.75 5.75"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            <path
                d="M10 6.75v3.5l2.25 1.5M10 2.75v1.5M17.25 10h-1.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function navIcon(href: NavItemDefinition['href'], isActive: boolean): ReactNode {
    if (href === '/dashboard') return <DashboardIcon isActive={isActive} />;
    if (href === '/submissions') return <FileStackIcon isActive={isActive} />;
    if (href === '/scouts') return <UsersIcon isActive={isActive} />;
    if (href === '/crm') return <ContactCardIcon isActive={isActive} />;
    if (href === '/pipeline') return <PipelineIcon isActive={isActive} />;
    return <MailTemplateIcon isActive={isActive} />;
}

/**
 * Renders the shared Admin shell used on protected routes.
 *
 * @param props - Shell title, active route, identity and page content
 * @returns Sidebar + page content layout
 */
export function AdminShell(props: AdminShellProps) {
    const showTeamManagement = props.userRole === 'IT' || props.userRole === 'IT_ADMIN';
    const userInitials = getUserInitials(props.userName);

    return (
        <main className="admin-root">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <Image
                        src="/branding/cofactor-header-logo.png"
                        alt="Cofactor Admin wordmark"
                        width={148}
                        height={31}
                        priority
                    />
                    <span className="admin-sidebar-brand-label">admin</span>
                </div>

                <nav className="admin-sidebar-nav">
                    {NAV_ITEMS.map((item) => {
                        const isActive = props.activePath === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={navItemClass(isActive)}
                            >
                                {navIcon(item.href, isActive)}
                                <span className="label text-inherit">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-footer">
                    {showTeamManagement ? (
                        <>
                            <Link
                                href="/auth/signup"
                                className={utilityItemClass(props.activePath === '/auth/signup')}
                            >
                                <UsersIcon isActive={props.activePath === '/auth/signup'} />
                                <span className="label text-inherit">Team Members</span>
                            </Link>
                            <Link
                                href="/settings/audit-log"
                                className={utilityItemClass(
                                    props.activePath === '/settings/audit-log'
                                )}
                            >
                                <AuditTrailIcon
                                    isActive={props.activePath === '/settings/audit-log'}
                                />
                                <span className="label text-inherit">Audit Log</span>
                            </Link>
                        </>
                    ) : null}
                    <SignOutButton />
                </div>
            </aside>

            <div className="admin-page ml-[240px]">
                <header className="admin-page-header px-[32px]">
                    <h2 className="m-0">{props.pageTitle}</h2>
                    <div className="admin-page-actions">
                        {props.pageActions}
                        <div className="admin-header-account">
                            <div className="admin-header-account-copy">
                                <span className="label text-admin-primary">{props.userName}</span>
                                <span className="caption admin-header-role">{props.userRole}</span>
                            </div>
                            <div className="admin-header-avatar" aria-hidden="true">
                                <span className="label text-[var(--white)]">{userInitials}</span>
                            </div>
                        </div>
                    </div>
                </header>
                <section className="admin-page-content px-[32px] py-[24px]">
                    {props.children}
                </section>
            </div>
        </main>
    );
}
