let log4js = require('log4js');
let config = require('../../package.json');
let env = require('./env')
let path = require('path')
let fs = require('fs');
let LogFilePath = path.join(env.appHome, 'logs', 'devlog.log')

// logger.setLevels({debug: 0, info: 1, silly: 2, warn: 3, error: 4,});
// logger.addColors({debug: 'green', info: 'cyan', silly: 'magenta', warn: 'yellow', error: 'red'});
//logger.remove(logger.transports.Console);
//logger.add(logger.transports.Console, {level: 'debug', colorize: true});

var debuglevel = 0
if(config.BuildCode == 1)
    debuglevel = 'all'
else
    debuglevel = 'ERROR'

log4js.configure({
    appenders:{
        std: { type: "stdout", layout:{ type: "colored", } },
        file: { type: "file", filename: LogFilePath, encoding: "utf-8" },
        console: { type: "console", layout:{ type: "colored", } }
    },
    categories: {
        default: {appenders: ["std", "file","console"], level: debuglevel},
        custom: {appenders: ["std", "file"], level: debuglevel}
    }
});
syslogger = log4js.getLogger('default');
syslogger.info("Start log")
syslogger.info('Debug level: '+debuglevel)

exports.error = function(file, functionName, dsc) {
    file = file+"("+functionName+")";
    if(typeof dsc == 'object')
        dsc = JSON.stringify(dsc);
    let logger = log4js.getLogger(file);
    logger.error(dsc);
}

exports.info = function(file, functionName, dsc) {
    file = file+"("+functionName+")";
    if(typeof dsc == 'object')
        dsc = JSON.stringify(dsc);
    let logger = log4js.getLogger(file);
    logger.info(dsc)
}

exports.debug = function(file, functionName, dsc) {
    file = file+"("+functionName+")";
    if(typeof dsc == 'object')
        dsc = JSON.stringify(dsc);
    let logger = log4js.getLogger(file);
    logger.debug(dsc);
}

exports.warn = function(file, functionName, dsc) {
    file = file+"("+functionName+")";
    if(typeof dsc == 'object')
        dsc = JSON.stringify(dsc);
    let logger = log4js.getLogger(file);
    logger.warn(dsc);
}

exports.trace = function(file, functionName, dsc) {
    file = file+"("+functionName+")";
    if(typeof dsc == 'object')
        dsc = JSON.stringify(dsc);
    let logger = log4js.getLogger(file);
    logger.trace(dsc);
}

exports.fatal = function(file, functionName, dsc) {
    file = file+"("+functionName+")";
    if(typeof dsc == 'object')
        dsc = JSON.stringify(dsc);
    let logger = log4js.getLogger(file);
    logger.fatal(dsc);
}

exports.mark = function(file, functionName, dsc) {
    file = file+"("+functionName+")";
    if(typeof dsc == 'object')
        dsc = JSON.stringify(dsc);
    let logger = log4js.getLogger(file);
    logger.mark(dsc);
}