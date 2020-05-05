const AWS = require('aws-sdk');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: AWS_REGION
});

function saveAnswer(gameId, playerId, answer) {
  let params = {
    TableName: 'GAMES',
    Key: { 'GAME_ID': gameId },
    UpdateExpression: 'SET ANSWERS.#playerId = :ans',
    ExpressionAttributeNames: { '#playerId': playerId },
    ExpressionAttributeValues: { ':ans': answer },
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

exports.handler = async function(event) {
  try {
    const { type, tx, gameId, playerId, answer } = JSON.parse(event.body);
    const gameData = await saveAnswer(gameId, playerId, answer);
    const {HOST_CONN: hostConnId, ANSWERS: answers, PLAYERS: players } = gameData;
    const playerCount = Object.keys(players).length;
    const answerCount = Object.keys(answers).length;
    await sendResponse(event.requestContext, { type, tx, playerCount, answerCount }, hostConnId)
    return SUCCESS;
  } catch (e) {
    console.warn(e);
    return FAILURE;
  }
};