const cp = require('child_process');
const path = require('path');

/**
 * 创建 http-server 服务器子进程
 * @returns {ChildProcessWithoutNullStreams}
 */
const spawnHttpServer = (server) => {
	const port = server && server.port;
	const logsPathname = path.resolve(__dirname, '../../logs');
	if (port) {
		cp.spawn(`http-server ${logsPathname} -c-1 -p ${port}`, { shell: true, detached: true });
	}
};

module.exports = spawnHttpServer;