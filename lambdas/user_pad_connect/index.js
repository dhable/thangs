const AWS = require('aws-sdk');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    region: AWS_REGION
});

function updatePlayerStatus(gameId, playerId, connId) {
    const params = {
        TableName: "GAMES",
        Key: { "GAME_ID": gameId },
        UpdateExpression: "SET #players.#pId.#connId = :pConnId",
        ExpressionAttributeNames: {
            '#players': 'PLAYERS',
            '#pId': playerId,
            '#connId': 'CONN_ID'
        },
        ExpressionAttributeValues: { ":pConnId": connId },
        ReturnValues: 'ALL_NEW'
    };
    return DynamoDB.update(params).promise().then(i => i.Attributes);
}

function sendResponse(reqCtx, payload, connId) {
    const apiGatewayMgmt = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: reqCtx.domainName + "/" + reqCtx.stage
    });

    return apiGatewayMgmt.postToConnection({
        ConnectionId: connId || reqCtx.connectionId,
        Data: JSON.stringify(payload)
    }).promise();
}

exports.handler = async (event) => {
  try {
    const { type, tx, gameId, playerId } = JSON.parse(event.body);
    const gameInfo = await updatePlayerStatus(gameId, playerId, event.requestContext.connectionId);

    // notify host screen of new player states
    let currentPlayers = Object.fromEntries(
        Object.entries(gameInfo.PLAYERS)
            .map(([key, value]) =>
                [key, {name: value.NAME, status: value.CONN_ID ? 'online' : 'offline'}]));

    await Promise.all([
        sendResponse(event.requestContext, { type, tx, gameId, currentPlayers },  gameInfo.HOST_CONN),
        sendResponse(event.requestContext, { type, tx, 'status': 'ok' })
    ]);
    
    return SUCCESS;
  } catch (e) {
    console.warn(e);
    return FAILURE;
  }
};