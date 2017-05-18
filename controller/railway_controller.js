const AppConstants = require('./AppConstants');
const externalAPIClient = require('./call_external_api');

module.exports.processRequest = function (data, callback_to_router) {
    var action = data.result.action;
    if ( action == AppConstants.PNR_ACTION ) {
        checkPNRStatus(data, callback_to_router);
    }
    else if ( action == AppConstants.TRAIN_SCHEDULE ) {
        getTrainSchedule(data, callback_to_router);
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
    var train_detail = rawResponse.train;
    var route_detail = rawResponse.route;
    var days = [];
    var stations = '';
    train_detail.days.forEach(function(day) {
        if ( day.runs == 'Y' ) {
            days.push(day['day-code']);
        }
    });
    var days_str = days.length == 7 ? "Runs Daily" : days.join();
    route_detail.forEach(function (station) {
        stations += station.fullname + ' (' + station.code + ')\n';
        stations += 'SA-' + station.scharr + ', SD-' + station.schdep + '\n\n';
    })
    var display_text = "Train: " + train_detail.number + ", " +  train_detail.name + "\n";
    display_text += days_str + '\n\n';
    display_text += stations;
    var response = {};
    response['speech'] = "";
    response['displayText'] = display_text;
    response['data'] = {};
    response['contextOut'] = [];
    response['source'] = "ChatBot";
    return response;
}