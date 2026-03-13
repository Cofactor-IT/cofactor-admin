/**
 * page.tsx
 *
 * Server wrapper for reset-password route.
 */

import { ResetPasswordForm } from './ResetPasswordForm';

interface ResetPasswordPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getFirstParamValue(value: string | string[] | undefined): string | undefined {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value[0];
    return undefined;
}

/**
 * Renders reset-password page with token from URL query.
 *
 * @param props - Route search params
 * @returns Reset-password page content
 */
export default async function ResetPasswordPage(props: ResetPasswordPageProps) {
    const params = (await props.searchParams) ?? {};
    const token = getFirstParamValue(params.token);

    return (
        <main className="admin-shell">
            <section className="admin-page-content admin-auth-content">
                <ResetPasswordForm token={token} />
            </section>
        </main>
    );
}
