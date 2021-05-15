const moment = require('moment');

const getCurrentDateString = () => {
	return moment().format('YYYY-MM-DD HH-mm-ss');
};

module.exports = getCurrentDateString;