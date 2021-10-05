import 'source-map-support/register';

import { middyfy } from '@libs/lambda';
import { S3 } from 'aws-sdk';

const REGION = 'eu-west-1';
const BUCKET = 'my-aws-shop-import';

const headers = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*'
}

// sls invoke local --function importProductsFile -d '{"queryStringParameters":{"name":"123"}}'

const importProductsFile = async (event) => {
  const name: string = event.queryStringParameters.name;
  console.log('importProductsFile', name, event);

  const s3 = new S3({ region: REGION });
  const params = {
    Bucket: BUCKET,
    Key: `uploaded/${name}`,
    Expires: 60,
    ContentType: 'text/csv',
  };

  const url = await s3.getSignedUrl('putObject', params);

  console.log('signedUrl', url);

  return {
    statusCode: 200,
    headers,
    body: url,
  };
}

export const main = middyfy(importProductsFile);
