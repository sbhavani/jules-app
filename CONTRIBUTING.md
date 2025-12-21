# Contributing to Jules UI

Thanks for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/jules-app.git`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`
5. Make your changes
6. Run tests: `npm test`
7. Run linter: `npm run lint`
8. Submit a pull request

## Development Guidelines

- **Atomic PRs**: Keep PRs focused on a single feature or fix.
- **Issue First**: Every PR should be linked to an existing GitHub Issue.
- **Tests**: Add tests for new features and bug fixes.
- **Documentation**: Update the [PRD](docs/PRD.md) if you are implementing a feature or changing architectural assumptions.

### Commit Message Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: ...` for new features
- `fix: ...` for bug fixes
- `docs: ...` for documentation changes
- `refactor: ...` for code refactoring
- `perf: ...` for performance improvements

### Pull Request Standards

To ensure high-quality code and maintain project alignment:
1. **Title**: Use an action-oriented title (e.g., `feat: implement session health monitoring`).
2. **Context**: Use the provided template to explain *why* the change is needed.
3. **Verification**: Explicitly list how the changes were tested.
4. **Architect's Alignment**: Ensure your changes match the **Acceptance Criteria** defined in the linked issue. If you need to deviate, explain why in the PR description.

## Project Structure

See the [PRD](docs/PRD.md) for detailed architecture and feature roadmap.

## Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/sbhavani/jules-app/issues).

### For Feature Requests
Please use the following format:
- **User Story**: "As a [role], I want to [action], so that [benefit]."
- **Description**: Detailed explanation of the feature.
- **Proposed Acceptance Criteria**: 3-5 checkboxes that define "done".

### For Bugs
- **Description**: Clear description of the problem.
- **Steps to Reproduce**: Detailed list of steps.
- **Environment**: OS, Browser, etc.
- **Expected vs Actual**: What should have happened vs what did.
- **Screenshots**: If applicable.

## Questions?

Feel free to ask questions in [GitHub Discussions](https://github.com/sbhavani/jules-app/discussions) or open an issue.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
