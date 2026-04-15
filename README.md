# LSM 游戏王数据库配置

## 简介

本仓库包含了基于 Label-SQL Mapping (LSM) 规范的游戏王卡片数据库配置文件。这些配置文件定义了游戏王卡片的标签与 SQL 查询条件之间的映射关系。

## 配置文件

- [main.yaml](main.yaml) - 主配置文件，包含所有标签和数据库配置

## 主要标签

- **属性**：光、暗、地、水、火、风
- **种族**：龙、魔法师、战士、恶魔、不死、机械、水族、炎族、兽战士、昆虫、植物、岩石、鸟兽、雷族、爬虫类、念动力、幻神兽族、天使、恶魔族、海龙、雷龙、电子界族
- **卡片类型**：怪兽、魔法、陷阱
- **怪兽类型**：通常、效果、融合、仪式、同调、XYZ、连接
- **魔法类型**：通常、永续、装备、场地、速攻、仪式
- **陷阱类型**：通常、永续、反击

## 数据库结构

配置文件假设数据库包含以下表结构：

### 主表（datas）
- `id`：卡片 ID
- `name`：卡片名称
- `type`：卡片类型
- `attribute`：属性（仅怪兽卡）
- `race`：种族（仅怪兽卡）
- `atk`：攻击力（仅怪兽卡）
- `def`：防御力（仅怪兽卡）
- `level`：等级（仅怪兽卡）
- `linkval`：连接值（仅连接怪兽）
- `scale`：灵摆刻度（仅灵摆怪兽）
- `ocg_tcg`：OCG/TCG 状态

### 文本表（texts）
- `id`：卡片 ID
- `desc`：卡片描述
- `flavor`：卡片风味文本

## 游戏王数据库引用

本配置文件基于以下开源游戏王数据库：

- **GitHub 仓库**：[moecube/ygopro-database](https://github.com/moecube/ygopro-database.git)
- **Git 子模块**：已作为 `database` 目录添加到本仓库
- **子路径**：`database/` 目录

## 初始化子模块

```bash
# 克隆仓库时同时克隆子模块
git clone --recursive https://github.com/WYeYang/lsm-ygopro-database.git

# 或者在已克隆的仓库中初始化子模块
git submodule update --init --recursive
```

## 如何使用

1. 克隆本仓库
2. 使用 LSM SDK 加载配置文件
3. 执行查询操作

```javascript
const { LSMSDK } = require('label-sql-mapping-sdk');

// 配置文件路径
const configPath = './lsm-ygopro-database/main.yaml';

// 数据库配置
const dbConfig = {
  type: 'sqlite',
  path: './ygopro.db' // 基于 moecube/ygopro-database 的数据库文件
};

// 初始化 SDK
const sdk = new LSMSDK(configPath, dbConfig);

// 执行查询
const result = await sdk.query('attribute = "光" AND race = "龙"');
```

## 相关项目

- [label-sql-mapping-spec](https://github.com/WYeYang/label-sql-mapping-spec) - LSM 1.0 规范文档
- [label-sql-mapping-sdk](https://github.com/WYeYang/label-sql-mapping-sdk) - LSM SDK 和 CLI 工具
- [ygopro-card-cli](https://github.com/WYeYang/ygopro-card-cli) - 游戏王卡片查询 CLI 工具
- [moecube/ygopro-database](https://github.com/moecube/ygopro-database.git) - 游戏王卡片数据库