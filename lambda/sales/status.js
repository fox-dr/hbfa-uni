import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' })
const docClient = DynamoDBDocumentClient.from(client)

const SALES_TABLE = process.env.SALES_TABLE || 'hbfa_sales_dev'

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers }
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      }
    }

    const data = JSON.parse(event.body || '{}')
    const {
      project_id,
      contract_unit_number,
      status_key,
      status_date,
      status_label,
      status_color
    } = data

    if (!project_id || !contract_unit_number || !status_key) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    const item = {
      project_id,
      contract_unit_number,
      status_key,
      status_date: status_date || '',
      status_label: status_label || '',
      status_color: status_color || '#4b5563',
      updated_at: new Date().toISOString()
    }

    const command = new PutCommand({
      TableName: SALES_TABLE,
      Item: item
    })

    await docClient.send(command)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        item
      })
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