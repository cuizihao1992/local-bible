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

## 桌面版 exe

打包 Windows 便携版：

```powershell
npm run dist:win
```

生成文件：

```text
dist\本地圣经 1.6.0.exe
```

桌面版仍默认读取：

```text
D:\bibleDownload
```

桌面版个人数据保存到 Windows 用户数据目录，避免便携版临时目录导致收藏和笔记丢失。

## Android 离线 APK

构建 Android 离线 release APK：

```powershell
npm run dist:android
```

生成文件：

```text
dist\android\local-bible-reader-offline-1.9.37-release.apk
```

如需调试包，可以运行：

```powershell
npm run dist:android:debug
```

当前 Android 离线版默认只内置 4 个常用译本：`和合本.db`、`和合本修订版.db`、`KJV.db`、`WEB.db`，安装包更小。其他译本和注释库会构建成 GitHub Release 数据包，APK 里可在“高级设置 -> 离线资源”按需下载到手机本地。安装后，APK 不读取电脑 D 盘、不依赖电脑后台服务。

构建可选离线资源包：

```powershell
npm run dist:android:packages
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
- `GET/POST /api/user/progress`：章节阅读进度
- `GET /api/audio?book=1&chapter=2`：当前章节音频列表
- `GET /api/dictionaries`：辞典/百科库列表
- `GET /api/dictionary/search?source=证主圣经百科全书.db&q=膏`：搜索词条
- `GET /api/dictionary/image?source=简明圣经史地图解.db&name=总图一.png`：读取辞典图片
- `GET /api/diagnostics`：本地数据兼容性检查
- `GET /api/user/export`：导出个人收藏、笔记、历史和阅读进度
- `POST /api/user/import`：导入个人收藏、笔记、历史和阅读进度

## 开发检查

```powershell
npm run check
npm test
```

## 当前状态

当前是 `V1.9.37` Android 轻量 APK + 按需资源包版。版本计划见 [ROADMAP.md](./ROADMAP.md)，优化体检见 [OPTIMIZATION.md](./OPTIMIZATION.md)。

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
- 夜间模式、配色预设、字号、行距、复制、快捷键
- 本地诊断、导入/导出
- 经文右键/长按操作菜单
- 经文正文不再常驻显示每节操作按钮
- 鼠标多选跨节经文后可一键复制规范格式
- 左侧面板默认只展示译本、书卷、章节，高级功能折叠显示
- Electron Windows 便携版 exe
- Android 离线 release APK
- APK 内置经文、前端静态资源和应用图标，安装后独立运行
- Android APK 内置常用译本，其他译本和注释库可按需从 GitHub Release 下载
- 前端错误处理、选区性能、桌面单实例等稳定性优化
- 移动端底部导航
- 手机端顶部栏、侧栏、底部安全区适配
- 收藏与笔记管理面板
- 搜索结果关键词高亮
- 阅读进度、已读章节和继续未读章节
- API smoke test


## AI ???????

- DeepSeek ???????/???? `deepseek-v4-flash`??????????????????????? `deepseek-v4-pro`?
- ?? MiMo ?????? `mimo-v2.5`????????? `mimo-v2.5-pro`?
- ?????OpenAI ?? `gpt-4o-mini-transcribe`??????? `gpt-4o-transcribe`??? MiMo ASR ???? `mimo-v2.5-asr`?
- ??????????????????????????/????????????????????????????????????AI ??????? AI??????????? Key ?????
- ?????????????? Android???????????? AI ??????????????????
