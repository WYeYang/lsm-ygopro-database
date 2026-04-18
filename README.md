# LSM YGOPRO 卡片数据库配置

## 数据来源

- **YGOPRO 数据库**：[mycard/ygopro-database](https://github.com/mycard/ygopro-database)
- **下载链接**：`https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb`

## 安装

```bash
# 方式一：GitHub + 自动下载
npm install https://github.com/WYeYang/lsm-ygopro-database --db_url=https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb

# 方式二：手动下载后安装
curl -sLO https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb
npm install https://github.com/WYeYang/lsm-ygopro-database --db_url=./cards.cdb

# 方式三：已有数据库文件
npm install https://github.com/WYeYang/lsm-ygopro-database --db_url=/path/to/cards.cdb
```

## 规范与 SDK

- **LSM 规范**：[label-sql-mapping-spec](https://github.com/WYeYang/label-sql-mapping-spec) - 配置文件规范
- **SDK 和 CLI**：[label-sql-mapping-sdk](https://github.com/WYeYang/label-sql-mapping-sdk) - 程序化调用和命令行工具

### CLI 使用

```bash
# 安装 SDK
npm install https://github.com/WYeYang/label-sql-mapping-sdk

# 命令行查询
lsm-cli -c lsm-ygopro-database --query "攻击力大于2500的龙族怪兽"
```

### SDK 使用

```javascript
const { LSMSDK } = require('lsm-sdk');

// 只安装了一个 lsm 模块时，直接用
const sdk = LSMSDK.fromAppConfig();

// 安装了多个 lsm 模块时，指定包名
const sdk = LSMSDK.fromAppConfig('lsm-ygopro-database');

// 查询
const result = await sdk.query({ query: '攻击力大于2500' });
```

### 返回结果

```javascript
{
  sql: "SELECT ...",           // 生成的 SQL 语句
  data: [{                    // 查询结果
    id: 123,
    name: "黑魔术师",
    atk: 2500,
    // ...
  }, ...],
  total: 100,                 // 总记录数
  page: 1,                   // 当前页
  pageSize: 20,              // 每页数量
  totalPages: 5,             // 总页数
  explanation: "...",         // AI 对查询的解释
  extensions: {               // 扩展标签（mode=detail 时嵌入数据）
    "effect_type": [{ id: 123, values: ["怪兽破坏", "卡片除外"] }],
    "series": [{ id: 456, values: ["黑魔导"] }]
  }
}
```

### 查询扩展标签

```javascript
// 查询并返回扩展标签
const result = await sdk.query({
  query: '黑魔术师的卡片',
  extensions: ['效果分类', '系列']  // 指定要查询的扩展标签
});

// extensions 字段说明
{
  "effect_type": [{           // 扩展标签 ID
    id: 123,                  // 卡片 ID
    values: ["怪兽破坏"]       // 该卡片匹配的扩展标签值
  }],
  "series": [{
    id: 123,
    values: ["黑魔导"]
  }]
}
```

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
