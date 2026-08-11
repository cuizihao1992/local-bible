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
- `GET /api/audio?book=1&chapter=2`：当前章节音频列表
- `GET /api/dictionaries`：辞典/百科库列表
- `GET /api/dictionary/search?source=证主圣经百科全书.db&q=膏`：搜索词条
- `GET /api/dictionary/image?source=简明圣经史地图解.db&name=总图一.png`：读取辞典图片
- `GET /api/diagnostics`：本地数据兼容性检查
- `GET /api/user/export`：导出个人收藏、笔记和历史
- `POST /api/user/import`：导入个人收藏、笔记和历史

## 开发检查

```powershell
npm run check
npm test
```

## 当前状态

当前是 `V1.0` 稳定本地版。版本计划见 [ROADMAP.md](./ROADMAP.md)。

## 数据说明

个人数据保存到：

```text
data\user.sqlite
```

这个文件不会提交到 Git。可以在页面设置区导出/导入个人数据。

## 已支持

- 多版本圣经阅读
- 多版本对照
- 快速定位和关键词搜索
- 注释联动
- Strong 编号和原文释义
- 收藏、高亮、笔记、标签
- 章节音频播放
- 辞典/百科搜索和图片显示
- 夜间模式、字号、行距、复制、快捷键
- 本地诊断、导入/导出
- 经文右键/长按操作菜单
- 移动端底部导航
- 收藏与笔记管理面板
- 搜索结果关键词高亮
- API smoke test
