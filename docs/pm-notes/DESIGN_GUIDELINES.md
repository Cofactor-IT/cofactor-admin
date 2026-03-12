# Cofactor Admin - Design Guidelines

**Audience:** Developers, Designers  
**Last Updated:** 2026-03-12  
**Base:** Extends Cofactor Scout design guidelines

---

## What Stays The Same

All Scout design foundation rules still apply unless overridden here:

- Color palette foundation and brand accent (teal)
- Typography system and class names (`.h1`, `.h2`, `.body`, `.caption`, etc.)
- Border radius rules (4px for cards/inputs, full pill for buttons/badges)
- Responsive breakpoints
- General component quality standards

Admin should feel related to Scout, not visually disconnected.

---

## What Changes For Admin

Scout is public-facing and spacious.  
Admin is internal tooling: darker, denser, and more operational.

---

## Admin Color Tokens

Use these Admin-specific tokens in addition to shared Scout tokens:

```css
--admin-bg: #0F1923;
--admin-surface: #1B2A4A;
--admin-surface-raised: #243656;
--admin-border: #2D3F5F;
--admin-text-primary: #F0F4F8;
--admin-text-secondary: #8FA3BF;
```

Preferred usage:

```tsx
<main className="bg-[var(--admin-bg)] text-[var(--admin-text-primary)]" />
<Card className="bg-[var(--admin-surface)] border border-[var(--admin-border)]" />
<Modal className="bg-[var(--admin-surface-raised)] border border-[var(--admin-border)]" />
```

---

## Sidebar Navigation

Admin navigation uses a persistent left sidebar as the primary wayfinding pattern.

```tsx
<aside className="fixed left-0 top-0 h-screen w-[240px] bg-[var(--admin-surface)] border-r border-[var(--admin-border)] flex flex-col">
  <div className="h-[64px] flex items-center px-[24px] border-b border-[var(--admin-border)]">
    <Wordmark />
  </div>

  <nav className="flex-1 px-[12px] py-[16px] flex flex-col gap-[4px]">
    <NavItem href="/submissions" icon={FileStack} label="Submissions" />
    <NavItem href="/scouts" icon={Users} label="Scout Profiles" />
    <NavItem href="/crm" icon={ContactCard} label="CRM" />
    <NavItem href="/pipeline" icon={Pipeline} label="Deal Pipeline" />
    <NavItem href="/templates" icon={Mail} label="Email Templates" />
  </nav>

  <div className="h-[64px] flex items-center px-[24px] border-t border-[var(--admin-border)]">
    <span className="caption text-[var(--admin-text-secondary)]">User Name - ROLE</span>
  </div>
</aside>
```

Nav item states:

```tsx
<div className="flex items-center gap-[12px] px-[12px] h-[40px] rounded-[4px] bg-[var(--teal)] text-white" />
<div className="flex items-center gap-[12px] px-[12px] h-[40px] rounded-[4px] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-raised)] hover:text-white" />
```

---

## Page Layout

Pages should account for the fixed sidebar width:

```tsx
<div className="ml-[240px] min-h-screen bg-[var(--admin-bg)]">
  <header className="h-[64px] flex items-center justify-between px-[32px] border-b border-[var(--admin-border)]">
    <h2 className="text-[var(--admin-text-primary)]">Submissions</h2>
    <div>{/* Page-level actions */}</div>
  </header>

  <main className="px-[32px] py-[24px]">{/* Content */}</main>
</div>
```

Base page shell rules:

- Sidebar width is fixed at `240px`
- Main content shell uses `ml-[240px]`
- Header always uses title-left / actions-right alignment
- Content padding defaults to `px-[32px] py-[24px]`
- Layout is desktop-only and stable from `1024px` upward

---

## Density Rules

Admin is compact by default:

- Table rows: `h-[48px]`
- Card padding: `p-[16px] md:p-[24px]`
- Layout gaps: `gap-2 md:gap-4`
- Input height: `h-[36px] px-[12px]`
- Input text: `14px` (compact by default)

Admin input contrast/focus defaults:

- Base border: `--admin-border-strong`
- Hover border: higher-contrast navy-blue tint
- Focus border: `--admin-focus` with subtle teal ring
- Validation error border: `--admin-error-strong` with a red focus ring
- Validation error label/helper text: `--admin-error`

Avoid Scout's spacious defaults in dense Admin views.

---

## Typography On Dark Surfaces

Use existing typography classes, but with dark-surface color pairing:

```tsx
<h2 className="text-[var(--admin-text-primary)]">Page Title</h2>
<p className="body text-[var(--admin-text-primary)]">Primary body text</p>
<p className="body text-[var(--admin-text-secondary)]">Secondary/supporting text</p>
<span className="caption text-[var(--admin-text-secondary)]">Metadata</span>
```

---

## Cards And Panels

Cards should use Admin surfaces:

```tsx
<Card className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-none" style={{ borderRadius: "4px" }} />
```

White cards are a Scout pattern and should not be used in Admin.

---

## Status Badges On Dark

Use Scout status semantics with dark-optimized contrast:

```tsx
PENDING:    { bg: "rgba(254, 243, 199, 0.15)", text: "#FCD34D" }
VALIDATING: { bg: "rgba(219, 234, 254, 0.15)", text: "#93C5FD" }
APPROVED:   { bg: "rgba(209, 250, 229, 0.15)", text: "#6EE7B7" }
REJECTED:   { bg: "rgba(254, 226, 226, 0.15)", text: "#FCA5A5" }
```

---

## Teal Accent Usage

Teal remains the primary action color for continuity with Scout:

- Primary buttons
- Active sidebar item
- Links and action accents
- Positive trend accents

---

## What Not To Do

- Do not use white/off-white page backgrounds in Admin
- Do not use top-only navigation patterns
- Do not use Scout spacing defaults in dense queue/table views
- Do not use dark text on dark surfaces
- Do not skip sidebar structure on Admin pages
- Do not bypass Scout baseline rules not explicitly overridden here

---

## Admin Examples

### Submissions Queue Row

```tsx
<tr className="h-[48px] border-b border-[var(--admin-border)] hover:bg-[var(--admin-surface-raised)]">
  <td className="px-[16px] caption text-[var(--admin-text-primary)]">Quantum Error Correction</td>
  <td className="px-[16px] caption text-[var(--admin-text-secondary)]">Dr. Sarah Chen</td>
  <td className="px-[16px]">
    <span className="status-badge status-badge-approved">Reviewing</span>
  </td>
  <td className="px-[16px] caption text-[var(--admin-text-secondary)]">Mar 10, 2026</td>
</tr>
```

### Stat Card

```tsx
<Card className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-[24px]" style={{ borderRadius: "4px" }}>
  <div className="caption text-[var(--admin-text-secondary)] mb-[8px]">Active Submissions</div>
  <div className="text-[32px] font-bold text-[var(--admin-text-primary)]">24</div>
  <div className="caption text-[var(--teal)] mt-[4px]">+3 this week</div>
</Card>
```

---

Same family, different room.
