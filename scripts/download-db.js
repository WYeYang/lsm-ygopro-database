/**
 * 自动下载游戏王数据库
 */
const { execSync, readFileSync } = require('fs');
const { join } = require('path');

const pkgDir = join(__dirname, '..');
const dbPath = join(pkgDir, './database/locales/zh-CN/cards.cdb');
const url = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

try {
  readFileSync(dbPath);
  console.log('[lsm-ygopro-database] 数据库已存在');
} catch {
  execSync(`curl -sL "${url}" -o "${dbPath}"`, { stdio: 'pipe' });
  console.log('[lsm-ygopro-database] 下载完成');
}
