"use strict";
import { Progression } from "@tonaljs/tonal";
import { generateMusic } from "../tfjs/tfjs";
import { dynamodb } from "../utils/aws";

module.exports.generate = async (event) => {
  const projectId = event.Records[0].Sns.Message;
  const params = {
    Key: {
      id: projectId,
    },
    TableName: "project",
  };

  const result = await dynamodb.get(params).promise();

  const chordProgression = Progression.fromRomanNumerals(
    result.Item.tonic,
    result.Item.chordProgression
  );

  const sequence = await generateMusic(chordProgression, result.Item.tempo);

  const updateParams = {
    TableName: "project",
    Key: {
      id: projectId,
    },
    UpdateExpression: "set #s = :s",
    ExpressionAttributeNames: {
      "#s": 'sequence'
    },
    ExpressionAttributeValues: {
      ":s": sequence,
    }
  };

  try {
    await dynamodb.update(updateParams).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          status: "success",
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
