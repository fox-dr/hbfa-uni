# Migration Guide

This guide explains how to migrate code from the separate HBFA repositories into this unified monorepo.

## Overview

The unified repository consolidates:
- `fox-dr/hbfa-ops-erp` → `packages/ops-erp`
- `fox-dr/hbfa-sales-ui` → `packages/sales-ui`

## Migration Strategy

### Option 1: Fresh Start (Recommended for Initial Setup)

Clone both repositories into the appropriate package directories while preserving git history:

```bash
# From the root of hbfa-uni

# Migrate ops-erp
git subtree add --prefix=packages/ops-erp https://github.com/fox-dr/hbfa-ops-erp.git master --squash

# Migrate sales-ui
git subtree add --prefix=packages/sales-ui https://github.com/fox-dr/hbfa-sales-ui.git main --squash
```

### Option 2: Manual Migration

If you prefer more control, manually copy files:

1. **Clone the source repositories**:
   ```bash
   cd /tmp
   git clone https://github.com/fox-dr/hbfa-ops-erp.git
   git clone https://github.com/fox-dr/hbfa-sales-ui.git
   ```

2. **Copy files to unified repo**:
   ```bash
   # Navigate to hbfa-uni root
   cd /path/to/hbfa-uni
   
   # Copy ops-erp files
   cp -r /tmp/hbfa-ops-erp/* packages/ops-erp/
   
   # Copy sales-ui files
   cp -r /tmp/hbfa-sales-ui/* packages/sales-ui/
   ```

3. **Update dependencies**:
   ```bash
   npm install
   ```

## Post-Migration Steps

### 1. Update Import Paths

Some imports may need updating to reflect the new monorepo structure.

#### For sales-ui (JavaScript)

Update any relative imports that reference shared utilities:

```javascript
// Before (in separate repo)
import { formatPrice } from '../../utils/format';

// After (in monorepo)
import { formatPrice } from '../../utils/format';  // Usually no change needed
```

#### For ops-erp (Python)

Update module imports if needed:

```python
# Before (in separate repo)
from tools.polaris.report_pdf import generate_report

# After (in monorepo) - usually the same
from tools.polaris.report_pdf import generate_report
```

### 2. Update Environment Variables

Create a `.env.local` file at the root or in specific packages:

```bash
# Root .env.local (for shared config)
AWS_REGION=us-east-2
AWS_PROFILE=hbfa-dev

# packages/sales-ui/.env.local
VITE_API_URL=https://api.example.com
VITE_COGNITO_USER_POOL_ID=us-east-2_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxx
```

### 3. Update CI/CD Configuration

If you have GitHub Actions or other CI/CD:

1. Move workflow files to `.github/workflows/`
2. Update paths in workflow files to point to correct packages
3. Update deployment scripts to work with monorepo structure

Example GitHub Actions workflow:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test-sales-ui:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/sales-ui
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test

  test-ops-erp:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/ops-erp
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: pip install -r requirements.txt
      - run: pytest
```

### 4. Update Documentation References

Search for references to old repository paths and update them:

```bash
# Find references to old repo
grep -r "hbfa-ops-erp" .
grep -r "hbfa-sales-ui" .

# Update to point to packages/ops-erp or packages/sales-ui
```

### 5. Update Package Scripts

If scripts reference absolute paths or other repository locations, update them:

```javascript
// Before (in standalone repo)
const configPath = '/path/to/hbfa-ops-erp/config.json';

// After (in monorepo)
const configPath = path.join(__dirname, '../ops-erp/config.json');
```

## Verifying the Migration

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
# Test all packages
npm test

# Test individual packages
npm test --workspace=packages/sales-ui
cd packages/ops-erp && pytest
```

### 3. Run Development Servers

```bash
# Sales UI
npm run dev:sales-ui

# Ops ERP
cd packages/ops-erp
python -m tools.polaris.report_pdf_hso --help
```

### 4. Build Production Assets

```bash
npm run build
```

## Path Reference Changes

| Old Path (Separate Repos) | New Path (Monorepo) |
|---------------------------|---------------------|
| `hbfa-ops-erp/tools/` | `packages/ops-erp/tools/` |
| `hbfa-ops-erp/scripts/` | `packages/ops-erp/scripts/` |
| `hbfa-sales-ui/src/` | `packages/sales-ui/src/` |
| `hbfa-sales-ui/netlify/` | `packages/sales-ui/netlify/` |
| `hbfa-sales-ui/scripts/` | `packages/sales-ui/scripts/` |

## Troubleshooting

### Module Not Found Errors

If you see "module not found" errors:

1. Check that `node_modules` exists in the root
2. Run `npm install` from the root
3. Check that package.json workspaces configuration is correct

### Import Errors (Python)

If Python imports fail:

1. Ensure you're running from the correct directory
2. Check PYTHONPATH includes the package directory
3. Verify requirements.txt dependencies are installed

### Git History

To preserve commit history from separate repos:

```bash
# View history from migrated repos
git log --follow packages/ops-erp/
git log --follow packages/sales-ui/
```

## Rollback Plan

If you need to revert the migration:

1. The original repositories remain unchanged
2. You can continue working in separate repos if needed
3. Delete the unified repo and start fresh

## Next Steps

After migration:

1. Archive or mark the old repositories as deprecated
2. Update all documentation and links
3. Notify team members of the new structure
4. Update deployment pipelines
5. Update local development documentation

## Support

If you encounter issues during migration:
- Check the troubleshooting section above
- Review closed issues in the repository
- Open a new issue with details about the problem
