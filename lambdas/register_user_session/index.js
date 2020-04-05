const AWS = require('aws-sdk');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: AWS_REGION
});

async function fetchGameInfo(playerToken) {
    const params = {
        TableName: "INVITES",
        Key: { "INVITE_ID": playerToken },
        ProjectionExpression: "GAME_ID"
    };

    let response = await DynamoDB.get(params).promise();
    return response.Item.GAME_ID;
}

function updateGameInfo(gameId, connId) {
    const params = {
        TableName: "GAMES",
        Key: { "GAME_ID": gameId },
        UpdateExpression: "SET #p = list_append(#p, :pConnId)",
        ExpressionAttributeNames: { "#p": "PLAYERS" },
        ExpressionAttributeValues: { ":pConnId": [connId] }
    };

    return DynamoDB.update(params).promise();
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
        const reqData = JSON.parse(event.body);
        const reqCtx = event.requestContext;
        const playerToken = reqData.playerToken;
        const gameId = await fetchGameInfo(playerToken);

        await updateGameInfo(gameId, reqCtx.connectionId);
        await sendResponse(reqCtx, reqCtx.connectionId, {gameId, connectionId: reqCtx.connectionId});
        return SUCCESS;
    } catch (e) {
        console.warn(e);
        return FAILURE;
    }
};