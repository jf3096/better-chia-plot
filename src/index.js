const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const getConfig = require('./config');
const formatStartCmdTplAndOverwrite = require('./utils/format-start-cmd-tpl-and-overwrite');
const spawnHttpServer = require('./process/spawn-http-server');
const PlotterManager = require('./models/plotter-manager');

(async () => {
	const config = await getConfig();

	/**
	 * 获取 wip 文件路径
	 * @type {string}
	 */
	const wipPathname = path.resolve(__dirname, '../logs/wip');
	/**
	 * 获取完成的路径
	 * @type {string}
	 */
	const finishedPathname = path.resolve(__dirname, '../logs/finished');
	/**
	 * 获取备份文件 entry.html 路径
	 * @type {string}
	 */
	const entryHtml = path.resolve(__dirname, '../bak/entry.html');
	/**
	 * 移除临时目录
	 */
	await fs.removeSync(config.tempFolder);
	/**
	 * 清除 wip 文件夹所有日志文件
	 */
	await fs.removeSync(wipPathname);
	/**
	 * 创建 wip 文件路径
	 */
	mkdirp.sync(wipPathname);
	/**
	 * 创建完成的文件路径
	 */
	mkdirp.sync(finishedPathname);
	/**
	 * 创建临时文件夹
	 */
	mkdirp.sync(config.tempFolder);
	/**
	 * 将 entry.html 复制到 wip 中
	 */
	fs.copySync(entryHtml, path.resolve(wipPathname, 'entry.html'));
	/**
	 * 创建 http-server 子进程
	 */
	spawnHttpServer(config.server);
	/**
	 * 创建耕地管理器
	 * @type {PlotterManager}
	 */
	const plotterManager = new PlotterManager({ maxConcurrentFarmer: config.maxConcurrentFarmer });

	// noinspection ES6MissingAwait
	/**
	 * 开始耕地
	 */
	plotterManager.start();
	/**
	 * 间隔输出答应日志
	 */
	if (config.print.interval) {
		setInterval(() => {
			/**
			 * 输出打印
			 */
			console.clear();
			plotterManager.print();
		}, config.print.interval * 1000);
	}
})();
