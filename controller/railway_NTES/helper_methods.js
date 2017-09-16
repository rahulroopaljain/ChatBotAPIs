const AppConstants = require('../app_constants');
const fs = require('fs');

module.exports.responseObjectToApiAI = function(display_text, data) {
    var response = {};
    response['speech'] = display_text;
    response['displayText'] = '';
    response['data'] = data;
    response['contextOut'] = [];
    response['source'] = "ChatBot";
    return response;
}


module.exports.getNTESRequestObject = function() {
    return {
        hostname: AppConstants.INDIAN_RAIL_HOST,
        headers: {
            'connection': 'keep-alive'
        }
    };
}


module.exports.fetchNTESParams = function() {
    console.log('Reading cookies from file');
    return JSON.parse(fs.readFileSync('./NTESUtils/NTESData.json'));
}


module.exports.getTrainRunningDays = function(train) {
    var days = [];
    train.days.forEach(function(day) {
        if ( day.runs == 'Y' )
            days.push(day['day-code']);
    });
    var days_str = days.length == 7 ? "Runs Daily" : days.join();
    return days_str;
}


module.exports.getDaysOfRunString = function(s){
    if(s==="1111111"){
        return "Runs daily";
    }
    var ret="";
    var d=s.substring(0,1);
    if(d==="1"){
        ret+= "SUN,";
    }
    d=s.substring(1,2);
    if(d==="1"){
        ret+= "MON,";
    }
    d=s.substring(2,3);
    if(d==="1"){
        ret+= "TUE,";
    }
    d=s.substring(3,4);
    if(d==="1"){
        ret+= "WED,";
    }
    d=s.substring(4,5);
    if(d==="1"){
        ret+= "THU,";
    }
    d=s.substring(5,6);
    if(d==="1"){
        ret+= "FRI,";
    }
    d=s.substring(6,7);
    if(d==="1"){
        ret+= "SAT,";
    }
    if(ret.length>1){
        ret=ret.substring(0,ret.length - 1);
    }
    return ret;
}


var _ALL_STN_NAMES_NOT_SET = true;
var _ALL_STNS_ARR = {};
var _ALL_STNS_ARR_STR = '';
function _initStnCodesNames() {
    if(_ALL_STN_NAMES_NOT_SET){
        console.log("get station name init method calling check");
        _ALL_STN_NAMES_NOT_SET=false;
        _ALL_STNS_ARR_STR = JSON.parse(fs.readFileSync('./controller/railway_NTES/station_names.json'));
        var arr=_ALL_STNS_ARR_STR.stations.split(",");
        for(var i=0; i<arr.length; i+=5) {
            _ALL_STNS_ARR[arr[i]]=[arr[i],arr[i+1],arr[i+2].length===0?arr[i+1]:arr[i+2],arr[i+3],arr[i+4]];
        }
        _ALL_STNS_ARR_STR = null;
    }
}

module.exports.getStnName = function(stnCode) {
    _initStnCodesNames();
    var stn = _ALL_STNS_ARR[stnCode];
    if(stn) {
        return stn[1];
    }
    return "";
}

