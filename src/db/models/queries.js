// queries.js
const User = require('./user');
const ChatLog = require('./chatlog');
const { Sequelize, sequelize } = require('../config');
//const bigqueryClient = require('../bigqueryClient');
const { BigQuery } = require('@google-cloud/bigquery');



// Initialize BigQuery client
const bigqueryClient = new BigQuery({
    projectId: 'aichatbot21747', // Use your BigQuery project ID
});

// Specify your BigQuery dataset and table IDs
const datasetId = 'aichatbot21747'; // Use your BigQuery dataset ID
const usersTableId = 'Users';
const chatLogsTableId = 'ChatLogs';

// Function to insert data into BigQuery
const insertIntoBigQuery = async (data, tableId) => {
    const table = bigqueryClient.dataset(datasetId).table(tableId);

    try {
        await table.insert(data);
        console.log(`Data inserted into BigQuery table: ${tableId}`);
    } catch (error) {
        console.error('Error inserting data into BigQuery:', error);
        if (error.name === 'PartialFailureError' && error.errors) {
            error.errors.forEach((err, index) => {
                console.error(`Error ${index + 1} details:`, JSON.stringify(err.errors, null, 2));
            });
        }
    }

};


const insertUser = async (username, password, emailId) => {
    try {
        const user = await User.create({ username, password, emailId });

        // Prepare data for BigQuery
        let id = user.id;
        const bigQueryUserData = {
            id, username, password, emailId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };

        // Insert user data into BigQuery
        const bigQueryData = await insertIntoBigQuery([bigQueryUserData], usersTableId);



        return user.id;
    } catch (err) {
        console.error('Error inserting user:', err);
        throw err;
    }
};

// const insertChatLog = async (userId, sessionId, message, response) => {

//     try {
//         const chatLog = await ChatLog.create({userId,sessionId, message, response });


//                 // Prepare data for BigQuery
//                 const bigQueryChatLogData = {
//                     insertId: chatLog.id.toString(), // Convert ID to string for BigQuery
//                     json: { userId, sessionId, message, response, createdAt: new Date(), updatedAt: new Date() },
//                 };

//                 // Insert chat log data into BigQuery
//                 await insertIntoBigQuery([bigQueryChatLogData], chatLogsTableId);


//     } catch (err) {
//         console.error('Error inserting chat log:', err);
//         throw err;
//     }
// };

const insertChatLog = async (userId, sessionId, message, response) => {
    try {
        const chatLog = await ChatLog.create({ userId, sessionId, message, response });

        // Prepare data for BigQuery
        const bigQueryChatLogData = {
            id: chatLog.id,
            userId: chatLog.userId,
            sessionId: chatLog.sessionId,
            message: chatLog.message,
            response: chatLog.response,
            createdAt: chatLog.createdAt.toISOString(),
            updatedAt: chatLog.updatedAt.toISOString()

        };

        // Insert chat log data into BigQuery
        const data = await insertIntoBigQuery([bigQueryChatLogData], chatLogsTableId);

        console.log('Chat log inserted into bigquery');

    } catch (err) {
        console.error('Error inserting chat log:', err);
        throw err;
    }
};


const getAllChatLogsByUserId = async (userId) => {
    try {
        const chatLogs = await ChatLog.findAll({
            where: { userId }
        });
        console.log('chat logs: ', chatLogs)
        return chatLogs;
    } catch (err) {
        console.error('Error fetching chat logs:', err);
        throw err;
    }
};
const getAllChatLogsByUserAndSession = async (userId, sessionId) => {
    try {
        const chatLogs = await ChatLog.findAll({
            where: { userId, sessionId }
        });
        return chatLogs;
    } catch (err) {
        console.error('Error fetching chat logs:', err);
        throw err;
    }
};

const getAllSessionsByUserId = async (userId) => {
    try {
        // Find the earliest createdAt for each sessionId for the user
        const earliestMessages = await ChatLog.findAll({
            attributes: [
                'sessionId',
                [Sequelize.fn('min', Sequelize.col('createdAt')), 'firstMessageCreatedAt']
            ],
            where: { userId },
            group: ['sessionId'],
        });

        // Map through each session to find the first message
        const sessionData = await Promise.all(earliestMessages.map(async (session) => {
            // Now find the message with the earliest createdAt for each sessionId
            const firstMessageRecord = await ChatLog.findOne({
                where: {
                    sessionId: session.get('sessionId'),
                    createdAt: session.get('firstMessageCreatedAt')
                },
                attributes: ['message']
            });

            // Return an object containing the sessionId, the first message, and the createdAt time
            return {
                sessionId: session.get('sessionId'),
                firstMessage: firstMessageRecord ? firstMessageRecord.get('message') : null,
                createdAt: session.get('firstMessageCreatedAt') // Add the createdAt time
            };
        }));

        // Sort the sessionData by createdAt in descending order
        sessionData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return sessionData;
    } catch (err) {
        console.error('Error fetching sessions by user ID:', err);
        throw err;
    }
};
// Function to delete a session based on sessionId
// const deleteSession = async (sessionId) => {
//     try {
//         const result = await ChatLog.destroy({
//             where: { sessionId }
//         });
//         console.log(`Deleted ${result} chat log(s) for session ID: ${sessionId}`);
//         return result; // Returns the number of deleted records
//     } catch (err) {
//         console.error('Error deleting session:', err);
//         throw err;
//     }
// };


