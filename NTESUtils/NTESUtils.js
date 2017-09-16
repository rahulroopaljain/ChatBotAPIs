/**
 * Created by roopjain on 6/13/17.
 */
const externalAPIClient = require('./call_NTES_api');
const cheerio = require('cheerio');
const fs = require('fs');

var ntesURL = 'https://enquiry.indianrail.gov.in/ntes/';
var timer = '';
var timer1 = '';
function startNTESHelper() {
    console.log('================================================================');
    console.log(new Date() + ' - Hitting NTES main domain');
    clearInterval(timer);
    externalAPIClient.getRequest(ntesURL, function (rawResponse, cookie) {
        parseHtml(rawResponse, cookie);
    });
}
startNTESHelper();

function setNTESHelper() {
    console.log(new Date() + ' - setting main domain call in every 4 hrs');
    timer1 = setInterval(function () {
        startNTESHelper();
    }, 1000 * 60 * 60 * 4);
}

function parseHtml(rawResponse, cookie) {
    var $ = cheerio.load(rawResponse);
    var scripts = $('body script');
    var ntesParams = {};
    for ( var i=0; i<scripts.length; i++) {
        str = $($(scripts)[i]).html().trim().replace(/\s/g,'');
        if (!str.match("function") && str.length < 30 && str.split('="').length == 2) {
            var key = str.split('="')[1];
            key = key.substring(0, key.length-2);
            var value = $('[name="' + key + '"]').val();
            if (value)
                break;
        }
    }
    if (key != undefined && value != undefined && cookie != undefined) {
        ntesParams['urlParam'] = key + '=' + value;
        ntesParams['cookie'] = cookie;
        console.log(new Date() + ' - fetched parameters:' + JSON.stringify(ntesParams));
        writeToFile(ntesParams);
        setNTESHelper();
        setIamAlive(ntesParams);
    }
    else {
        console.log(new Date() + ' - Params are not valid, key:' + key + ' value:' + value + ' cookie:' + cookie );
        clearInterval(timer1);
        startNTESHelper();
    }
}

function writeToFile(ntesParams) {
    fs.writeFileSync("./NTESData.json", JSON.stringify(ntesParams));
    console.log(new Date() + ' - wrote NTES params in file');
}

function setIamAlive(ntesParams) {
    console.log(new Date() + ' - setting iAmAlive for every 5 mins');
    timer = setInterval(function () {
        var options = {
            hostname: 'enquiry.indianrail.gov.in',
            path: '/ntes/IamAlive?' + ntesParams.urlParam,
            headers: {
                'cookie': ntesParams.cookie,
                'connection': 'keep-alive'
            }
        };
        externalAPIClient.getRequest(options, function (rawResponse, cookie) {
            console.log(new Date() + ' - I am alive response - ' + rawResponse);
        });
    }, 1000 * 60 * 5);
}
