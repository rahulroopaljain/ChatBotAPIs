const logger = require('winston');
const AppConstants = require('../app_constants');
const helper = require('./helper_methods');


const PNR = require('./pnr_status');
const TS = require('./train_schedule_NTES');
const LS = require('./live_station_NTES');
const TBS = require('./train_between_station_NTES');

var action = '';

module.exports.processRequest = function (data, callback_to_router) {
    action = data.result.action;

    logger.info('POST Request received for /railindigo_NTES/api with action \'' + action + '\'');
    //logger.info('Source: ' + data.originalRequest.source + ', Sender ID: ' + data.originalRequest.data.sender.id);
    logger.debug('request payload: ' + JSON.stringify(data));

    if ( action == AppConstants.PNR_ACTION ) {
        PNR.processRequest(data, callback_to_router);
    }
    else if ( action == AppConstants.TRAIN_SCHEDULE_ACTION ) {
        TS.processRequest(data, callback_to_router);
    }
    else if ( action == AppConstants.LIVE_STATION_ACTION ) {
        LS.processRequest(data, callback_to_router);
    }
    else if ( action == AppConstants.TRAIN_BETWEEN_STATIONS_ACTION ) {
        TBS.processRequest(data, callback_to_router);
    }
    else {
        logger.error('Action \'' + action + '\' is missing');
        callback_to_router(helper.responseObjectToApiAI(AppConstants.GENERIC_ERROR_MESSAGE));
    }
}
