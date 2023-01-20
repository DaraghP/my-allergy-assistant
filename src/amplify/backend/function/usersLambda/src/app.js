/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

let tableName = "User";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}


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
  //console.log('Received event:', JSON.stringify(event, null, 2));

  let body;
  let statusCode = '200';
  const headers = {
    'Content-Type': 'application/json',
  };

  // console.log("EVENT -> ", event);
  // console.log("CONTEXT -> ", context)

  try {
    switch (event.httpMethod) {
      case 'DELETE':
        body = await dynamo.delete(JSON.parse(event.body)).promise();
        break;
      case 'GET':
        let queryParams = { TableName: tableName };
        console.log(queryParams)
        if (event.body != null && "Key" in event.body) {
        // if (event.queryStringParameters != null && "Key" in event.queryStringParameters) {
          // console.log("test1 ->", event.queryStringParameters.Key);
          // console.log("test2 ->", event.queryStringParameters["Key"]);
          // queryParams["Key"] = event.queryStringParameters.Key;
          // body = await dynamo.get(queryParams).promise();
          console.log("Getting single user");
          body = await dynamo.get(JSON.parse(event.body)).promise();
        }
        else {
          console.log("Getting all users");
          body = await dynamo.scan(queryParams).promise();
        }


        break;
      case 'POST':
        body = await dynamo.put(JSON.parse(event.body)).promise();
        break;
      case 'PUT':
        body = await dynamo.update(JSON.parse(event.body)).promise();
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

//PREV VERSION
//
// const AWS = require('aws-sdk')
// const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
// const bodyParser = require('body-parser')
// const express = require('express')
//
// AWS.config.update({ region: process.env.TABLE_REGION });
//
// const dynamodb = new AWS.DynamoDB.DocumentClient();
//
// let tableName = "User";
// if (process.env.ENV && process.env.ENV !== "NONE") {
//   tableName = tableName + '-' + process.env.ENV;
// }
//
// const userIdPresent = false; // TODO: update in case is required to use that definition
// const partitionKeyName = "username";
// const partitionKeyType = "S";
// const sortKeyName = "email";
// const sortKeyType = "S";
// const hasSortKey = sortKeyName !== "";
// const path = "/users";
// const UNAUTH = 'UNAUTH';
// const hashKeyPath = '/:' + partitionKeyName;
// const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';
//
// // declare a new express app
// const app = express()
// app.use(bodyParser.json())
// app.use(awsServerlessExpressMiddleware.eventContext())
//
// // Enable CORS for all methods
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*")
//   res.header("Access-Control-Allow-Headers", "*")
//   next()
// });
//
// // convert url string param to expected Type
// const convertUrlType = (param, type) => {
//   switch(type) {
//     case "N":
//       return Number.parseInt(param);
//     default:
//       return param;
//   }
// }
//
// /********************************
//  * HTTP Get method for list objects *
//  ********************************/
//
// app.get(path + hashKeyPath, function(req, res) {
//   const condition = {}
//   condition[partitionKeyName] = {
//     ComparisonOperator: 'EQ'
//   }
//
//   if (userIdPresent && req.apiGateway) {
//     condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
//   } else {
//     try {
//       condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }
//
//   let queryParams = {
//     TableName: tableName,
//     KeyConditions: condition
//   }
//
//   dynamodb.query(queryParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({error: 'Could not load items: ' + err});
//     } else {
//       res.json(data.Items);
//     }
//   });
// });
//
// /*****************************************
//  * HTTP Get method for get single object *
//  *****************************************/
//
// app.get(path + '/object' + hashKeyPath + sortKeyPath, function(req, res) {
//   const params = {};
//   if (userIdPresent && req.apiGateway) {
//     params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   } else {
//     params[partitionKeyName] = req.params[partitionKeyName];
//     try {
//       params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }
//   if (hasSortKey) {
//     try {
//       params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }
//
//   let getItemParams = {
//     TableName: tableName,
//     Key: params
//   }
//
//   dynamodb.get(getItemParams,(err, data) => {
//     if(err) {
//       res.statusCode = 500;
//       res.json({error: 'Could not load items: ' + err.message});
//     } else {
//       if (data.Item) {
//         res.json(data.Item);
//       } else {
//         res.json(data) ;
//       }
//     }
//   });
// });
//
//
// /************************************
// * HTTP put method for insert object *
// *************************************/
//
// app.put(path, function(req, res) {
//
//   if (userIdPresent) {
//     req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   }
//
//   let putItemParams = {
//     TableName: tableName,
//     Item: req.body
//   }
//   dynamodb.put(putItemParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({ error: err, url: req.url, body: req.body });
//     } else{
//       res.json({ success: 'put call succeed!', url: req.url, data: data })
//     }
//   });
// });
//
// /************************************
// * HTTP post method for insert object *
// *************************************/
//
// app.post(path, function(req, res) {
//
//   if (userIdPresent) {
//     req.body['userId'] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   }
//
//   let putItemParams = {
//     TableName: tableName,
//     Item: req.body
//   }
//   dynamodb.put(putItemParams, (err, data) => {
//     if (err) {
//       res.statusCode = 500;
//       res.json({error: err, url: req.url, body: req.body});
//     } else {
//       res.json({success: 'post call succeed!', url: req.url, data: data})
//     }
//   });
// });
//
// /**************************************
// * HTTP remove method to delete object *
// ***************************************/
//
// app.delete(path + '/object' + hashKeyPath + sortKeyPath, function(req, res) {
//   const params = {};
//   if (userIdPresent && req.apiGateway) {
//     params[partitionKeyName] = req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
//   } else {
//     params[partitionKeyName] = req.params[partitionKeyName];
//      try {
//       params[partitionKeyName] = convertUrlType(req.params[partitionKeyName], partitionKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }
//   if (hasSortKey) {
//     try {
//       params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType);
//     } catch(err) {
//       res.statusCode = 500;
//       res.json({error: 'Wrong column type ' + err});
//     }
//   }
//
//   let removeItemParams = {
//     TableName: tableName,
//     Key: params
//   }
//   dynamodb.delete(removeItemParams, (err, data)=> {
//     if (err) {
//       res.statusCode = 500;
//       res.json({error: err, url: req.url});
//     } else {
//       res.json({url: req.url, data: data});
//     }
//   });
// });
//
// app.listen(3033, function() {
//   console.log("App started")
// });
//
// // Export the app object. When executing the application local this does nothing. However,
// // to port it to AWS Lambda we will create a wrapper around that will load the app from
// // this file
// module.exports = app
