@AGENTS.md

## Workflow rules

- **Auto-push after a successful build.** Whenever a feature, tool, or fix lands and `pnpm build` passes clean, immediately stage all changes, write a clear commit message, and `git push origin main`. Don't wait for the user to ask. GitHub Actions deploys from `main` to https://sonusharmafiles.github.io/toollyz/.
- Skip the push only if: the build fails, there are uncommitted secrets, or the user explicitly says to hold off.
