const winston = require('winston');

const logger = winston.createLogger({
    //exitOnError: false,
    level: 'info',
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    levels: winston.config.syslog.levels,
    defaultMeta: {service: 'user-service'},
    transports: [
        new winston.transports.File({filename: 'error.log', level: 'error', handleExceptions:true}),
        new winston.transports.File({filename: 'combined.log'})
    ]
});

module.exports = logger;