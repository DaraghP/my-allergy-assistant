const AWS = require("aws-sdk");
const lambdaLocal = require("lambda-local");
const usersLambda = require("../lambda_functions/usersLambda/src/app");
const {stopDb} = require("jest-dynalite")
const {addItems, addItem, deleteItem, getAllItems} = require("./helperFunctions");

let dynamodb;
let docClient;
describe("User", () => {
    const setUpUsers = (count) => {
        let users = []

        let user;
        let email;
        let data = {
          "deviceEndpoint": "deviceEndpoint",
          "email": email,
          "allergens": ["allergens"],
          "hasCompletedSetup": false,
          "scans": {"test": "test"},
          "username": user,
        }

        for (let i = 0; i < count; i++) {
            data.username = `test${i}`;
            data.email = `test${i}@fakeemail.com`;
            users.push({...data});
        }

        return users;
    }

    beforeAll(async () => {
        // set up
        dynamodb = new AWS.DynamoDB({endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, sslEnabled: false, region: "localhost"});
        docClient = new AWS.DynamoDB.DocumentClient({endpoint: process.env.MOCK_DYNAMODB_ENDPOINT, region: "localhost", sslEnabled: false});
    })

    afterAll(async () => {
        await stopDb();
    })

    it("table should be setup", () => {
        getAllItems(dynamodb, "User").then((items) => {
            expect(items).toBeDefined();
        })
    })

    it("should add user", async () => {
        let user = setUpUsers(1)[0]
        await addItem(docClient, "User", user);

        let res = await getAllItems(dynamodb, "User");
        expect(res.Items.length).toBeGreaterThan(0);
    })

    it("should get all users", async () => {
        let numberOfUsers = 5;
        let users = setUpUsers(numberOfUsers);
        await addItems(docClient, "User", ...users);

        let res = await getAllItems(dynamodb, "User");
        expect(res.Items.length).toEqual(5);
    })

    it("should delete user", async () => {
        let user = setUpUsers(1)[0];

        await addItem(docClient, "User", user);
        let scanBefore = await getAllItems(dynamodb, "User");

        await deleteItem(dynamodb, "User", {username: {"S": user.username}}, {email: { "S": user.email}});
        let scanAfter = await getAllItems(dynamodb, "User");

        expect(scanBefore.Items.length).toEqual(scanAfter.Items.length + 1)
    })

    it("should get single user", async () => {
        let numberOfUsers = 4
        let users = setUpUsers(numberOfUsers);

        await addItems(docClient, "User", ...users)

        let scan = await getAllItems(dynamodb, "User");
        let user = scan.Items[2];

        expect(user.username.S).toEqual(users[2].username)
    })

    it("should update user information" , async () => {
        let user = setUpUsers(1)[0];
        await addItem(docClient, "User", user);
        let userStateBefore = await getAllItems(dynamodb, "User");
        user.allergens = ["Milk"];
        await dynamodb.updateItem({
            TableName: "User",
            Key: {username: {"S": user.username}, email: { "S": user.email}},
            UpdateExpression: "set allergens = :a",
            ExpressionAttributeValues: {
                ":a": {"SS": user.allergens}
            },
            ReturnValues: "ALL_NEW"
        }).promise();

        let userStateAfter = await getAllItems(dynamodb, "User");

        expect(userStateBefore).not.toEqual(userStateAfter)
        expect(userStateAfter.Items[0].allergens).toEqual({"SS": ["Milk"]})
    })

    it("lambda should return unsupported HTTP method", async () => {
        const event = {
            httpMethod: "PATCH",
            body: JSON.stringify({}),
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler",
        })

        expect(res.statusCode).toEqual("400")
        expect(res.body).toEqual('"Unsupported method \\\"PATCH\\\"\"')
    })

    it("lambda should create user", async () => {
        let user = setUpUsers(1)[0]

        const stateBefore = await getAllItems(dynamodb, "User");

        const event = {
            httpMethod: "POST",
            body: JSON.stringify({Item: user})
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        const stateAfter = await getAllItems(dynamodb, "User");

        expect(stateBefore).not.toEqual(stateAfter);
        expect(stateAfter.ScannedCount).toEqual(stateBefore.ScannedCount + 1);
    })

    it("lambda should get user", async () => {
        let user = setUpUsers(1)[0];
        await addItem(docClient, "User", user)

        const event = {
            httpMethod: "GET",
            queryStringParameters: {
              username: user.username,
              email: user.email,
            }
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        expect(res.statusCode).toEqual("200");
        expect(JSON.parse(res.body).Item.username).toEqual("test0")
    })

    it("lambda should give empty body if asked to get user which doesn't exist", async () => {
        let user = setUpUsers(1)[0];

        const event = {
            httpMethod: "GET",
            queryStringParameters: {
              username: user.username,
              email: user.email,
            }
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        expect(res.statusCode).toEqual("200");
        expect(JSON.parse(res.body)).toEqual({})
    })

    it("lambda should get user", async () => {
        let user = setUpUsers(1)[0];
        await addItem(docClient, "User", user)

        const event = {
            httpMethod: "GET",
            queryStringParameters: {
              username: user.username,
              email: user.email,
            }
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        expect(res.statusCode).toEqual("200");
        expect(JSON.parse(res.body).Item.username).toEqual("test0")
    })

    it("lambda should get all users", async () => {
        let numberOfUsers = 5;
        let users = setUpUsers(numberOfUsers);
        await addItems(docClient, "User", ...users);

        const event = {
            httpMethod: "GET",
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        expect(res.statusCode).toEqual("200");
        expect(JSON.parse(res.body).ScannedCount).toEqual(numberOfUsers);
    })

    it("lambda should delete user", async () => {
        let user = setUpUsers(1)[0];
        await addItem(docClient, "User", user)

        const stateBefore = await getAllItems(dynamodb, "User");

        const event = {
            httpMethod: "DELETE",
            body: JSON.stringify({
              Key: {username: user.username, email: user.email},
            })
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        const stateAfter = await getAllItems(dynamodb, "User");

        expect(stateAfter.ScannedCount).toEqual(stateBefore.ScannedCount - 1)
    })

    it("lambda should update user allergens", async () => {
        let user = setUpUsers(1)[0];
        await addItem(docClient, "User", user);

        const event = {
            httpMethod: "PUT",
            body: JSON.stringify({
              Key: {username: user.username, email: user.email},
              UpdateExpression: 'set allergens = :allergen_list',
              ExpressionAttributeValues: {
                ':allergen_list': ["Peanuts"],
              },
              ReturnValues: 'UPDATED_NEW',
            })
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        const res = await getAllItems(dynamodb, "User");
        expect(res.Items[0].allergens).toEqual({"L": [{"S": "Peanuts"}]})
    })

    it("lambda should update user scans", async () => {
        let user = setUpUsers(1)[0];
        await addItem(docClient, "User", user);

        const scan = {
            "3017620422003": {
                "date": "2023-03-26T17:47:55.290Z",
                "product_display_name": "Nutella - Ferrero - 400g",
                "receive_notifications": true
            },
        }

        const event = {
            httpMethod: "PUT",
            body: JSON.stringify({
                Key: {username: user.username, email: user.email},
                UpdateExpression: `set #scans.#product = :scanResult`, // ${scan.product_id}
                ExpressionAttributeValues: {
                    ':scanResult': Object.values(scan)[0],
                },
                ExpressionAttributeNames: {
                    '#scans': "scans",
                    '#product': Object.keys(scan)[0],
                },
                ReturnValues: 'UPDATED_NEW',
            })
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        const res = await getAllItems(dynamodb, "User");
        expect(Object.keys(res.Items[0].scans.M)).toContain("3017620422003")
    })

    it("lambda should update user receive_notifications value", async () => {
        let user = setUpUsers(1)[0];
        await addItem(docClient, "User", user);

        const scan = {
            "3017620422003": {
                "date": "2023-03-26T17:47:55.290Z",
                "product_display_name": "Nutella - Ferrero - 400g",
                "receive_notifications": true
            },
        }

        let event = {
            httpMethod: "PUT",
            body: JSON.stringify({
                Key: {username: user.username, email: user.email},
                UpdateExpression: `set #scans.#product = :scanResult`, // ${scan.product_id}
                ExpressionAttributeValues: {
                    ':scanResult': Object.values(scan)[0],
                },
                ExpressionAttributeNames: {
                    '#scans': "scans",
                    '#product': Object.keys(scan)[0],
                },
                ReturnValues: 'UPDATED_NEW',
            })
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })


        const product_id = "3017620422003";
        const receive_notifications = true;

        event = {
            httpMethod: "PUT",
            body: JSON.stringify({
                Key: {username: user.username, email: user.email},
                UpdateExpression: 'set scans.#product.receive_notifications = :new_boolean',
                ExpressionAttributeValues: {
                    ':new_boolean': receive_notifications,
                },
                ExpressionAttributeNames: {
                    '#product': product_id,
                },
                ReturnValues: 'UPDATED_NEW',
            })
        }

        await lambdaLocal.execute({
            event: event,
            lambdaFunc: usersLambda,
            lambdaHandler: "handler"
        })

        const res = await getAllItems(dynamodb, "User");
        expect(Object.keys(res.Items[0].scans.M)).toContain(product_id)
        expect(res.Items[0].scans.M[product_id].M.receive_notifications).toBeDefined();
        expect(res.Items[0].scans.M[product_id].M.receive_notifications.BOOL).toEqual(true)

    })
})