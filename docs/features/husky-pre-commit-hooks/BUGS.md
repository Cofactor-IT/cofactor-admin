# Husky Pre-Commit Hooks Bugs (CA-21)

## Known Issues

- Prisma client generation can still hit Windows DLL file locks if another process is holding the generated client open
