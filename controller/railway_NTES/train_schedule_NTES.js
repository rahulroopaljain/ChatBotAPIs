const logger = require('winston');
const AppConstants = require('../app_constants');
const externalAPIClient = require('../../NTESUtils/call_NTES_api');
const helper = require('./helper_methods');



module.exports.processRequest = function(data, callback_to_router) {
    var parameters = data.result.parameters;
    var ntesParams = helper.fetchNTESParams();

    logger.info('parameters: ' + JSON.stringify(parameters));

    var train_number = parameters.TRAIN_NBR;

    if ( train_number.length != 5 || isNaN(train_number)) {
        var display_text = "Invalid train no.: " + train_number + "\nTrain no. should be 5 digit numeric value.";
        callback_to_router(helper.responseObjectToApiAI(display_text));
    }
    else {
        var ntes_request_object = helper.getNTESRequestObject();
        ntes_request_object['path'] = '/ntes/SearchFutureTrain?trainNo=' + train_number + '&' + ntesParams.urlParam;
        ntes_request_object.headers['cookie'] = ntesParams.cookie;
        externalAPIClient.getRequest(ntes_request_object, function (rawResponse, err) {
            var response_to_apiAI = '';
            if (err) {
                console.log('err' + err)
                response_to_apiAI = helper.responseObjectToApiAI(AppConstants.RAILWAY_SERVER_ERROR_MESSAGE);
                callback_to_router(response_to_apiAI);
            }
            else {
                var search_train_response = eval(rawResponse);
                if (search_train_response != undefined && search_train_response.success) {
                    ntes_request_object['path'] = '/ntes/FutureTrain?action=getTrainData&trainNo=' + train_number + '&validOnDate=&' + ntesParams.urlParam;
                    externalAPIClient.getRequest(ntes_request_object, function (rawResponse, err) {
                        if (err) {
                            response_to_apiAI = helper.responseObjectToApiAI(AppConstants.RAILWAY_SERVER_ERROR_MESSAGE);
                        }
                        else {
                            response_to_apiAI = prepareResponse(rawResponse);
                            callback_to_router(response_to_apiAI);
                        }
                    });
                }
                else {
                    response_to_apiAI = helper.responseObjectToApiAI('Train ' + train_number + ' not found, please provide correct train no.');
                    callback_to_router(response_to_apiAI);
                }
            }
        });
    }
}

function prepareResponse(rawResponse) {
    var resData = eval(rawResponse)[0];
    var train = resData.trainNo;
    var train_name = resData.trainName;
    var stations ='';
    var display_text = 'Train: ' + train + ', ' +  train_name + '\n';
    display_text += helper.getDaysOfRunString(resData.runsOn) + '\n\n';
    resData.trainSchedule.stations.forEach(function (station) {
            stations += helper.getStnName(station.stnCode) + ' (' + station.stnCode + ')\n';
            if (station.stnCode == resData.from)
                stations += 'SA-XX:XX' + ', SD-' + station.depTime + '\n\n';
            else if (station.stnCode == resData.to)
                stations += 'SA-' + station.arrTime + ', SD-XX:XX' + '\n\n';
            else
                stations += 'SA-' + station.arrTime + ', SD-' + station.depTime + '\n\n';
    })
    display_text += stations;
    return helper.responseObjectToApiAI(display_text);
}
