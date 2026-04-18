/**
 * 下载数据库
 * npm install lsm-ygopro-database --download=URL
 */
const { execSync, existsSync } = require('fs');
const { join } = require('path');

const arg = process.argv.find(a => a.startsWith('--download='));
const url = arg?.split('=')[1];

if (!url) {
  console.log('[lsm-ygopro-database] 跳过下载（未指定 --download）');
  process.exit(0);
}

const dbPath = join(__dirname, '..', 'cards.cdb');

if (existsSync(dbPath)) {
  console.log('[lsm-ygopro-database] 数据库已存在');
} else {
  execSync(`curl -sL "${url}" -o "${dbPath}"`, { stdio: 'pipe' });
  console.log('[lsm-ygopro-database] 下载完成');
}
