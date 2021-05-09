const pretty = require('pretty-time');

/**
 * 输出持续时间
 */
const printDuration = (hrtime, digits = 's') => {
	return pretty(process.hrtime(start), digits);
};

var start = process.hrtime();

setTimeout(() => {
	console.log(printDuration(start));
}, 70000);

module.exports = printDuration;