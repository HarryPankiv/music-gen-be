import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

import { dynamodb } from "../utils/aws";
import { QUANTIZED_LENGTH } from "../tfjs/constants";

module.exports.generateAudio = async ({ body }) => {
  const requestBody = body ? JSON.parse(body) : {};
  const projectId = uuidv4();
  const sequence = {}

  const snsParams = {
    Message: projectId,
    TopicArn: "arn:aws:sns:us-east-1:225558997672:CustomGenerateTopic",
  };

  const sns = new AWS.SNS({ apiVersion: "2010-03-31" });
  sns.publish(snsParams).promise();


  const project = {
    id: projectId,
    createdAt: new Date(),
    urlHash: "/" + projectId,
    tonic: requestBody.tonic,
    mode: requestBody.mode,
    scale: requestBody.scale,
    tempo: requestBody.tempo,
    length: Math.round((QUANTIZED_LENGTH * requestBody.tempo) / 120),
    chordProgression: requestBody.chordProgression,
    instruments: requestBody.instruments,
    sequence,
  };

  const params = {
    TableName: "project",
    Item: project,
  };

  try {
    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          projectId,
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
