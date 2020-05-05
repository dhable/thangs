const AWS = require('aws-sdk');
const { SHA3 } = require('sha3');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: AWS_REGION
});

const SNS = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: 'us-east-1'
});

function generatePlayerId(seed) {
  let hash = new SHA3(224);
  hash.update(`${seed}-${process.hrtime.bigint().toString()}`);
  return hash.digest('base64');
}

function updateDatabase(gameId, playerId, name, txtNum) {
  const gameParams = {
    TableName: 'GAMES',
    Key: { 'GAME_ID': gameId },
    UpdateExpression: 'SET PLAYERS.#playerId = :playerMap',
    ExpressionAttributeNames: { '#playerId': playerId },
    ExpressionAttributeValues: {
      ':playerMap': {
        'NAME': name,
        'TXTNUM': txtNum,
        'CONN_ID': null
      }
    }
  };
  return DynamoDB.update(gameParams).promise();
}

function sendPlayerInvite(txtNum, gameId, playerId) {
  const params = {
    Message: `Join a game of Thangs - https://thangs.caffeinatedideas.com/p/${gameId}/${playerId}`,
    PhoneNumber: txtNum,
    MessageAttributes: {
      'SMSType': {
        'StringValue': 'Transactional',
        'DataType': 'String'
      }
    }
  };
  return SNS.publish(params).promise();
}

function sendResponse(reqCtx, payload) {
  const apiGatewayMgmt = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: reqCtx.domainName + '/' + reqCtx.stage
  });

  return apiGatewayMgmt.postToConnection({
    ConnectionId: reqCtx.connectionId,
    Data: JSON.stringify(payload)
  }).promise();
}

exports.handler = async (event) => {
  try {
    const { type, tx, gameId, txtNum, name } = JSON.parse(event.body);
    const playerId = generatePlayerId(gameId + txtNum);
    await updateDatabase(gameId, playerId, name, txtNum);
    await sendPlayerInvite(txtNum, gameId, playerId);
    await sendResponse(event.requestContext, { type, tx, 'status': 'ok' });
    return SUCCESS;
  } catch (e) {
    console.warn(e);
    return FAILURE;
  }
};
