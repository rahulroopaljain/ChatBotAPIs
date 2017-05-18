// Import required modules
const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const https = require('https');

// Initialize express app
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// initialize routes
app.use(require('./controller/router'));

const PORT = 8043;

https.createServer({
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
}, app).listen(PORT, function () {
    console.log('Server is running on port: ' + PORT);
});
