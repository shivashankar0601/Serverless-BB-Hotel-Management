const { dbClient } = require("./client");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuidv4 } = require("uuid");
const {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");

exports.handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  let body;
  try {
    switch (event.httpMethod) {
      case "GET":
        console.log(event.path);
        if (event.queryStringParameters != null) {
          body = await getBookingByRoomType(event); // GET booking/?category=Phone
          return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({
              message: `Booking details by roomtypes`,
              body: body,
            }),
          };
        } else if (event.pathParameters != null) {
          body = await getBookingByUser(event.pathParameters.userid); // GET booking/{userid}
          return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({
              message: `Booking details`,
              body: body,
            }),
          };
        } else {
          body = await getAllBooking(); // GET booking
          return {
            headers: {
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            statusCode: 200,
            body: JSON.stringify({
              message: `List of all booking`,
              body: body,
            }),
          };
        }
        break;
      default:
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }

    console.log(body);
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

const getBookingByUser = async (id) => {
  console.log("getBookingByUser");
  console.log(id);
  try {
    const params = {
      TableName: "customerBooking",
      Key: marshall({ booking_id: id }),
    };

    const { Item } = await dbClient.send(new GetItemCommand(params));

    console.log(Item);
    return Item ? unmarshall(Item) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getAllBooking = async () => {
  console.log("customerBooking");
  try {
    const params = {
      TableName: "customerBooking",
    };

    const { Items } = await dbClient.send(new ScanCommand(params));

    console.log(Items);
    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};



const getBookingByRoomType = async (event) => {
  console.log("getBookingByRoomType");
  try {
    // GET booking/?category=Executive Room
    const bookingId = event.pathParameters.userid;
    const category = event.queryStringParameters.category;
    console.log(bookingId);
    console.log(category)
    const params = {
      KeyConditionExpression: "booking_id = :booking_id",
      FilterExpression: "contains (roomType, :roomType)",
      ExpressionAttributeValues: {
        ":booking_id": { S: bookingId },
        ":roomType": { S: category },
      },
      TableName: "customerBooking",
    };

    const { Items } = await dbClient.send(new QueryCommand(params));

    console.log(Items);
    return Items ? Items.map((item) => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};

