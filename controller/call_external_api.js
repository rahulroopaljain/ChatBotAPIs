const http = require('http');
const logger = require('winston');

module.exports.getRequest = function(url, callback) {

    logger.info('Making GET request, url: ' + url);

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
            logger.info('GET request completed, response received.');
            logger.debug('Response from GET call: ' + buffer);

            try {
                data = JSON.parse(buffer);
                callback(data);
            }
            catch (err) {
                logger.error(err.message + '\n' + buffer);
                callback(data, err.message);
            }
        });
    });

    request.on('error', function (err) {
        logger.error('GET request call failed to url: ' + url + '\n' + err);
        callback(err, err);
    });

    request.end();
}