const AWS = require('aws-sdk');

let config = {}
let tableName = "Report";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

// for tests
if (process.env.MOCK_DYNAMODB_ENDPOINT) {
  config = {endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, region: "localhost"};
}

const sns = new AWS.SNS();
const dynamo = new AWS.DynamoDB.DocumentClient(config);

async function notifyUsers(productID, productName, report) {
    // call notifications GET
    let customQueryParams = {
        TableName: "Notifications-dev",
        Key: {product_id: productID}
    }
    let getNotis = await dynamo.get(customQueryParams).promise();
    // console.log("endpointsList: "+ getNotis.Item.user_endpoints.values);
    if (getNotis.Item?.user_endpoints) {
        for (let endpoint of getNotis.Item.user_endpoints.values) {
            // send SNS notification to each user_endpoint to notify about new report.
            try{
                console.log("publish to : " + endpoint);
                const GCMdata = {
                    "notification": {
                        "title": "MyAllergyAssistant",
                        "body": "A product you scanned was reported",
                        "data": {
                            "product_id": productID,
                            "product_name": productName,
                            "report": report
                        }
                    }
                }
                const data = {
                    "GCM": JSON.stringify(GCMdata)
                }
                const messageJson = JSON.stringify(data);
                console.log(messageJson);
                const testMessage = {
                    MessageStructure: "json",
                    Message: messageJson,
                    // Subject: "MyAllergyAssistant",
                    TargetArn: endpoint
                };
                let SNSresponse = await sns.publish(testMessage).promise();
                console.log("SNS message sent - " + SNSresponse.MessageId);
            } catch(err) {
                console.log(err);
            }
        }
    }
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

    try {
        let queryParams = { TableName: tableName };
        switch (event.httpMethod) {
            case 'DELETE':
                queryParams = {...queryParams, ...JSON.parse(event.body)};
                body = await dynamo.delete(queryParams).promise();
                break;
            case 'GET':
                if (event.queryStringParameters != null && "product_id" in event.queryStringParameters) {
                    // console.log("Getting single report");
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

                queryParams = {...queryParams, ...parsedEventBody};
                body = await dynamo.put(queryParams).promise();

                await notifyUsers(parsedEventBody.Item.product_id, parsedEventBody.Item.product_name, parsedEventBody.Item.reports[0]);
                break;
            case 'PUT':
                let parsedPutJson = JSON.parse(event.body);
                console.log(JSON.stringify(parsedPutJson));
                queryParams = {...queryParams, ...parsedPutJson};
                body = await dynamo.update(queryParams).promise();

                let updateExp = parsedPutJson.UpdateExpression;
                console.log("updateExp: " + updateExp);
                console.log("typeof: " + typeof updateExp);
                if (!(updateExp.includes("REMOVE"))){
                    await notifyUsers(parsedPutJson.Key.product_id, parsedPutJson.ReportData.product_name, parsedPutJson.ReportData.report);
                } else {
                    console.log("not sending noti, report deleted");
                }
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
