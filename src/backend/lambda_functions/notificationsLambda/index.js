const AWS = require('aws-sdk');

let tableName = "Notifications"
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

let dynamo;

// for tests
if (process.env.MOCK_DYNAMODB_ENDPOINT) {
    dynamo = new AWS.DynamoDB.DocumentClient({endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, region: "localhost"});
}
else {
    dynamo = new AWS.DynamoDB.DocumentClient();
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
                if (event.queryStringParameters != null && "product_id" in event.queryStringParameters) {
                    // console.log("Getting user to notify of single product");
                    queryParams["Key"] = {
                        product_id: event.queryStringParameters.product_id
                    }
                    body = await dynamo.get(queryParams).promise();
                }
                else{
                    body = await dynamo.scan(queryParams).promise();
                }
                break;
            case 'POST':
                let parsedEventBody = JSON.parse(event.body);
                let endpointSet = dynamo.createSet(parsedEventBody.Item.user_endpoints);

                parsedEventBody.Item.user_endpoints = endpointSet;
                queryParams = {...queryParams, ...parsedEventBody};
                body = await dynamo.put(queryParams).promise();
                break;
            case 'PUT':
                let updateEventBody = JSON.parse(event.body);
                updateEventBody.ExpressionAttributeValues[':endpoint'] = dynamo.createSet(updateEventBody.ExpressionAttributeValues[':endpoint']);
                queryParams = {...queryParams, ...updateEventBody};
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
