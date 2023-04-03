const AWS = require("aws-sdk");
const lambdaLocal = require("lambda-local");
const reportsLambda = require("../lambda_functions/reportsLambda/index");
const {stopDb} = require("jest-dynalite")
const {addItems, addItem, deleteItem, getAllItems} = require("./helperFunctions");

let table = "Report";
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

    beforeAll(async () => {
        // set up
        dynamodb = new AWS.DynamoDB({endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, sslEnabled: false, region: "localhost"});
        docClient = new AWS.DynamoDB.DocumentClient({endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, region: "localhost", sslEnabled: false});
    })

    afterAll(async () => {
        await stopDb();
    })

    it("table should be set up", () => {
        getAllItems(dynamodb, table).then((items) => {
            expect(items).toBeDefined();
        })
    })

    it("should create first report for a product and get the report", async () => {
        const data = setUpProductReports(1);

        const stateBefore = await getAllItems(dynamodb, table);

        await addItem(docClient, table, data);

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(1)
    })

    it("should create more than one report for the product and get its reports", async () => {
        const data = setUpProductReports(2);

        await getAllItems(dynamodb, table);

        await addItem(docClient, table, data);

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.ScannedCount).toEqual(1)
        expect(stateAfter.Items[0].reports.L.length).toEqual(2);
    })

    it("should delete product report by user id", async () => {
        const data = setUpProductReports(2);

        const index = 0;
        const userId = `test${index}_id`;

        await addItems(docClient, table, data)

        await getAllItems(dynamodb, table);

        await dynamodb.updateItem({
            TableName: table,
            Key: {product_id: {S: "barcode"}},
            UpdateExpression: "REMOVE reports["+index+"]",
            ReturnValues: 'UPDATED_NEW',
        }).promise()

        const stateAfter = await getAllItems(dynamodb, table);

        expect(stateAfter.Items[0].reports.L[0].M.user_id.S).toEqual("test1_id");
    })
})