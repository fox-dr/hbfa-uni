# Quick Start Guide

Get up and running with the HBFA unified repository in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Python** v3.9 or higher ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))
- **AWS CLI** configured ([Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/fox-dr/hbfa-uni.git
cd hbfa-uni
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies for all packages
npm install

# Install Python dependencies for ops-erp
cd packages/ops-erp
pip install -r requirements.txt
cd ../..
```

### 3. Configure Environment

Create environment files:

```bash
# Root .env.local (optional, for shared config)
cat > .env.local << EOF
AWS_REGION=us-east-2
AWS_PROFILE=hbfa-dev
EOF

# Sales UI environment
cat > packages/sales-ui/.env.local << EOF
VITE_API_URL=your-api-url
VITE_COGNITO_USER_POOL_ID=your-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
EOF
```

## Running the Applications

### Sales UI (Development Mode)

```bash
# From root
npm run dev:sales-ui

# Or from package directory
cd packages/sales-ui
npm run dev
```

Visit http://localhost:5173 in your browser.

### Ops ERP (Report Processing)

```bash
cd packages/ops-erp

# Generate a Mylar PDF
python -m tools.polaris.report_pdf_hso --output reports/mylar-2025-11-10.pdf

# Process a weekly report (requires sales-ui scripts)
cd ../sales-ui
node scripts/import-polaris-report.mjs --file="path/to/report.csv" --report-date=2025-11-10
```

## Common Tasks

### Building for Production

```bash
# Build all packages
npm run build

# Build specific package
npm run build:sales-ui
```

### Running Tests

```bash
# Test all packages
npm test

# Test specific package
npm test --workspace=packages/sales-ui
```

### Linting

```bash
# Lint all packages
npm run lint

# Lint specific package
npm run lint --workspace=packages/sales-ui
```

## Package-Specific Quick Starts

### Working on Sales UI

```bash
cd packages/sales-ui

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Working on Ops ERP

```bash
cd packages/ops-erp

# Run Python scripts
python -m tools.polaris.report_pdf_hso --help

# Run tests
pytest

# Format code
black .
```

## Typical Workflows

### 1. Processing a Weekly Report

```bash
# Step 1: Save Excel attachment to local directory
# Step 2: Preprocess with legacy tool to CSV
# Step 3: Import to DynamoDB
cd packages/sales-ui
node scripts/import-polaris-report.mjs \
  --file="/path/to/Polaris_Processed.csv" \
  --report-date=2025-11-10

# Step 4: Generate Mylar PDF
cd ../ops-erp
python -m tools.polaris.report_pdf_hso \
  --output reports/mylar-2025-11-10.pdf
```

### 2. Creating a New Offer

1. Start the Sales UI: `npm run dev:sales-ui`
2. Navigate to the offer form
3. Fill in buyer, unit, and financial details
4. Click "Save and generate PDF"
5. PDF downloads automatically

### 3. Tracking a Unit

1. Start the Sales UI
2. Use the tracking search
3. Select buyer/unit
4. Form auto-populates
5. Make updates
6. Click "Save Tracking"

## Troubleshooting

### Port Already in Use

If port 5173 is in use:

```bash
# Specify a different port
npm run dev:sales-ui -- --port 5174
```

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Python Import Errors

```bash
# Ensure you're in the correct directory
cd packages/ops-erp

# Reinstall dependencies
pip install -r requirements.txt
```

### AWS Credentials

Ensure AWS CLI is configured:

```bash
aws configure
# Enter your access key, secret key, and region (us-east-2)
```

## Next Steps

- Read the [Architecture documentation](docs/ARCHITECTURE.md)
- Check out the [Contributing guide](CONTRIBUTING.md)
- Review the [Migration guide](docs/MIGRATION.md) if moving from separate repos
- Explore individual package READMEs:
  - [ops-erp README](packages/ops-erp/README.md)
  - [sales-ui README](packages/sales-ui/README.md)

## Getting Help

- Check the documentation in the `docs/` directory
- Review package-specific READMEs
- Open an issue on GitHub
- Contact the development team

## Useful Commands

```bash
# View all workspace packages
npm ls --workspaces --depth=0

# Clean everything
npm run clean

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

Happy coding! 🚀
