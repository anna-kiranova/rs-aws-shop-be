import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import * as products from 'src/products';

// sls invoke local --function getProductsList

const getProductsList = async () => {
  let res;
  try {
    res = await products.list();
  } catch (e) {
    return formatJSONResponse(500, e.message);
  }
  return formatJSONResponse(200, res);
}

export const main = middyfy(getProductsList);
