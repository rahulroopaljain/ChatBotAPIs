const https = require('https');
//const logger = require('winston');

module.exports.getRequest = function(options, callback) {

//    logger.info('Making GET request, url: ' + url);
    console.log(new Date() + ' - Making GET request, url: ' + JSON.stringify(options));

    var request = https.request(options, function (response) {
        // data is streamed in chunks from the server
        // so we have to handle the "data" event

        var buffer = "";
        response.on("data", function (chunk) {
            buffer += chunk;
        });

        response.on("end", function (err) {
            // finished transferring data
//            logger.info('GET request completed, response received.');
//            logger.debug('Response from GET call: ' + buffer);
            console.log(new Date() + ' - GET request completed, response received.');

            try {
                var data = buffer;
                callback(data, response.headers['set-cookie'] != undefined ? response.headers['set-cookie'].join(';') : undefined);
            }
            catch (err) {
//                logger.error(err.message + '\n' + buffer);
                console.log('check' + err);
                callback(data, err.message);
            }
        });
    });

    request.on('error', function (err) {
//        logger.error('GET request call failed to url: ' + url + '\n' + err);
        console.log('GET request call failed to url: ' + JSON.stringify(options) + '\n' + err);
        callback(err, err);
    });

    request.end();
}