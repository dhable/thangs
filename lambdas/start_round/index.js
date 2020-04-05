const AWS = require('aws-sdk');
const Questions = require('./questions');

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
        ProjectionExpression: "PLAYERS, PREV_QS"
    };

    let response = await DynamoDB.get(params).promise();
    return response.Item;
}

function generateRandomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateNextQuestionId(max, previous) {
    let guess;

    do {
        guess = generateRandomNumber(max);
    } while (previous.includes(guess));

    return guess;
}

function updateGameInfo(gameId, nextQuestion) {
    let params = {
        TableName: "GAMES",
        Key: { "GAME_ID": gameId },
        UpdateExpression: "SET #Q = list_append(#Q, :quesId), #A = :ans",
        ExpressionAttributeNames: { "#Q": "PREV_QS", "#A": "ANSWERS" },
        ExpressionAttributeValues: { ":quesId": [nextQuestion], ":ans": {} }
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
        const { gameId } = JSON.parse(event.body);
        const reqCtx =  event.requestContext;

        console.log("getting game info");
        const {PLAYERS: players, PREV_QS: previousQuestions } = await getGameInfo(gameId);

        const nextQuestionId = generateNextQuestionId(Questions.length, previousQuestions);

        console.log("going to update game info");
        await updateGameInfo(gameId, nextQuestionId);

        const question = Questions[nextQuestionId];
        await sendResponse(reqCtx, reqCtx.clientConnId, { gameId, question });

        let clientPromises = players.map(pId => sendResponse(reqCtx, pId, { gameId, action: "reset" } ));
        await Promise.all(clientPromises);

        return SUCCESS;
    } catch (e) {
        console.warn(e);
        return FAILURE;
    }
};
