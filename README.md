# LSM 数据库配置

## 简介

本仓库包含了基于 Label-SQL Mapping (LSM) 规范的数据库配置文件。这些配置文件定义了标签与 SQL 查询条件之间的映射关系。

## 配置文件

- [main.yaml](main.yaml) - 主配置文件，包含所有标签和数据库配置

## 数据库结构

配置文件假设数据库包含以下表结构：

### 主表（datas）
- `id`：数据 ID
- `name`：名称
- `type`：类型
- `attribute`：属性
- `race`：种族
- `atk`：攻击力
- `def`：防御力
- `level`：等级
- `linkval`：连接值
- `scale`：刻度
- `ocg_tcg`：状态

### 文本表（texts）
- `id`：数据 ID
- `desc`：描述
- `flavor`：风味文本

## 数据库引用

本配置文件使用以下数据库：

- **GitHub 仓库**：[mycard/ygopro-database](https://github.com/mycard/ygopro-database)
- **Git 子模块**：已作为 `database` 目录添加到本仓库
- **数据库文件路径**：`database/locales/zh-CN/cards.cdb`

## 初始化子模块

```bash
# 克隆仓库时同时克隆子模块
git clone --recursive https://github.com/WYeYang/lsm-ygopro-database.git

# 或者在已克隆的仓库中初始化子模块
git submodule update --init --recursive
```

## 如何使用

1. 克隆本仓库并初始化子模块（见上文）
2. 使用 LSM SDK 加载配置文件
3. 执行查询操作

```javascript
const { LSMSDK } = require('label-sql-mapping-sdk');

// 配置文件路径
const configPath = './lsm-ygopro-database/main.yaml';

// 数据库配置
const dbConfig = {
  type: 'sqlite',
  path: './lsm-ygopro-database/database/locales/zh-CN/cards.cdb' // 使用子模块中的数据库文件
};

// 初始化 SDK
const sdk = new LSMSDK(configPath, dbConfig);

// 执行查询
const result = await sdk.query('attribute = "光" AND race = "龙"');
```

## 相关项目

- [label-sql-mapping-spec](https://github.com/WYeYang/label-sql-mapping-spec) - LSM 1.0 规范文档
- [label-sql-mapping-sdk](https://github.com/WYeYang/label-sql-mapping-sdk) - LSM SDK 和 CLI 工具
- [mycard/ygopro-database](https://github.com/mycard/ygopro-database) - 数据库