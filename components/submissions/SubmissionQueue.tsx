'use client';

/**
 * SubmissionQueue.tsx
 *
 * Client-rendered Scout submissions queue with interval-based live refresh.
 */

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useEffect } from 'react';
import { DashboardEmptyState } from '../dashboard/DashboardEmptyState';
import { Card } from '../ui/Card';
import type { ScoutSubmissionQueueResult } from '../../lib/database/queries/submissions';

interface SubmissionQueueProps {
    queue: ScoutSubmissionQueueResult;
}

interface SearchParamsLike {
    toString(): string;
}

const POLL_INTERVAL_MS = 30000;

function pageHref(pathname: string, searchParams: SearchParamsLike, page: number): string {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
        nextSearchParams.delete('page');
    } else {
        nextSearchParams.set('page', String(page));
    }

    const query = nextSearchParams.toString();
    if (!query) return pathname;
    return `${pathname}?${query}`;
}

function statusClassName(status: string): string {
    if (status === 'VALIDATING') return 'status-badge status-badge-validating';
    if (status === 'REJECTED') return 'status-badge status-badge-rejected';
    if (status === 'MATCH_MADE' || status === 'PITCHED_MATCHMAKING') {
        return 'status-badge status-badge-approved';
    }

    return 'status-badge status-badge-pending';
}

function queueSummary(queue: ScoutSubmissionQueueResult): string {
    if (!queue.scoutConfigured) return 'Scout read-only connection required';
    if (queue.pagination.totalItems === 0) return 'No submitted Scout leads yet';
    if (queue.pagination.totalItems === 1) return '1 submitted Scout lead';
    return `${queue.pagination.totalItems} submitted Scout leads`;
}

/**
 * Renders the Scout submissions queue and keeps it fresh with route refreshes.
 *
 * @param props - Queue data loaded on the server route
 * @returns Queue card with empty state, rows, and pagination controls
 */
export function SubmissionQueue(props: SubmissionQueueProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const serializedSearchParams = searchParams.toString();
    const previousPageHref = pageHref(pathname, searchParams, props.queue.pagination.page - 1);
    const nextPageHref = pageHref(pathname, searchParams, props.queue.pagination.page + 1);

    useEffect(() => {
        const refreshTimer = window.setInterval(() => {
            startTransition(() => {
                router.refresh();
            });
        }, POLL_INTERVAL_MS);

        return () => window.clearInterval(refreshTimer);
    }, [router, serializedSearchParams]);

    return (
        <section className="admin-content-stack admin-submissions-stack">
            <Card className="admin-submissions-card">
                <Card.Header className="admin-submissions-header">
                    <div className="admin-submissions-header-copy">
                        <h3 className="m-0">Incoming Scout submissions</h3>
                        <p className="body m-0">
                            Sorted newest first and refreshed automatically every 30 seconds.
                        </p>
                    </div>
                    <div className="admin-submissions-meta">
                        <span className="caption">{queueSummary(props.queue)}</span>
                        <span className="caption">Page {props.queue.pagination.page}</span>
                    </div>
                </Card.Header>

                <Card.Body className="admin-submissions-body">
                    {props.queue.items.length === 0 ? (
                        <DashboardEmptyState
                            icon="submission"
                            title="No Scout submissions yet"
                            message={props.queue.emptyMessage}
                            href="/dashboard"
                            actionLabel="Back to dashboard"
                        />
                    ) : (
                        <div className="admin-submissions-table-shell">
                            <div className="admin-submissions-table-scroll">
                                <div className="admin-submissions-table-head">
                                    <span className="caption">Submission title</span>
                                    <span className="caption">Scout</span>
                                    <span className="caption">Research area</span>
                                    <span className="caption">University</span>
                                    <span className="caption">Submitted</span>
                                    <span className="caption">Status</span>
                                </div>

                                <div className="admin-submissions-list">
                                    {props.queue.items.map((submission) => (
                                        <div key={submission.id} className="admin-submissions-row">
                                            <div className="admin-submissions-primary-cell">
                                                <p className="body-bold m-0">{submission.title}</p>
                                            </div>
                                            <div className="admin-submissions-cell">
                                                <p className="body m-0">{submission.scoutName}</p>
                                            </div>
                                            <div className="admin-submissions-cell">
                                                <p className="body m-0">
                                                    {submission.researchArea}
                                                </p>
                                            </div>
                                            <div className="admin-submissions-cell">
                                                <p className="body m-0">{submission.university}</p>
                                            </div>
                                            <div className="admin-submissions-cell">
                                                <p className="body m-0">
                                                    {submission.dateSubmittedLabel}
                                                </p>
                                            </div>
                                            <div className="admin-submissions-cell">
                                                <span
                                                    className={statusClassName(submission.status)}
                                                >
                                                    {submission.statusLabel}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </Card.Body>

                {props.queue.pagination.totalPages > 1 ? (
                    <Card.Footer className="admin-submissions-footer">
                        {props.queue.pagination.hasPreviousPage ? (
                            <Link
                                href={previousPageHref}
                                className="admin-button-secondary button admin-submissions-page-link"
                                scroll={false}
                            >
                                Previous
                            </Link>
                        ) : (
                            <span className="admin-submissions-page-link admin-submissions-page-link-disabled">
                                Previous
                            </span>
                        )}

                        <p className="caption m-0">
                            Showing page {props.queue.pagination.page} of{' '}
                            {props.queue.pagination.totalPages}
                        </p>

                        {props.queue.pagination.hasNextPage ? (
                            <Link
                                href={nextPageHref}
                                className="admin-button-secondary button admin-submissions-page-link"
                                scroll={false}
                            >
                                Next
                            </Link>
                        ) : (
                            <span className="admin-submissions-page-link admin-submissions-page-link-disabled">
                                Next
                            </span>
                        )}
                    </Card.Footer>
                ) : null}
            </Card>
        </section>
    );
}
