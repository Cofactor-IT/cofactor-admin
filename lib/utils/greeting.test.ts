/**
 * greeting.test.ts
 *
 * Tests for dashboard greeting copy selection and formatting.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDashboardGreeting } from './greeting';
import { findGreetingSignalMetrics } from '../database/queries/greeting';

vi.mock('../database/queries/greeting', () => ({
    findGreetingSignalMetrics: vi.fn(),
}));

describe('dashboard greeting utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('prefers overdue CRM steps over all other signals', async () => {
        vi.setSystemTime(new Date(2026, 2, 12, 9, 0, 0));
        vi.mocked(findGreetingSignalMetrics).mockResolvedValue({
            overdueNextSteps: 2,
            staleSubmissions: 3,
            newSubmissionsSinceLastVisit: 5,
            queuedSubmissions: 7,
        });

        await expect(buildDashboardGreeting('user_1', 'NF Emmanuel')).resolves.toBe(
            'Good morning, NF. You have 2 overdue next steps in your CRM.'
        );
    });

    it('falls back to an all-clear message when no signals are active', async () => {
        vi.setSystemTime(new Date(2026, 2, 12, 18, 30, 0));
        vi.mocked(findGreetingSignalMetrics).mockResolvedValue({
            overdueNextSteps: 0,
            staleSubmissions: 0,
            newSubmissionsSinceLastVisit: 0,
            queuedSubmissions: 0,
        });

        await expect(buildDashboardGreeting('user_2', 'Ahmed Aizi')).resolves.toBe(
            'Good evening, Ahmed. The queue is clear for now.'
        );
    });
});
