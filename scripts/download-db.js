/**
 * 自动下载游戏王数据库
 * 从 mycard/ygopro-database releases 下载中文数据库
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// 下载目标
const DB_URL = 'https://github.com/mycard/ygopro-database/releases/download/latest/cards.cdb';
const DB_PATH = path.join(__dirname, '..', 'database', 'locales', 'zh-CN', 'cards.cdb');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    // 检查是否已存在
    if (fs.existsSync(dest)) {
      console.log('[lsm-ygopro-database] 数据库已存在，跳过下载:', dest);
      return resolve();
    }

    console.log('[lsm-ygopro-database] 正在下载数据库...');
    
    // 确保目录存在
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 重定向
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        return reject(new Error(`下载失败: ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('[lsm-ygopro-database] 数据库下载完成:', dest);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

download(DB_URL, DB_PATH).catch(err => {
  console.error('[lsm-ygopro-database] 下载失败:', err.message);
  process.exit(1);
});
