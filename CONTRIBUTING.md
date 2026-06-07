# Contributing to ProfileChatter

Thank you for your interest in contributing to ProfileChatter! 🎉 We're excited to welcome new contributors and appreciate any help you can provide to make this project even better. Whether you're fixing bugs, adding features, improving documentation, or suggesting new ideas, your contributions are valuable and help build a stronger community.

## Getting Started

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub by clicking the "Fork" button on the [ProfileChatter repository page](https://github.com/dsj7419/ProfileChatter).

2. **Clone your fork** to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/ProfileChatter.git
   cd ProfileChatter
   ```

3. **Install dependencies** (a single root install covers the Configurator UI too, via npm workspaces):

   ```bash
   npm install
   ```

4. **Set up environment variables**:
   - Copy `.env.template` to `.env`
   - Fill in the required API keys and configuration values
   - Note: Some features require API keys (WakaTime, Spotify, GitHub) for local development and testing

5. **Verify your setup** by running the tests:

   ```bash
   npm run test
   ```

## Coding Standards & Style

ProfileChatter maintains high code quality standards to ensure consistency and maintainability:

- **ESLint**: We use ESLint for code linting. Run `npm run lint` to check for issues.
- **Prettier**: Code formatting is handled by Prettier. Run `npm run format` to auto-format your code.
- **SOLID Principles**: All new code should adhere to SOLID principles, particularly the Single Responsibility Principle (SRP).

**Before committing**, always run:

```bash
npm run lint
npm run format
```

Or run the full local gate (lint + tests with coverage + configurator build) in one shot — the same checks CI enforces:

```bash
npm run verify
```

## Running Tests

ProfileChatter has a comprehensive test suite covering both unit and integration tests:

- **Run all tests**: `npm run test`
- **Run with coverage**: `npm run coverage`
- **Run only unit tests**: `npm run test:unit`
- **Run only integration tests**: `npm run test:integration`
- **Watch mode** (for development): `npm run test:watch`

**Important**: All tests must pass for a Pull Request to be considered for merge. The CI/CD pipeline will automatically run tests on every PR.

## Submitting Pull Requests

### Process

1. **Fork the repository** (if you haven't already)

2. **Create a new branch** for your feature or bugfix:

   ```bash
   git checkout -b feature/new-data-source
   # or
   git checkout -b fix/avatar-rendering-bug
   ```

3. **Make your changes** following the coding standards above

4. **Ensure all tests pass**:

   ```bash
   npm run test
   npm run lint
   ```

5. **Write clear, concise commit messages**:

   ```bash
   git commit -m "feat: add support for Discord activity data source"
   git commit -m "fix: resolve avatar rendering issue in dark themes"
   ```

6. **Push your branch** to your fork:

   ```bash
   git push origin feature/new-data-source
   ```

7. **Open a Pull Request** against the `main` branch of the `dsj7419/ProfileChatter` repository

### Pull Request Description

When creating your PR, please:

- **Use a descriptive title** that clearly explains what the PR does
- **Link to relevant issues** using "Closes #123" or "Fixes #456" syntax
- **Provide a summary** of the changes and any necessary context
- **Include screenshots** if your changes affect the UI
- **Mention any breaking changes** or special considerations for reviewers

## Areas for Contribution

We welcome contributions in many areas! Here are some places where help would be especially appreciated:

### 🎨 **New Themes**

- Create additional color schemes and visual styles
- Improve existing theme implementations
- Add theme customization options

### 📊 **Additional Data Sources**

- Integrate new APIs for displaying user activity
- Enhance existing data source implementations
- Add error handling and fallback mechanisms

### 🖥️ **UI Improvements in the Configurator**

- Enhance the Svelte-based configuration interface
- Improve user experience and accessibility
- Add new configuration options and previews

### 🧪 **Expanding Test Coverage**

- Write tests for UI components
- Add integration tests for new features
- Improve test reliability and performance

### 📚 **Documentation Enhancements**

- Improve setup and configuration guides
- Create tutorials and examples
- Update API documentation

### 🐛 **Bug Fixes**

- Help identify and fix issues
- Improve error handling and user feedback
- Optimize performance

## Code of Conduct

We expect all contributors to adhere to a respectful and inclusive standard of communication. Please be kind, constructive, and professional in all interactions within the project community. We want ProfileChatter to be a welcoming space for developers of all backgrounds and experience levels.

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the "question" label
- Start a discussion in the repository's Discussions section
- Reach out to the maintainers

Thank you again for contributing to ProfileChatter! 🚀
