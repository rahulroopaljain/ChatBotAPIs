// Import required modules
const express = require('express');

// Initialize express app
const app = express();

// initialize routes
app.use(require('./routes/router'));

const PORT = 8080;

app.listen(PORT, function () {
    console.log('Server is running on port: ' + PORT);
});

