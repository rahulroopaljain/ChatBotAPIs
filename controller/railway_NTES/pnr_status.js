const logger = require('winston');
const AppConstants = require('../app_constants');
const externalAPIClient = require('../../NTESUtils/call_NTES_api');
const helper = require('./helper_methods');
const cheerio = require('cheerio');


module.exports.processRequest = function(data, callback_to_router) {
    var parameters = data.result.parameters;

    logger.info('parameters: ' + JSON.stringify(parameters));
    var pnr_number = parameters.PNR_NM;
    if ( pnr_number.length != 10 || isNaN(pnr_number)) {
        var display_text = "Invalid PNR number.Please enter valid 10 digit PNR.";
        logger.info(display_text);
        callback_to_router(helper.responseObjectToApiAI(display_text));
    }
    else {
        var response_to_apiAI = '';
        var tktUrl = 'https://www.confirmtkt.com/pnr-status/' + pnr_number;
        externalAPIClient.getRequest(tktUrl, function (rawResponse, err) {
            if (err) {
                response_to_apiAI = helper.responseObjectToApiAI(AppConstants.RAILWAY_SERVER_ERROR_MESSAGE);
            }
            else {
                response_to_apiAI = prepareResponse(rawResponse);
            }
            callback_to_router(response_to_apiAI);
        });
    }
}

function prepareResponse(rawResponse) {
    var $ = cheerio.load(rawResponse);
    var scripts = $('body script');
    var data = '';
    var display_text = '';
    for ( var i=0; i<scripts.length; i++) {
        var text = $($(scripts)[i]).html().trim();
        data = fetchVarValue(text, "var data =");
        if (data != '') {
           break;
        }
    }
    data = JSON.parse(data);
    if (!(data.Error)) {
        display_text = 'PNR:' + data.Pnr + '\n';
        display_text += 'TrainNo:' + data.TrainNo + ', ' + data.From + ' To ' + data.To + '\n';
        display_text += 'Train:' + data.TrainName + '\n';
        display_text += 'DOJ:' + data.Doj + ', ' + data.Class + '\n\n';
        var passengers = data.PassengerStatus;
        for (var i=0; i<passengers.length; i++) {
            display_text += 'Passenger ' + (i+1) + ':\n';
            display_text += 'BookingStatus - ' + passengers[i].BookingStatus + '\n';
            display_text += 'CurrentStatus - ' + passengers[i].CurrentStatus + '\n';
            if (passengers[i].Prediction)
                display_text += 'Prediction - ' + passengers[i].Prediction + '\n';
            display_text += '\n';
        }
        display_text += 'Chart Prepared: ' + (data.ChartPrepared ? 'Yes' : 'No') + '\n';
    }
    else {
        display_text = data.Error;
    }
    return helper.responseObjectToApiAI(display_text);
}

function fetchVarValue(target, variable) {
    if (target.search(variable) >= 0) {
        var chopFront = target.substring(target.search(variable)+variable.length,target.length);
        var result = chopFront.substring(0,chopFront.search(" ;"));
        return result.trim();
    }
    return '';
}
