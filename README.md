# LSM 游戏王卡片数据库配置

## 数据库来源

本配置使用 **mycard** 维护的游戏王卡片数据库：

- **来源**：[mycard/ygopro-database](https://github.com/mycard/ygopro-database)
- **安装**：通过 npm install 自动下载 `cards.cdb`
- **版权**：游戏王卡片数据版权属于 **Konami**，仅供学习研究使用

> ⚠️ **免责声明**：卡片名称、卡图、效果描述等游戏王相关内容版权归 Konami 所有。本项目仅提供数据查询功能，请勿用于商业用途。

## 安装

```bash
npm install lsm-ygopro-database
```

安装后 `cards.cdb` 会自动下载到包目录。

## 配置文件

- [main.yaml](main.yaml) - 主配置文件
- [extensions/](extensions/) - 扩展标签配置
