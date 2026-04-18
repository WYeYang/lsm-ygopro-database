/**
 * 自动下载游戏王数据库
 */
const { execSync, readFileSync, existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const pkgDir = join(__dirname, '..');
const dbPath = join(pkgDir, 'cards.cdb');
const yamlPath = join(pkgDir, 'main.yaml');
const url = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

if (!existsSync(dbPath)) {
  mkdirSync(pkgDir, { recursive: true });
  execSync(`curl -sL "${url}" -o "${dbPath}"`, { stdio: 'pipe' });
  console.log('[lsm-ygopro-database] 下载完成');
}

// 修改 main.yaml 配置
let yaml = readFileSync(yamlPath, 'utf8');
yaml = yaml.replace('./database/locales/zh-CN/cards.cdb', './cards.cdb');
writeFileSync(yamlPath, yaml);
console.log('[lsm-ygopro-database] 配置已更新');
