const AWS = require('aws-sdk');
const { SHA3 } = require('sha3');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: AWS_REGION
});

function generateHashId(seed) {
  let hash = new SHA3(256);
  hash.update(`${seed}-${process.hrtime.bigint().toString()}`);
  return hash.digest("base64");
}

function createGameRecord(gameId, name, connectionId) {
  let params = {
    TableName: "GAMES",
    Item: {
      GAME_ID: gameId,
      NAME: name,
      HOST_CONN: connectionId,
      PLAYERS: {},
      PREV_QS: [],
      ANS_LOCK: false,
      ANSWERS: {},
      EXPIRE_TS: Math.floor((Date.now() + 43200000) / 1000) // 12 hours from now
    }
  };
  return DynamoDB.put(params).promise();
}

function sendResponse(reqCtx, payload) {
  const apiGatewayMgmt = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: reqCtx.domainName + "/" + reqCtx.stage
  });

  return apiGatewayMgmt.postToConnection({
    ConnectionId: reqCtx.connectionId,
    Data: JSON.stringify(payload)
  }).promise();
}

exports.handler = async (event) => {
  try {
    const { type, tx, name } = JSON.parse(event.body);
    const gameId = generateHashId(tx);
    await createGameRecord(gameId, name, event.requestContext.connectionId);
    await sendResponse(event.requestContext, { type, tx, gameId });
    return SUCCESS;
  } catch (e) {
    console.warn(e);
    return FAILURE;
  }
};
