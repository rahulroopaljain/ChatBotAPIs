const logger = require('winston');

module.exports.processRailwayResponseStatus = function (action, status) {
    if ( status == 401 || status ==403 || status == 405 ) {
        logger.error("Status code: " + status);
        return "We are facing some serious issue, please report this incident to admin.";
    }
    else if ( status == 510 ) {
        logger.warn("Status code: " + status);
        return "Train is not scheduled to run on this day.";
    }
}
