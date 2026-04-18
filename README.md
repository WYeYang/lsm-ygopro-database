# LSM YGOPRO 卡片数据库配置

## 安装

```bash
# 1. 安装配置（在同一目录下执行）
npm install https://github.com/WYeYang/lsm-ygopro-database

# 2. 下载数据库到 node_modules/lsm-ygopro-database/ 下
curl -sLO https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb -o node_modules/lsm-ygopro-database/cards.cdb
```

> 注意：两条命令需在同一目录下执行

## 规范与 SDK

- **LSM 规范**：[label-sql-mapping-spec](https://github.com/WYeYang/label-sql-mapping-spec) - 配置文件规范
- **SDK 和 CLI**：[label-sql-mapping-sdk](https://github.com/WYeYang/label-sql-mapping-sdk) - 安装和使用方法见 SDK 仓库

## 配置说明

### main.yaml 结构

```yaml
version: "1.0"           # 配置文件版本
name: "配置名称"         # 显示名称
id: "unique_id"          # 唯一标识符

database:                 # 数据库配置
  type: sqlite           # 数据库类型（sqlite/mysql/postgres）
  path: "./cards.cdb"    # 数据库文件路径（相对于包目录）

tables:                  # 数据表（可选，默认从数据库推断）
  - name: datas          # 表名
    alias: d             # SQL 别名

mappings:                # 标签映射（核心配置）
  - id: name             # 标签唯一ID
    name: 名称            # 显示名称
    description: 描述     # AI 使用的描述
    condition: SQL条件    # 筛选条件（SQL WHERE 子句）
    value: 字段名         # 结果值来源字段
```

### mappings 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 标签唯一标识，AI 识别用 |
| `name` | 是 | 人类可读的显示名称 |
| `description` | 否 | AI 理解标签用途的描述 |
| `condition` | 否 | SQL WHERE 条件，限制数据范围 |
| `value` | 否 | 返回结果使用的字段 |
| `items` | 否 | 枚举值列表（互斥标签） |

### items 子配置

```yaml
items:
  - condition: d.type & 1 > 0    # SQL 条件
    value: "通常"                   # 显示值
    condition: ...                  # 可选的额外筛选
```

### 示例：属性标签

```yaml
- id: attribute
  name: 属性
  items:
    - condition: d.attribute = 1
      value: 地
    - condition: d.attribute = 2
      value: 水
```

## 扩展标签

扩展标签在 `extensions/` 目录下，按需加载：

- `effect-type.yaml` - 效果类型分类
- `series.yaml` - 系列/卡组分类
