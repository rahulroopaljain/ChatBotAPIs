const http = require("http");

module.exports.getRequest = function(url, callback) {
    var request = http.get(url, function (response) {
        // data is streamed in chunks from the server
        // so we have to handle the "data" event
        var buffer = "",
            data;

        response.on("data", function (chunk) {
            buffer += chunk;
        });

        response.on("end", function (err) {
            // finished transferring data
            data = JSON.parse(buffer);
            callback(data);
        });
    });
}