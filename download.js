/**
 * 下载数据库
 */
const { execSync, existsSync } = require('fs');
const { join } = require('path');

const arg = process.argv.find(a => a.startsWith('--download='));
const src = arg?.split('=')[1];
const dbPath = join(__dirname, 'cards.cdb');

// 默认下载链接
const DEFAULT_URL = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

if (existsSync(dbPath)) {
  console.log('[lsm-ygopro-database] 数据库已存在');
  process.exit(0);
}

if (src) {
  // 使用指定路径/URL
  if (src.startsWith('http')) {
    console.log('[lsm-ygopro-database] 下载中...');
    execSync(`curl -sLO "${src}" -o "${dbPath}"`, { stdio: 'pipe' });
  } else {
    execSync(`cp "${src}" "${dbPath}"`, { stdio: 'pipe' });
  }
} else {
  // 使用默认链接
  console.log('[lsm-ygopro-database] 下载中...');
  execSync(`curl -sLO "${DEFAULT_URL}" -o "${dbPath}"`, { stdio: 'pipe' });
}

console.log('[lsm-ygopro-database] 完成');
