# HBFA Operations & ERP System

The operations and ERP system for Homes Built For America, handling weekly report processing, Mylar PDF generation, and data management.

## Overview

This package manages the back-office operations for HBFA, including:

- **Weekly Polaris Report Processing**: Automated ingestion and processing of weekly Excel reports
- **Mylar PDF Generation**: Creating detailed milestone and schedule PDFs for construction tracking
- **DynamoDB Management**: Maintaining normalized data in AWS DynamoDB
- **Building Milestone Tracking**: Managing construction schedules and milestones

## Prerequisites

- Python 3.9 or higher
- AWS CLI configured with appropriate credentials
- Access to HBFA DynamoDB tables (region: us-east-2)

## Installation

From the package directory:

```bash
cd packages/ops-erp
pip install -r requirements.txt
```

Or from the root of the monorepo:

```bash
npm install  # This will also handle package-specific setup
```

## Usage

### Weekly Report Processing

The typical workflow for processing a weekly Polaris report:

1. Save the email attachment to your local directory
2. Preprocess the Excel file to CSV format
3. Import the CSV to DynamoDB
4. Generate the Mylar PDF

For detailed step-by-step instructions, see the weekly runbook below.

### Generating Mylar PDFs

```bash
python -m tools.polaris.report_pdf_hso --output reports/mylar-YYYY-MM-DD.pdf
```

### Backfill Operations

For backfilling Fusion data from manual sources:

```bash
# From the sales-ui package
node scripts/backfill-hbfa-sales-offers.mjs
```

## Weekly Runbook

### Normal Steps

1. **Save email attachment**
   - Save the weekly Excel as: `HBFA Report-YYYY-MM-DD-hh-mm-ss.xlsx`

2. **Preprocess to CSV**
   - Use the legacy processor tool to convert Excel to CSV
   - Outputs: `Polaris_Processed.xlsx` and `Polaris_Processed.csv`

3. **Import CSV → DynamoDB**
   - Navigate to: `packages/sales-ui`
   - Run: `node scripts/import-polaris-report.mjs --file="path/to/Polaris_Processed.csv" --report-date=YYYY-MM-DD`
   - This writes raw rows to `polaris_raw_weekly` and normalized rows to `hbfa_sales_offers`

4. **Generate Mylar PDF**
   - Navigate to: `packages/ops-erp`
   - Run: `python -m tools.polaris.report_pdf_hso --output reports/mylar-YYYY-MM-DD.pdf`

### Backfill / Recovery Steps

- **Backfill Fusion from manual source**
  - Repo: `packages/sales-ui`
  - Command: `node scripts/backfill-hbfa-sales-offers.mjs`

- **Backfill Fusion from raw weekly data**
  - Repo: `packages/ops-erp`
  - Command: `node scripts/backfill-fusion-from-praw.mjs --since=YYYY-MM-01 --until=YYYY-MM-DD --dry-run`

## Project Structure

```
ops-erp/
├── tools/
│   └── polaris/          # Polaris report processing tools
│       ├── report_pdf.py
│       └── report_pdf_hso.py
├── scripts/              # Utility scripts
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Configuration

Configuration is managed through environment variables:

- `AWS_REGION`: AWS region for DynamoDB (default: us-east-2)
- `POLARIS_INCLUDE_FUSION`: Include Fusion in imports (default: false)

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Code Style

This project follows PEP 8 guidelines. Format code using:

```bash
black .
```

## Migration Note

This package was migrated from the standalone `hbfa-ops-erp` repository into the unified HBFA monorepo. Historical commit history is preserved.

## Support

For issues or questions, please open an issue in the main HBFA unified repository.

## Related Packages

- [sales-ui](../sales-ui/README.md): Sales interface and offer management system
