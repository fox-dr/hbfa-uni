# Contributing to HBFA Unified Repository

Thank you for contributing to the HBFA unified repository! This guide will help you get started.

## Code of Conduct

- Be respectful and professional
- Focus on constructive feedback
- Help maintain a welcoming environment

## Getting Started

1. **Fork the repository** (for external contributors)
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/hbfa-uni.git
   cd hbfa-uni
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-user-auth`)
- `fix/` - Bug fixes (e.g., `fix/pdf-generation-error`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(sales-ui): add unit search functionality
fix(ops-erp): correct PDF generation date format
docs: update installation instructions
chore(deps): update react to v18.2.0
```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the appropriate package:
   - `packages/sales-ui/` for front-end changes
   - `packages/ops-erp/` for backend/ERP changes

3. **Test your changes**:
   ```bash
   # Run tests for all packages
   npm test
   
   # Or test a specific package
   npm test --workspace=packages/sales-ui
   ```

4. **Lint your code**:
   ```bash
   npm run lint
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## Code Style Guidelines

### JavaScript/TypeScript (sales-ui)

- Use ES6+ syntax
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

Example:
```javascript
/**
 * Formats a price value with currency symbol and commas
 * @param {number} value - The price value
 * @returns {string} Formatted price string
 */
function formatPrice(value) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}
```

### Python (ops-erp)

- Follow PEP 8 style guide
- Use type hints where applicable
- Write docstrings for functions and classes
- Keep functions focused on single responsibility

Example:
```python
def process_report(file_path: str, report_date: str) -> dict:
    """
    Process a Polaris report and return normalized data.
    
    Args:
        file_path: Path to the CSV file
        report_date: Report date in YYYY-MM-DD format
    
    Returns:
        Dictionary containing processed report data
    """
    # Implementation
    pass
```

## Testing

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Aim for good test coverage
- Test both success and error cases

### Running Tests

```bash
# All tests
npm test

# Specific package
npm test --workspace=packages/sales-ui

# Python tests
cd packages/ops-erp
pytest
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New code has appropriate test coverage
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] No merge conflicts with main branch

### Pull Request Description

Include:
- **Summary**: Brief description of changes
- **Motivation**: Why is this change needed?
- **Changes**: List of specific changes made
- **Testing**: How was this tested?
- **Screenshots**: If applicable (for UI changes)

### Review Process

1. Automated checks run (linting, tests, builds)
2. Code review by maintainers
3. Address feedback and requested changes
4. Approval and merge

## Package-Specific Guidelines

### sales-ui

- Use React hooks for state management
- Keep components in `src/components/`
- Place Netlify functions in `netlify/functions/`
- Update relevant documentation in `docs/`

### ops-erp

- Place tools in `tools/` directory
- Add scripts to `scripts/` directory
- Update requirements.txt for new dependencies
- Document any new CLI commands

## Documentation

- Update README files when adding features
- Add inline comments for complex logic
- Update API documentation for new endpoints
- Include examples in documentation

## Questions?

If you have questions:
- Check existing documentation
- Review closed issues and PRs
- Open a new issue for discussion
- Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
