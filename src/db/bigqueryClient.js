// src/db/bigqueryClient.js
require('dotenv').config();
const { BigQuery } = require('@google-cloud/bigquery');
const path = require('path');

const bigqueryClient = new BigQuery({
  keyFilename: path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

module.exports = bigqueryClient;
