const AWS = require('aws-sdk');
const Questions = require('./questions');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: AWS_REGION
});

function getGameInfo(gameId) {
  let params = {
    TableName: 'GAMES',
    Key: { 'GAME_ID': gameId },
    ProjectionExpression: 'PLAYERS, PREV_QS'
  };

  return DynamoDB.get(params)
                 .promise()
                 .then(r => r.Item);
}

function generateRandomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function pickNextQuestion(prevQuestions) {
  return new Promise((resolve, reject) => {
    let guess;
    do {
      guess = generateRandomNumber(Questions.length);
    } while (prevQuestions.includes(guess));
    resolve(guess);
  });
}

function updateGameInfo(gameId, nextQuestionId) {
  let params = {
    TableName: 'GAMES',
    Key: { 'GAME_ID': gameId },
    UpdateExpression: 'SET #Q = list_append(#Q, :quesId), #A = :ans, #L = :lock',
    ExpressionAttributeNames: { '#Q': 'PREV_QS', '#A': 'ANSWERS', '#L': 'ANS_LOCK' },
    ExpressionAttributeValues: { ':quesId': [nextQuestionId], ':ans': {}, ':lock': false }
  };

  return DynamoDB.update(params).promise()
            .then(() => nextQuestionId);
}

function sendResponse(reqCtx, payload, targetConnId) {
    const apiGatewayMgmt = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: reqCtx.domainName + '/' + reqCtx.stage
    });

    return apiGatewayMgmt.postToConnection({
        ConnectionId: targetConnId || reqCtx.connectionId,
        Data: JSON.stringify(payload)
    }).promise();
}

exports.handler = async (event) => {
    try {
        const { type, tx, gameId } = JSON.parse(event.body);
        const gameInfo = await getGameInfo(gameId);
        const promises = [
            pickNextQuestion(gameInfo.PREV_QS)
                .then(updateGameInfo.bind(null, gameId))
                .then(quesId => ({ type, tx, gameId, q: Questions[quesId] }))
                .then(sendResponse.bind(null, event.requestContext))
        ];

        for (const playerId in gameInfo.PLAYERS) {
          var connId = gameInfo.PLAYERS[playerId].CONN_ID;
          if (connId) {
            promises.push(
              sendResponse(event.requestContext, { type: 'unlock', tx }, connId));
          }
        }

        await Promise.all(promises);
        return SUCCESS;
    } catch (e) {
        console.warn(e);
        return FAILURE;
    }
};
