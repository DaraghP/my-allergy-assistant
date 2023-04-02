async function addItem(docClient, table, item) {
    await addItems(docClient, table, item);
}

async function addItems(docClient, table, ...items) {
    for (let i = 0; i < items.length; i++){
        await docClient.put({TableName: table, Item: items[i]}).promise();
    }
}

async function deleteItem(dynamodb, table, partitionKey, sortKey) {
    await dynamodb.deleteItem({TableName: table, Key: {...partitionKey, ...sortKey}}).promise()
}

async function getAllItems(ddb, table) {
    return await ddb.scan({TableName: table}).promise();
}

module.exports = {addItem, addItems, deleteItem, getAllItems}
