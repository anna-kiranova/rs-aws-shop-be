import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import * as products from 'src/products';
import { ProductData } from 'src/products/types';
import { SNS } from 'aws-sdk';

const REGION = 'eu-west-1';

const catalogBatchProcess = async (event) => {
  console.log('catalogBatchProcess', event);

  const sns = new SNS({ region: REGION });

  for (const record of event.Records) {

    const product: ProductData = JSON.parse(record.body);
    await products.create(product);

    await sns.publish({
      Subject: `${product.title} created.`,
      Message: JSON.stringify(product),
      TopicArn: process.env.SNS_ARN,
    }).promise();
  }

  return formatJSONResponse(200, {ok: true});
}

export const main = middyfy(catalogBatchProcess);
