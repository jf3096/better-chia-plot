/**
 * 格式化模板
 */
const formatTpl = function(str, placeholders) {
	for (const propertyName in placeholders) {
		const re = new RegExp('{' + propertyName + '}', 'gm');
		// noinspection JSUnfilteredForInLoop
		str = str.replace(re, placeholders[propertyName]);
	}
	return str;
};

module.exports = formatTpl;