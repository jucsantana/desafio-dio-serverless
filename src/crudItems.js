"use strict"

const {v4} = require('uuid');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();


// função para inserir um item
const insertItem = async (event) => {
    const {item} = JSON.parse(event.body);
    const createdAt = new Date().toISOString();
    const id = v4();
    
    const params = {
        TableName: 'ItemTableNew',
        Item: {
            id,
            item,
            createdAt,
            itemStatus: false
            }
    };
    
   await dynamodb.put(params).promise();

   return  {
        statusCode: 200,
        body: JSON.stringify(params.Item)
    };
}

// Função para recuperar todos os itens
const getAllItems = async () => {
    const params = {
      TableName: 'ItemTableNew'
    }
  
    try {
      const result = await dynamodb.scan(params).promise()
      return {
        statusCode: 200,
        body: JSON.stringify(result.Items)
      }
    } catch (error) {
      console.error(error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Erro ao recuperar todos os itens.' })
      }
    }
  }

// Função para recuperar um item por id
const getItemById = async (event) => {
  const id = event.pathParameters.id

  const params = {
    TableName: 'ItemTableNew',
    Key: {
      id: id
    }
  }

  try {
    const result = await dynamodb.get(params).promise()
    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item)
      }
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Item com id ${id} não encontrado.` })
      }
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao recuperar item por id.' })
    }
  }
}

// Função para atualizar um item pelo id
const updateItemById = async (event) => {
  const id = event.pathParameters.id
  const data = JSON.parse(event.body)

  const params = {
    TableName: 'ItemTableNew',
    Key: {
      id: id
    },
    UpdateExpression: 'set #item = :item, #itemStatus = :itemStatus',
    ExpressionAttributeNames: {
      '#item': 'item',
      '#itemStatus': 'itemStatus'
    },
    ExpressionAttributeValues: {
      ':item': data.item,
      ':itemStatus': data.itemStatus
    },
    ReturnValues: 'UPDATED_NEW'
  }

  try {
    const result = await dynamodb.update(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao atualizar item por id.' })
    }
  }
}


module.exports={
    insertItem,
    getAllItems,
    getItemById,
    updateItemById
}
