const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");
const lambdaLocal = require("lambda-local");
const notificationsLambda = require("../lambda_functions/notificationsLambda/index");
const {stopDb} = require("jest-dynalite")
const {addItems, addItem, updateItem, deleteItem, getItem, getAllItems} = require("./helperFunctions");

const table = "Notifications";
let dynamodb;
let docClient;

describe("Notifications", () => {
    beforeAll(async () => {
        // set up
        dynamodb = new AWS.DynamoDB({
            endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
            sslEnabled: false,
            region: "localhost"
        });
        docClient = new AWS.DynamoDB.DocumentClient({
            endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
            region: "localhost",
            sslEnabled: false
        });
    })

    afterAll(async () => {
        await stopDb();
        AWSMock.restore("SNS", "publish");
    })

    it("table should be set up", () => {
        getAllItems(dynamodb, table).then((items) => {
            expect(items).toBeDefined();
        })
    })

    it("should create new set of user endpoints for a product", async () => {
        // Item: {product_id: productId, user_endpoints: [user_endpoint]},
        await addItem(docClient, table, {product_id: "productId", user_endpoints: ["endpoint1"]})
        const stateAfter = await getAllItems(dynamodb, table);
        expect(stateAfter.ScannedCount).toEqual(1)
        expect(stateAfter.Items[0].user_endpoints.L).toContainEqual({"S": "endpoint1"});
    })

    it("should add new user endpoints for an existing product in the table containing an endpoint", async () => {
        await addItem(docClient, table, {product_id: "productId1", user_endpoints: docClient.createSet(["endpoint1"])})

        const queryParams = {
            Key: {product_id: "productId1"},
            UpdateExpression: `ADD user_endpoints :endpoint`,
            ExpressionAttributeValues: {
                ':endpoint': docClient.createSet(["endpoint2"])
            },
            ReturnValues: 'UPDATED_NEW',
        }

        await updateItem(
            docClient,
            table,
            queryParams
        )

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.Items[0].user_endpoints.SS.length).toEqual(2);
        expect(stateAfter.Items[0].user_endpoints.SS).toEqual(["endpoint1", "endpoint2"])
    })

    it("should be able to get endpoints of a existing product", async () => {
        await addItem(docClient, table, {product_id: "productId1", user_endpoints: docClient.createSet(["endpoint1"])})
        const product = await getItem(docClient, table, {product_id: "productId1"});
        expect(product.Item.user_endpoints.values).toStrictEqual(["endpoint1"])
    })

    it("should not be able to get endpoints of a non-existant product", async () => {
        const product = await getItem(docClient, table, {product_id: "productId1"});
        expect(product).toStrictEqual({})
    })

    it("should be able to get all products in the table", async () => {
        await addItem(docClient, table, {product_id: "productId1", user_endpoints: docClient.createSet(["endpoint1"])})
        await addItem(docClient, table, {product_id: "productId2", user_endpoints: docClient.createSet(["endpoint1"])})
        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(2);
    })

    it("should delete notification from a product", async () => {
        await addItem(docClient, table, {product_id: "productId", user_endpoints: docClient.createSet(["endpoint1"])})

        const stateBefore = await getAllItems(dynamodb, table);
        await deleteItem(dynamodb, table, {product_id: {S: "productId"}}, {})
        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(stateBefore.ScannedCount - 1)
    })

    it("should be able to publish SNS notifications", async () => {
        const endpoints = ["endpoint1", "endpoint2"];
        await addItem(docClient, table, {product_id: "productId1", user_endpoints: docClient.createSet(endpoints)})

        // set up mock for SNS
        const snsMock = {
            publish: jest.fn().mockReturnValue({
                "ResponseMetadata": {
                    "RequestId": "SNSRequestID"
                },
                "MessageId": "SNSMessageID"
                }
            )
        }

        AWSMock.mock(
            "SNS",
            "publish",
            {publish: snsMock.publish}
        )

        const message = {
              "MessageStructure": "json",
              "Message": "{\"GCM\":\"{\\\"notification\\\":{\\\"title\\\":\\\"MyAllergyAssistant\\\",\\\"body\\\":\\\"A product you scanned was reported\\\",\\\"data\\\":{\\\"product_id\\\":\\\"productId1\\\",\\\"product_name\\\":\\\"productName\\\",\\\"report\\\":{}}}}\"}",
              "TargetArn": "endpoint1"
        }

        for (let endpoint of endpoints) {
            message.TargetArn = endpoint;
            snsMock.publish(message);
        }

        expect(snsMock.publish).toHaveBeenCalledTimes(2);
        expect(snsMock.publish).toHaveBeenCalledWith({
              "MessageStructure": "json",
              "Message": "{\"GCM\":\"{\\\"notification\\\":{\\\"title\\\":\\\"MyAllergyAssistant\\\",\\\"body\\\":\\\"A product you scanned was reported\\\",\\\"data\\\":{\\\"product_id\\\":\\\"productId1\\\",\\\"product_name\\\":\\\"productName\\\",\\\"report\\\":{}}}}\"}",
              "TargetArn": "endpoint2"
        })
    })

    it("lambda should return unsupported HTTP method", async () => {
        const event = {
            httpMethod: "PATCH",
            body: JSON.stringify({}),
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: notificationsLambda,
            lambdaHandler: "handler",
        })

        expect(res.statusCode).toEqual("400")
        expect(res.body).toEqual('"Unsupported method \\\"PATCH\\\"\"')
    })

    it("lambda should create new set of user endpoints for a product", async () => {
        const event = {
            httpMethod: "POST",
            body: JSON.stringify({Item: {product_id: "productId", user_endpoints: ["endpoint1"]},})
        }

        const stateBefore = await getAllItems(dynamodb, table);
        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: notificationsLambda,
            lambdaHandler: "handler"
        })
        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(1)
        expect(stateAfter.Items[0].user_endpoints).toEqual({"SS": ["endpoint1"]});
    })

    it("lambda should add new user endpoints for an existing product in the table containing an endpoint", async () => {
        const event = {
            httpMethod: "POST",
            body: JSON.stringify({Item: {product_id: "productId", user_endpoints: ["endpoint1"]},})
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: notificationsLambda,
            lambdaHandler: "handler"
        })

        event.httpMethod = "PUT"
        event.body = JSON.stringify({
            Key: {product_id: "productId"},
            UpdateExpression: `ADD user_endpoints :endpoint`,
            ExpressionAttributeValues: {
              ':endpoint': ["endpoint2"]
            },
            ReturnValues: 'UPDATED_NEW',
        })

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: notificationsLambda,
            lambdaHandler: "handler"
        })

        const stateAfter = await getAllItems(dynamodb, table)

        expect(stateAfter.Items[0].user_endpoints.SS.length).toEqual(2);
        expect(stateAfter.Items[0].user_endpoints.SS).toEqual(["endpoint1", "endpoint2"])
    })

    it("lambda should be able to get endpoints of a existing product", async () => {
        await addItem(docClient, table, {product_id: "productId1", user_endpoints: docClient.createSet(["endpoint1"])})
        const event = {
            httpMethod: "GET",
            queryStringParameters: {
                product_id: "productId1"
            }
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: notificationsLambda,
            lambdaHandler: "handler"
        })

        res.body = JSON.parse(res.body)

        expect(res.statusCode).toEqual("200");
        expect(res.body.Item.user_endpoints).toEqual(["endpoint1"])
    })

    it("lambda should not be able to get endpoints of a non-existent product", async () => {
        const event = {
            httpMethod: "GET",
            queryStringParameters: {
                product_id: "productId1"
            }
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: notificationsLambda,
            lambdaHandler: "handler"
        })

        res.body = JSON.parse(res.body)

        expect(res.statusCode).toEqual("200");
        expect(res.body).toEqual({})
    })

    it("lambda should be able to get all products in the table", async () => {
        await addItem(docClient, table, {product_id: "productId1", user_endpoints: docClient.createSet(["endpoint1"])})
        await addItem(docClient, table, {product_id: "productId2", user_endpoints: docClient.createSet(["endpoint2"])})

        const event = {
            httpMethod: "GET"
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: notificationsLambda,
            lambdaHandler: "handler"
        })

        res.body = JSON.parse(res.body);

        expect(res.statusCode).toEqual("200");
        expect(res.body.ScannedCount).toEqual(2);
    })
})