/**
 * 自动下载游戏王数据库
 * 使用 git sparse-checkout 从 GitHub 下载
 * 
 * 可通过环境变量自定义：
 *   npm_config_download_url   - 自定义下载链接（格式：owner/repo@branch/path/to/file）
 *   npm_config_download_dir    - 自定义下载目录
 * 
 * 示例：
 *   npm install --download_url=mycard/ygopro-database@master/locales/zh-CN/cards.cdb
 *   npm install --download_dir=/custom/path
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 环境变量
const envUrl = process.env.npm_config_download_url;
const envDir = process.env.npm_config_download_dir;

// GitHub 仓库信息（默认）
const DEFAULT_REPO = 'https://github.com/mycard/ygopro-database';
const DB_FILE = 'locales/zh-CN/cards.cdb';

// 解析环境变量
function parseEnvUrl() {
  if (!envUrl) return null;
  // 格式：owner/repo@branch/path/to/file
  const match = envUrl.match(/^([^@\/]+)\/([^@\/]+)@([^\/]+)\/(.+)$/);
  if (match) {
    const [, owner, repo, branch, filePath] = match;
    return {
      repo: `https://github.com/${owner}/${repo}`,
      file: filePath,
      dir: filePath.replace(/\/[^/]+$/, '')
    };
  }
  return null;
}

const envConfig = parseEnvUrl();

// GitHub 仓库信息
const GITHUB_REPO = envConfig?.repo || DEFAULT_REPO;
const DB_FILE_PATH = envConfig?.file || DB_FILE;
const DB_DIR = envDir 
  ? path.resolve(envDir)
  : path.join(__dirname, '..', 'database', 'locales', 'zh-CN');
const DB_PATH = path.join(DB_DIR, 'cards.cdb');
const TMP_DIR = path.join(__dirname, '..', '.git-tmp');

function download() {
  // 检查是否已存在
  if (fs.existsSync(DB_PATH)) {
    console.log('[lsm-ygopro-database] 数据库已存在，跳过下载:', DB_PATH);
    return;
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

    // 使用 git sparse-checkout
    const checkoutDir = envConfig?.dir || 'locales/zh-CN';
    console.log('[lsm-ygopro-database] 使用 git sparse-checkout 下载...');
    execSync(`git clone --depth 1 --filter=blob:none --sparse ${GITHUB_REPO} ${TMP_DIR}`, {
      stdio: 'pipe'
    });

    execSync(`git sparse-checkout set ${checkoutDir}`, {
      cwd: TMP_DIR,
      stdio: 'pipe'
    });

    const src = path.join(TMP_DIR, DB_FILE_PATH);
    fs.copyFileSync(src, DB_PATH);

    // 清理临时目录
    fs.rmSync(TMP_DIR, { recursive: true, force: true });

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
