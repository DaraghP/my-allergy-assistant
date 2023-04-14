const { SNSClient, CreatePlatformEndpointCommand } = require("@aws-sdk/client-sns");
const lambdaLocal = require("lambda-local");
const registerDeviceTokenLambda = require("../lambda_functions/registerDeviceToken/app");

jest.mock("@aws-sdk/client-sns")

let client;
const snsPlatformAppArn = "arn:aws:sns:eu-west-1:123456789012:app/GCM/MyAllergyAssistant";
describe("RegisterDeviceToken", () => {
    beforeEach(() => {
        client = new SNSClient({region: "eu-west-1"});
    })

    it("should create a new endpoint", async () => {
        const newEndpoint = new CreatePlatformEndpointCommand({PlatformApplicationArn: snsPlatformAppArn, Token: "token"})
        await client.send(newEndpoint)

        expect(client.send).toHaveBeenCalledWith(newEndpoint)
        expect(CreatePlatformEndpointCommand).toHaveBeenCalledWith({PlatformApplicationArn: snsPlatformAppArn, Token: "token"})
    })

    it("lambda should return unsupported HTTP method", async () => {
        const event = {
            httpMethod: "PATCH",
            body: JSON.stringify({}),
        }

        const res = await lambdaLocal.execute({
            event: event,
            lambdaFunc: registerDeviceTokenLambda,
            lambdaHandler: "handler",
        })

        expect(res.statusCode).toEqual("400")
        expect(res.body).toEqual('"Unsupported method \\\"PATCH\\\"\"')
    })
})