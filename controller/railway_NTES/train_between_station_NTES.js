const logger = require('winston');
const AppConstants = require('../app_constants');
const externalAPIClient = require('../../NTESUtils/call_NTES_api');
const helper = require('./helper_methods');



module.exports.processRequest = function(data, callback_to_router) {
    var parameters = data.result.parameters;
    var ntesParams = helper.fetchNTESParams();

    logger.info('parameters: ' + JSON.stringify(parameters));

    var from_stn_code = parameters.SOURCE_STN;
    var to_stn_code = parameters.DEST_STN;
    if (from_stn_code === to_stn_code)
        callback_to_router(helper.responseObjectToApiAI('FROM and TO both stations can not be same.'));

    var response_to_apiAI = '';
    var ntes_request_object = helper.getNTESRequestObject();
    ntes_request_object.headers['cookie'] = ntesParams.cookie;
    ntes_request_object['path'] = '/ntes/NTES?action=getTrnBwStns&stn1=' + from_stn_code + '&stn2=' +
                                  to_stn_code + '&trainType=ALL&' + ntesParams.urlParam;
    externalAPIClient.getRequest(ntes_request_object, function (rawResponse, err) {
        if (err) {
            response_to_apiAI = helper.responseObjectToApiAI(AppConstants.RAILWAY_SERVER_ERROR_MESSAGE);
        }
        else {
            response_to_apiAI = prepareResponse(parameters, rawResponse);
        }
        callback_to_router(response_to_apiAI);
    });
}

function prepareResponse(parameters, rawResponse) {
    var resData = eval(rawResponse);
    var trains = resData.trains.direct;
    var display_text = 'No train found between ' + helper.getStnName(parameters.SOURCE_STN) + ' & ' + helper.getStnName(parameters.DEST_STN);
    if ( trains.length >=1 ) {
        display_text = 'Trains between ' + helper.getStnName(parameters.SOURCE_STN) + ' & ' + helper.getStnName(parameters.DEST_STN) + '\n\n';
        trains.forEach(function (train) {
            display_text += train.trainNo + ', ' + train.trainName + '\n' +
                            train.runsFromStn + '\n' +
                            train.fromStn + ' - ' + formatTime(train.depAtFromStn) + '\n' +
                            train.toStn + ' - ' + formatTime(train.arrAtToStn) + '\n' +
                            'Travel time - ' + train.travelTime + '\n\n';
        });
    }
    return helper.responseObjectToApiAI(display_text);
}


function formatTime(s) {
    if ( s === 'RIGHT TIME' )
        return 'RT';
    return s.split(',')[0];
}
