# HBFA Unified Repository

This is the unified monorepo for **Homes Built For America** (HBFA), consolidating all HBFA systems into a single, cohesive development environment.

## Overview

The HBFA Unified Repository brings together multiple systems that were previously maintained as separate repositories:

- **ops-erp**: Operations and ERP system for weekly report processing, Mylar PDF generation, and DynamoDB management (Python-based)
- **sales-ui**: Sales interface for offer management, tracking, and customer-facing forms (React/Vite-based)

## Repository Structure

```
hbfa-uni/
├── packages/
│   ├── ops-erp/          # Operations & ERP system (Python)
│   └── sales-ui/         # Sales UI application (React/Vite)
├── docs/                 # Shared documentation
├── scripts/              # Shared utility scripts
├── .github/              # GitHub Actions workflows
├── package.json          # Root workspace configuration
├── README.md             # This file
└── .gitignore           # Git ignore patterns
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - for sales-ui and workspace management
- **Python** (v3.9 or higher) - for ops-erp
- **AWS CLI** configured with appropriate credentials
- **Git** for version control

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fox-dr/hbfa-uni.git
   cd hbfa-uni
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

This will install dependencies for all packages in the workspace.

### Working with Packages

Each package can be developed independently:

```bash
# Work on sales-ui
cd packages/sales-ui
npm run dev

# Work on ops-erp
cd packages/ops-erp
python -m tools.polaris.report_pdf_hso --help
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test --workspace=packages/sales-ui
```

## Package Details

### ops-erp

The operations and ERP system handles:
- Weekly Polaris report processing
- Mylar PDF generation
- DynamoDB data management
- Building milestone tracking

See [packages/ops-erp/README.md](packages/ops-erp/README.md) for detailed documentation.

### sales-ui

The sales UI provides:
- Preliminary offer form generation
- Unit tracking and inventory management
- PDF generation for prospects
- Authentication via AWS Cognito

See [packages/sales-ui/README.md](packages/sales-ui/README.md) for detailed documentation.

## Development Workflow

### Creating a New Feature

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes in the relevant package(s)

3. Test your changes locally

4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request

### Coding Standards

- **JavaScript/TypeScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 guidelines
- **Commits**: Use conventional commit format (feat:, fix:, docs:, etc.)

## Deployment

Each package has its own deployment strategy:

- **sales-ui**: Deployed to Netlify (continuous deployment from main branch)
- **ops-erp**: Manual deployment or scheduled execution for report processing

See individual package READMEs for deployment details.

## Contributing

1. Check existing issues or create a new one
2. Fork the repository
3. Create your feature branch
4. Make your changes with tests
5. Submit a Pull Request

## Migration from Separate Repositories

This unified repository consolidates the following previous repositories:
- `fox-dr/hbfa-ops-erp` → `packages/ops-erp`
- `fox-dr/hbfa-sales-ui` → `packages/sales-ui`

Historical commit history from individual repositories is preserved using git subtree merge strategy.

## Support

For questions or issues:
- Open a GitHub issue in this repository
- Contact the HBFA development team

## License

Copyright © 2025 Homes Built For America. All rights reserved.