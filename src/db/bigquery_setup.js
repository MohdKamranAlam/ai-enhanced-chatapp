// bigquery_setup.js

const { BigQuery } = require('@google-cloud/bigquery');

// Explicitly specify the project ID when initializing the BigQuery client
const bigquery = new BigQuery({
  projectId: 'aichatbot21747', 
});

async function createDataset(datasetId) {
    try {
        await bigquery.createDataset(datasetId);
        console.log(`Dataset ${datasetId} created.`);
    } catch (error) {
        console.error('ERROR:', error);
    }
}

async function createTable(datasetId, tableId, schema) {
    const options = {
        schema: schema,
        location: 'asia-south2', // Corrected location format
    };

    try {
        await bigquery.dataset(datasetId).createTable(tableId, options);
        console.log(`Table ${tableId} created.`);
    } catch (error) {
        console.error('ERROR:', error);
    }
}

const datasetId = 'aichatbot21747'; // Replace with your desired dataset ID

const usersSchema = {
    fields: [
        { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'username', type: 'STRING', mode: 'REQUIRED' },
        { name: 'password', type: 'STRING', mode: 'REQUIRED' },
        { name: 'emailId', type: 'STRING', mode: 'NULLABLE' },
        { name: 'createdAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'updatedAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
    ],
};

const chatLogsSchema = {
    fields: [
        { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'userId', type: 'INTEGER', mode: 'REQUIRED' },
        { name: 'sessionId', type: 'STRING', mode: 'REQUIRED' },
        { name: 'message', type: 'STRING', mode: 'NULLABLE' },
        { name: 'response', type: 'STRING', mode: 'NULLABLE' },
        { name: 'createdAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'updatedAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
    ],
};

async function setupBigQuery() {
    // Create Dataset
    await createDataset(datasetId);

    // Create Users Table
    await createTable(datasetId, 'Users', usersSchema);

    // Create ChatLogs Table
    await createTable(datasetId, 'ChatLogs', chatLogsSchema);
}

setupBigQuery().catch(console.error);
