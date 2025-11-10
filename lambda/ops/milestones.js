import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-2' })
const docClient = DynamoDBDocumentClient.from(client)

const MILESTONES_TABLE = process.env.MILESTONES_TABLE || 'hbfa_milestones_dev'

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  try {
    const { httpMethod, pathParameters, body } = event
    const method = httpMethod.toLowerCase()

    switch (method) {
      case 'options':
        return { statusCode: 200, headers }

      case 'get':
        return await getMilestones(pathParameters, headers)

      case 'post':
      case 'put':
        return await saveMilestones(JSON.parse(body || '{}'), headers)

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
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

async function getMilestones(pathParameters, headers) {
  const { project, building, unit } = pathParameters || {}

  if (unit) {
    // Get specific unit milestones
    const command = new GetCommand({
      TableName: MILESTONES_TABLE,
      Key: {
        pk: `${project}#${building}`,
        sk: unit
      }
    })
    const result = await docClient.send(command)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.Item || {})
    }
  } else if (building) {
    // Get all units in building
    const command = new QueryCommand({
      TableName: MILESTONES_TABLE,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `${project}#${building}`
      }
    })
    const result = await docClient.send(command)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ items: result.Items || [] })
    }
  } else {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required parameters' })
    }
  }
}

async function saveMilestones(data, headers) {
  const { project_id, building_id, unit_number, milestones } = data

  if (!project_id || !building_id || !unit_number) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields' })
    }
  }

  const command = new PutCommand({
    TableName: MILESTONES_TABLE,
    Item: {
      pk: `${project_id}#${building_id}`,
      sk: unit_number,
      project_id,
      building_id,
      unit_number,
      milestones: milestones || {},
      updated_at: new Date().toISOString()
    }
  })

  await docClient.send(command)

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true })
  }
}