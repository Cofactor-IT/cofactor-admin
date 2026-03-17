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
import { requireAnalyst, requireGdprView, requireIT, requireITAdmin } from './permissions';

// ============================================
// requireAnalyst
// ============================================

describe('requireAnalyst', () => {
    it('returns authenticated session', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_any_1', role: 'ANALYST', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireAnalyst();
        expect(session.user.id).toBe('user_any_1');
    });
});

// ============================================
// requireIT
// ============================================

describe('requireIT', () => {
    it('allows IT users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_it_1', role: 'IT', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireIT();
        expect(session.user.role).toBe('IT');
    });

    it('allows IT_ADMIN users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_itadmin_1', role: 'IT_ADMIN', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireIT();
        expect(session.user.role).toBe('IT_ADMIN');
    });

    it('rejects ANALYST users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_analyst_1', role: 'ANALYST', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        await expect(requireIT()).rejects.toThrow('Unauthorized');
    });
});

// ============================================
// requireITAdmin
// ============================================

describe('requireITAdmin', () => {
    it('allows IT_ADMIN users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_itadmin_1', role: 'IT_ADMIN', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireITAdmin();
        expect(session.user.role).toBe('IT_ADMIN');
    });

    it('rejects IT users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_it_1', role: 'IT', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        await expect(requireITAdmin()).rejects.toThrow('Unauthorized');
    });

    it('rejects ANALYST users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_analyst_1', role: 'ANALYST', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        await expect(requireITAdmin()).rejects.toThrow('Unauthorized');
    });
});

// ============================================
// requireGdprView
// ============================================

describe('requireGdprView', () => {
    it('allows IT users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_it_1', role: 'IT', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireGdprView();
        expect(session.user.id).toBe('user_it_1');
    });

    it('allows IT_ADMIN users', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_itadmin_1', role: 'IT_ADMIN', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireGdprView();
        expect(session.user.id).toBe('user_itadmin_1');
    });

    it('allows ANALYST with gdprDelegate flag', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_gdpr_1', role: 'ANALYST', gdprDelegate: true },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        const session = await requireGdprView();
        expect(session.user.id).toBe('user_gdpr_1');
    });

    it('rejects ANALYST without gdprDelegate flag', async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            user: { id: 'user_analyst_1', role: 'ANALYST', gdprDelegate: false },
        } as Awaited<ReturnType<typeof getCurrentSession>>);

        await expect(requireGdprView()).rejects.toThrow('Unauthorized');
    });
});
