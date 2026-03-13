/**
 * permissions.test.ts
 *
 * Tests for role-based permission helpers.
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('./session', () => ({
    getCurrentSession: vi.fn(),
}));

import { getCurrentSession } from './session';
import { requireAnalyst, requireIT } from './permissions';

describe('requireIT', () => {
    it('allows IT users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: {
                id: 'user_it_1',
                role: 'IT',
            },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireIT();
        expect(session.user.role).toBe('IT');
    });

    it('rejects analyst users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: {
                id: 'user_analyst_1',
                role: 'ANALYST',
            },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        await expect(requireIT()).rejects.toThrow('Unauthorized');
    });
});

describe('requireAnalyst', () => {
    it('returns authenticated session', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: {
                id: 'user_any_1',
                role: 'ANALYST',
            },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireAnalyst();
        expect(session.user.id).toBe('user_any_1');
    });
});
