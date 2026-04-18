/**
 * 下载数据库
 * npm run install --download=URL
 */
const { execSync, existsSync } = require('fs');
const { join } = require('path');

const arg = process.argv.find(a => a.startsWith('--download='));
const src = arg?.split('=')[1];

if (!src) {
  console.log('[lsm-ygopro-database] 跳过（未传 --download）');
  console.log('  下载：curl -sLO https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb');
  console.log('  安装：npm run install --download=./cards.cdb');
  process.exit(0);
}

const dbPath = join(__dirname, 'cards.cdb');

if (src.startsWith('http')) {
  execSync(`curl -sLO "${src}" -o "${dbPath}"`, { stdio: 'pipe' });
  console.log('[lsm-ygopro-database] 下载完成');
} else {
  execSync(`cp "${src}" "${dbPath}"`, { stdio: 'pipe' });
  console.log('[lsm-ygopro-database] 复制完成');
}
