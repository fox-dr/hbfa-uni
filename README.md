# HBFA Unified Operations Platform

A consolidated platform for HBFA operations, sales, and reporting workflows.

## Overview

This unified platform consolidates three previously separate systems:
- **Operations Console** (milestone tracking, timeline rollups)
- **Sales Management** (unit inventory, status tracking) 
- **Report Generation** (Mylar PDFs, analytics)

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Deploy to AWS
npm run deploy
```

## Architecture

- **Frontend**: React + Vite SPA
- **Backend**: AWS Lambda functions
- **Database**: DynamoDB (us-east-2)
- **Hosting**: CloudFront + S3
- **Auth**: AWS Cognito

## Project Structure

```
src/
├── components/          # Shared UI components
├── pages/              # Main application views
├── services/           # API clients and business logic
├── utils/              # Shared utilities
└── styles/             # CSS and styling

lambda/
├── ops/                # Operations functions
├── sales/              # Sales management functions
└── reports/            # Report generation functions

infrastructure/
├── cloudformation/     # AWS infrastructure templates
└── scripts/           # Deployment and migration scripts
```

## Migration Status

- [ ] Initial project setup
- [ ] Core infrastructure deployment
- [ ] Operations module migration
- [ ] Sales module migration
- [ ] Reports module migration
- [ ] Data consolidation (us-west-1 → us-east-2)
- [ ] Production deployment

## Environment Setup

See `HBFA_UNIFIED_VISION.md` for detailed implementation roadmap and architecture decisions.

## Contributing

1. Create feature branch from `main`
2. Make changes and test locally
3. Submit PR with clear description
4. Deploy after review and approval

## Support

For questions or issues, see the vision document or contact the development team.