/**
 * WorkspacePlaceholder.tsx
 *
 * Reusable placeholder body for Admin workspaces that are not built yet.
 */

import { Card } from '../ui/Card';

interface WorkspacePlaceholderProps {
    title: string;
    description: string;
}

/**
 * Renders a placeholder panel for an upcoming Admin workspace.
 *
 * @param props - Title and description for the placeholder state
 * @returns Placeholder content section
 */
export function WorkspacePlaceholder(props: WorkspacePlaceholderProps) {
    return (
        <section className="admin-content-stack">
            <Card>
                <Card.Body className="p-[24px]">
                    <h3 className="m-0">{props.title}</h3>
                    <p className="body mt-[12px] mb-0">{props.description}</p>
                </Card.Body>
            </Card>
        </section>
    );
}
