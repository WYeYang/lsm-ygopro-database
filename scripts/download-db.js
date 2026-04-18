/**
 * 自动下载游戏王数据库
 */
const { execSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const pkgDir = join(__dirname, '..');
const dbPath = join(pkgDir, 'cards.cdb');
const yamlPath = join(pkgDir, 'main.yaml');
const url = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

if (!existsSync(dbPath)) {
  execSync(`curl -sL "${url}" -o "${dbPath}"`, { stdio: 'pipe' });
}

// 修改 path
let yaml = readFileSync(yamlPath, 'utf8');
yaml = yaml.replace('path: ./database/locales/zh-CN/cards.cdb', 'path: ./cards.cdb');
writeFileSync(yamlPath, yaml);
