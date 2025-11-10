# HBFA Unified Platform Migration Plan

## Overview

This document outlines the step-by-step migration from three separate repositories to the unified HBFA platform.

## Current State

- **hbfa-ops**: Operations console (Netlify + DynamoDB us-west-1)
- **hbfa-sales-ui**: Sales management (Netlify + DynamoDB us-east-2)  
- **hbfa-ops-erp**: Report generation (Python scripts + DynamoDB us-west-1)

## Target State

- **hbfa-uni**: Unified platform (AWS Lambda + CloudFront + DynamoDB us-east-2)

## Migration Phases

### Phase 1: Infrastructure Setup ✅
- [x] Create unified repository structure
- [x] Set up React + Vite frontend framework
- [x] Create AWS CloudFormation templates
- [x] Define Lambda function structure
- [x] Initial deployment scripts

### Phase 2: Operations Module Migration
- [ ] Migrate BuildingMilestones component
- [ ] Migrate TimelineRollup functionality
- [ ] Migrate Holiday management
- [ ] Convert Netlify functions to Lambda
- [ ] Update API endpoints and authentication

### Phase 3: Sales Module Migration  
- [ ] Migrate unit inventory management
- [ ] Migrate sales status tracking
- [ ] Convert sales API endpoints
- [ ] Integrate with unified authentication

### Phase 4: Reports Module Migration
- [ ] Convert Python report scripts to Lambda
- [ ] Migrate Mylar PDF generation
- [ ] Migrate HSO report functionality
- [ ] Set up S3 storage for generated reports

### Phase 5: Data Consolidation
- [ ] Create data migration scripts
- [ ] Migrate ops_milestones (us-west-1 → us-east-2)
- [ ] Migrate fusion_units (us-west-1 → us-east-2)
- [ ] Consolidate hbfa_sales_offers in us-east-2
- [ ] Verify data integrity and relationships

### Phase 6: Testing & Validation
- [ ] End-to-end functionality testing
- [ ] Performance testing
- [ ] Security review
- [ ] User acceptance testing

### Phase 7: Production Deployment
- [ ] DNS cutover planning
- [ ] Production deployment
- [ ] Monitoring and alerting setup
- [ ] Legacy system decommissioning

## Migration Commands

### Development Setup
```bash
cd d:\downloads\hbfa-uni
npm install
npm run dev
```

### Infrastructure Deployment
```bash
# Deploy development environment
npm run deploy:dev

# Deploy production environment  
npm run deploy:prod
```

### Data Migration (TBD)
```bash
# Migrate operations data
node infrastructure/scripts/migrate-ops-data.js

# Migrate sales data
node infrastructure/scripts/migrate-sales-data.js

# Verify migration
node infrastructure/scripts/verify-migration.js
```

## Risk Mitigation

1. **Parallel Operation**: Keep existing systems running during migration
2. **Incremental Migration**: Migrate modules one at a time
3. **Data Backup**: Full backup before any data migration
4. **Rollback Plan**: Ability to revert to previous systems
5. **Testing**: Comprehensive testing at each phase

## Success Criteria

- [ ] All functionality from three repos available in unified platform
- [ ] Performance equal or better than current systems
- [ ] Zero data loss during migration
- [ ] User training completed
- [ ] Legacy systems safely decommissioned

## Timeline Estimate

- **Phase 1**: ✅ Complete (1 day)
- **Phase 2**: 3-5 days
- **Phase 3**: 2-3 days  
- **Phase 4**: 3-4 days
- **Phase 5**: 2-3 days
- **Phase 6**: 2-3 days
- **Phase 7**: 1-2 days

**Total Estimated Time**: 2-3 weeks

## Next Steps

1. Begin Phase 2: Operations Module Migration
2. Start with BuildingMilestones component migration
3. Set up development environment and testing workflow
4. Create detailed technical specifications for each component