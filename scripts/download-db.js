/**
 * 自动下载游戏王数据库
 * 优先直链下载，失败后使用 git sparse-checkout
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 从环境变量或命令行参数获取
const arg = process.argv.find(a => a.startsWith('--download='))?.split('=')[1];
const downloadSrc = process.env.npm_config_download || arg;

// 配置
const DB_DIR = path.join(__dirname, '..', 'database', 'locales', 'zh-CN');
const DB_PATH = path.join(DB_DIR, 'cards.cdb');

// GitHub 直链模板
const GITHUB_RAW = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

// 解析下载来源
function parseSource(src) {
  if (!src) return null;
  
  // 本地文件
  if (src.startsWith('/') || src.startsWith('file://') || fs.existsSync(src)) {
    return { type: 'local', path: src.replace('file://', '') };
  }
  
  // GitHub blob 链接 -> 转为 raw
  const blobMatch = src.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
  if (blobMatch) {
    const [, owner, repo, branch, filePath] = blobMatch;
    return { type: 'url', url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}` };
  }
  
  // GitHub raw 链接
  if (src.includes('raw.githubusercontent.com') || src.includes('github.com')) {
    const match = src.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/) 
               || src.match(/github\.com\/([^/]+)\/([^/]+)\/raw\/([^/]+)\/(.+)/);
    if (match) {
      const [, owner, repo, branch, filePath] = match;
      return { type: 'url', url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}` };
    }
  }
  
  // HTTP 链接
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return { type: 'url', url: src };
  }
  
  return null;
}

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

  // 解析来源
  const source = parseSource(downloadSrc);
  let url = source?.type === 'url' ? source.url 
          : source?.type === 'local' ? null
          : GITHUB_RAW;

  // 1. 尝试直链下载
  if (url) {
    console.log('[lsm-ygopro-database] 尝试直链下载...');
    try {
      execSync(`curl -sL "${url}" -o "${DB_PATH}"`, { stdio: 'pipe' });
      if (fs.existsSync(DB_PATH) && fs.statSync(DB_PATH).size > 1000) {
        console.log('[lsm-ygopro-database] 直链下载成功:', DB_PATH);
        return;
      }
      fs.unlinkSync(DB_PATH);
    } catch (e) {
      console.log('[lsm-ygopro-database] 直链下载失败');
    }
  }

  // 2. 本地文件复制
  if (source?.type === 'local') {
    console.log('[lsm-ygopro-database] 从本地复制...');
    fs.copyFileSync(source.path, DB_PATH);
    console.log('[lsm-ygopro-database] 复制完成:', DB_PATH);
    return;
  }

  // 3. 使用 git clone（兜底）
  console.log('[lsm-ygopro-database] 使用 git sparse-checkout 下载...');
  const TMP_DIR = path.join(__dirname, '..', '.git-tmp');
  
  try {
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
    
    execSync(`git clone --depth 1 --filter=blob:none --sparse "https://github.com/mycard/ygopro-database" "${TMP_DIR}"`, {
      stdio: 'pipe'
    });
    execSync(`git sparse-checkout set locales/zh-CN`, { cwd: TMP_DIR, stdio: 'pipe' });
    fs.copyFileSync(path.join(TMP_DIR, 'locales/zh-CN/cards.cdb'), DB_PATH);
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
    console.log('[lsm-ygopro-database] git 下载成功:', DB_PATH);
  } catch (err) {
    console.error('[lsm-ygopro-database] 下载失败:', err.message);
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

download();
