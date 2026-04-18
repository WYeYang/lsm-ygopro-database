/**
 * 自动下载游戏王数据库
 * 从 main.yaml 的 database.download 字段读取链接
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// 从 main.yaml 读取下载链接
const mainYamlPath = path.join(__dirname, '..', 'main.yaml');
const mainYaml = yaml.parse(fs.readFileSync(mainYamlPath, 'utf8'));
const downloadUrl = mainYaml?.database?.download;

// 解析 GitHub 链接，转换为 raw 下载链接
function parseGitHubUrl(url) {
  // 匹配 github.com/{owner}/{repo}/blob/{branch}/{path}
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
  if (match) {
    const [, owner, repo, branch, filePath] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  }
  // 已经是 raw 链接，直接返回
  if (url.includes('raw.githubusercontent.com')) {
    return url;
  }
  return null;
}

// GitHub 仓库信息
const DB_DIR = path.join(__dirname, '..', 'database', 'locales', 'zh-CN');
const DB_PATH = path.join(DB_DIR, 'cards.cdb');
const TMP_DIR = path.join(__dirname, '..', '.git-tmp');

function download() {
  if (!downloadUrl) {
    console.log('[lsm-ygopro-database] 未配置 download，跳过下载');
    return;
  }

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

    // 解析下载链接
    const rawUrl = parseGitHubUrl(downloadUrl);
    if (!rawUrl) {
      console.error('[lsm-ygopro-database] 无法解析下载链接:', downloadUrl);
      process.exit(1);
    }

    // 提取仓库 URL 和文件路径
    const match = rawUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/);
    if (!match) {
      console.error('[lsm-ygopro-database] 无法解析 raw 链接:', rawUrl);
      process.exit(1);
    }

    const [, owner, repo, branch, filePath] = match;
    const repoUrl = `https://github.com/${owner}/${repo}`;
    const dirPath = filePath.replace('/cards.cdb', '');

    console.log('[lsm-ygopro-database] 使用 git sparse-checkout 下载...');

    // 使用 git sparse-checkout
    execSync(`git clone --depth 1 --filter=blob:none --sparse ${repoUrl} ${TMP_DIR}`, {
      stdio: 'pipe'
    });

    execSync(`git sparse-checkout set ${dirPath}`, {
      cwd: TMP_DIR,
      stdio: 'pipe'
    });

    const src = path.join(TMP_DIR, filePath);
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
