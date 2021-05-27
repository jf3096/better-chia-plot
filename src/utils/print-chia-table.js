const Table = require('cli-table3');
const os = require('os-utils');
const pretty = require('prettysize');
const prettyDuration = require('./pretty-duration');
const path = require('path');
const glob = require('glob');

/**
 * 1M
 * @type {number}
 */
const oneM = 1024 * 1024;

/**
 * 转化百分比数
 * @param value
 * @param decimal
 * @returns {number}
 */
const toPercentNum = (value, decimal = 2) => {
	return Number((value * 100).toFixed(decimal));
};

/**
 * 获取CPU使用率
 * @returns {Promise<number>}
 */
const getCpuUsage = () => {
	return new Promise((resolve) => {
		os.cpuUsage(function(v) {
			resolve(v);
		});
	});
};

/**
 * 输出完成的 plots
 */
const printFinishPlotsTable = () => {
	const table = new Table({
		head: ['日期', '完成种地数'],
		style: { compact: true },
	});
	const targetDirectory = path.resolve(__dirname, '../../logs/finished');
	const pathname = path.resolve(targetDirectory, 'chia-*.txt');
	return new Promise((resolve) => {
		glob(pathname, {}, (error, filenames) => {
			const result = {};
			filenames.map((filename) => path.relative(targetDirectory, filename)).sort().forEach((filename) => {
				const match = filename.match(/\d{4}-\d{2}-\d{2}/);
				if (match && match[0]) {
					const dateString = match[0];
					result[dateString] = (result[dateString] || 0) + 1;
				}
			});
			table.push(...Object.keys(result).map((key) => {
				return [key, result[key]];
			}));
			console.log(table.toString());
			resolve();
		});
	});
};

const printChiaTable = async (rows) => {
	const table = new Table({
		head: ['序号', 'pid', 'k', '开始时间', '花费时间', '阶段', '阶段耗时', '进度', '临时盘空间', '最终盘空间'],
	});

	table.push(...rows);
	console.log(table.toString());

	const [cpuUsage] = await Promise.all([
		getCpuUsage(),
	]);

	const output = [];

	output.push(`CPU 线程数: ${os.cpuCount()}`);
	output.push(`CPU 使用率(%): ${toPercentNum(cpuUsage)}`);
	output.push(`RAM 使用率(%): ${pretty(os.freemem() * oneM)}/${pretty(os.totalmem() * oneM)} (${toPercentNum(os.freememPercentage())}%)`);
	output.push(`当前服务已启动: ${prettyDuration(os.processUptime())}`);
	output.push();
	output.push();
	console.log(output.join('\r\n'));
	// await printFinishPlotsTable();
	return output;
};

module.exports = printChiaTable;