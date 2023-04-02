const createTableConfig = (name, partitionKey, sortKey) => {
  let config = {
      TableName: name,
      KeySchema: [
          {
              "AttributeName": partitionKey,
              "KeyType": "HASH"
          },
      ],
      AttributeDefinitions: [
          {
              "AttributeName": partitionKey,
              "AttributeType": "S",
          },
      ],
      ProvisionedThroughput: {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
  }

  if (sortKey) {
    config["KeySchema"].push({"AttributeName": sortKey, "KeyType": "RANGE"})
    config["AttributeDefinitions"].push({"AttributeName": sortKey, "AttributeType": "S"})
  }

  return config;
}


const config = {
  tables: [
    createTableConfig(
        "User",
        "username",
        "email",
    ),
    createTableConfig(
        "Report",
        "product_id",
        false,
    ),
    createTableConfig(
        "Notifications",
        "product_id",
        false,
    )
  ],
  basePort: 8000,
};

module.exports = config;