const JSON5 = require('json5');
const path = require('path');
const fs = require('fs-extra');

/**
 * 路径辅助方法
 * @param pathname
 * @returns {string}
 */
const resolve = (pathname) => path.resolve(__dirname, pathname);

/**
 * string: 最后一次正确的 config 配置
 */
let lastCorrectConfigString;

/**
 * 打印默认的错误信息
 */
const printDefaultErrorMessage = () => {
	console.error('最新配置失效, 将采取最后一次正确配置: \n' + lastCorrectConfigString);
};

/**
 * 获取相关配置
 */
const getConfig = async () => {
	try {
		const json5String = (await fs.readFile(resolve('../../config.json5'))).toString();
		const options = JSON5.parse(json5String);

		options.maxConcurrentFarmer = Math.round(options.maxConcurrentFarmer);

		if (typeof options.stopWhenFinishAll !== 'boolean') {
			// noinspection ExceptionCaughtLocallyJS
			throw new Error(`[stopWhenFinishAll: 当完成所有后停止] 非法值 = ${options.stopWhenFinishAll}`);
		}

		if (!(options.maxConcurrentFarmer > 0 && options.maxConcurrentFarmer <= 100)) {
			// noinspection ExceptionCaughtLocallyJS
			throw new Error(`[maxConcurrentFarmer: 最多并发种地数] 非法值 = ${options.maxConcurrentFarmer}. 要求 0 < maxConcurrentFarmer <=100`);
		}

		if (!(options.thread >= 2 && options.thread <= 50)) {
			// noinspection ExceptionCaughtLocallyJS
			throw new Error(`[thread: 线程数] 非法值 = ${options.thread}. 要求 2 < thread <=50`);
		}

		if ([32, 33, 34, 35].indexOf(options.kSize) === -1) {
			// noinspection ExceptionCaughtLocallyJS
			throw new Error(`[kSize: chia k size for (plot)] 非法值 = ${options.maxConcurrentFarmer}. 有效值取其中一个 [32, 33, 34, 35]`);
		}

		if ([64, 128, 256].indexOf(options.buckets) === -1) {
			// noinspection ExceptionCaughtLocallyJS
			throw new Error(`[buckets: 桶的个数] 非法值 = ${options.buckets}. 有效值取其中一个 [64, 128, 256]`);
		}

		await Promise.all([fs.access(options.tempFolder), fs.access(options.destFolder)]);

		lastCorrectConfigString = json5String;

		return {
			/**
			 * 当全部完成后將停止, 这样做的好处是如果你想停下来了 (如升级软件或者关机等) 那就没必要接着
			 * 开垦下一块地了
			 */
			stopWhenFinishAll: options.stopWhenFinishAll,
			/**
			 * 当前最大同时种地数, 这个设定是为了防止缓存盘空间溢出的问题
			 */
			maxConcurrentFarmer: options.maxConcurrentFarmer,
			/**
			 * 最大线程数
			 */
			thread: options.thread,
			/**
			 * chia k size for (plot)
			 */
			kSize: options.kSize,
			/**
			 * 桶的个数
			 */
			buckets: options.buckets,
			/**
			 * 内存缓冲数
			 */
			memoryBuffer: options.memoryBuffer,
			/**
			 * p 盘临时文件夹
			 */
			tempFolder: options.tempFolder,
			/**
			 * 完成后将地块放置的文件夹位置
			 */
			destFolder: options.destFolder,
			/**
			 * 当日志出现下面的如 "Computing table 6" 时创建新的 plot
			 */
			createNewPlotIndicator: options.createNewPlotIndicator
		};
	} catch (error) {
		const errorMessage = error.message;
		console.error(errorMessage);
		printDefaultErrorMessage();

		if (!lastCorrectConfigString) {
			throw new Error('config.json5 配置异常, 请修正后重试');
		}

		const options = JSON5.parse(lastCorrectConfigString);

		return {
			/**
			 * 当全部完成后將停止, 这样做的好处是如果你想停下来了 (如升级软件或者关机等) 那就没必要接着
			 * 开垦下一块地了
			 */
			stopWhenFinishAll: options.stopWhenFinishAll,
			/**
			 * 当前最大同时种地数, 这个设定是为了防止缓存盘空间溢出的问题
			 */
			maxConcurrentFarmer: options.maxConcurrentFarmer,
			/**
			 * 最大线程数
			 */
			thread: options.thread,
			/**
			 * chia k size for (plot)
			 */
			kSize: options.kSize,
			/**
			 * 桶的个数
			 */
			buckets: options.buckets,
			/**
			 * 内存缓冲数
			 */
			memoryBuffer: options.memoryBuffer,
			/**
			 * p 盘临时文件夹
			 */
			tempFolder: options.tempFolder,
			/**
			 * 完成后将地块放置的文件夹位置
			 */
			destFolder: options.destFolder,
			/**
			 * 当日志出现下面的如 "Computing table 6" 时创建新的 plot
			 */
			createNewPlotIndicator: options.createNewPlotIndicator
		};
	}
};

module.exports = getConfig;