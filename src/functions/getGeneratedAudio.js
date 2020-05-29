"use strict";
import { dynamodb } from "../utils/aws";

module.exports.getGeneratedAudio = async ({
  queryStringParameters: { projectId },
}) => {
  const params = {
    ExpressionAttributeValues: {
      ":projectId": projectId,
    },
    KeyConditionExpression: "id = :projectId",
    TableName: "project",
  };

  try {
    const result = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          result,
        },
        null,
        2
      ),
    };
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
