/**
 * 下载数据库
 * npm install --download=URL
 */
const { execSync, existsSync } = require('fs');
const { join } = require('path');

const arg = process.argv.find(a => a.startsWith('--download='));
const url = arg?.split('=')[1];

if (!url) {
  console.log('[lsm-ygopro-database] 跳过（请传 --download=URL）');
  process.exit(0);
}

const dbPath = join(__dirname, 'cards.cdb');
if (!existsSync(dbPath)) {
  execSync(`curl -sLO "${url}" -o "${dbPath}"`, { stdio: 'pipe' });
  console.log('[lsm-ygopro-database] 下载完成');
} else {
  console.log('[lsm-ygopro-database] 数据库已存在');
}
