# 奥赛群星闪耀时：五科学科奥赛数据 MCP 与 Agent Skill

**Aosai Qunxing — Chinese Academic Olympiad data for AI agents.** 查询中国高中数学、物理、化学、生物、信息学奥林匹克竞赛的国际奖牌、国家队、真实国家集训队、国内决赛、学校、省份、学生履历与原始来源。

[奥赛群星闪耀时](https://aosaiqunxing.com) · [Agent Skill](./skill/aosaiqunxing/SKILL.md) · [MIT 许可证](./LICENSE)

> 本仓库只开源 **MCP 接入程序和 Agent Skill**，不包含网站源码、查询后端、数据库、学生资料或任何用户密钥。竞赛数据由线上只读服务提供；使用数据工具需要注册并使用自己的 API Key。本项目不隶属于各学科竞赛主办机构。

## 可以问什么

- “中国五科累计收录多少国际金牌？各科分别多少？”
- “哪些学校在数学、物理、化学三科都有国家集训队选手？”
- “某省历届国家队、国集和决赛金牌分别有多少？”
- “某位选手在哪些年份、哪些赛事获奖？原始文件在哪里？”
- “2018 年至今各科国家队和国际奖牌如何变化？”

数据覆盖并非每一年、每一赛事都同样完整，**缺档不等于零**。国家集训队严格依据已收录名单，不用决赛前 N 名替代；同名跨科选手也不会未经确认自动合并。

## 选择接入方式

| 方式 | 适合场景 | 地址或命令 |
| --- | --- | --- |
| 远程 MCP | 客户端支持 Streamable HTTP 和私有请求头 | `https://aosaiqunxing.com/mcp` |
| 本地 MCP | 客户端支持 stdio MCP | 运行本仓库的 Node.js 接入程序 |
| Agent Skill | Agent 支持 `SKILL.md` | 安装 [`skill/aosaiqunxing`](./skill/aosaiqunxing) |

三种方式均使用网站账号的个人 API Key。请先在[连接群星](https://aosaiqunxing.com/#connect)页面登录并复制专属连接信息。不要把密钥提交到 GitHub、写进公开 Skill 或分享截图。

### 远程 MCP

服务地址为 `https://aosaiqunxing.com/mcp`，请求头为 `Authorization: Bearer <个人 API Key>`。网站的“复制连接说明”会生成已含个人密钥的完整配置。

### 本地 MCP

需要 Node.js 20 或更新版本：

```sh
git clone https://github.com/sunjun333/aosaiqunxing-mcp.git
cd aosaiqunxing-mcp
npm install
```

在 MCP 客户端的本机私有环境中设置 `AOSAIQUNXING_API_KEY`，再添加 stdio 服务端：

```json
{
  "mcpServers": {
    "aosaiqunxing": {
      "command": "node",
      "args": ["/absolute/path/to/aosaiqunxing-mcp/bin/aosaiqunxing-mcp.mjs"],
      "env": {"AOSAIQUNXING_API_KEY": "<仅存于本机私有配置的个人密钥>"}
    }
  }
}
```

### Agent Skill

使用 Skills CLI 安装（按提示选择 Agent）：

```sh
npx skills add sunjun333/aosaiqunxing-mcp --skill aosaiqunxing
```

也可以手动复制 [`skill/aosaiqunxing`](./skill/aosaiqunxing) 文件夹。Skill 会优先调用已连接的 `aosaiqunxing` MCP；安装 Skill 不会自动取得 API Key，也不会代替 MCP 连接。

## 工具

| 工具 | 用途 |
| --- | --- |
| `describe_data` | 收录范围、统计口径和重要缺口 |
| `check_coverage` | 指定学科、年份、阶段的覆盖情况 |
| `get_honors_overview` | 五科总体荣誉与科目对比 |
| `rank_regions` / `rank_schools` | 省份和学校排行 |
| `get_region_profile` / `get_school_profile` | 省份和学校历史档案 |
| `find_students` / `get_student_profile` | 学生检索与逐年履历 |
| `query_awards` | 按学科、年份、阶段、奖项等查询记录 |

工具定义由远程服务实时返回。MCP 只提供结构化只读查询，不开放任意 SQL 或全库批量导出。

## 数据与隐私边界

- 本仓库不包含竞赛数据库、网站源码、用户账号或 API Key。
- 所有注册用户可通过数据服务查询已收录的完整姓名，但不能读取其他用户的账号信息。
- 每个账号有每日调用额度；服务端保留频率控制与密钥撤销能力。
- 官方来源与整理来源会分别标注；能提供原始文件链接时，Agent 应交给用户核验。

## 开发与测试

```sh
npm install
npm test
```

## 许可证

接入程序与 Skill 使用 [MIT License](./LICENSE)。线上数据、官方文件及第三方来源不因本仓库开源而改变其权利归属。

