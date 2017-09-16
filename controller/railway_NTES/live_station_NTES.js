const logger = require('winston');
const AppConstants = require('../app_constants');
const externalAPIClient = require('../../NTESUtils/call_NTES_api');
const helper = require('./helper_methods');



module.exports.processRequest = function(data, callback_to_router) {
    var parameters = data.result.parameters;
    var ntesParams = helper.fetchNTESParams();

    logger.info('parameters: ' + JSON.stringify(parameters));

    if (liveStationParameterSlotFilling(parameters, callback_to_router))
        return;

    var from_stn_code = parameters.STN_NM;
    var to_stn_code = parameters.TO_STN_NM;
    if (from_stn_code === to_stn_code)
        to_stn_code = parameters.TO_STN_NM = null;
    var hrs = parameters.HRS;

    var response_to_apiAI = '';
    var ntes_request_object = helper.getNTESRequestObject();
    ntes_request_object.headers['cookie'] = ntesParams.cookie;
    ntes_request_object['path'] = '/ntes/NTES?action=getTrainsViaStn&viaStn=' + from_stn_code + '&toStn=' +
                                  to_stn_code + '&withinHrs=' + hrs + '&trainType=ALL&' + ntesParams.urlParam;
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
    var trains = resData.allTrains;
    var display_text = 'No train arriving at ' + parameters.STN_NM + ' in next ' + parameters.HRS + ' Hrs';
    if (parameters.TO_STN_NM && parameters.TO_STN_NM != '')
        display_text = 'No train from ' + parameters.STN_NM + ' to ' + parameters.TO_STN_NM + ' in next ' + parameters.HRS + ' Hrs';
    if ( trains.length >=1 ) {
        display_text = 'Trains at ' + parameters.STN_NM + ' in next ' + parameters.HRS + ' Hrs\n\n';
        if (parameters.TO_STN_NM && parameters.TO_STN_NM != '')
            display_text = 'Trains from ' + parameters.STN_NM + ' to ' + parameters.TO_STN_NM + ' in next ' + parameters.HRS + ' Hrs\n\n';
        trains.forEach(function (train) {
            display_text += train.trainNo + ', ' + train.trainName + '\n' +
                'SA-' + formatTime(train.schArr) + ', SD-' + formatTime(train.schDep) + '\n' +
                'LA-' + formatTime(train.delayArr) + ', LD-' + formatTime(train.delayDep) + '\n' +
                'EA-' + formatTime(train.actArr) + ', ED-' + formatTime(train.actDep) + '\n' +
                (train.pfNo === '0' ? '\n' : 'Exp PF: ' + train.pfNo + '\n\n');
        });
    }
    return helper.responseObjectToApiAI(display_text);
}


function formatTime(s) {
    if ( s === 'RIGHT TIME' )
        return 'RT';
    return s.split(',')[0];
}

function liveStationParameterSlotFilling(parameters, callback) {
    if (parameters.STN_NM == '') {
        callback(responseObjectToApiAI('Please enter station name or code..'));
        return true;
    }
    else if (parameters.HRS == '') {
        var data = {"facebook": {"text":"Select time window (2/4/6/8 Hrs): ","quick_replies":[
            {"content_type":"text","title":"Next 2 Hrs","payload":"2"},
            {"content_type":"text","title":"Next 4 Hrs","payload":"4"},
            {"content_type":"text","title":"Next 6 Hrs","payload":"6"},
            {"content_type":"text","title":"Next 8 Hrs","payload":"8"}
        ]}};
        callback(responseObjectToApiAI('', data));
        return true;
    }
    return false;
}