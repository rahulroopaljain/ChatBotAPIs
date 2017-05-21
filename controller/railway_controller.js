const AppConstants = require('./AppConstants');
const externalAPIClient = require('./call_external_api');
const processStatus = require('./process_status');

var action = ''

module.exports.processRequest = function (data, callback_to_router) {
    action = data.result.action;
    if ( action == AppConstants.PNR_ACTION ) {
        checkPNRStatus(data, callback_to_router);
    }
    else if ( action == AppConstants.TRAIN_SCHEDULE_ACTION ) {
        getTrainSchedule(data, callback_to_router);
    }
    else if ( action == AppConstants.TRAIN_RUNNING_STATUS_ACTION ) {
        getTrainRunningStatus(data, callback_to_router);
    }
    else if ( action == AppConstants.LIVE_STATUS_ACTION ) {
        getLiveStation(data, callback_to_router);
    }
}



/* PNR related methods */
function checkPNRStatus(data, callback_to_router) {
    var parameters = data.result.parameters;
    var PNR = parameters.PNR_NBR;
    var railway_api_url = AppConstants.RAILWAY_API_DOMAIN_URL + '/pnr_status/pnr/' + PNR + '/apikey/' + AppConstants.RAILWAY_API_KEY + '/';
    externalAPIClient.getRequest(railway_api_url, function (rawResponse) {
        var response_to_apiAI = prepare_pnr_status_response(rawResponse);
        callback_to_router(response_to_apiAI);
    });
}

function prepare_pnr_status_response(rawResponse) {
    var status = rawResponse.response_code;
    var pnr = rawResponse.pnr;
    var chart_prepared = rawResponse.chart_prepared == 'Y' ? 'Chart prepared' : 'Chart not prepared';
    var passenger_count = rawResponse.total_passengers;
    var passenger_array = rawResponse.passengers;
    return 'PNR: ' + pnr + '\n' +
           'status: ' + status + '\n' +
           '*** ' + chart_prepared + ' ***';

}


/* Train Schedule related methods */
function getTrainSchedule(data, callback_to_router) {
    var parameters = data.result.parameters;
    var train_number = parameters.TRAIN_NBR;
    var railway_api_url = AppConstants.RAILWAY_API_DOMAIN_URL + '/route/train/' + train_number + '/apikey/' + AppConstants.RAILWAY_API_KEY + '/';
    externalAPIClient.getRequest(railway_api_url, function (rawResponse) {
        var response_to_apiAI = prepare_train_schedule_response(rawResponse);
        callback_to_router(response_to_apiAI);
    });
}

function prepare_train_schedule_response(rawResponse) {
    var status = rawResponse.response_code;
    var display_text = '';
    if ( status != 200 ) {
        display_text = processStatus.processRailwayResponseStatus(action, status);
    }
    else {
        var train_detail = rawResponse.train;
        var route_detail = rawResponse.route;
        var days = [];
        var stations = '';
        train_detail.days.forEach(function(day) {
            if ( day.runs == 'Y' )
                days.push(day['day-code']);
        });
        var days_str = days.length == 7 ? "Runs Daily" : days.join();
        route_detail.forEach(function (station) {
            stations += station.fullname + ' (' + station.code + ')\n';
            stations += 'SA-' + station.scharr + ', SD-' + station.schdep + '\n\n';
        })
        display_text = "Train: " + train_detail.number + ", " +  train_detail.name + "\n";
        display_text += days_str + '\n\n' + stations;
    }
    var response = {};
    response['speech'] = display_text;
    response['displayText'] = display_text;
    response['data'] = {};
    response['contextOut'] = [];
    response['source'] = "ChatBot";
    return response;
}


/* Train running status methods */
function getTrainRunningStatus(data, callback_to_router) {
    var parameters = data.result.parameters;
    var train_number = parameters.TRAIN_NBR;
    var inq_date = parameters.INQ_DATE.replace(/-/g, '');
    var railway_api_url = AppConstants.RAILWAY_API_DOMAIN_URL + '/live/train/' + train_number +
                          '/doj/' + inq_date + '/apikey/' + AppConstants.RAILWAY_API_KEY + '/';
    externalAPIClient.getRequest(railway_api_url, function (rawResponse) {
        var response_to_apiAI = prepare_train_running_status_response(rawResponse);
        callback_to_router(response_to_apiAI);
    });
}

function prepare_train_running_status_response(rawResponse) {
    var status = rawResponse.response_code;
    var train = rawResponse.train_number;
    var position = rawResponse.position;
    var display_text = position;
    var response = {};
    response['speech'] = display_text;
    response['displayText'] = display_text;
    response['data'] = {};
    response['contextOut'] = [];
    response['source'] = "ChatBot";
    return response;
}


/*Live station method*/
function getLiveStation(data, callback_to_router) {
    var parameters = data.result.parameters;
    var station_code = parameters.STN_NM;
    var hrs = parameters.HRS;
    var railway_api_url = AppConstants.RAILWAY_API_DOMAIN_URL + '/arrivals/station/' + station_code +
                          '/hours/' + hrs + '/apikey/' + AppConstants.RAILWAY_API_KEY + '/';
    externalAPIClient.getRequest(railway_api_url, function (rawResponse) {
        var response_to_apiAI = prepare_live_station_response(rawResponse);
        callback_to_router(response_to_apiAI);
    });
}

function prepare_live_station_response(rawResponse) {
    var status = rawResponse.response_code;
    var station_code = rawResponse.station;
    var trains = rawResponse.train;
    var display_text = station_code + '\n\n';
    var response = {};
    trains.forEach(function (train) {
        display_text += train.number + ', ' + train.name + '\n' +
                        'SA-' + train.scharr + ', SD-' + train.schdep + '\n' +
                        'LA-' + train.delayarr + ', LD-' + train.delaydep + '\n' +
                        'EA-' + train.actarr + ', ED-' + train.actdep + '\n\n';

    });
    response['speech'] = display_text;
    response['displayText'] = display_text;
    response['data'] = {};
    response['contextOut'] = [];
    response['source'] = "ChatBot";
    return response;
}