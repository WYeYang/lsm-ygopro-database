/**
 * 自动下载游戏王数据库
 * 使用直链下载
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 从命令行参数获取
const arg = process.argv.find(a => a.startsWith('--download='))?.split('=')[1];
const downloadSrc = process.env.npm_config_download || arg;

// 配置
const DB_DIR = path.join(__dirname, '..', 'database', 'locales', 'zh-CN');
const DB_PATH = path.join(DB_DIR, 'cards.cdb');

// 默认直链
const GITHUB_RAW = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

function download() {
  // 检查是否已存在
  if (fs.existsSync(DB_PATH)) {
    console.log('[lsm-ygopro-database] 数据库已存在，跳过下载:', DB_PATH);
    return;
  }

  // 确保目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // 确定下载 URL
  let url = GITHUB_RAW;
  
  if (downloadSrc) {
    // GitHub blob 链接 -> 转为 raw
    const blobMatch = downloadSrc.match(/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\/(.+)/);
    if (blobMatch) {
      url = `https://raw.githubusercontent.com/${downloadSrc.match(/github\.com\/([^/]+)\/([^/]+)/).slice(1).join('/')}/${downloadSrc.match(/blob\/([^/]+)/)[1]}/${blobMatch[1]}`;
    } else if (downloadSrc.startsWith('http')) {
      url = downloadSrc;
    }
  }

  console.log('[lsm-ygopro-database] 正在下载数据库...');

  // 使用 curl 下载
  try {
    execSync(`curl -sL "${url}" -o "${DB_PATH}"`, { stdio: 'pipe' });
    
    if (!fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size < 1000) {
      console.error('[lsm-ygopro-database] 下载失败，文件无效');
      process.exit(1);
    }
    
    console.log('[lsm-ygopro-database] 数据库下载完成:', DB_PATH);
  } catch (err) {
    console.error('[lsm-ygopro-database] 下载失败:', err.message);
    process.exit(1);
  }
}

download();
