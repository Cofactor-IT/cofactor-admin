/**
 * sanitization.test.ts
 *
 * Tests for server-side sanitization helpers.
 */

import { describe, expect, it } from 'vitest';
import { sanitizeFilename, sanitizeHtml, sanitizePlainText, sanitizeSlug } from './sanitization';

describe('sanitizeHtml', () => {
    it('removes unsafe script content while preserving safe markup', () => {
        const result = sanitizeHtml('<p>Hello</p><script>alert(1)</script><strong>World</strong>');

        expect(result).toBe('<p>Hello</p><strong>World</strong>');
    });
});

describe('sanitizePlainText', () => {
    it('strips html and normalizes whitespace', () => {
        const result = sanitizePlainText('  <strong>Theis</strong>\n <em>Admin</em>  ');

        expect(result).toBe('Theis Admin');
    });
});

describe('sanitizeFilename', () => {
    it('removes unsafe characters and traversal patterns', () => {
        const result = sanitizeFilename('../draft<>notes?.md');

        expect(result).toBe('__draft__notes_.md');
    });
});

describe('sanitizeSlug', () => {
    it('normalizes arbitrary text into a safe slug', () => {
        const result = sanitizeSlug('  Admin Notes / March 2026  ');

        expect(result).toBe('admin-notes-march-2026');
    });
});
