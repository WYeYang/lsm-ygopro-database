/**
 * 自动下载游戏王数据库
 * 
 * 支持三种安装方式：
 * 1. GitHub blob 链接：npm install --download=https://github.com/mycard/ygopro-database/blob/master/locales/zh-CN/cards.cdb
 * 2. GitHub raw 链接：npm install --download=https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb
 * 3. 本地路径：npm install --download=/path/to/cards.cdb
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 从环境变量或命令行参数获取
const arg = process.argv.find(a => a.startsWith('--download='))?.split('=')[1];
const downloadSrc = process.env.npm_config_download || arg;

// 配置
const DB_DIR = path.join(__dirname, '..', 'database', 'locales', 'zh-CN');
const DB_PATH = path.join(DB_DIR, 'cards.cdb');
const TMP_DIR = path.join(__dirname, '..', '.git-tmp');

// 解析链接类型
function parseSource(src) {
  if (!src) return null;
  
  // 本地文件/路径
  if (src.startsWith('/') || src.startsWith('file://') || fs.existsSync(src)) {
    const filePath = src.replace('file://', '');
    return { type: 'local', path: filePath };
  }
  
  // GitHub blob 链接
  const blobMatch = src.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
  if (blobMatch) {
    const [, owner, repo, branch, filePath] = blobMatch;
    return {
      type: 'git',
      repo: `https://github.com/${owner}/${repo}`,
      file: filePath,
      dir: filePath.replace(/\/[^/]+$/, '')
    };
  }
  
  // GitHub raw 链接
  const rawMatch = src.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/);
  if (rawMatch) {
    const [, owner, repo, branch, filePath] = rawMatch;
    return {
      type: 'git',
      repo: `https://github.com/${owner}/${repo}`,
      file: filePath,
      dir: filePath.replace(/\/[^/]+$/, '')
    };
  }
  
  // 其他 HTTP 链接
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return { type: 'http', url: src };
  }
  
  return null;
}

// 下载文件
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function download() {
  // 检查是否已存在
  if (fs.existsSync(DB_PATH)) {
    console.log('[lsm-ygopro-database] 数据库已存在，跳过下载:', DB_PATH);
    return;
  }

  // 解析来源
  const source = parseSource(downloadSrc);
  
  if (!source) {
    // 使用默认仓库
    console.log('[lsm-ygopro-database] 使用默认仓库下载...');
    source = {
      type: 'git',
      repo: 'https://github.com/mycard/ygopro-database',
      file: 'locales/zh-CN/cards.cdb',
      dir: 'locales/zh-CN'
    };
  }

  console.log('[lsm-ygopro-database] 正在下载数据库...');

  try {
    // 确保目录存在
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // 删除旧目录
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }

    let src;

    if (source.type === 'local') {
      // 本地文件
      console.log('[lsm-ygopro-database] 从本地复制...');
      fs.copyFileSync(source.path, DB_PATH);
      
    } else if (source.type === 'http') {
      // HTTP 下载
      console.log('[lsm-ygopro-database] 从 HTTP 链接下载...');
      execSync(`curl -sL "${source.url}" -o "${DB_PATH}"`);
      
    } else if (source.type === 'git') {
      // Git clone + sparse-checkout
      console.log('[lsm-ygopro-database] 使用 git sparse-checkout 下载...');
      execSync(`git clone --depth 1 --filter=blob:none --sparse "${source.repo}" "${TMP_DIR}"`, {
        stdio: 'pipe'
      });
      execSync(`git sparse-checkout set "${source.dir}"`, {
        cwd: TMP_DIR,
        stdio: 'pipe'
      });
      src = path.join(TMP_DIR, source.file);
      fs.copyFileSync(src, DB_PATH);
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }

    console.log('[lsm-ygopro-database] 数据库下载完成:', DB_PATH);
    
  } catch (err) {
    console.error('[lsm-ygopro-database] 下载失败:', err.message);
    if (fs.existsSync(TMP_DIR)) {
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

download();
