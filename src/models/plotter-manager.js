const moment = require('moment');
const getConfig = require('../config');
const Plotter = require('./plotter');
const printChiaTable = require('../utils/print-chia-table');
const calTimeElapse = require('../utils/cal-time-elapse');
const prettyDuration = require('../utils/pretty-duration');
const getDiskSpace = require('../utils/get-disk-space');
// noinspection SpellCheckingInspection
const prettysize = require('prettysize');

class PlotterManager {
	/**
	 * 当前最大同时种地数, 这个设定是为了防止缓存盘空间溢出的问题
	 */
	maxConcurrentFarmer;
	/**
	 * 队列
	 * @param {Plotter[]}
	 */
	queue;
	/**
	 * 计数器
	 */
	index;

	constructor({ maxConcurrentFarmer }) {
		this.maxConcurrentFarmer = maxConcurrentFarmer;
		this.queue = [];
		this.index = 0;
	}

	async start() {
		await this.createNewPlot();
		await this.print();
	}

	async createNewPlot() {
		if (!this.isReachMaxConcurrency()) {
			const config = await getConfig();
			this.maxConcurrentFarmer = config.maxConcurrentFarmer;
			if (config.stopWhenFinishAll) {
				console.log('stopWhenFinishAll = true, 将完成当前所以种地后终止');
				return;
			}
			const plotter = new Plotter({ index: this.index++ });
			await plotter.start();
			plotter.childProcess.stdout.on('data', (data) => {
				data = data.toString();

				const createNewPlotIndicator = plotter.config.createNewPlotIndicator;

				const hasSome = createNewPlotIndicator.some((indicator) => {
					return data.indexOf(indicator) > -1;
				});

				if (hasSome) {
					this.createNewPlot();
				}
			});
			this.enqueue(plotter);
		}
	}

	/**
	 * 达到最大并发数
	 */
	isReachMaxConcurrency() {
		return this.queue.length >= this.maxConcurrentFarmer;
	}

	/**
	 * 入队
	 * @param {Plotter} plotter
	 */
	enqueue(plotter) {
		this.queue.push(plotter);
		plotter.onEnd = () => {
			this.queue.dequeue(plotter);
		};
	}

	/**
	 * 出队
	 * @param {Plotter} plotter
	 */
	dequeue(plotter) {
		const index = this.queue.indexOf(plotter);
		if (index > -1) {
			this.queue.splice(index, 1);
		}
	}

	/**
	 * @param {Plotter} plotter
	 */
	timeSpentString(plotter) {
		const result = [];
		const phraseTimeConsumeList = plotter.phraseTimeConsumeList;
		for (let i = 1; i < phraseTimeConsumeList.length; i++) {
			const diff = phraseTimeConsumeList[i] - phraseTimeConsumeList[i - 1];
			result.push(calTimeElapse(diff));
		}
		return result.join(' ');
	}

	/**
	 * 输出种地信息
	 */
	print() {
		return printChiaTable(
			this.queue.map(
				/**
				 * @param {Plotter} plotter
				 */
				(plotter) => {
					return [
						plotter.index,
						plotter.childProcess.pid,
						plotter.config.kSize,
						moment(plotter.starTime).format('MM/DD HH:mm:ss'),
						prettyDuration(Date.now() - plotter.starTime),
						plotter.phraseTimeConsumeList.length,
						this.timeSpentString(plotter),
						plotter.progress,
						prettysize(getDiskSpace(plotter.config.tempFolder)),
						prettysize(getDiskSpace(plotter.config.destFolder)),
					];
				}),
		);
	}
}

module.exports = PlotterManager;