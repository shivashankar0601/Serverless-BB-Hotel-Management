const { dbClient } = require("./client");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");
const {
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

exports.handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  let body;
  try {
    switch (event.httpMethod) {
      case "GET":
        body = await getAllFeedback(); // GET booking
        return {
            headers: {
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            statusCode: 200,
            body: JSON.stringify({
              message: `List of all feedback`,
              body: body,
            }),
          };  
      default:
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({
        message: "Failed to perform operation.",
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
};

const getAllFeedback = async () => {
  console.log("getAllFeedback");
  try {
    const params = {
      TableName: "feedback",
    };

    const { Items } = await dbClient.send(new ScanCommand(params));

    console.log(Items);
    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};


