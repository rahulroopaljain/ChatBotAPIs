const winston = require('winston');
const fs = require('fs');
const moment = require('moment');
const uuid = require('uuid/v1');

var today = moment().format('YYYY-MM-DD');
var log_file_name = 'logs/railindigo-' + today + '.log';

if (!fs.existsSync(log_file_name)) {
    fs.closeSync(fs.openSync(log_file_name, 'w'));
}


function customFileFormatter(options) {
    return options.timestamp() + ' [' + options.level.toUpperCase() + '] ' + uuid() + ' ' + (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : '');
}

winston.remove(winston.transports.Console);
winston.add(winston.transports.File,
    {
        timestamp: function () {
            return moment().format();
        },
        json: false,
        filename: log_file_name,
        formatter: customFileFormatter
    }
);

module.exports = function (req, res, next) {
    next()
};