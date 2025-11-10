# HBFA Unified Repository Architecture

This document describes the architecture and design decisions for the HBFA unified monorepo.

## Overview

The HBFA unified repository is structured as a monorepo containing multiple packages that work together to provide operations and sales management for Homes Built For America.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    HBFA Unified Repo                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Sales UI       │         │   Ops ERP        │    │
│  │   (React/Vite)   │◄───────►│   (Python)       │    │
│  └────────┬─────────┘         └────────┬─────────┘    │
│           │                             │               │
│           │                             │               │
│           ▼                             ▼               │
│  ┌─────────────────────────────────────────────────┐  │
│  │           AWS DynamoDB (us-east-2)               │  │
│  │  • hbfa_sales_offers                             │  │
│  │  • polaris_raw_weekly                            │  │
│  │  • fusion_offers                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │              AWS Services                        │  │
│  │  • S3 (Document storage)                         │  │
│  │  • Cognito (Authentication)                      │  │
│  │  • Lambda (Netlify Functions)                    │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Package Structure

### Monorepo Layout

```
hbfa-uni/
├── packages/                 # All application packages
│   ├── ops-erp/             # Operations & ERP system
│   └── sales-ui/            # Sales interface
├── docs/                    # Shared documentation
├── scripts/                 # Shared utility scripts
├── .github/                 # CI/CD workflows
├── package.json            # Root workspace config
└── .gitignore              # Git ignore patterns
```

### Package: ops-erp

**Purpose**: Backend operations for weekly report processing and data management

**Technology Stack**:
- Python 3.9+
- boto3 (AWS SDK)
- pandas (Data processing)
- ReportLab (PDF generation)

**Key Components**:
- `tools/polaris/`: Polaris report processing
  - `report_pdf.py`: Standard PDF generation
  - `report_pdf_hso.py`: HSO-specific PDF generation
- `scripts/`: Utility scripts for data operations

**Responsibilities**:
- Process weekly Excel reports from email
- Convert Excel to CSV format
- Generate Mylar PDFs with building schedules
- Manage DynamoDB data operations
- Handle backfill operations

### Package: sales-ui

**Purpose**: Front-end interface for sales operations

**Technology Stack**:
- React 18
- Vite (Build tool)
- Netlify (Hosting & Serverless)
- AWS Cognito (Authentication)

**Key Components**:
- `src/`: React application source
  - `components/`: Reusable UI components
  - `pages/`: Page-level components
  - `utils/`: Client-side utilities
- `netlify/functions/`: Serverless API endpoints
- `public/`: Static assets
- `scripts/`: Build and data scripts

**Responsibilities**:
- Render offer forms and tracking interfaces
- Handle user authentication via Cognito
- Generate and download PDFs for prospects
- Provide CRUD operations for offers and units
- Interface with DynamoDB via Netlify functions

## Data Flow

### Weekly Report Processing

```
┌─────────────┐
│ Email       │
│ Attachment  │
│ (Excel)     │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Preprocess   │
│ (Legacy Tool)│
└──────┬───────┘
       │
       ▼ CSV
┌──────────────────────┐
│ Import Script        │
│ (sales-ui/scripts)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DynamoDB             │
│ • polaris_raw_weekly │
│ • hbfa_sales_offers  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────┐
│ PDF Generator    │
│ (ops-erp/tools)  │
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ Mylar PDF    │
│ Output       │
└──────────────┘
```

### Offer Creation Flow

```
┌──────────────┐
│ User         │
│ (Sales UI)   │
└──────┬───────┘
       │
       ▼ Form Submit
┌──────────────────────┐
│ Netlify Function     │
│ (CommonJS Lambda)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ DynamoDB             │
│ hbfa_sales_offers    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ PDF Generator        │
│ (Browser/Server)     │
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│ Download     │
│ to Device    │
└──────────────┘
```

## Design Decisions

### 1. Monorepo Structure

**Decision**: Use npm workspaces for monorepo management

