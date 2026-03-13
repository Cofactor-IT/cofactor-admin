/**
 * sanitization.ts
 *
 * Server-side sanitization helpers for user-generated content.
 */

import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_HTML_TAGS = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'blockquote',
    'code',
    'pre',
];
const ALLOWED_HTML_ATTRS = ['href', 'target', 'rel', 'class'];
const MAX_FILENAME_LENGTH = 255;
const MAX_SLUG_LENGTH = 100;

function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes rich-text HTML while preserving a limited safe tag set.
 *
 * @param html - Raw HTML string from user input
 * @returns Sanitized safe HTML
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ALLOWED_HTML_TAGS,
        ALLOWED_ATTR: ALLOWED_HTML_ATTRS,
        FORCE_BODY: true,
    });
}

/**
 * Strips all HTML tags and normalizes whitespace for plain-text fields.
 *
 * @param text - Raw text field value
 * @returns Sanitized plain text
 */
export function sanitizePlainText(text: string): string {
    const sanitized = DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });

    return normalizeWhitespace(sanitized);
}

/**
 * Restricts filenames to a safe ASCII subset and removes traversal patterns.
 *
 * @param filename - Raw filename from user input
 * @returns Sanitized filename safe for storage
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .replace(/^\./, '_')
        .slice(0, MAX_FILENAME_LENGTH);
}

/**
 * Normalizes arbitrary text into a URL-safe slug.
 *
 * @param slug - Raw slug source value
 * @returns Sanitized slug
 */
export function sanitizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, MAX_SLUG_LENGTH);
}
