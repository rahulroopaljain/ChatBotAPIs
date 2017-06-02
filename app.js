// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const uuid = require('uuid/v4');
const logger = require('./logger');

// Initialize express app
const app = express();

//Middleware function calls
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    logger.setRequestUniqueID(uuid());
    next();
});
app.use('/view', express.static('./files'));
app.use(require('./controller/router'));

const PORT = 8043;

https.createServer({
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
}, app).listen(PORT, function () {
    console.log('Server is running on port: ' + PORT);
});
