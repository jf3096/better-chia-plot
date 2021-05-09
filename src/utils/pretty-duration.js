const prettyMs = require('pretty-ms');

/**
 * 输出持续时间
 */
const prettyDuration = (ms) => {
	return prettyMs(ms);
};

module.exports = prettyDuration;