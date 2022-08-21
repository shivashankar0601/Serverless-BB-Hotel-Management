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
        body = await getUserInfo();
        
        var output = [];
        body.map((data) => {
        var foundIndex = output.findIndex((x) => x.userId == data.userId);
        if (foundIndex === -1) {
          const name = data.firstName+ " " + data.lastName;
          const userData = { userId: data.userId, name: name, email: data.email, lastLogin: data.timestamp , logincount: 1 };
          output.push(userData);
        } else {
          let timestamp = null;
          if (data.timestamp > output[foundIndex].timestamp) {
            timestamp = data.timestamp;
          } else {
            timestamp = output[foundIndex].timestamp;
          }
          const name = data.firstName+ " " + data.lastName;
          const userData = {
            userId: data.userId, name: name, email: data.email, lastLogin: data.timestamp,
            logincount: output[foundIndex].logincount + 1,
          };
          output[foundIndex] = userData;
        }
         });
        return {
            headers: {
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            statusCode: 200,
            body: JSON.stringify({
              message: `List of all user`,
              body: output,
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

const getUserInfo = async () => {
  try {
    const params = {
      TableName: "login_statistics",
    };

    const { Items } = await dbClient.send(new ScanCommand(params));

    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};