const deleteSession = async (sessionId) => {
    try {
        // First, check the createdAt timestamp from the local database
        const chatLog = await ChatLog.findOne({
            where: { sessionId },
            attributes: ['createdAt']
        });

        if (!chatLog) {
            console.log(`No session found with ID: ${sessionId}`);
            return 0; // No records to delete
        }

        const createdAt = new Date(chatLog.createdAt).getTime();
        const ninetyMinutesAgo = Date.now() - (90 * 60 * 1000);

        // Check if 90 minutes have passed since the session was created
        if (createdAt > ninetyMinutesAgo) {
            console.log(`Session ID: ${sessionId} is not old enough to be deleted`);
            return 0; // No records to delete
        }

        // Proceed with deletion from the local database
        const localDbResult = await ChatLog.destroy({
            where: { sessionId }
        });
        console.log(`Deleted ${localDbResult} chat log(s) for session ID: ${sessionId} from local database`);

        // Construct the DELETE query for BigQuery, assuming that BigQuery also has a createdAt field
        const deleteQuery = `
            DELETE FROM \`${datasetId}.${chatLogsTableId}\`
            WHERE sessionId = @sessionId AND TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), createdAt, MINUTE) >= 90
        `;

        const options = {
            query: deleteQuery,
            location: 'asia-south2', // Make sure to match your dataset's location
            params: { sessionId: sessionId }
        };

        // Execute the DELETE query in BigQuery
        await bigqueryClient.query(options);
        console.log(`Deleted session ID: ${sessionId} from BigQuery`);

        return localDbResult; // Returns the number of deleted records from the local database
    } catch (err) {
        console.error('Error deleting session:', err);
        throw err;
    }
};

const getAllSessionsByUserIdFromBigquery = async (userId) => {
    const query = `
      WITH FirstMessages AS (
        SELECT
          sessionId,
          message AS firstMessage,
          createdAt AS firstMessageCreatedAt,
          ROW_NUMBER() OVER(PARTITION BY sessionId ORDER BY createdAt ASC) AS rn
        FROM
          \`${datasetId}.${chatLogsTableId}\`
        WHERE
          userId = @userId
      )
      SELECT
        sessionId,
        firstMessage,
        firstMessageCreatedAt
      FROM
        FirstMessages
      WHERE
        rn = 1
      ORDER BY
        firstMessageCreatedAt DESC
    `;

    const options = {
        query: query,
        location: 'asia-south2', // Set the location to match your dataset's location
        params: { userId: parseInt(userId, 10) }, // Ensure userId is passed as an integer
    };

    try {
        const [rows] = await bigqueryClient.query(options);
        return rows.map(row => ({
            sessionId: row.sessionId,
            firstMessage: row.firstMessage,
            createdAt: row.firstMessageCreatedAt,
        }));
    } catch (err) {
        console.error('Error fetching session data from BigQuery:', err);
        throw err;
    }
};




// const getAllChatLogsByUserAndSessionFromBigquery = async (userId, sessionId) => {
//     const query = `
//       SELECT *
//       FROM \`${datasetId}.${chatLogsTableId}\`
//       WHERE userId = @userId AND sessionId = @sessionId
//     `;

//     const options = {
//       query: query,
//       location: 'asia-south2', // Set the location to match your dataset's location
//       //params: {userId: userId, sessionId: sessionId},
//       params: { userId: parseInt(userId, 10), sessionId}
//     };

//     try {
//       const [rows] = await bigqueryClient.query(options);
//       return rows;
//     } catch (err) {
//       console.error('Error fetching chat logs from BigQuery:', err);
//       throw err;
//     }
//   };

const getAllChatLogsByUserAndSessionFromBigquery = async (userId, sessionId) => {
    const query = `
        SELECT *
        FROM \`${datasetId}.${chatLogsTableId}\`
        WHERE userId = @userId AND sessionId = @sessionId
        ORDER BY createdAt ASC
    `;

    const options = {
        query: query,
        location: 'asia-south2', // Set the location to match your dataset's location
        params: {
            userId: BigQuery.int(userId), // Convert userId to BigQuery's INT64
            sessionId: sessionId
        }
    };

    try {
        const [rows] = await bigqueryClient.query(options);
        console.log("userId and sessionId: ", [rows])
        return rows.map(row => ({
            id: row.id,
            userId: row.userId,
            sessionId: row.sessionId,
            message: row.message,
            response: row.response,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }));

        console.log("userId and sessionId: ", [rows])
    } catch (err) {
        console.error('Error fetching chat logs from BigQuery:', err);
        throw err;
    }
};




module.exports = {
    insertUser,
    insertChatLog,
    getAllChatLogsByUserId,
    getAllChatLogsByUserAndSession,
    getAllSessionsByUserId,
    deleteSession,
    getAllSessionsByUserIdFromBigquery,
    getAllChatLogsByUserAndSessionFromBigquery,
};
