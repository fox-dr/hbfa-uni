import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' })
const docClient = DynamoDBDocumentClient.from(client)

const HOLIDAYS_TABLE = process.env.HOLIDAYS_TABLE || 'hbfa_holidays_dev'

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

    const { project_id } = event.queryStringParameters || {}
    
    if (!project_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'project_id is required' })
      }
    }

    // Query holidays for project or region
    const command = new QueryCommand({
      TableName: HOLIDAYS_TABLE,
      KeyConditionExpression: 'project_id = :project_id',
      ExpressionAttributeValues: {
        ':project_id': project_id
      }
    })

    const result = await docClient.send(command)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        items: result.Items || []
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