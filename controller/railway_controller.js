const AppConstants = require('./AppConstants');
const externalAPIClient = require('./call_external_api');
const processStatus = require('./process_status');

var action = '';

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
    else if ( action == AppConstants.TRAIN_BETWEEN_STATIONS_ACTION ) {
        getTrainBetweenStations(data, callback_to_router);
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
    var chart_status = rawResponse.chart_prepared == 'Y' ? 'Chart prepared' : 'Chart not prepared';
    var train = rawResponse.train;
    var display_text = 'PNR: ' + rawResponse.pnr + '\n';
    display_text += train.number + ', ' + train.name + '\n';
    display_text += rawResponse.doj + ', ' + rawResponse.class + '\n';
    rawResponse.passengers.forEach(function (passenger) {

    })
    return responseObjectToApiAI(display_text);
}


/* Train Schedule related methods */
function getTrainSchedule(data, callback_to_router) {
    var parameters = data.result.parameters;
    var train_number = parameters.TRAIN_NBR;
    if ( train_number.length != 5 || isNaN(train_number)) {
        var display_text = "Invalid train no.: " + train_number + "\nTrain no. should be 5 digit numeric.";
        callback_to_router(responseObjectToApiAI(display_text));
    }
    else {
        var railway_api_url = AppConstants.RAILWAY_API_DOMAIN_URL + '/route/train/' + train_number + '/apikey/' + AppConstants.RAILWAY_API_KEY + '/';
        externalAPIClient.getRequest(railway_api_url, function (rawResponse) {
            var response_to_apiAI = prepare_train_schedule_response(rawResponse);
            callback_to_router(response_to_apiAI);
        });
    }
}

function prepare_train_schedule_response(rawResponse) {
    var status = rawResponse.response_code;
    var display_text = '';
    if ( status == 200 || status ==204 ) {
        var train_detail = rawResponse.train;
        var route_detail = rawResponse.route;
        var stations = '';
        route_detail.forEach(function (station) {
            stations += station.fullname + ' (' + station.code + ')\n';
            stations += 'SA-' + station.scharr + ', SD-' + station.schdep + '\n\n';
        })
        display_text = "Train: " + train_detail.number + ", " +  train_detail.name + "\n";
        display_text += getTrainRunningDays(train_detail) + '\n\n' + stations;
    }
    else {
        display_text = processStatus.processRailwayResponseStatus(action, status);
    }
    return responseObjectToApiAI(display_text);
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
    var display_text = '';
    if ( status == 200 || status == 204 ) {
        var position = rawResponse.position;
        display_text = position;
    }
    else {
        display_text = processStatus.processRailwayResponseStatus(action, status);
    }
    return responseObjectToApiAI(display_text);
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
    var trains = rawResponse.trains;
    var display_text = 'No train found for station ' + station_code;
    if ( trains.length >=1 ) {
        display_text = station_code + '\n\n';
        trains.forEach(function (train) {
            display_text += train.number + ', ' + train.name + '\n' +
                'SA-' + train.scharr + ', SD-' + train.schdep + '\n' +
                'LA-' + train.delayarr + ', LD-' + train.delaydep + '\n' +
                'EA-' + train.actarr + ', ED-' + train.actdep + '\n\n';

        });
    }
    return responseObjectToApiAI(display_text);
}


/*Train between stations method*/
function getTrainBetweenStations(data, callback_to_router) {
    var parameters = data.result.parameters;
    var source_code = parameters.SOURCE_STN;
    var dest_code = parameters.DEST_STN;
    var railway_api_url = AppConstants.RAILWAY_API_DOMAIN_URL + '/between/source/' + source_code +
                          '/dest/' + dest_code + '/apikey/' + AppConstants.RAILWAY_API_KEY + '/';
    externalAPIClient.getRequest(railway_api_url, function (rawResponse) {
        var response_to_apiAI = prepare_train_between_stations_response(parameters, rawResponse);
        callback_to_router(response_to_apiAI);
    });
}

function prepare_train_between_stations_response(parameters, rawResponse) {
    var status = rawResponse.response_code;
    var trains = rawResponse.train;
    var display_text = 'No train found between ' + parameters.SOURCE_STN + ' & ' + parameters.DEST_STN + '\n';
    if ( trains.length >=1 ) {
        display_text = 'Trains between ' + parameters.SOURCE_STN + ' & ' + parameters.DEST_STN + '\n\n';
        trains.forEach(function (train) {
            display_text += train.number + ', ' + train.name + '\n' +
                            getTrainRunningDays(train)+ '\n' +
                            train.from.name + '- ' + train.src_departure_time + '\n' +
                            train.to.name + '- ' + train.dest_arrival_time + '\n' +
                            'Travel time- ' + train.travel_time + '\n\n';
        });
    }
    return responseObjectToApiAI(display_text);
}


/* Helper functions*/
function getTrainRunningDays(train) {
    var days = [];
    train.days.forEach(function(day) {
        if ( day.runs == 'Y' )
            days.push(day['day-code']);
    });
    var days_str = days.length == 7 ? "Runs Daily" : days.join();
    return days_str;
}


function responseObjectToApiAI(display_text) {
    var response = {};
    response['speech'] = display_text;
    response['displayText'] = display_text;
    response['data'] = {};
    response['contextOut'] = [];
    response['source'] = "ChatBot";
    return response;
}