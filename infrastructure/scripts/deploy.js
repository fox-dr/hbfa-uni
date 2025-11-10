#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const STACK_NAME = process.env.STACK_NAME || 'hbfa-unified-dev'
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev'

console.log(`Deploying HBFA Unified Platform (${ENVIRONMENT})...`)

try {
  // Build the frontend
  console.log('Building frontend...')
  execSync('npm run build', { stdio: 'inherit' })

  // Deploy CloudFormation stack
  console.log('Deploying infrastructure...')
  execSync(`aws cloudformation deploy \
    --template-file infrastructure/cloudformation/main.yml \
    --stack-name ${STACK_NAME} \
    --parameter-overrides Environment=${ENVIRONMENT} \
    --capabilities CAPABILITY_NAMED_IAM`, { stdio: 'inherit' })

  // Get stack outputs
  const outputs = JSON.parse(execSync(`aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --query 'Stacks[0].Outputs'`).toString())

  const websiteUrl = outputs.find(o => o.OutputKey === 'WebsiteURL')?.OutputValue
  const bucketName = `hbfa-unified-${ENVIRONMENT}-${process.env.AWS_ACCOUNT_ID || 'ACCOUNT'}`

  // Sync built files to S3
  console.log('Uploading frontend to S3...')
  execSync(`aws s3 sync dist/ s3://${bucketName}/ --delete`, { stdio: 'inherit' })

  // Invalidate CloudFront cache
  const distributionId = websiteUrl?.split('//')[1]?.split('.')[0]
  if (distributionId) {
    console.log('Invalidating CloudFront cache...')
    execSync(`aws cloudfront create-invalidation \
      --distribution-id ${distributionId} \
      --paths "/*"`, { stdio: 'inherit' })
  }

  console.log(`\n✅ Deployment complete!`)
  console.log(`🌐 Website URL: ${websiteUrl}`)

} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}