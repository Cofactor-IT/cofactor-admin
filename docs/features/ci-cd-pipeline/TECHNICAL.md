# CI/CD Pipeline - Technical Documentation

**Audience:** Developers  
**Last Updated:** 2026-03-12  
**Task:** CA-22

## Goal

Run the same quality gates in both GitHub and Bitbucket for every PR and `main` update.

## Files

```
.github/workflows/
`-- ci.yml                     # GitHub Actions workflow

bitbucket-pipelines.yml        # Bitbucket pipeline config
```

## Commands Used by CI

- `npm ci`
- `npm run prisma:generate:all`
- `npm run lint`
- `npm run type-check`
- `npm run build`

## Package Scripts

`package.json` defines:

- `lint`: `eslint . --max-warnings=0`
- `type-check`: `tsc --noEmit`
- `build`: `next build`

## Trigger Rules

GitHub Actions:

- push to `main`
- pull requests targeting `main`

Bitbucket Pipelines:

- pull requests (`"**"`)
- branch `main`

## Branch Protection Note

Config files alone do not block merging.  
Branch protection / merge checks must be enabled in repository settings:

- GitHub: require successful status checks on `main`
- Bitbucket: require passing builds before merge on `main`
