/**
 * 下载数据库
 * npm install lsm-ygopro-database --download=URL
 */
const { execSync, existsSync } = require('fs');
const { join } = require('path');

const arg = process.argv.find(a => a.startsWith('--download='));
const src = arg?.split('=')[1];

if (!src) {
  console.log('[lsm-ygopro-database] 跳过下载（未指定 --download）');
  process.exit(0);
}

const dbPath = join(__dirname, '..', 'cards.cdb');

// 如果是 URL 则下载
if (src.startsWith('http')) {
  if (!existsSync(dbPath)) {
    execSync(`curl -sLO "${src}" -o "${dbPath}"`, { stdio: 'pipe' });
    console.log('[lsm-ygopro-database] 下载完成');
  } else {
    console.log('[lsm-ygopro-database] 数据库已存在');
  }
} else {
  // 本地路径则复制
  if (existsSync(dbPath)) {
    console.log('[lsm-ygopro-database] 数据库已存在');
  } else {
    execSync(`cp "${src}" "${dbPath}"`, { stdio: 'pipe' });
    console.log('[lsm-ygopro-database] 复制完成');
  }
}
