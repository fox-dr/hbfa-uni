import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' })
const docClient = DynamoDBDocumentClient.from(client)

const MILESTONES_TABLE = process.env.MILESTONES_TABLE || 'hbfa_milestones_dev'
const UNITS_TABLE = process.env.UNITS_TABLE || 'hbfa_units_dev'
const SALES_TABLE = process.env.SALES_TABLE || 'hbfa_sales_dev'

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers }
    }

    const {
      project_id,
      building_id,
      include_units = 'false',
      include_events = 'false'
    } = event.queryStringParameters || {}

    if (!project_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'project_id is required' })
      }
    }

    const response = {
      project_id,
      building_id,
      units: [],
      events: [],
      sales_sync: {
        records_scanned: 0,
        units_matched: 0,
        last_updated: new Date().toISOString(),
        warnings: []
      }
    }

    // Get milestones for building
    if (building_id) {
      const milestonesCommand = new QueryCommand({
        TableName: MILESTONES_TABLE,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `${project_id}#${building_id}`
        }
      })

      const milestonesResult = await docClient.send(milestonesCommand)
      
      if (include_units === 'true') {
        // Get units for building
        const unitsCommand = new QueryCommand({
          TableName: UNITS_TABLE,
          IndexName: 'gsi_project_building',
          KeyConditionExpression: 'project_id = :project_id AND building_id = :building_id',
          ExpressionAttributeValues: {
            ':project_id': project_id,
            ':building_id': building_id
          }
        })

        const unitsResult = await docClient.send(unitsCommand)
        
        // Get sales status for units
        const salesCommand = new QueryCommand({
          TableName: SALES_TABLE,
          KeyConditionExpression: 'project_id = :project_id',
          ExpressionAttributeValues: {
            ':project_id': project_id
          }
        })

        const salesResult = await docClient.send(salesCommand)
        const salesMap = {}
        salesResult.Items?.forEach(item => {
          salesMap[item.contract_unit_number] = {
            status_key: item.status_key,
            status_label: item.status_label,
            status_color: item.status_color,
            status_date: item.status_date
          }
        })

        // Combine unit data with milestones and sales status
        response.units = unitsResult.Items?.map(unit => {
          const milestoneData = milestonesResult.Items?.find(m => m.sk === unit.unit_number)
          const salesStatus = salesMap[unit.unit_number]
          
          return {
            ...unit,
            milestones: milestoneData?.milestones || {},
            sales_status: salesStatus || null
          }
        }) || []

        response.sales_sync.units_matched = response.units.length
      }

      response.sales_sync.records_scanned = (milestonesResult.Items?.length || 0) + (salesResult?.Items?.length || 0)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}