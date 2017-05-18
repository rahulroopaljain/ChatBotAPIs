// Import required modules
const express = require('express');
const bodyParser = require("body-parser");

// Initialize express app
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// initialize routes
app.use(require('./controller/router'));

const PORT = 8080;

app.listen(PORT, function () {
    console.log('Server is running on port: ' + PORT);
});

