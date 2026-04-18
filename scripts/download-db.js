/**
 * 自动下载游戏王数据库
 * 直链：https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'database', 'locales', 'zh-CN');
const DB_PATH = path.join(DB_DIR, 'cards.cdb');
const URL = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log('[lsm-ygopro-database] 下载数据库...');
  execSync(`curl -sL "${URL}" -o "${DB_PATH}"`, { stdio: 'pipe' });
  console.log('[lsm-ygopro-database] 下载完成:', DB_PATH);
} else {
  console.log('[lsm-ygopro-database] 数据库已存在:', DB_PATH);
}
