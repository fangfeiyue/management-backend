const log4js = require('log4js');

const levels = {
	trace: log4js.levels.TRACE,
	debug: log4js.levels.DEBUG,
	info: log4js.levels.INFO,
	error: log4js.levels.ERROR,
	warn: log4js.levels.WARN,
	fatal: log4js.levels.FATAL
};

log4js.configure({
	appenders: {
		console: { type: 'console' },
		info: {
			type: 'file',
			filename: 'log/all-logs.log'
		},
		error: {
			type: 'dateFile',
			filename: 'log/log',
			pattern: 'yyyy-MM-dd.log',
			alwaysIncludePattern: true
		}
	},
	categories: {
		default: { appenders: [ 'console' ], level: 'debug' },
		info: {
			appenders: [ 'info', 'console' ],
			level: 'info'
		},
		error: { appenders: [ 'error', 'console' ], level: 'error' }
	}
});

exports.debug = (content) => {
	const logger = log4js.getLogger();
	logger.level = levels.debug;
	logger.debug(content);
};

exports.info = (content) => {
	const logger = log4js.getLogger('info');
	logger.level = levels.info;
	logger.info(content);
};

exports.error = (content) => {
	const logger = log4js.getLogger('error');
	logger.level = levels.error;
	logger.error(content);
};
