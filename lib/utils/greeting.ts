/**
 * greeting.ts
 *
 * Utility helpers for dashboard greeting copy and signal prioritization.
 */

import {
    findGreetingSignalMetrics,
    type GreetingSignalMetrics,
} from '../database/queries/greeting';

interface GreetingSignal {
    message: string;
    priority: number;
}

function firstName(name: string): string {
    return name.split(/\s+/).filter(Boolean)[0] ?? 'there';
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
    return count === 1 ? singular : plural;
}

function getTimeOfDay(now: Date): 'morning' | 'afternoon' | 'evening' {
    const hour = now.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

function getGreetingPrefix(name: string, now: Date): string {
    return `Good ${getTimeOfDay(now)}, ${firstName(name)}.`;
}

function overdueNextStepsSignal(count: number): GreetingSignal | null {
    if (count === 0) return null;
    return {
        message: `You have ${count} overdue ${pluralize(count, 'next step')} in your CRM.`,
        priority: 1,
    };
}

function staleSubmissionsSignal(count: number): GreetingSignal | null {
    if (count === 0) return null;
    const verb = count === 1 ? 'has' : 'have';
    return {
        message: `${count} ${pluralize(count, 'submission')} ${verb} been in review for over 48 hours.`,
        priority: 2,
    };
}

function newSubmissionsSignal(count: number): GreetingSignal | null {
    if (count === 0) return null;
    return {
        message: `${count} new ${pluralize(count, 'submission')} since your last visit.`,
        priority: 3,
    };
}

function queuedSubmissionsSignal(count: number): GreetingSignal | null {
    if (count === 0) return null;
    return {
        message: `${count} ${pluralize(count, 'submission')} waiting for review.`,
        priority: 4,
    };
}

function signalMessage(metrics: GreetingSignalMetrics): string {
    const signals = [
        overdueNextStepsSignal(metrics.overdueNextSteps),
        staleSubmissionsSignal(metrics.staleSubmissions),
        newSubmissionsSignal(metrics.newSubmissionsSinceLastVisit),
        queuedSubmissionsSignal(metrics.queuedSubmissions),
    ].filter((signal): signal is GreetingSignal => signal !== null);

    if (signals.length === 0) return 'The queue is clear for now.';
    return signals.sort((left, right) => left.priority - right.priority)[0].message;
}

/**
 * Builds the contextual dashboard greeting line for the signed-in user.
 *
 * @param userId - Signed-in Admin user id
 * @param name - Signed-in Admin user name
 * @returns Combined greeting prefix and highest-priority signal
 */
export async function buildDashboardGreeting(userId: string, name: string): Promise<string> {
    const now = new Date();
    const metrics = await findGreetingSignalMetrics(userId);
    return `${getGreetingPrefix(name, now)} ${signalMessage(metrics)}`;
}
