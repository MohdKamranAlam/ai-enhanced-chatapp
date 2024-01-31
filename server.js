// Application entry file server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path'); // Import the Socket.IO setup
const cors = require('cors')
const cookieParser = require('cookie-parser')


const sequelize = require('./src/db/config');
const db = require('./src/db/models/queries')
const authRoutes = require('./src/routes/authRoutes')
const setupSocket = require('./src/app');
const {logger, logEvents} = require('./src/middleware/logger')
const errorHandler = require('./src/middleware/loginLimiter')

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8084;



// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Your client's URL
app.use(logger)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('index'); // Update this as per your requirement
});


app.use(errorHandler)
// Setup Socket.io
setupSocket(server);

sequelize.sync().then(() => {
    console.log('Database synchronized');
    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        setupSocket(server);
    });
    
}).catch((err)=>{
    console.error("Error Occured during db sync: ", err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'postgres.log')
})