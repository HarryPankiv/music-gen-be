"use strict";
import { dynamodb } from "../utils/aws";

module.exports.exportMidi = async ({
  queryStringParameters: { projectId },
}) => {
  const params = {
    Key: {
      id: projectId,
    },
    TableName: "project",
  };

  try {
    const result = await dynamodb.get(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          ...result.Item.sequence
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
