#!/bin/bash
set -e
IFS='|'

# reference: https://docs.amplify.aws/cli/usage/headless/#sample-script-3

REACTCONFIG="{\
\"SourceDir\":\"src\",\
\"DistributionDir\":\"build\",\
\"BuildCommand\":\"npm run-script build\",\
\"StartCommand\":\"npm run-script start\"\
}"

AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":false,\
\"profileName\":\"default\",\
\"accessKeyId\":\"$AmplifyIAMUserAccessKey\",\
\"secretAccessKey\":\"$AmplifyIAMUserSecretKey\",\
\"region\":\"eu-west-1\"\
}"

AMPLIFY="{\
\"projectName\":\"MyAllergyAssistant\",\
\"appId\":\"$AmplifyAppId\",\
\"envName\":\"$AmplifyEnvName\",\
\"defaultEditor\":\"code\"\
}"

FRONTEND="{\
\"frontend\":\"javascript\",\
\"framework\":\"react-native\",\
\"config\":$REACTCONFIG\
}"

PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"

amplify pull \
--amplify $AMPLIFY \
--frontend $FRONTEND \
--providers $PROVIDERS \
--yes
