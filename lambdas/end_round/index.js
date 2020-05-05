const AWS = require('aws-sdk');

const { AWS_REGION } = process.env;

const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: AWS_REGION
});

function lockGameAnswers(gameId) {
  let params = {
    TableName: 'GAMES',
    Key: { 'GAME_ID': gameId },
    UpdateExpression: 'SET #L = :value',
    ExpressionAttributeNames: { '#L': 'ANS_LOCK' },
    ExpressionAttributeValues: { ':value': true },
    ReturnValues: 'ALL_NEW'
  };
  return DynamoDB.update(params).promise().then(i => i.Attributes);
}

function sendResponse(reqCtx, payload, connectionId) {
    const apiGatewayMgmt = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: reqCtx.domainName + '/' + reqCtx.stage
    });

    return apiGatewayMgmt.postToConnection({
        ConnectionId: connectionId || reqCtx.connectionId,
        Data: JSON.stringify(payload)
    }).promise();
}

exports.handler = async (event) => {
    try {
        const { type, tx, gameId } = JSON.parse(event.body);
        const gameInfo = await lockGameAnswers(gameId);
        const { PLAYERS: players, ANSWERS: answers } = gameInfo;
        let promises = [
            sendResponse(event.requestContext, { type, tx, gameId, answers: Object.values(answers) })
        ];

        for (let playerId in players) {
            promises.push(
                sendResponse(event.requestContext,{ type: 'lock', tx },  players[playerId].CONN_ID));
        }

        await Promise.all(promises);
        return SUCCESS;
    } catch(e) {
        console.warn(e);
        return FAILURE;
    }
};