**Rationale**:
- Simple setup without additional tooling (like Lerna or Nx)
- Native npm support for workspaces
- Easy dependency management across packages
- Maintains separate package.json files for isolation

**Trade-offs**:
- Limited advanced features compared to specialized tools
- Manual coordination needed for some operations
- Good enough for this project's scale

### 2. Package Independence

**Decision**: Keep packages loosely coupled

**Rationale**:
- Each package can be developed independently
- Separate deployment pipelines
- Different technology stacks (Python vs JavaScript)
- Easier to split later if needed

**Trade-offs**:
- Some code duplication (e.g., DynamoDB schemas)
- Need to coordinate database changes
- Shared configuration in multiple places

### 3. Netlify Functions as API Layer

**Decision**: Use Netlify serverless functions for sales-ui API

**Rationale**:
- Serverless architecture reduces infrastructure management
- Built-in deployment with Netlify
- AWS Lambda runtime compatibility
- Easy integration with front-end

**Trade-offs**:
- Cold start latency
- Limited to CommonJS format for compatibility
- Function timeout constraints

### 4. CommonJS for Serverless Functions

**Decision**: Use CommonJS (require/exports) instead of ESM (import/export)

**Rationale**:
- AWS Lambda runtime expects CommonJS
- Avoids "Cannot use import statement outside a module" errors
- Netlify deployment works consistently
- Runtime Fetch API available (no need for node-fetch)

**Trade-offs**:
- Different module system than front-end code
- Cannot use ESM-only packages in functions
- Extra attention needed during development

### 5. DynamoDB as Primary Database

**Decision**: Use AWS DynamoDB for all data storage

**Rationale**:
- Scalable NoSQL solution
- Good AWS integration
- Pay-per-use pricing
- Fast read/write operations

**Trade-offs**:
- NoSQL limitations for complex queries
- Schema management requires care
- Need to handle data consistency
- Limited transaction support

## Security Considerations

### Authentication

- AWS Cognito for user authentication
- OAuth 2.0 flows
- Proper logout handling with session cleanup

### Data Access

- AWS IAM roles for service access
- Least privilege principle
- Environment variables for credentials
- No secrets in code or git history

### API Security

- Function-level authentication checks
- Input validation on all endpoints
- CORS configuration for API endpoints

## Deployment Strategy

### Sales UI

- **Platform**: Netlify
- **Trigger**: Push to main branch
- **Process**:
  1. Vite builds React app
  2. Netlify deploys static assets
  3. Serverless functions deployed to AWS Lambda
  4. DNS and CDN automatically updated

### Ops ERP

- **Platform**: Local execution or scheduled Lambda
- **Trigger**: Manual or scheduled (weekly)
- **Process**:
  1. Developer runs Python scripts locally
  2. Processes data and generates PDFs
  3. Uploads results to S3 if needed

## Performance Considerations

### Front-End (Sales UI)

- Vite for fast builds and HMR
- Code splitting for lazy loading
- Asset optimization (images, fonts)
- CDN delivery via Netlify

### Back-End (Ops ERP)

- Batch processing for large datasets
- Efficient pandas operations
- PDF generation optimized for size

### Database

- DynamoDB partition key design for distribution
- Query patterns optimized for access patterns
- Caching where appropriate

## Future Enhancements

### Short Term

- Add comprehensive test coverage
- Implement automated backups
- Set up monitoring and alerting
- Add integration tests

### Long Term

- Consider shared component library
- Evaluate migration to TypeScript
- Implement GraphQL API layer
- Add real-time features with WebSockets
- Containerize ops-erp for cloud execution

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review and update documentation
- Monitor AWS costs
- Review security alerts
- Backup DynamoDB tables

### Code Quality

- ESLint for JavaScript
- Black/Flake8 for Python
- Conventional commits
- Code reviews required

## Troubleshooting

Common issues and solutions documented in:
- [Migration Guide](MIGRATION.md)
- [Contributing Guide](../CONTRIBUTING.md)
- Individual package READMEs

## References

- [AWS DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [npm Workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)
- [React Best Practices](https://react.dev/learn)
