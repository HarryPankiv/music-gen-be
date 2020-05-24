import AWS from 'aws-sdk';
import https from 'https';

const sslAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  rejectUnauthorized: true
});

sslAgent.setMaxListeners(0);

AWS.config.update({
  httpOptions: {
    agent: sslAgent
  },
  region: 'us-east-1'
});

export const dynamodb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });