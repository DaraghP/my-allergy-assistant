/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


const {AWS} = require("aws-sdk");
const { SNSClient, CreatePlatformEndpointCommand } = require("@aws-sdk/client-sns");

const client = new SNSClient({region: "eu-west-1"})
const snsPlatformAppArn = "arn:aws:sns:eu-west-1:726018912366:app/GCM/MyAllergyAssistant";
exports.handler = async (event, context) => {
    let body;
    let deviceEndpoint;
    let token = event.token;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.httpMethod) {
            case 'POST':
                const res = await client.send(new CreatePlatformEndpointCommand({PlatformApplicationArn: snsPlatformAppArn, Token: token}));
                deviceEndpoint = res.EndpointArn;
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        console.log(err)
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
        deviceEndpoint
    };
};
