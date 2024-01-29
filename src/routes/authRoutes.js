// authRouthes.js
require('dotenv').config();

const express = require('express')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');

const jwt = require('jsonwebtoken');
const User = require('../db/models/user');
const ChatLog = require('../db/models/chatlog');
const authenticateToken = require('../middleware/auth');
const loginLimiter = require('../middleware/loginLimiter')
const { getAllChatLogsByUserAndSession, getAllSessionsByUserId,deleteSession, 
    insertUser, insertChatLog, getAllChatLogsByUserAndSessionFromBigquery, 
    getAllSessionsByUserIdFromBigquery } = require('../db/models/queries'); 


const router = express.Router()


router.use(bodyParser.json());
// Signup route
router.post('/signup', async (req, res) => {
    const { username, password, emailId } = req.body;
  
    // Check if the username or email already exists
    const existingUser = await User.findOne({ 
        where: { [Op.or]: [{ username }, { emailId }] }
    });
    if (existingUser) {
        return res.status(400).json({ message: 'Username or Email already exists' });
    }
  
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);
  
    try {
        // Use the insertUser function from queries.js
        const userId = await insertUser(username, hashedPassword, emailId);
        // Create a JWT token for the new user
        const token = jwt.sign({ userId: userId, username: username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
        res.json({ token, userId: userId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});
router.post('/login',loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ where: { username } });

        // Check user and password validity
        if (!user) {
            return res.status(401).json({ message: 'Username does not exist.' });
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Respond with the token and user information
        res.json({ token, userId: user.id, username: user.username });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error during the login process' });
    }
});

router.get('/bigquery-data', async (req, res) => {
    try {
        // Here you would replace 'SELECT * FROM `your_dataset.your_table` LIMIT 10'
        // with your actual query
        const query = 'SELECT * FROM `your_dataset.your_table` LIMIT 10';
        const data = await getBigQueryData(query);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from BigQuery:', error);
        res.status(500).json({ message: 'Error fetching data from BigQuery' });
    }
});

// // GET route to retrieve chat logs for a specific user
router.get('/chatlogs/:userId',authenticateToken, async (req, res) => {
  try {
      const chatLogs = await ChatLog.findAll({
          where: { userId: req.params.userId }
      });
      res.json(chatLogs);
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

router.get('/chatlogs/sessions/:userId',authenticateToken, async (req, res) => {
    const { userId } = req.params;

    /** Fetching the data from local database whenever you need you  can unComment this portion  and comment the bigquery part*/
    try {
        // Validate the user ID if necessary
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const sessionData = await getAllSessionsByUserId(userId);
        res.json( sessionData);
    } catch (error) {
        console.error('Error fetching session IDs:', error);
        res.status(500).json({ message: 'Error fetching session IDs' });
    }

    /** getting data from bigQuery */

    // try {
    //     const sessionData = await getAllSessionsByUserIdFromBigquery(userId);
    //     //console.log("Session data from BigQuery", sessionData);
    //     res.json(sessionData);
    // } catch (error) {
    //     console.error('Error fetching session IDs from BigQuery:', error);
    //     res.status(500).json({ message: 'Error fetching session IDs from BigQuery' });
    // }
});


router.get('/chatlogs/sessions/:userId/:sessionId',authenticateToken, async (req, res) => {
    const { userId, sessionId } = req.params;

     /** Fetching the data from local database whenever you need you  can unComment this portion  and comment the bigquery part*/
    try {
        
        const chatLogs = await getAllChatLogsByUserAndSession(userId, sessionId);
        res.json(chatLogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat logs' });
    }

     /** getting data from bigQuery */
    // try {
    //     const chatLogs = await getAllChatLogsByUserAndSessionFromBigquery(userId, sessionId);
    //     res.json(chatLogs);
    // } catch (error) {
    //     console.error('Error fetching chat logs from BigQuery:', error);
    //     res.status(500).json({ message: 'Error fetching chat logs from BigQuery' });
    // }
});

// DELETE route to delete a session
router.delete('/session/:sessionId',authenticateToken, async (req, res) => {
    const { sessionId } = req.params;

    try {
        const deletedCount = await deleteSession(sessionId);
        if (deletedCount > 0) {
            res.json({ message: `Session with ID ${sessionId} successfully deleted` });
        } else {
            res.status(404).json({ message: `No session found with ID ${sessionId}, or it is not old enough to be deleted.` });
        }
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ message: 'Error deleting session' });
    }
});

module.exports = router;
