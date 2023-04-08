const AWS = require("aws-sdk");
const AWSMock = require("aws-sdk-mock");
const lambdaLocal = require("lambda-local");
const reportsLambda = require("../lambda_functions/reportsLambda/index");
const {stopDb} = require("jest-dynalite")
const {addItems, addItem, deleteItem, getAllItems} = require("./helperFunctions");

const table = "Report";
let dynamodb;
let docClient;

describe("Report", () => {
    const setUpProductReports = (count) => {
        let productReports = []

        let data = {
            product_id: "barcode",
            product_name: "productName",
            reports: []
        }

        for (let i = 0; i < count; i++) {
            productReports.push({suspected_allergens: ["allergen"], user_id: `test${i}_id`, date: new Date()});
        }

        data.reports = productReports;
        return data;
    }

    const setUpReportNotification = (userID = 1, productID = "productID", productName = "productName") => {
        return {
            "Item": {
                "product_id": productID,
                "product_name": productName,
                "reports": [
                    {
                        "suspected_allergens": ["allergen"],
                        "user_id": userID
                    }
                ]
            }
        }
    }

    const setUpNotificationToBeAppended = (userId, productId = "productID", ) => {
        return JSON.stringify({
                "Key": {
                    "product_id": productId
                },
                "UpdateExpression": "set reports = list_append(if_not_exists(reports, :emptyReportsList), :addReport)",
                "ExpressionAttributeValues": {
                    ":addReport": [
                        {
                            "suspected_allergens": [
                                "allergen"
                            ],
                            "user_id": "2",
                            "date": "2023-03-03T10:42:11.220Z"
                        }
                    ],
                    ":emptyReportsList": []
                },
                "ReturnValues": "UPDATED_NEW",
                "ReportData": {
                    "product_name": "productName",
                    "report": {
                        "suspected_allergens": [
                            "allergen"
                        ],
                        "user_id": userId,
                        "date": "2023-03-03T10:42:11.220Z"
                    }
                }
            })
    }

    beforeAll(async () => {
        // set up
        dynamodb = new AWS.DynamoDB({endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, sslEnabled: false, region: "localhost"});
        docClient = new AWS.DynamoDB.DocumentClient({endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, region: "localhost", sslEnabled: false});

        // set up mock for SNS
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock("SNS", "publish", (params, callback) => {
            const mockResponse = {
                "ResponseMetadata": {
                    "RequestId": "SNSRequestID"
                },
                "MessageId": "SNSMessageID"
            };

            callback(null, mockResponse)
        })
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

    it("should create first report for a product and get the report", async () => {
        const data = setUpProductReports(1);

        await addItem(docClient, table, data);

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(1)
    })

    it("should create more than one report for the product and get its reports", async () => {
        const data = setUpProductReports(2);

        await addItem(docClient, table, data);

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(1)
        expect(stateAfter.Items[0].reports.L.length).toEqual(2);
    })

    it("should delete product report by user id", async () => {
        const data = setUpProductReports(2);

        const user1Index = 0;

        await addItems(docClient, table, data)

        await getAllItems(dynamodb, table);

        await dynamodb.updateItem({
            TableName: table,
            Key: {product_id: {S: "barcode"}},
            UpdateExpression: "REMOVE reports["+user1Index+"]",
            ReturnValues: 'UPDATED_NEW',
        }).promise()

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.Items[0].reports.L[0].M.user_id.S).toEqual("test1_id");
    })

    it("should delete all reports of a product", async () => {
        const data = setUpProductReports(2);
  
        await addItems(docClient, table, data)

        const stateBefore = await getAllItems(dynamodb, table);

        await deleteItem(dynamodb, table, {product_id: {S: "barcode"}});

        const stateAfter = await getAllItems(dynamodb, table);
        
        expect(stateAfter.ScannedCount).toEqual(stateBefore.ScannedCount - 1);
    })

    it("lambda should return unsupported HTTP method", async () => {
        const event = {
            httpMethod: "PATCH",
            body: JSON.stringify({}),
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler",
        })

        expect(res.statusCode).toEqual("400")
        expect(res.body).toEqual('"Unsupported method \\\"PATCH\\\"\"')
    })

    it("lambda create first report for a product and get the report", async () => {
        const stateBefore = await getAllItems(dynamodb, table);

        const event = {
            httpMethod: "POST",
            body: JSON.stringify(setUpReportNotification())
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateBefore).not.toEqual(stateAfter);
        expect(stateAfter.ScannedCount).toEqual(stateBefore.ScannedCount + 1);        
    })

    it("lambda should create more than one report for the product and get its reports", async () => {
        let event = {
            httpMethod: "POST",
            body: JSON.stringify(setUpReportNotification(1))
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        event = {
            httpMethod: "PUT", 
            body: setUpNotificationToBeAppended("1")
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(1)
        expect(stateAfter.Items[0].reports.L.length).toEqual(2);
    })

    it("lambda should delete product report by user id", async () => {
        let user1Index = 0;
        
        let event = {
            httpMethod: "POST",
            body: JSON.stringify(setUpReportNotification("1"))
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        event = {
            httpMethod: "PUT",
            body: setUpNotificationToBeAppended("1")
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        // deletion event
        const stateBefore = await getAllItems(dynamodb, table);
        
        event = {
            ...event,
            body: JSON.stringify({
                Key: {product_id: "productID"},
                UpdateExpression: "REMOVE reports["+user1Index+"]",
                ReturnValues: 'UPDATED_NEW',
            })
        } 

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })
        
        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.Items[0].reports.L[0].M.user_id.S).toEqual("2");
        expect(stateAfter.Items[0].reports.L.length).toEqual(stateBefore.Items[0].reports.L.length - 1);
    })

    it("lambda should delete all reports of a product", async () => {
        let event = {
            httpMethod: "POST",
            body: JSON.stringify(setUpReportNotification(1))
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        event = {
            httpMethod: "PUT",
            body: JSON.stringify({
                "Key": {
                    "product_id": "productID"
                },
                "UpdateExpression": "set reports = list_append(if_not_exists(reports, :emptyReportsList), :addReport)",
                "ExpressionAttributeValues": {
                    ":addReport": [
                        {
                            "suspected_allergens": [
                                "allergen"
                            ],
                            "user_id": "2",
                            "date": "2023-03-03T10:42:11.220Z"
                        }
                    ],
                    ":emptyReportsList": []
                },
                "ReturnValues": "UPDATED_NEW",
                "ReportData": {
                    "product_name": "productName",
                    "report": {
                        "suspected_allergens": [
                            "allergen"
                        ],
                        "user_id": "2",
                        "date": "2023-03-03T10:42:11.220Z"
                    }
                }
            })
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        // deletion event
        const stateBefore = await getAllItems(dynamodb, table);

        event = {
            httpMethod: "DELETE",
            body: JSON.stringify({
                Key: {product_id: "productID"},
            })
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: reportsLambda,
            lambdaHandler: "handler"
        })

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(stateBefore.ScannedCount - 1)
    })

})