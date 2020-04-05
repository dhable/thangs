const AWS = require('aws-sdk');
const { SHA3 } = require('sha3');

const { AWS_REGION } = process.env;
const SUCCESS = {statusCode: 200};
const FAILURE = {statusCode: 500};

const DynamoDB = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: AWS_REGION
});

const SNS = new AWS.SNS({
  apiVersion: "2010-03-31",
  region: "us-east-1"
});

function generateHashId(seed) {
  let hash = new SHA3(256);

  hash.update(seed);
  hash.update(process.hrtime.bigint().toString());

  return hash.digest("base64");
}

function createGameRecord(gameId, gameName) {
  let params = {
    TableName: "GAMES",
    Item: {
      GAME_ID: gameId,
      NAME: gameName,
      PLAYERS: [],
      PREV_QS: [],
      ANSWERS: {},
      EXPIRE_TS: Math.floor((Date.now() + 43200000) / 1000) // 12 hours from now
    }
  };

  return DynamoDB.put(params).promise();
}

async function createInvites(gameId, num) {
  const inviteIds = [];

  for (let i = 0; i < num; i++) {
    let playerHash = generateHashId(i.toString());
    let params = {
      TableName: "INVITES",
      Item: {
        INVITE_ID: playerHash,
        GAME_ID: gameId,
        EXPIRE_TS: Math.floor((Date.now() + 43200000) / 1000) // 12 hours from now
      }
    };

    await DynamoDB.put(params).promise();
    inviteIds.push(playerHash);
  }

  return inviteIds;
}

function sendInvites(txtnums, inviteHashes) {
  let promises = [];

  for (let i = 0; i < txtnums.length; i++) {
    let txtnum = txtnums[i];
    let invite = inviteHashes[i];
    let params = {
      Message: `Join your game of Thangs - https://thangs.caffeinatedideas.com/player#${invite}`,
      PhoneNumber: txtnum,
      MessageAttributes: {
        "SMSType": {
          "StringValue": "Transactional",
          "DataType": "String"
        }
      }
    };

    promises.push(SNS.publish(params).promise());
  }

  return promises;
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
    const { name, txtnums } = JSON.parse(event.body);
    const gameId = generateHashId(name);

    await createGameRecord(gameId, name);

    const inviteHashes = await createInvites(gameId, txtnums.length);
    await sendInvites(txtnums, inviteHashes);

    await sendResponse(event.requestContext, {gameId});

    return SUCCESS;
  } catch (e) {
    console.warn(e);
    return FAILURE;
  }
};
