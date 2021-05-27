const shell = require('shelljs');

/**
 * 获取磁盘空间
 */
const getDiskSpace = (volumeText) => {
	try {
		volumeText = volumeText.split(':')[0];
		// noinspection JSUnresolvedFunction,SpellCheckingInspection
		shell.exec('chcp 65001', { silent: true });
		// noinspection JSUnresolvedFunction,SpellCheckingInspection
		const result = shell.exec(`fsutil volume diskfree ${volumeText}:`, { silent: true });
		const resultText = [...result].join('');
		if (resultText.startsWith('Error: ')) {
			// noinspection ExceptionCaughtLocallyJS
			throw resultText;
		}
		return Number(resultText.split('\r\n')[0].replace(/,/g, '').match(/\d+/)[0]);
	} catch (e) {
		console.log(e);
		return 0;
	}
};

module.exports = getDiskSpace;