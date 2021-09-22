import 'source-map-support/register';

import { middyfy } from '@libs/lambda';
import { S3 } from 'aws-sdk';
import * as csv from 'csv-parser';

const REGION = 'eu-west-1';
const BUCKET = 'my-aws-shop-import';

const headers = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*'
}

// sls invoke local --function importFileParser -d '{"queryStringParameters":{"name":"123"}}'

const importFileParser = async (event) => {
  console.log('importFileParser', event);

  const s3 = new S3({ region: REGION });
  for (const record of event.Records) {
    const params = {
      Bucket: BUCKET,
      Key: record.s3.object.key,
    };
    const s3Stream = s3.getObject(params).createReadStream();

    const results = [];

    s3Stream
      .pipe(csv())
      .on('data', (data) => { console.log('on data', record.s3.object.key, data); results.push(data); })
      .on('error', (error) => { console.log('on error', record.s3.object.key, error); })
      .on('end', () => { console.log('on end', record.s3.object.key, results); });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      event,
    }),
  };
}

export const main = middyfy(importFileParser);
