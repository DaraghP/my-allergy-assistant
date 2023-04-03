/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


const AWS = require('aws-sdk');

let config = {}
let tableName = "User";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

// for tests
if (process.env.MOCK_DYNAMODB_ENDPOINT) {
  config = {endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, region: "localhost"};
}

const dynamo = new AWS.DynamoDB.DocumentClient(config);

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = async (event, context) => {

  let body;
  let statusCode = '200';
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    let queryParams = { TableName: tableName };
    switch (event.httpMethod) {
      case 'DELETE':
        queryParams = {...queryParams, ...JSON.parse(event.body)};
        body = await dynamo.delete(queryParams).promise();
        break;
      case 'GET':
        if (event.queryStringParameters != null && "username" in event.queryStringParameters) {
          queryParams["Key"] = {
            username: event.queryStringParameters.username,
            email: event.queryStringParameters.email
          }
          body = await dynamo.get(queryParams).promise();
        }
        else {
          body = await dynamo.scan(queryParams).promise();
        }
        break;
      case 'POST':
        queryParams = {...queryParams, ...JSON.parse(event.body)};
        body = await dynamo.put(queryParams).promise();
        break;
      case 'PUT':
        queryParams = {...queryParams, ...JSON.parse(event.body)};
        body = await dynamo.update(queryParams).promise();
        break;
      default:
        throw new Error(`Unsupported method "${event.httpMethod}"`);
    }
  } catch (err) {
    statusCode = '400';
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
