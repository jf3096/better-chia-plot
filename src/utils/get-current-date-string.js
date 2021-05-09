const moment = require('moment');

const getCurrentDateString = () => {
	return moment().format('YYYY-MM-DD hh-mm-ss');
};

module.exports = getCurrentDateString;