#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev'

const LAMBDA_FUNCTIONS = [
  { name: 'units', path: 'lambda/ops/units.js', functionName: `hbfa-unified-units-${ENVIRONMENT}` },
  { name: 'milestones', path: 'lambda/ops/milestones.js', functionName: `hbfa-unified-milestones-${ENVIRONMENT}` },
  { name: 'timeline', path: 'lambda/ops/timeline.js', functionName: `hbfa-unified-timeline-${ENVIRONMENT}` },
  { name: 'holidays', path: 'lambda/ops/holidays.js', functionName: `hbfa-unified-holidays-${ENVIRONMENT}` },
  { name: 'sales-status', path: 'lambda/sales/status.js', functionName: `hbfa-unified-sales-status-${ENVIRONMENT}` }
]

console.log(`Deploying Lambda functions for ${ENVIRONMENT} environment...`)

try {
  for (const func of LAMBDA_FUNCTIONS) {
    console.log(`\nDeploying ${func.name}...`)
    
    // Read the function code
    const code = readFileSync(func.path, 'utf8')
    
    // Create a temporary deployment package
    const deployCode = `
${code}

// Export for Lambda
export { handler }
`
    
    // Write to temporary file
    const tempFile = `temp-${func.name}.mjs`
    writeFileSync(tempFile, deployCode)
    
    // Create zip file
    execSync(`zip ${func.name}.zip ${tempFile}`, { stdio: 'inherit' })
    
    // Update Lambda function
    try {
      execSync(`aws lambda update-function-code \
        --function-name ${func.functionName} \
        --zip-file fileb://${func.name}.zip`, { stdio: 'inherit' })
      console.log(`✅ ${func.name} deployed successfully`)
    } catch (error) {
      console.log(`⚠️  ${func.name} function may not exist yet, skipping update`)
    }
    
    // Cleanup
    execSync(`rm ${tempFile} ${func.name}.zip`)
  }

  console.log(`\n✅ Lambda deployment complete!`)

} catch (error) {
  console.error('❌ Lambda deployment failed:', error.message)
  process.exit(1)
}