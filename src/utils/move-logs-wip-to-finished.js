const path = require('path');
const fs = require('fs-extra');

/**
 * 路径工具方法
 * @param pathname
 * @returns {string}
 */
const resolve = (...pathname) => path.resolve(__dirname, '../../logs', ...pathname);

/**
 * 将 wip 日志移动到 finished 文件夹中
 * @param wipFilename
 * @returns {Promise<void>}
 */
const moveLogsWipToFinished = async (wipFilename) => {
	const source = resolve('wip', wipFilename);
	const dest = resolve('finished', wipFilename);
	console.log(source);
	console.log(dest);
	return fs.move(source, dest);
};

module.exports = moveLogsWipToFinished;