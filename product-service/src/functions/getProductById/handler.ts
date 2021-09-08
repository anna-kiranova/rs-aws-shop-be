import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import * as products from 'src/products';

// sls invoke local --function getProductById -d '{"pathParameters":{"id":"1"}}'

const getProductById = async (event) => {
  let res;
  const id = event.pathParameters.id;
  try {
    res = await products.getById(id);
  } catch (e) {
    return formatJSONResponse(500, e.message);
  }
  if (!res) {
    return formatJSONResponse(404, `No product found by id ${id}`);
  }
  return formatJSONResponse(200, res);
}

export const main = middyfy(getProductById);
