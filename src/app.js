// app.js a socket.io file

require("dotenv").config();
const { Server } = require("socket.io");
const { OpenAI } = require('openai');
const { insertChatLog, insertUser, getAllChatLogsByUserId,getAllSessionsByUserId, getAllChatLogsByUserAndSession } = require('./db/models/queries'); // Import database query functions
const Users = require('./db/models/user')

// Configure OpenAI
const ApiKey = process.env.OPENAI_API_KEY; // Replace with your actual API key
const openai = new OpenAI({
    apiKey: ApiKey
});

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // Adjust as needed for your frontend URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Handle user registration
        socket.on('register', async (userData) => {
            try {
                const { username, password, emailId } = userData;
                const userId = await insertUser({ username, password, emailId });
                socket.emit('registered', userId);
            } catch (error) {
                console.error('Registration error:', error);
            }
        });

        // Handle incoming messages from users

        socket.on('message', async (data) => {
            const { userId, userMessage, sessionId } = data;

            // Validation code...

            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant."
                        },
                        {
                            role: "user",
                            content: userMessage
                        }
                    ]
                });

                if (response && response.choices) {
                    let botResponse = response.choices[0].message.content;

                    // Check to determine if the response is code
                    let isCode = botResponse.startsWith('function') || botResponse.includes(';');

                    // Split the response into chunks and emit each with a delay to simulate real-time typing
                    const delay = 500; // Delay in milliseconds
                    const chunks = splitIntoChunks(botResponse, 100); // Split botResponse into chunks

                    chunks.forEach((chunk, index) => {
                        setTimeout(() => {
                            socket.emit('response', { content: chunk, sessionId: sessionId, isCode: isCode, final: index === chunks.length - 1 });
                        }, index * delay);
                    });

                    // Store the chat log
                    const userExists = await Users.findByPk(userId);
                    if (!userExists) {
                        console.error(`User not found for userId: ${userId}`);
                        return;
                    }
                    await insertChatLog(userId, sessionId, userMessage, botResponse);

                } else {
                    console.error('Invalid bot response:', botResponse);
                }

            } catch (error) {
                console.error('Error handling message:', error);
            }
        });
        // socket.on('message', async (data) => {
        //     const { userId, userMessage, sessionId } = data;
        //     // Validate userMessage
        //     if (typeof userMessage !== 'string' || userMessage.trim() === '') {
        //         console.error('Invalid user message:', userMessage);
        //         // Optionally, send an error message back to the client
        //         socket.emit('error', 'Invalid message content');
        //         return; // Exit the function
        //     }
        //     if (userId == null || isNaN(Number(userId))) {
        //         console.error(`Invalid userId: ${userId}`);
        //         // Handle the error appropriately, such as returning an error response or throwing an exception
        //         return;
        //     }


        //     try {
        //         const response = await openai.chat.completions.create({
        //             model: "gpt-3.5-turbo",
        //             messages: [
        //                 {
        //                     role: "system",
        //                     content: "You are a helpful assistant."
        //                 },
        //                 {
        //                     role: "user",
        //                     content: userMessage
        //                 }
        //             ]
        //         });

        //         let botResponse = '';
        //         let isCode = false; // Define isCode

        //         if (response && response.choices) {
        //             botResponse = response.choices[0].message.content;

        //             // Simple check to determine if the response is code
        //             isCode = botResponse.startsWith('function') || botResponse.includes(';');

        //             socket.emit('response', { content: botResponse, sessionId: sessionId, isCode: isCode });

        //             // Store the chat log
        //             const userExists = await Users.findByPk(userId);
        //             if (!userExists) {
        //                 console.error(`User not found for userId: ${userId}`);
        //                 // Handle this case appropriately
        //                 return;
        //             }
        //             await insertChatLog(userId, sessionId, userMessage, botResponse);

        //         } else {
        //             console.error('Invalid bot response:', botResponse);
        //             // Optionally send an error or a default message to the client
        //         }

        //     } catch (error) {
        //         console.error('Error handling message:', error);
        //     }
        // });

        // Event listener to handle fetching all chat logs for a user
        socket.on('getChatLogs', async (userId) => {
            try {
                if (userId == null || isNaN(Number(userId))) {
                    console.error(`Invalid userId: ${userId}`);
                    // Handle the error appropriately
                    socket.emit('error', 'Invalid user ID');
                    return;
                }

                const chatLogs = await getAllChatLogsByUserId(userId);
                socket.emit('chatLogs', chatLogs);
            } catch (error) {
                console.error('Error fetching chat logs:', error);
                socket.emit('error', 'Error fetching chat logs');
            }
        });

        // Event listener for fetching all session IDs for a user
        socket.on('getSessions', async (userId) => {
            try {
                if (userId == null || isNaN(Number(userId))) {
                    console.error(`Invalid userId: ${userId}`);
                    socket.emit('error', 'Invalid user ID');
                    return;
                }

                const sessionIds = await getAllSessionsByUserId(userId);
                socket.emit('sessionIds', sessionIds);
            } catch (error) {
                console.error('Error fetching session IDs:', error);
                socket.emit('error', 'Error fetching session IDs');
            }
        });

        socket.on('getChatLogsBySession', async (data) => {
            const { userId, sessionId } = data;

            // Validations for userId and sessionId
            if (!userId || !sessionId) {
                socket.emit('error', 'Invalid userId or sessionId');
                return;
            }

            try {
                const chatLogs = await getAllChatLogsByUserAndSession(userId, sessionId);
                socket.emit('chatLogsBySession', chatLogs);
            } catch (error) {
                console.error('Error fetching chat logs by session:', error);
                socket.emit('error', 'Error fetching chat logs by session');
            }
        });


        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
function splitIntoChunks(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.substring(i, i + size));
    }
    return chunks;
}

module.exports = setupSocket;
