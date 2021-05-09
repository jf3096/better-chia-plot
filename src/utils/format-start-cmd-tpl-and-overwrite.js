const getConfig = require('../config');
const formatTpl = require('./format-tpl');
const fs = require('fs-extra');
const path = require('path');

const startBatTplPathname = path.resolve(__dirname, '../bat/start.bat.tpl');
const startBatPathname = path.resolve(__dirname, '../bat/start.bat');

const getStartCmdTpl = async () => {
	return (await fs.readFile(startBatTplPathname)).toString();
};

const formatStartCmdTplAndOverwrite = async () => {
	const [config, startCmdTpl] = await Promise.all([
		getConfig(),
		getStartCmdTpl(),
	]);
	const tpl = formatTpl(startCmdTpl, config);
	console.log('当前 start.bat 为: \n\n' + tpl + '\n\n');
	await fs.writeFile(startBatPathname, tpl);
};

(async () => {
	console.log(await formatStartCmdTplAndOverwrite());
})();

module.exports = formatStartCmdTplAndOverwrite;