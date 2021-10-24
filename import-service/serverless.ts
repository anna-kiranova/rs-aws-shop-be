import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';
import { GatewayResponseType } from 'aws-sdk/clients/apigateway';

const BUCKET = 'my-aws-shop-import';

const enableGatewayResponseCors = (responseType: GatewayResponseType) => {
  return {
    Type: "AWS::ApiGateway::GatewayResponse",
    Properties: {
      RestApiId: {
        Ref: "ApiGatewayRestApi",
      },
      ResponseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
      ResponseType: responseType,
    },
  };
};

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
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
  resources: {
    Resources: {
      ApiGatewayRestApi: {
        Type: "AWS::ApiGateway::RestApi",
        Properties: {
          Name: {
            "Fn::Sub": "${AWS::StackName}",
          },
        },
      },
      ResponseUnauthorized: enableGatewayResponseCors("UNAUTHORIZED"),
      ResponseAccessDenied: enableGatewayResponseCors("ACCESS_DENIED"),
    },
  }
};

module.exports = serverlessConfiguration;
