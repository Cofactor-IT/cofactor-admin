'use client';

/**
 * page.tsx
 *
 * Forgot-password page for requesting reset email/token.
 */

import { useActionState } from 'react';
import {
    requestPasswordReset,
    type ForgotPasswordActionState,
} from '../../../actions/password-reset.actions';
import { Button } from '../../../components/ui/Button';
import { TextButton } from '../../../components/ui/TextButton';

const INITIAL_STATE: ForgotPasswordActionState = {
    success: false,
    message: '',
};

function firstFieldError(state: ForgotPasswordActionState, field: string): string | null {
    return state.fieldErrors?.[field]?.[0] ?? null;
}

function hasFieldError(state: ForgotPasswordActionState, field: string): boolean {
    return Boolean(firstFieldError(state, field));
}

/**
 * Renders forgot-password request form.
 *
 * @returns Password reset request UI
 */
export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, INITIAL_STATE);

    return (
        <main className="admin-shell">
            <section className="admin-page-content admin-auth-content">
                <form
                    action={formAction}
                    className="admin-card admin-auth-form admin-auth-form-wide"
                >
                    <h1 className="m-0">Forgot Password</h1>
                    <p className="body m-0">
                        Enter your @cofactor.world email and we will send reset instructions.
                    </p>

                    <label
                        className={`label${hasFieldError(state, 'email') ? ' admin-field-error' : ''}`}
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={`admin-input${hasFieldError(state, 'email') ? ' admin-input-error' : ''}`}
                        aria-invalid={hasFieldError(state, 'email')}
                        autoComplete="email"
                        required
                    />
                    {firstFieldError(state, 'email') ? (
                        <p className="caption admin-field-error">
                            {firstFieldError(state, 'email')}
                        </p>
                    ) : null}

                    {state.message ? (
                        <p className={`caption${state.success ? '' : ' admin-field-error'}`}>
                            {state.message}
                        </p>
                    ) : null}

                    {state.devResetUrl ? (
                        <p className="caption">
                            Dev reset link:{' '}
                            <a className="admin-text-button" href={state.devResetUrl}>
                                open reset page
                            </a>
                        </p>
                    ) : null}

                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Sending...' : 'Send Reset Instructions'}
                    </Button>
                    <TextButton href="/signin">Back to sign in</TextButton>
                </form>
            </section>
        </main>
    );
}
