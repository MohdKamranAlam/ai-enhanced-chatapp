// index.js or app.js

const { createConnection } = require('typeorm');
const ormconfig = require('./ormconfig');

createConnection(ormconfig)
    .then(() => {
        console.log('Database connected');
        // Rest of your server setup
    })
    .catch(error => console.error('Error connecting to database:', error));
