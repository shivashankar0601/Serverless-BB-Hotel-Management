/*
    Author: Shiva Shankar Pandillapalli
    Banner: B00880049
    Task: Redirection of input received from tour preferences web page to tour service by publishing a message to google pub/sub topic as shown below in the javascript. This is a lambda function deployed as a part of the customer module microservices to redirect the input.
*/

const { PubSub } = require("@google-cloud/pubsub");
require("dotenv").config();
const projectId = "sonic-anagram-341118";
const pubSubClient = new PubSub({ projectId });

async function publishMessage(msg) {
    console.log(msg);
    const dataBuffer = Buffer.from(msg);

    try {
        const messageId = await pubSubClient
            .topic("triggerRecommendation")
            .publishMessage({ data: dataBuffer });
        console.log(`Message ${messageId} published.`);
        return `Message ${messageId} published.`;
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        return `Received error while publishing: ${error.message}`;
    }
}

exports.handler = async (event) => {
    console.log("before", event);
    event = JSON.parse(event.body);
    console.log("body", event);
    let res = await publishMessage(
        event.email +
            "~" +
            event.data +
            "~" +
            event.persons +
            "~" +
            event.cost +
            "~" +
            event.duration
    );
    return {
        statusCode: 200,
        body: JSON.stringify(res),
    };
};
