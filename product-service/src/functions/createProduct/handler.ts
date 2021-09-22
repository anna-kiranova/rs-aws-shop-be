import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import * as products from 'src/products';

// sls invoke local --function createProduct -d '{"body":{"title":"New Banana Muffin","description":"super","price":10,"count":10}}'

const createProduct = async (event) => {
  const productData = event.body;
  let createdProduct;
  try {
    createdProduct = await products.create(productData);
  } catch (e) {
    return formatJSONResponse(500, e.message);
  }
  if (!createdProduct) {
    return formatJSONResponse(400, 'Incorrect product data');
  }
  return formatJSONResponse(200, createdProduct);
}

export const main = middyfy(createProduct);
