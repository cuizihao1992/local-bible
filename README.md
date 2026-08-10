# 本地圣经阅读器

一个本地运行的圣经阅读网页应用。后台使用 Node.js，直接读取 `D:\bibleDownload` 里的 SQLite 圣经数据库；前端提供译本、书卷、章节选择和逐节阅读。

## 运行

```powershell
npm start
```

默认地址：

```text
http://127.0.0.1:8765
```

## 配置

默认数据目录是：

```text
D:\bibleDownload
```

可以用环境变量覆盖：

```powershell
$env:BIBLE_DATA_ROOT="D:\bibleDownload"
$env:BIBLE_READER_HOST="127.0.0.1"
$env:BIBLE_READER_PORT="8765"
npm start
```

局域网访问时可以把 `BIBLE_READER_HOST` 设为 `0.0.0.0`，然后用电脑的局域网 IP 访问。

## API

- `GET /api/health`：服务状态
- `GET /api/versions`：译本列表
- `GET /api/books?version=和合本.db`：书卷列表
- `GET /api/chapter?version=和合本.db&book=1&chapter=1`：章节经文
- `GET /api/chapters?version=和合本.db&version=KJV.db&book=1&chapter=1`：多版本章节经文
- `GET /api/search?version=和合本.db&q=永生&scope=all`：当前译本关键词搜索
- `GET /api/commentaries`：注释源列表
- `GET /api/commentary?source=信望爱注释.db&book=43&chapter=3`：当前章节注释
- `GET /api/strong?code=H7225`：Strong 原文编号释义
- `GET /api/user/marks?version=和合本.db&book=1&chapter=1`：章节收藏/高亮/笔记
- `POST /api/user/mark`：保存经文收藏/高亮/笔记/标签
- `GET/POST /api/user/history`：最近阅读位置

## 开发检查

```powershell
npm run check
```

## 当前状态

当前是 `V0.6` 笔记、收藏、高亮版。后续规划见 [ROADMAP.md](./ROADMAP.md)。
