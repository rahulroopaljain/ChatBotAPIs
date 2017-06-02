const winston = require('winston');
const moment = require('moment');
require('winston-daily-rotate-file');

var request_uuid;

module.exports.setRequestUniqueID = function (uuid) {
    request_uuid = uuid;
}


function customFileFormatter(options) {
    return options.timestamp() + ' [' + options.level.toUpperCase() + '] ' + request_uuid + ' ' + (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '');
}

winston.remove(winston.transports.Console);

winston.add(winston.transports.DailyRotateFile,{
    timestamp: function () {
        return moment().format();
    },
    filename: './logs/-chatbot.log',
    datePattern: 'yyyy-MM-dd',
    prepend: true,
    json: false,
    localTime: true,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    formatter: customFileFormatter
});