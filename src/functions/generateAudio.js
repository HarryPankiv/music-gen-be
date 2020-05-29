import { Progression } from "@tonaljs/tonal";
import { v4 as uuidv4 } from "uuid";

import { dynamodb } from "../utils/aws";
import { generateMusic } from "../tfjs/tfjs";

module.exports.generateAudio = async ({ body }) => {
  const requestBody = body ? JSON.parse(body) : {};
  const chordProgression = Progression.fromRomanNumerals(
    requestBody.tonic,
    requestBody.chordProgression
  );
  const sequence = await generateMusic(chordProgression);

  const project = {
    id: uuidv4(),
    createdAt: new Date(),
    tonic: requestBody.tonic,
    mode: requestBody.mode,
    scale: requestBody.scale,
    tempo: requestBody.tempo,
    chordProgression: requestBody.chordProgression,
    instruments: requestBody.instruments,
    sequence,
  };

  const params = {
    TableName: "project",
    Item: project,
  };

  try {
    const result = await dynamodb.put(params).promise();

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
