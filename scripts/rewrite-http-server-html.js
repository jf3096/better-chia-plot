const fs = require('fs');
const path = require('path');
const targetFilePath = path.resolve(__dirname, '../', 'node_modules\\ecstatic\\lib\\ecstatic\\show-dir\\index.js');
const tplFilePath = path.resolve(__dirname, './tpl/show-dir-index.tpl.js');
const tplContent = fs.readFileSync(tplFilePath.toString());
fs.writeFileSync(targetFilePath, tplContent);