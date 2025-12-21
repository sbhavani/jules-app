# Gemini Assistant Guidelines

## Git Workflow

- **Commit Messages**:
  - Must be concise.
  - Must follow [Conventional Commits](https://www.conventionalcommits.org/) format (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`).
  - Examples:
    - `feat: add user login`
    - `fix: resolve crash on startup`
    - `docs: update readme`

- **Commit Frequency**:
  - Commit every major change or distinct logical unit of work. Do not bundle unrelated changes.

- **Pushing**:
  - Push changes to the remote repository approximately every 5 commits, or after a significant milestone is reached.

- **GitHub CLI**:
  - The GitHub CLI (`gh`) is always available. Use it for creating pull requests, managing issues, and other GitHub-integrated workflows.
