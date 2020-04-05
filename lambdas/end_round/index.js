const AWS = require('aws-sdk');

const { AWS_REGION } = process.env;

const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: AWS_REGION
});

async function getGameInfo(gameId) {
    let params = {
        TableName: "GAMES",
        Key: { "GAME_ID": gameId },
        ProjectionExpression: "PLAYERS, ANSWERS"
    };

    let resposne = await DynamoDB.get(params).promise();
    return resposne.Item;
}

function sendResponse(reqCtx, connId, payload) {
    const apiGatewayMgmt = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: reqCtx.domainName + "/" + reqCtx.stage
    });

    return apiGatewayMgmt.postToConnection({
        ConnectionId: connId,
        Data: JSON.stringify(payload)
    }).promise();
}

exports.handler = async (event) => {
    try {
        const { gameId } = JSON.parse(event.body);
        const reqCtx = event.requestContext;

        // fetch answers from db
        const {PLAYERS: playerConnId, ANSWERS: answers } = await getGameInfo(gameId);

        // send lock out to clients
        const sendPromises = playerConnId.map(connId => sendResponse(reqCtx, connId, {"gameId": gameId, "action": "lock" } ));

        sendPromises.push(
            sendResponse(reqCtx, reqCtx.connectionId, {gameId, answers: Object.values(answers)})
        );

        await Promise.all(sendPromises);

        return SUCCESS;
    } catch(e) {
        console.warn(e);
        return FAILURE;
    }
};