/**
 * 自动下载游戏王数据库
 */
const { execSync, existsSync } = require('fs');
const { join } = require('path');

const dbPath = join(__dirname, '..', 'cards.cdb');
const url = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

if (!existsSync(dbPath)) {
  execSync(`curl -sL "${url}" -o "${dbPath}"`, { stdio: 'pipe' });
}
