import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductById from '@functions/getProductById';
import createProduct from '@functions/createProduct';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const EMAIL_IMPORT = 'anne.kiranova@gmail.com';

const serverlessConfiguration: AWS = {
  service: 'product-service',
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

      SNS_ARN: {
        Ref: 'createProductTopic',
      },
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'createProductTopic',
        },
      }
    ],
  },

  // resources
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'product-queue',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'product-notification',
        },
      },
      createProductTopicSubscriptionBatch: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: EMAIL_IMPORT,
          Protocol: 'email',
          TopicArn: {
            Ref: 'createProductTopic',
          },
        },
      },
    },
    Outputs: {
      catalogItemsQueueUrl: {
        Value: {
          Ref: 'catalogItemsQueue',
        },
      },
      createProductTopicArn: {
        Value: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      }
    },
  },

  // import the function via paths
  functions: {
    getProductsList,
    getProductById,
    createProduct,
    catalogBatchProcess,
  },
};

module.exports = serverlessConfiguration;
