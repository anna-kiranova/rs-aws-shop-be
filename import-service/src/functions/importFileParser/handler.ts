import 'source-map-support/register';
import { ProductData } from '../../../../product-service/src/products/types';
import { middyfy } from '@libs/lambda';
import { S3, SQS } from 'aws-sdk';
import * as csv from 'csv-parser';

const REGION = 'eu-west-1';
const BUCKET = 'my-aws-shop-import';

const importFileParser = async (event) => {
  console.log('importFileParser', event);

  const s3 = new S3({ region: REGION });
  const sqs = new SQS({ region: REGION });

  for (const record of event.Records) {
    const params = {
      Bucket: BUCKET,
      Key: record.s3.object.key,
    };
    const s3Stream = s3.getObject(params).createReadStream();

    s3Stream
      .pipe(csv())
      .on('data', async (data) => {
        console.log('product row', data);
        const { title, description, price, count } = data;
        const product: ProductData = {
          title, description,
          price: Number(price),
          count: Number(count),
        };
        await sqs.sendMessage({
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(product),
        }).promise();
      })
      .on('error', (error) => { console.log('product import error', record.s3.object.key, error); });
  }

  return {
    statusCode: 200,
  };
}

export const main = middyfy(importFileParser);
