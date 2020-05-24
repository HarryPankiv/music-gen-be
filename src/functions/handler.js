"use strict";
const { dynamodb } = require("../utils/aws");

module.exports.handler = async (event) => {
  const params = {
    TableName: "project",
  };

  try {
    const result = await dynamodb.scan(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
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
