"use strict";
const { dynamodb } = require("../utils/aws");

module.exports.getGeneratedAudio = async (event) => {
  const params = {
    TableName: "project",
  };

  try {
    const result = await dynamodb.scan(params).promise();
    
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
      body: JSON.stringify(
        err
      )
    }
  }
};
