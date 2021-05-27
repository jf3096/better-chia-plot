const cp = require('child_process');
const fs = require('fs');
const moveLogsWipToFinished = require('../utils/move-logs-wip-to-finished');
const prettyDuration = require('../utils/pretty-duration');
const getCurrentDateString = require('../utils/get-current-date-string');
const path = require('path');
const formatStartCmdTplAndOverwrite = require('../utils/format-start-cmd-tpl-and-overwrite');

class Plotter {
	/**
	 * 序号
	 */
	index;
	/**
	 * 阶段耗时
	 * @type {number[]}
	 */
	phraseTimeConsumeList;
	/**
	 * 开始时间
	 * @type {number}
	 */
	starTime;
	/**
	 * 子进程
	 */
	childProcess;
	/**
	 * 日志流
	 */
	logStream;
	/**
	 * 日志文件名
	 */
	logFilename;

	/**
	 * 待实现,先占位: 进度
	 */
	progress;

	constructor({ index }) {
		this.index = index;
		this.phraseTimeConsumeList = [];
		this.starTime = Date.now();
		this.progress = 0;
	}

	/**
	 * 种地开始
	 */
	async start() {
		const startBatPathname = path.resolve(__dirname, '../bat/start.bat');
		this.logFilename = `chia-${getCurrentDateString()}.txt`;
		const dest = path.resolve(__dirname, '../../logs/wip', this.logFilename);
		this.logStream = fs.createWriteStream(dest, { flags: 'a', encoding: 'utf8' });
		this.config = await formatStartCmdTplAndOverwrite()
		this.childProcess = cp.spawn(startBatPathname);
		this.onLogStreamUpdate();
		this.onChildProcessUpdate();
		this.onFinish();
	}

	/**
	 * 当子进程更新
	 */
	onChildProcessUpdate() {
		this.childProcess.stdout.on('data', async (data) => {
			data = data.toString();
			this.progress++;
			if (data.startsWith('Starting phase 1/4')) {
				this.phraseTimeConsumeList.push(Date.now());
			} else if (data.startsWith('Starting phase 1/4')) {
				this.phraseTimeConsumeList.push(Date.now());
			} else if (data.startsWith('Starting phase 2/4')) {
				this.phraseTimeConsumeList.push(Date.now());
			} else if (data.startsWith('Starting phase 3/4')) {
				this.phraseTimeConsumeList.push(Date.now());
			} else if (data.startsWith('Starting phase 4/4')) {
				this.phraseTimeConsumeList.push(Date.now());
			}
		});
	}

	/**
	 * 当日志流更新
	 */
	onLogStreamUpdate() {
		this.childProcess.stdout.on('data', async (data) => {
			data = data.toString();
			this.logStream.write(data);
		});
	}

	/**
	 * 当完成时
	 */
	onFinish() {
		this.childProcess.on('close', async (code) => {
			const isProcessSuccess = code === 1;
			if (isProcessSuccess) {
				this.phraseTimeConsumeList.push(Date.now());
				const newFilename = this.createNewFilenameWhenFinish();
				// noinspection ES6MissingAwait
				moveLogsWipToFinished(this.logFilename, newFilename);
			}
			this.onEnd();
		});
	}

	onEnd = () => {
	};

	/**
	 * 当完成时创建新的文件名
	 * @returns {string}
	 */
	createNewFilenameWhenFinish() {
		const splits = this.logFilename.split('.txt');
		const duration = prettyDuration(+new Date() - this.starTime);
		const endTime = getCurrentDateString();
		return `${splits[0]}~${endTime}~${duration}.txt`;
	}
}

module.exports = Plotter;