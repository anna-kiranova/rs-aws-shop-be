import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const BUCKET = 'my-aws-shop-import';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: '${cf:product-service-${self:provider.stage}.catalogItemsQueueUrl}',
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        'Effect': 'Allow',
        'Action': 's3:ListBucket',
        'Resource': [
          `arn:aws:s3:::${BUCKET}`,
        ],
      },
      {
        'Effect': 'Allow',
        'Action': [
          's3:*',
        ],
        'Resource': [
          `arn:aws:s3:::${BUCKET}/*`,
        ],
      },
      {
        'Effect': 'Allow',
        'Action': 'sqs:*',
        'Resource': '${cf:product-service-${self:provider.stage}.createProductTopicArn}',
      },
    ],
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
};

module.exports = serverlessConfiguration;
