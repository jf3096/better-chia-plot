const spawn = require('child_process').spawn;
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const getConfig = require('./config');
const formatStartCmdTplAndOverwrite = require('./utils/format-start-cmd-tpl-and-overwrite');
const getCurrentDateString = require('./utils/get-current-date-string');

let currentWorker = 0;

const createNewPlot = async () => {
	const config = await getConfig();
	if (config.stopWhenFinishAll) {
		console.log('stopWhenFinishAll = true, 将完成当前所以种地后终止');
		return;
	}
	if (currentWorker < config.maxConcurrentFarmer) {
		currentWorker++;
		console.log('============================== createNewPlot =================================');
		createNewPlotImpl();
	}
};

const createNewPlotImpl = () => {
	const startBatPathname = path.resolve(__dirname, 'bat/start.bat');
	const chiaCli = spawn(startBatPathname);
	const filename = `chia-${getCurrentDateString()}.txt`;
	const dest = path.resolve(__dirname, '../logs/wip', filename);
	const logStream = fs.createWriteStream(dest, { flags: 'a', encoding: 'utf8' });
	chiaCli.stdout.on('data', async (data) => {
		if (data.indexOf('Computing table 7') > -1) {
			await createNewPlot();
		}
		if (data.indexOf('===complete===') > -1) {
			currentWorker--;
			// noinspection JSUnresolvedFunction
			moveLogsWipToFinished(filename);
			await createNewPlot();
		}
		console.log(`${data}`);
		logStream.write(data);
	});

	chiaCli.stderr.on('data', function(data) {
		console.log('stderr: ' + data);
	});

	chiaCli.on('close', function(code) {
		console.log('子进程已退出，退出码 ' + code);
	});
};

(async () => {
	const config = await getConfig();

	const wipPathname = path.resolve(__dirname, '../logs/wip');
	const finishedPathname = path.resolve(__dirname, '../logs/finished');

	await formatStartCmdTplAndOverwrite();
	await fs.removeSync(config.tempFolder);
	await fs.removeSync(wipPathname);
	mkdirp.sync(wipPathname);
	mkdirp.sync(finishedPathname);
	mkdirp.sync(config.tempFolder);

	await createNewPlot();
})();
