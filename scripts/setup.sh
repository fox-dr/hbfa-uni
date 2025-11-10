#!/bin/bash

# HBFA Unified Repository - Setup Script
# This script helps set up the development environment

set -e

echo "🏠 HBFA Unified Repository Setup"
echo "=================================="
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm -v)"

# Check Python
echo "Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python $PYTHON_VERSION"

# Check pip
echo "Checking pip..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed."
    exit 1
fi
echo "✅ pip $(pip3 --version | cut -d' ' -f2)"

# Check AWS CLI
echo "Checking AWS CLI..."
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed. Some features may not work."
    echo "   Install from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
else
    echo "✅ AWS CLI $(aws --version | cut -d' ' -f1 | cut -d'/' -f2)"
fi

echo ""
echo "Installing dependencies..."
echo "=========================="

# Install Node.js dependencies
echo "Installing npm packages..."
npm install
echo "✅ npm packages installed"

# Install Python dependencies for ops-erp
echo "Installing Python packages for ops-erp..."
cd packages/ops-erp
pip3 install -r requirements.txt
cd ../..
echo "✅ Python packages installed"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables (see docs/QUICK_START.md)"
echo "2. Start development:"
echo "   - Sales UI: npm run dev:sales-ui"
echo "   - Ops ERP: cd packages/ops-erp && python -m tools.polaris.report_pdf_hso --help"
echo ""
echo "For more information, see:"
echo "- README.md"
echo "- docs/QUICK_START.md"
echo "- docs/ARCHITECTURE.md"
echo ""
