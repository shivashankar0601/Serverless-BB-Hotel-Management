const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const dbClient = new DynamoDBClient({});

module.exports = { dbClient }