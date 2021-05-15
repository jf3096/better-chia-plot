const spawn = require('child_process').spawn;
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const getConfig = require('./config');
const formatStartCmdTplAndOverwrite = require('./utils/format-start-cmd-tpl-and-overwrite');
const getCurrentDateString = require('./utils/get-current-date-string');
const moveLogsWipToFinished = require('./utils/move-logs-wip-to-finished');
const prettyDuration = require('./utils/pretty-duration');

let currentWorker = 0;

let isFirstQueueReachSpecificStage = false;
let isInit = true;

let underNewPlotIndicatorCounter = 0;

const createNewPlot = async () => {
	const config = await getConfig();
	if (config.stopWhenFinishAll) {
		console.log('stopWhenFinishAll = true, 将完成当前所以种地后终止');
		return;
	}
	if (isInit || (isFirstQueueReachSpecificStage && currentWorker < config.maxConcurrentFarmer)) {
		isInit = false;
		currentWorker++;
		underNewPlotIndicatorCounter++;
		console.log('============================== createNewPlot =================================');
		isFirstQueueReachSpecificStage = false;
		// noinspection ES6MissingAwait
		createNewPlotImpl();
	}
};

const createNewPlotImpl = async () => {
	const startBatPathname = path.resolve(__dirname, 'bat/start.bat');
	const chiaCli = spawn(startBatPathname);
	const filename = `chia-${getCurrentDateString()}.txt`;
	const dest = path.resolve(__dirname, '../logs/wip', filename);
	const logStream = fs.createWriteStream(dest, { flags: 'a', encoding: 'utf8' });
	const starTime = +new Date();
	const config = await getConfig();
	chiaCli.stdout.on('data', async (data) => {
		data = data.toString();

		if (data.indexOf(config.createNewPlotIndicator) > -1) {
			underNewPlotIndicatorCounter--;
			isFirstQueueReachSpecificStage = true;
			console.log(`${data}`);
			logStream.write(data);
			// noinspection ES6MissingAwait
			createNewPlot();
			return;
		}
		if (data.trim() === '===complete===') {
			currentWorker--;
			// noinspection JSUnresolvedFunction,ES6MissingAwait
			const splits = filename.split('.txt');
			const duration = prettyDuration(+new Date() - starTime);
			const newFilename = `${splits[0]} ~ ${duration} ~ ${getCurrentDateString()}.txt`;
			// noinspection ES6MissingAwait
			moveLogsWipToFinished(filename, newFilename);
			console.log(`${data}`);
			logStream.write(data);
			const durationString = `花费时间: ${duration}`;
			console.log('==================================== 分割线 ====================================');
			console.log(durationString);
			logStream.write(durationString);
			if (underNewPlotIndicatorCounter === 0) {
				// noinspection ES6MissingAwait
				createNewPlot();
			}
			return;
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
	const bakEntry = path.resolve(__dirname, '../bak/entry.html');

	await formatStartCmdTplAndOverwrite();
	// await fs.removeSync(config.tempFolder);
	// await fs.removeSync(wipPathname);
	mkdirp.sync(wipPathname);
	mkdirp.sync(finishedPathname);
	mkdirp.sync(config.tempFolder);
	fs.copySync(bakEntry, path.resolve(wipPathname, 'entry.html'));

	await createNewPlot();
})();
