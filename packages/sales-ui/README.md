# HBFA Sales UI

The front-end sales interface for Homes Built For America, providing offer management, tracking, and customer-facing forms.

## Overview

This package is the React-based sales application that provides:

- **Preliminary Offer Form**: Generate and manage offer packets for lender review
- **Unit Tracking**: Search and track buyer information across units
- **Inventory Preview**: View available units and their details
- **PDF Generation**: Create formatted PDFs for prospect delivery
- **Authentication**: Secure access via AWS Cognito

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- AWS CLI configured with appropriate credentials
- Access to HBFA DynamoDB tables and Netlify functions

## Installation

From the package directory:

```bash
cd packages/sales-ui
npm install
```

Or from the root of the monorepo:

```bash
npm install
```

## Development

### Local Development Server

```bash
npm run dev
```

This starts the Vite development server, typically at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## Features

### Offer Form Enhancements

The preliminary offer form provides:

- **Lender notes** mirrored into template fields for PDF output
- **Price formatting** with comma separators (e.g., $1,250,000.00)
- **Phone number normalization** to `(###) ###-####` format
- **Direct PDF download** via "Save and generate PDF" button
- **Project integration** with automatic Fusion project_id inclusion

### Tracking Form

- **Buyer/unit lookup** with immediate form hydration
- **Save Tracking** buttons for quick updates without scrolling
- Status dropdown removed to focus on actionable fields

### Authentication

- Secure login via AWS Cognito
- Proper logout flow with session cleanup
- Redirect to Cognito logout endpoint with required parameters

## Architecture

### Netlify Functions

All Netlify serverless functions use CommonJS format to ensure compatibility with AWS Lambda runtime:

- Entry points use `require()` instead of `import`
- Handlers exported via `module.exports`
- Shared utilities under `netlify/functions/utils/`
- DocuSign integration uses runtime Fetch API

### Data Flow

1. **Front-end**: React components with Vite bundling
2. **API Layer**: Netlify serverless functions
3. **Database**: AWS DynamoDB (region: us-east-2)
4. **Storage**: S3 for generated PDFs and documents

## Project Structure

```
sales-ui/
├── src/                  # React application source
│   ├── components/       # React components
│   ├── pages/           # Page components
│   └── utils/           # Client utilities
├── netlify/
│   └── functions/       # Serverless API functions
│       └── utils/       # Shared serverless utilities
├── public/              # Static assets
├── scripts/             # Build and utility scripts
├── dist/                # Production build output
├── package.json         # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## Key Workflows

### Creating a New Offer

1. Navigate to the offer form
2. Fill in buyer, unit, and financial details
3. Add lender notes and pricing
4. Click "Save and generate PDF"
5. PDF downloads automatically to device

### Tracking a Unit

1. Use the tracking search to find buyer/unit
2. Form auto-populates with existing data
3. Update fields as needed
4. Click "Save Tracking" to commit changes

### Report Generation

1. Select filters (date range, status, etc.)
2. View on-screen table
3. Click "Download CSV" to export
4. Safeguards ensure CSV matches displayed data

## Configuration

Configuration is managed through environment variables:

- `VITE_API_URL`: Base URL for API endpoints
- `VITE_COGNITO_*`: AWS Cognito configuration
- `AWS_REGION`: AWS region (default: us-east-2)

Create a `.env.local` file for local development (not committed to git).

## Deployment

The application is deployed to Netlify with continuous deployment from the main branch.

### Manual Deployment

```bash
npm run build
netlify deploy --prod
```

## Testing

```bash
npm test
```

## Migration Note

This package was migrated from the standalone `hbfa-sales-ui` repository into the unified HBFA monorepo. Historical commit history is preserved.

## Recent Updates

### CommonJS Migration (Netlify Functions)

All Netlify function entry points converted to CommonJS to prevent runtime errors. If deploying updates, ensure you redeploy the Netlify site to replace ESM bundles.

### CSV Safeguards

Status/COE report downloads now mirror on-screen tables and handle empty API responses gracefully.

### Form Hydration

Tracking form immediately populates when selecting a buyer/unit from search results.

## Support

For issues or questions, please open an issue in the main HBFA unified repository.

## Related Packages

- [ops-erp](../ops-erp/README.md): Operations and ERP system for report processing
