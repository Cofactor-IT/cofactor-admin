'use client';

/**
 * SearchBar.tsx
 *
 * Adapted search bar component for Admin query/filter surfaces.
 */

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="admin-search-icon">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path
                d="M13.25 13.25 16.5 16.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ClearIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="admin-search-icon">
            <path
                d="m6 6 8 8M14 6l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

/**
 * Renders the Admin search input with inline icon and clear control.
 *
 * @param props - Controlled input props for search surfaces
 * @returns Search input field with clear button
 */
export function SearchBar(props: SearchBarProps) {
    return (
        <div className="admin-search-shell">
            <span className="admin-search-adornment admin-search-adornment-left">
                <SearchIcon />
            </span>
            <input
                type="text"
                value={props.value}
                onChange={(event) => props.onChange(event.target.value)}
                placeholder={props.placeholder ?? 'Search...'}
                className="admin-input admin-search-input"
            />
            {props.value ? (
                <button
                    type="button"
                    onClick={props.onClear}
                    className="admin-search-adornment admin-search-clear"
                    aria-label="Clear search"
                >
                    <ClearIcon />
                </button>
            ) : null}
        </div>
    );
}
