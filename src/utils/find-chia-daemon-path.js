const os = require('os');
const glob = require('glob');

const findChiaDaemonPath = () => {
	const pathname = `${os.homedir()}\\AppData\\Local\\chia-blockchain\\app-*\\resources\\app.asar.unpacked\\daemon`;
	return new Promise(resolve => {
		glob(pathname, {}, function(err, files) {
			if (err) {
				console.error(err);
				process.exit(1);
			}
			if (files.length === 0) {
				console.error(`无法通过找到路径: ${pathname}, 请确保 chia 被正确安装`);
				process.exit(1);
			}
			resolve(files.sort().slice(-1)[0]);
		});
	});
};

module.exports = findChiaDaemonPath;