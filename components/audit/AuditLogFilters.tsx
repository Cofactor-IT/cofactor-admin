'use client';

/**
 * AuditLogFilters.tsx
 *
 * Server-backed filter controls for the audit log page.
 */

import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type AuditLogStatusFilter = 'ALL' | 'SUCCESS' | 'FAILURE';
type AuditLogContextFilter = 'ALL' | 'ERRORS' | 'REQUEST' | 'EMPTY';

interface AuditLogActorOption {
    value: string;
    label: string;
}

interface AuditLogFiltersProps {
    initialActor: string;
    initialStatus: AuditLogStatusFilter;
    initialContext: AuditLogContextFilter;
    initialFrom: string;
    initialTo: string;
    actorOptions: AuditLogActorOption[];
}

function buildNextUrl(
    pathname: string,
    searchParams: URLSearchParams,
    filters: {
        actor: string;
        status: AuditLogStatusFilter;
        context: AuditLogContextFilter;
        from: string;
        to: string;
    }
): string {
    const nextParams = new URLSearchParams(searchParams);

    if (filters.actor) nextParams.set('actor', filters.actor);
    else nextParams.delete('actor');

    if (filters.status !== 'ALL') nextParams.set('status', filters.status);
    else nextParams.delete('status');

    if (filters.context !== 'ALL') nextParams.set('context', filters.context);
    else nextParams.delete('context');

    if (filters.from) nextParams.set('from', filters.from);
    else nextParams.delete('from');

    if (filters.to) nextParams.set('to', filters.to);
    else nextParams.delete('to');

    const nextQuery = nextParams.toString();
    return nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname;
}

/**
 * Renders audit-log select and date filters and syncs them to URL params.
 *
 * @param props - Initial server-derived filter values and actor options
 * @returns Filter panel for audit log review
 */
export function AuditLogFilters(props: AuditLogFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [actor, setActor] = useState(props.initialActor);
    const [status, setStatus] = useState<AuditLogStatusFilter>(props.initialStatus);
    const [context, setContext] = useState<AuditLogContextFilter>(props.initialContext);
    const [from, setFrom] = useState(props.initialFrom);
    const [to, setTo] = useState(props.initialTo);

    const currentSearchParams = useMemo(
        () => new URLSearchParams(searchParams.toString()),
        [searchParams]
    );

    function applyFilters(nextFilters: {
        actor: string;
        status: AuditLogStatusFilter;
        context: AuditLogContextFilter;
        from: string;
        to: string;
    }): void {
        const nextUrl = buildNextUrl(pathname, currentSearchParams, nextFilters);
        startTransition(() => {
            router.replace(nextUrl);
        });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        applyFilters({ actor, status, context, from, to });
    }

    function resetFilters(): void {
        setActor('');
        setStatus('ALL');
        setContext('ALL');
        setFrom('');
        setTo('');
        applyFilters({
            actor: '',
            status: 'ALL',
            context: 'ALL',
            from: '',
            to: '',
        });
    }

    return (
        <form className="admin-card admin-audit-filter-panel" onSubmit={handleSubmit}>
            <div className="admin-audit-filter-grid">
                <label className="admin-audit-filter-field">
                    <span className="caption">Actor</span>
                    <select
                        className="admin-input"
                        value={actor}
                        onChange={(event) => setActor(event.target.value)}
                        disabled={isPending}
                    >
                        <option value="">All actors</option>
                        {props.actorOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="admin-audit-filter-field">
                    <span className="caption">Status</span>
                    <select
                        className="admin-input"
                        value={status}
                        onChange={(event) => setStatus(event.target.value as AuditLogStatusFilter)}
                        disabled={isPending}
                    >
                        <option value="ALL">All statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILURE">Failure</option>
                    </select>
                </label>

                <label className="admin-audit-filter-field">
                    <span className="caption">Context</span>
                    <select
                        className="admin-input"
                        value={context}
                        onChange={(event) =>
                            setContext(event.target.value as AuditLogContextFilter)
                        }
                        disabled={isPending}
                    >
                        <option value="ALL">All context</option>
                        <option value="ERRORS">Errors only</option>
                        <option value="REQUEST">Request metadata</option>
                        <option value="EMPTY">No context</option>
                    </select>
                </label>

                <label className="admin-audit-filter-field">
                    <span className="caption">From</span>
                    <input
                        type="date"
                        className="admin-input"
                        value={from}
                        onChange={(event) => setFrom(event.target.value)}
                        disabled={isPending}
                    />
                </label>

                <label className="admin-audit-filter-field">
                    <span className="caption">To</span>
                    <input
                        type="date"
                        className="admin-input"
                        value={to}
                        onChange={(event) => setTo(event.target.value)}
                        disabled={isPending}
                    />
                </label>
            </div>

            <div className="admin-audit-filter-actions">
                <button
                    type="button"
                    className="admin-button-secondary button admin-audit-filter-submit"
                    onClick={resetFilters}
                    disabled={isPending}
                >
                    Reset
                </button>
                <button
                    type="submit"
                    className="admin-button-secondary button admin-audit-filter-submit"
                    disabled={isPending}
                >
                    Apply filters
                </button>
            </div>
        </form>
    );
}
