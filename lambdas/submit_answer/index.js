const AWS = require('aws-sdk');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: AWS_REGION
});

function saveAnswer(gameId, connId, answer) {
    let params = {
        TableName: "GAMES",
        Key: { "GAME_ID": gameId },
        UpdateExpression: "SET ANSWERS.#connId = :ans",
        ExpressionAttributeNames: { "#connId": connId },
        ExpressionAttributeValues: { ":ans": answer }
    };

    return DynamoDB.update(params).promise();
}

exports.handler = async function(event) {
    try {
        const { gameId, answer } = JSON.parse(event.body);
        const connId = event.requestContext.connectionId;
        await saveAnswer(gameId, connId, answer);
        return SUCCESS;
    } catch (e) {
        console.warn(e);
        return FAILURE;
    }
};