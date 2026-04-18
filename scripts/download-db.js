/**
 * 自动下载游戏王数据库
 * 使用 git sparse-checkout 从 GitHub 下载
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// GitHub 仓库信息
const GITHUB_REPO = 'https://github.com/mycard/ygopro-database';
const DB_FILE = 'locales/zh-CN/cards.cdb';
const DB_DIR = path.join(__dirname, '..', 'database', 'locales', 'zh-CN');
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
    console.log('[lsm-ygopro-database] 使用 git sparse-checkout 下载...');
    execSync(`git clone --depth 1 --filter=blob:none --sparse ${GITHUB_REPO} ${TMP_DIR}`, {
      stdio: 'pipe'
    });

    execSync(`git sparse-checkout set locales/zh-CN`, {
      cwd: TMP_DIR,
      stdio: 'pipe'
    });

    const src = path.join(TMP_DIR, DB_FILE);
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
