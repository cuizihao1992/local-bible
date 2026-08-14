const state = {
  versions: [],
  books: [],
  commentaries: [],
  dictionaries: [],
  packages: [],
  marks: new Map(),
  progress: null,
  version: "",
  compareVersions: [],
  commentary: "",
  showStrong: false,
  audioAutoNext: false,
  theme: "light",
  palette: "classic",
  scriptPreference: "auto",
  fontSize: 20,
  lineHeight: 2.05,
  book: 1,
  chapter: 1,
  targetVerse: null,
  activeVerse: null,
  aiProvider: "deepseek",
  deepseekKey: "",
  deepseekModel: "deepseek-v4-flash",
  deepseekThinking: false,
  mimoKey: "",
  mimoKeyType: "standard",
  mimoBaseUrl: "https://api.xiaomimimo.com/v1",
  mimoModel: "mimo-v2.5",
  speechProvider: "system",
  openaiKey: "",
  speechModel: "gpt-4o-mini-transcribe",
  aiResponseStyle: "concise",
  recentBooks: [],
};
const STORAGE_KEY = "localBibleReaderState";

const versionSelect = document.querySelector("#versionSelect");
const compareVersions = document.querySelector("#compareVersions");
const bookSelect = document.querySelector("#bookSelect");
const bookSearchInput = document.querySelector("#bookSearchInput");
const bookFilterTabs = document.querySelector("#bookFilterTabs");
const bookGrid = document.querySelector("#bookGrid");
const chapterGrid = document.querySelector("#chapterGrid");
const chapterPanelTitle = document.querySelector("#chapterPanelTitle");
const chapterPanelMeta = document.querySelector("#chapterPanelMeta");
const chapterTitleBtn = document.querySelector("#chapterTitleBtn");
const chapterTitle = document.querySelector("#chapterTitle");
const versionTitle = document.querySelector("#versionTitle");
const bookPickerPanel = document.querySelector("#bookPickerPanel");
const bookPickerCurrent = document.querySelector("#bookPickerCurrent");
const closeBookPickerBtn = document.querySelector("#closeBookPickerBtn");
const progressSummary = document.querySelector("#progressSummary");
const content = document.querySelector("#content");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const menuBtn = document.querySelector("#menuBtn");
const closeSidebarBtn = document.querySelector("#closeSidebarBtn");
const sidebarTabs = document.querySelector(".sidebarTabs");
const readerSettingsBtn = document.querySelector("#readerSettingsBtn");
const readerSettingsPanel = document.querySelector("#readerSettingsPanel");
const closeReaderSettingsBtn = document.querySelector("#closeReaderSettingsBtn");
const overlay = document.querySelector("#overlay");
const quickForm = document.querySelector("#quickForm");
const quickInput = document.querySelector("#quickInput");
const searchScope = document.querySelector("#searchScope");
const searchPanel = document.querySelector("#searchPanel");
const searchSummary = document.querySelector("#searchSummary");
const searchResults = document.querySelector("#searchResults");
const closeSearchBtn = document.querySelector("#closeSearchBtn");
const commentarySelect = document.querySelector("#commentarySelect");
const commentaryHint = document.querySelector("#commentaryHint");
const commentaryContent = document.querySelector("#commentaryContent");
const strongToggle = document.querySelector("#strongToggle");
const strongPanel = document.querySelector("#strongPanel");
const strongTitle = document.querySelector("#strongTitle");
const strongContent = document.querySelector("#strongContent");
const closeStrongBtn = document.querySelector("#closeStrongBtn");
const audioPanel = document.querySelector("#audioPanel");
const audioAutoNext = document.querySelector("#audioAutoNext");
const dictionarySelect = document.querySelector("#dictionarySelect");
const dictionaryInput = document.querySelector("#dictionaryInput");
const dictionaryBtn = document.querySelector("#dictionaryBtn");
const dictionaryHint = document.querySelector("#dictionaryHint");
const dictionaryPanel = document.querySelector("#dictionaryPanel");
const dictionarySummary = document.querySelector("#dictionarySummary");
const dictionaryResults = document.querySelector("#dictionaryResults");
const closeDictionaryBtn = document.querySelector("#closeDictionaryBtn");
const aiResultPanel = document.querySelector("#aiResultPanel");
const aiResultTitle = document.querySelector("#aiResultTitle");
const aiResultContent = document.querySelector("#aiResultContent");
const closeAiResultBtn = document.querySelector("#closeAiResultBtn");
const themeSelect = document.querySelector("#themeSelect");
const paletteSelect = document.querySelector("#paletteSelect");
const scriptPreference = document.querySelector("#scriptPreference");
const fontSizeRange = document.querySelector("#fontSizeRange");
const lineHeightRange = document.querySelector("#lineHeightRange");
const fontSizeValue = document.querySelector("#fontSizeValue");
const lineHeightValue = document.querySelector("#lineHeightValue");
const exportDataBtn = document.querySelector("#exportDataBtn");
const importDataBtn = document.querySelector("#importDataBtn");
const importDataFile = document.querySelector("#importDataFile");
const userDataHint = document.querySelector("#userDataHint");
const packageList = document.querySelector("#packageList");
const packageHint = document.querySelector("#packageHint");
const downloadProgress = document.querySelector("#downloadProgress");
const downloadProgressText = document.querySelector("#downloadProgressText");
const downloadProgressValue = document.querySelector("#downloadProgressValue");
const downloadProgressBar = document.querySelector("#downloadProgressBar");
const clearDownloadCacheBtn = document.querySelector("#clearDownloadCacheBtn");
const updateStatus = document.querySelector("#updateStatus");
const checkUpdateBtn = document.querySelector("#checkUpdateBtn");
const downloadLatestApkBtn = document.querySelector("#downloadLatestApkBtn");
const copyApkLinkBtn = document.querySelector("#copyApkLinkBtn");
const showReleaseNotesBtn = document.querySelector("#showReleaseNotesBtn");
const aiProviderSelect = document.querySelector("#aiProviderSelect");
const deepseekKeyInput = document.querySelector("#deepseekKeyInput");
const deepseekModelSelect = document.querySelector("#deepseekModelSelect");
const deepseekThinkingToggle = document.querySelector("#deepseekThinkingToggle");
const mimoKeyInput = document.querySelector("#mimoKeyInput");
const mimoKeyTypeSelect = document.querySelector("#mimoKeyTypeSelect");
const mimoBaseUrlInput = document.querySelector("#mimoBaseUrlInput");
const mimoModelSelect = document.querySelector("#mimoModelSelect");
const speechProviderSelect = document.querySelector("#speechProviderSelect");
const openaiKeyInput = document.querySelector("#openaiKeyInput");
const speechModelSelect = document.querySelector("#speechModelSelect");
const aiResponseStyleSelect = document.querySelector("#aiResponseStyleSelect");
const saveAiConfigBtn = document.querySelector("#saveAiConfigBtn");
const testAiConfigBtn = document.querySelector("#testAiConfigBtn");
const showAiUsesBtn = document.querySelector("#showAiUsesBtn");
const aiConfigHint = document.querySelector("#aiConfigHint");
const dashboardPanel = document.querySelector("#dashboardPanel");
const mobileStatusPanel = document.querySelector("#mobileStatusPanel");
const verseMenu = document.querySelector("#verseMenu");
const verseMenuTitle = document.querySelector("#verseMenuTitle");
const selectionBar = document.querySelector("#selectionBar");
const selectionSummary = document.querySelector("#selectionSummary");
const copyFormatSelect = document.querySelector("#copyFormatSelect");
const copySelectionBtn = document.querySelector("#copySelectionBtn");
const cancelSelectionBtn = document.querySelector("#cancelSelectionBtn");
const mobilePrevBtn = document.querySelector("#mobilePrevBtn");
const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const voiceBtn = document.querySelector("#voiceBtn");
const mobileMarkReadBtn = document.querySelector("#mobileMarkReadBtn");
const mobileMyBtn = document.querySelector("#mobileMyBtn");
const mobileNextBtn = document.querySelector("#mobileNextBtn");
const myPanel = document.querySelector("#myPanel");
const myResults = document.querySelector("#myResults");
const myTagFilter = document.querySelector("#myTagFilter");
const closeMyPanelBtn = document.querySelector("#closeMyPanelBtn");
const releaseNotesPanel = document.querySelector("#releaseNotesPanel");
const releaseNotesContent = document.querySelector("#releaseNotesContent");
const closeReleaseNotesBtn = document.querySelector("#closeReleaseNotesBtn");
let longPressTimer = null;
let swipeState = null;
let touchFallbackState = null;
let lastScrollY = 0;
let scrollFrame = 0;
let selectedVerseNumbers = [];
let verseSelectionMode = false;
let selectionFrame = 0;
let lastUpdateInfo = null;
let bookFilter = "all";
let downloadProgressTimer = null;
let latestApkAsset = null;
let statusTimer = null;
let chapterLoadToken = 0;
let progressSaving = false;
let importInProgress = false;
let packageInstallInProgress = false;
let updateCheckInProgress = false;
let apkDownloadInProgress = false;
let searchState = { query: "", scope: "all", book: 1, results: [], nextOffset: 0, hasMore: false, loading: false };
let searchRequestToken = 0;
let dictionaryRequestToken = 0;
let strongRequestToken = 0;
let aiRequestToken = 0;
let myPanelRequestToken = 0;
const APP_VERSION = "1.9.25";
const RELEASE_NOTES = [
  {
    version: "1.9.25",
    date: "2026-08-14",
    items: ["新增统一内容面板关闭逻辑，避免搜索、词典、Strong、AI、我的、更新说明互相叠加", "打开书卷选择、阅读设置或侧栏时自动收起其它内容面板", "打开搜索、词典、Strong、我的、AI 结果时保持单一内容面板视图", "smoke test 增加内容面板互斥断言"],
  },
  {
    version: "1.9.24",
    date: "2026-08-14",
    items: ["阅读区滑动切章抽出统一手势判断，减少后续交互回归风险", "旧 WebView 或旧平板缺少 PointerEvent 时，使用 touch 事件兜底支持左右滑切章", "长按经文菜单在旧触摸环境中同样可触发，并在移动时自动取消", "smoke test 增加触摸兜底结构断言"],
  },
  {
    version: "1.9.23",
    date: "2026-08-14",
    items: ["确认内置和合本、和合本修订版包含真实 Titles 小标题数据", "正文小标题改为带节号的醒目段落标题，手机端不再被左侧缩进弱化", "搜索结果改为分页加载，避免一次性返回过多结果", "Android 离线接口同步支持搜索分页，并加入 APK 校验"],
  },
  {
    version: "1.9.22",
    date: "2026-08-14",
    items: ["底部上一章/下一章按钮同步边界禁用状态", "标记已读和导入数据增加防重复提交", "资源包安装、更新检查、APK 下载增加忙碌保护", "下载轮询异常时自动释放忙碌状态"],
  },
  {
    version: "1.9.21",
    date: "2026-08-14",
    items: ["连续滑动或连续点下一章时忽略旧章节请求", "经文、笔记标记、进度、注释、音频使用同一章节快照加载", "遮罩点击统一走返回关闭逻辑", "轻提示增加辅助功能播报属性", "语音按钮状态点改为 CSS 绘制"],
  },
  {
    version: "1.9.20",
    date: "2026-08-14",
    items: ["滑到第一章或最后一章时显示边界提示", "复制经文、复制 APK 链接、清理下载缓存增加轻提示", "跳转经文时自动收起搜索、我的、词典、原文、AI 与经文菜单", "切章、切书、切版本统一清理经文级临时状态"],
  },
  {
    version: "1.9.19",
    date: "2026-08-14",
    items: ["版本列表显示当前译本小标题数量", "正文顶部增加本章小标题快捷列表", "经文小标题只使用真实 Titles 数据或已确认兜底数据", "测试固定覆盖和合本腓利门书小标题"],
  },
  {
    version: "1.9.18",
    date: "2026-08-13",
    items: ["阅读正文支持左右滑切换上一章/下一章", "菜单、弹层、多选打开时禁用滑动切章避免误触", "手机阅读下滑隐藏顶部栏和底部栏，上滑恢复", "增加旧 WebView 的 color-mix 样式兜底"],
  },
  {
    version: "1.9.17",
    date: "2026-08-13",
    items: ["后端读取经文 DB 的 Titles 小标题表", "本地网页与 Android APK 都返回真实小标题", "前端优先显示译本自带小标题，没有数据时才使用兜底标题"],
  },
  {
    version: "1.9.16",
    date: "2026-08-13",
    items: ["每一章第 1 节前都显示兜底小标题", "腓利门书、约二、约三、犹大书增加细分小标题", "没有精细标题的章节不再空白"],
  },
  {
    version: "1.9.15",
    date: "2026-08-13",
    items: ["切换上一章/下一章后自动回到章节开头", "点击书卷或章节跳转后从第一节开始显示", "新增福音书主要段落小标题", "新增创世记开篇段落小标题"],
  },
  {
    version: "1.9.14",
    date: "2026-08-13",
    items: ["菜单改为阅读/工具/数据/AI 分类", "经文长按菜单增加应用内多选", "多选复制支持带出处、纯经文和合并段落格式", "书卷选择增加最近书卷入口"],
  },
  {
    version: "1.9.13",
    date: "2026-08-13",
    items: ["APK 更新下载增加重试", "支持 Range 续传已下载部分", "下载失败提示复制链接用浏览器下载"],
  },
  {
    version: "1.9.12",
    date: "2026-08-13",
    items: ["MiMo 增加 Key 类型切换", "普通 Key 与 CodePlan/Token Plan 分别按对应地址检查", "检查 AI 显示当前 MiMo 类型和实际测试地址"],
  },
  {
    version: "1.9.11",
    date: "2026-08-13",
    items: ["MiMo Base URL 改为支持 /v1 基础地址", "自动拼接 /chat/completions", "更适配 Token Plan/CodePlan 专属 Base URL"],
  },
  {
    version: "1.9.10",
    date: "2026-08-13",
    items: ["小米 MiMo 增加 Base URL 配置", "MiMo 请求同时兼容 Authorization 与 api-key 鉴权头", "MiMo 401 错误提示补充 Key 和 Token Plan 专属地址排查"],
  },
  {
    version: "1.9.9",
    date: "2026-08-13",
    items: ["检查 AI 增加 MiMo 语音配置检查", "Android APK 接入小米 MiMo 录音上传识别", "MiMo 语音识别结果可直接用于经文跳转"],
  },
  {
    version: "1.9.8",
    date: "2026-08-12",
    items: ["版本更新区增加下载最新 APK 按钮", "支持复制最新 APK 下载链接", "非 Android 本地网页也可检查 GitHub 最新版本"],
  },
  {
    version: "1.9.7",
    date: "2026-08-12",
    items: ["经文右键/长按菜单增加 AI 解释、上下文和笔记", "新增 AI 查经结果面板", "AI 结果支持复制"],
  },
  {
    version: "1.9.6",
    date: "2026-08-12",
    items: ["DeepSeek 模型更新为 v4-flash/v4-pro", "AI 配置页补充语音识别模型建议", "明确 AI 功能入口与云端语音接入状态"],
  },
  {
    version: "1.9.5",
    date: "2026-08-12",
    items: ["菜单打开时 Android 系统返回手势只关闭菜单", "增加检查更新、下载更新和版本更新说明", "阅读设置迁移到右上角按钮，菜单关闭按钮固定显示"],
  },
  {
    version: "1.9.0",
    date: "2026-08-12",
    items: ["Android APK 改为轻量离线包", "常用译本内置，其他译本和注释支持按需下载", "增加语音跳转、移动端菜单与高亮优化"],
  },
];

const SECTION_HEADINGS = {
  "1:1": { 1: "创造天地", 3: "神说，要有光", 6: "空气以上和以下的水", 9: "旱地和海", 14: "光体管理昼夜", 20: "水中和空中的活物", 24: "地上的活物", 26: "照神形像造人" },
  "1:2": { 1: "第七日安息", 4: "伊甸园", 18: "造女人" },
  "1:3": { 1: "蛇引诱人", 8: "人躲避神", 14: "咒诅与应许", 22: "逐出伊甸园" },
  "40:1": { 1: "耶稣基督的家谱", 18: "耶稣基督降生" },
  "40:2": { 1: "博士朝拜", 13: "逃往埃及", 16: "希律屠杀男孩", 19: "回到拿撒勒" },
  "40:3": { 1: "施洗约翰传道", 13: "耶稣受洗" },
  "40:4": { 1: "耶稣受试探", 12: "开始在加利利传道", 18: "呼召门徒", 23: "医病赶鬼" },
  "40:5": { 1: "登山宝训", 3: "八福", 13: "盐和光", 17: "成全律法", 21: "论仇恨", 27: "论奸淫", 33: "论起誓", 38: "论报复", 43: "爱仇敌" },
  "40:6": { 1: "论施舍", 5: "论祷告", 9: "主祷文", 16: "论禁食", 19: "天上的财宝", 25: "不要忧虑" },
  "40:7": { 1: "不要论断", 7: "祈求寻找叩门", 13: "窄门", 24: "两种根基" },
  "40:13": { 1: "撒种的比喻", 24: "稗子的比喻", 31: "芥菜种和面酵", 44: "藏宝与寻珠", 53: "拿撒勒人厌弃耶稣" },
  "40:26": { 1: "谋害耶稣", 17: "最后的晚餐", 36: "客西马尼园祷告", 47: "耶稣被捕", 57: "受审", 69: "彼得不认主" },
  "40:27": { 1: "耶稣交给彼拉多", 27: "兵丁戏弄耶稣", 32: "钉十字架", 57: "安葬耶稣" },
  "40:28": { 1: "耶稣复活", 16: "大使命" },
  "41:1": { 1: "福音的起头", 9: "耶稣受洗", 12: "受试探", 16: "呼召门徒", 21: "在会堂赶鬼", 40: "洁净麻风病人" },
  "41:4": { 1: "撒种的比喻", 21: "灯和量器", 26: "种子生长", 30: "芥菜种", 35: "平静风浪" },
  "41:8": { 27: "彼得认耶稣为基督", 31: "预言受难", 34: "背十字架跟从主" },
  "41:15": { 1: "耶稣受审", 16: "兵丁戏弄耶稣", 21: "钉十字架", 42: "安葬耶稣" },
  "41:16": { 1: "耶稣复活", 9: "复活后的显现" },
  "42:1": { 1: "写作缘起", 5: "预告约翰出生", 26: "预告耶稣降生", 46: "马利亚尊主颂", 57: "施洗约翰出生" },
  "42:2": { 1: "耶稣降生", 8: "牧羊人朝见", 21: "献与主", 41: "少年耶稣在圣殿" },
  "42:10": { 25: "好撒玛利亚人的比喻", 38: "马大和马利亚" },
  "42:15": { 1: "失羊的比喻", 8: "失钱的比喻", 11: "浪子的比喻" },
  "42:22": { 7: "最后的晚餐", 39: "橄榄山祷告", 47: "耶稣被捕", 54: "彼得不认主", 66: "公会审问" },
  "42:23": { 1: "耶稣受审", 26: "钉十字架", 50: "安葬耶稣" },
  "42:24": { 1: "耶稣复活", 13: "以马忤斯路上", 36: "向门徒显现", 50: "耶稣升天" },
  "43:1": { 1: "道成肉身", 19: "施洗约翰的见证", 35: "最初的门徒" },
  "43:2": { 1: "迦拿婚筵", 13: "洁净圣殿" },
  "43:3": { 1: "耶稣与尼哥底母", 16: "神爱世人", 22: "约翰为耶稣作见证" },
  "43:4": { 1: "耶稣与撒玛利亚妇人", 43: "医治大臣的儿子" },
  "43:6": { 1: "五饼二鱼", 16: "耶稣履海", 22: "生命的粮" },
  "43:10": { 1: "好牧人", 22: "修殿节的争论" },
  "43:11": { 1: "拉撒路复活", 45: "公会商议杀害耶稣" },
  "43:13": { 1: "为门徒洗脚", 21: "预言被卖", 31: "赐下新命令" },
  "43:14": { 1: "耶稣是道路、真理、生命", 15: "应许圣灵" },
  "43:15": { 1: "真葡萄树", 18: "世人恨门徒" },
  "43:17": { 1: "耶稣的祷告" },
  "43:18": { 1: "耶稣被捕", 12: "受审", 25: "彼得不认主", 28: "彼拉多审问" },
  "43:19": { 1: "钉十字架", 28: "耶稣死了", 38: "安葬耶稣" },
  "43:20": { 1: "耶稣复活", 19: "向门徒显现", 24: "多马信主", 30: "本书目的" },
  "43:21": { 1: "提比哩亚海边显现", 15: "耶稣与彼得", 20: "耶稣所爱的门徒" },
  "57:1": { 1: "问安与感恩", 8: "为阿尼西母求情", 17: "接纳与盼望", 23: "最后问安" },
  "63:1": { 1: "问安与真理中的爱", 4: "遵行爱的命令", 7: "防备迷惑人的人", 12: "最后问安" },
  "64:1": { 1: "问安", 5: "接待传道人", 9: "丢特腓与低米丢", 13: "最后问安" },
  "65:1": { 1: "问安", 3: "为真道竭力争辩", 17: "保守自己在神爱中", 24: "颂赞" },
};

function chapterTitleMap(chapter) {
  const fromDb = Object.fromEntries(
    (chapter.titles || [])
      .map((title) => [Number(title.verse), String(title.text || "").trim()])
      .filter(([verse, text]) => verse > 0 && text),
  );
  const fallback = SECTION_HEADINGS[`${state.book}:${state.chapter}`] || {};
  return Object.keys(fromDb).length ? fromDb : fallback;
}

function renderChapterTitleSummary(headings) {
  const items = Object.entries(headings)
    .map(([verse, title]) => ({ verse: Number(verse), title: String(title || "").trim() }))
    .filter((item) => item.verse > 0 && item.title)
    .sort((a, b) => a.verse - b.verse);
  if (!items.length) return "";
  return `
    <section class="chapterTitleSummary" aria-label="本章小标题">
      <div class="chapterTitleSummaryLabel">本章小标题</div>
      <div class="chapterTitlePills">
        ${items
          .map(
            (item) =>
              `<a class="chapterTitlePill" href="#v${item.verse}"><span>${item.verse}</span>${escapeHtml(item.title)}</a>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

async function readResponse(response) {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }
  if (!response.ok) {
    throw new Error(data?.error || `请求失败：${response.status}`);
  }
  return data || {};
}

async function api(path) {
  if (window.AndroidBibleApi?.getJson) {
    const data = JSON.parse(window.AndroidBibleApi.getJson(path));
    if (data.error) throw new Error(data.error);
    return data;
  }
  const response = await fetch(path);
  return readResponse(response);
}

function currentBook() {
  return state.books.find((book) => book.id === state.book) || state.books[0];
}

function currentVersion() {
  return state.versions.find((version) => version.id === state.version);
}

function bookAliases() {
  const aliases = new Map();
  state.books.forEach((book) => {
    [book.shortName, book.longName, book.longName?.replace(/记$/, ""), book.longName?.replace(/书$/, "")].forEach(
      (name) => {
        if (name) aliases.set(name, book);
      },
    );
  });
  return [...aliases.entries()].sort((a, b) => b[0].length - a[0].length);
}

function normalizeVoiceText(input) {
  return String(input || "")
    .replace(/[，。？！,.?!]/g, "")
    .replace(/跳转到|转到|打开|查找|请读|读到|经文/g, "")
    .replace(/第/g, "")
    .replace(/\s+/g, "");
}

function chineseNumberToInt(input) {
  const raw = String(input || "");
  if (/^\d+$/.test(raw)) return Number(raw);
  const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (!/[十百]/.test(raw)) {
    return raw.split("").reduce((value, char) => value * 10 + (digits[char] ?? 0), 0);
  }
  let total = 0;
  let current = 0;
  for (const char of raw) {
    if (char === "百") {
      total += (current || 1) * 100;
      current = 0;
    } else if (char === "十") {
      total += (current || 1) * 10;
      current = 0;
    } else if (Object.prototype.hasOwnProperty.call(digits, char)) {
      current = digits[char];
    }
  }
  return total + current;
}

function parseSpokenReference(input) {
  const value = normalizeVoiceText(input);
  if (!value) return null;
  const numberPattern = "([0-9零〇一二两三四五六七八九十百]+)";
  const match = value.match(new RegExp(`^(.+?)${numberPattern}章(?:${numberPattern}节?)?$`));
  if (!match) return parseReference(value);
  const rawBook = match[1];
  const found = bookAliases().find(([alias, book]) => rawBook === alias || rawBook.endsWith(alias) || book.longName === rawBook);
  if (!found) return null;
  return {
    book: found[1].id,
    chapter: chineseNumberToInt(match[2]),
    verse: match[3] ? chineseNumberToInt(match[3]) : null,
  };
}

function versionLabel(versionId) {
  const version = state.versions.find((item) => item.id === versionId);
  return version?.shortName || version?.name || versionId;
}

function setLoading(text = "加载中") {
  content.innerHTML = `<div class="loading">${escapeHtml(text)}</div>`;
}

function setError(error) {
  const message = error.message || String(error);
  content.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
  showStatus(message, "error");
}

function showStatus(message, tone = "info") {
  if (!mobileStatusPanel || !message) return;
  mobileStatusPanel.textContent = message;
  mobileStatusPanel.dataset.tone = tone;
  mobileStatusPanel.hidden = false;
  if (statusTimer) window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(
    () => {
      mobileStatusPanel.hidden = true;
    },
    tone === "error" ? 3600 : 1800,
  );
}

function postJson(path, payload) {
  if (window.AndroidBibleApi?.postJson) {
    const data = JSON.parse(window.AndroidBibleApi.postJson(path, JSON.stringify(payload)));
    if (data.error) throw new Error(data.error);
    return Promise.resolve(data);
  }
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(readResponse);
}

function isAndroidOffline() {
  return !!window.AndroidBibleApi;
}

function compareAppVersions(left, right) {
  const a = String(left || "").replace(/^v/i, "").split(".").map((part) => Number(part) || 0);
  const b = String(right || "").replace(/^v/i, "").split(".").map((part) => Number(part) || 0);
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    if ((a[index] || 0) > (b[index] || 0)) return 1;
    if ((a[index] || 0) < (b[index] || 0)) return -1;
  }
  return 0;
}

function apkAssetFromRelease(release) {
  return (release.assets || []).find((asset) => /\.apk$/i.test(asset.name || ""));
}

async function fetchLatestRelease() {
  if (window.AndroidUpdateApi?.checkLatest) {
    const info = JSON.parse(window.AndroidUpdateApi.checkLatest());
    if (info.error) throw new Error(info.error);
    return info;
  }
  const response = await fetch("https://api.github.com/repos/cuizihao1992/local-bible/releases/latest", {
    headers: { Accept: "application/vnd.github+json" },
  });
  const release = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(release.message || `GitHub Release 请求失败：${response.status}`);
  return {
    tagName: release.tag_name,
    version: String(release.tag_name || "").replace(/^v/i, ""),
    name: release.name,
    body: release.body,
    publishedAt: release.published_at,
    assets: (release.assets || []).map((asset) => ({
      name: asset.name,
      size: asset.size,
      url: asset.browser_download_url,
    })),
  };
}

function closeSidebar() {
  document.body.classList.remove("sidebarOpen");
}

function showSidebarPanel(name = "reading") {
  document.querySelectorAll("[data-sidebar-target]").forEach((button) => {
    button.classList.toggle("active", button.dataset.sidebarTarget === name);
  });
  document.querySelectorAll("[data-sidebar-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.sidebarPanel === name);
  });
}

function closeContentPanels() {
  closeSearch();
  closeStrong();
  closeDictionary();
  closeAiResult();
  closeMyPanel();
  closeReleaseNotes();
}

function openSidebar(panel = "reading") {
  toggleBookPicker(false);
  toggleReaderSettings(false);
  closeContentPanels();
  closeVerseMenu();
  closeSelectionBar();
  showSidebarPanel(panel);
  document.body.classList.add("sidebarOpen");
}

function toggleBookPicker(show = bookPickerPanel.hidden) {
  bookPickerPanel.hidden = !show;
  chapterTitleBtn.setAttribute("aria-expanded", show ? "true" : "false");
  if (show) {
    closeSidebar();
    toggleReaderSettings(false);
    closeContentPanels();
    closeVerseMenu();
    closeSelectionBar();
    renderBooks();
    renderChapterGrid();
  }
}

function closeTopPanels() {
  toggleBookPicker(false);
  toggleReaderSettings(false);
  closeContentPanels();
  closeVerseMenu();
  closeSelectionBar();
}

function resetVerseInteraction(targetVerse = null) {
  state.targetVerse = targetVerse;
  state.activeVerse = null;
  closeVerseMenu();
  closeSelectionBar();
  showReadingChrome();
}

function isFreshChapterLoad(token) {
  return token == null || token === chapterLoadToken;
}

function hasBlockingOverlayOpen() {
  return (
    document.body.classList.contains("sidebarOpen") ||
    !bookPickerPanel.hidden ||
    !readerSettingsPanel.hidden ||
    !searchPanel.hidden ||
    !strongPanel.hidden ||
    !dictionaryPanel.hidden ||
    !aiResultPanel.hidden ||
    !myPanel.hidden ||
    !releaseNotesPanel.hidden ||
    !verseMenu.hidden ||
    !selectionBar.hidden ||
    verseSelectionMode
  );
}

function showReadingChrome() {
  document.body.classList.remove("readingChromeHidden");
}

function updateReadingChromeVisibility() {
  scrollFrame = 0;
  if (window.innerWidth > 860 || hasBlockingOverlayOpen()) {
    showReadingChrome();
    lastScrollY = window.scrollY;
    return;
  }
  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;
  if (currentY < 120 || delta < -10) {
    showReadingChrome();
  } else if (delta > 12) {
    document.body.classList.add("readingChromeHidden");
  }
  lastScrollY = currentY;
}

function isInteractiveTarget(target) {
  return !!target.closest("button, input, textarea, select, a, audio, .verseMenu, .selectionBar, .noteEditor, .strongBtn, .verseTool");
}

function cancelLongPress() {
  if (!longPressTimer) return;
  clearTimeout(longPressTimer);
  longPressTimer = null;
}

function startSwipeGesture(id, x, y, target) {
  if (hasBlockingOverlayOpen() || isInteractiveTarget(target)) return null;
  return {
    id,
    x,
    y,
    time: Date.now(),
    moved: false,
  };
}

function updateSwipeGesture(gesture, x, y) {
  if (!gesture) return;
  const dx = Math.abs(x - gesture.x);
  const dy = Math.abs(y - gesture.y);
  if (dx > 10 || dy > 10) gesture.moved = true;
  if (longPressTimer && (dx > 8 || dy > 8)) cancelLongPress();
}

function finishSwipeGesture(gesture, x, y) {
  if (!gesture) return;
  const dx = x - gesture.x;
  const dy = y - gesture.y;
  const elapsed = Date.now() - gesture.time;
  const horizontal = Math.abs(dx) >= 76 && Math.abs(dx) > Math.abs(dy) * 1.45;
  if (horizontal && elapsed < 900 && !hasBlockingOverlayOpen()) {
    moveChapter(dx < 0 ? 1 : -1);
  }
}

function findTouchById(touches, id) {
  for (let index = 0; index < touches.length; index += 1) {
    if (touches[index].identifier === id) return touches[index];
  }
  return null;
}

function handleBackIntent() {
  if (!verseMenu.hidden) {
    closeVerseMenu();
    return true;
  }
  if (!selectionBar.hidden) {
    closeSelectionBar();
    return true;
  }
  if (document.body.classList.contains("sidebarOpen")) {
    closeSidebar();
    return true;
  }
  if (!readerSettingsPanel.hidden) {
    toggleReaderSettings(false);
    return true;
  }
  if (!bookPickerPanel.hidden) {
    toggleBookPicker(false);
    return true;
  }
  if (!releaseNotesPanel.hidden) {
    closeReleaseNotes();
    return true;
  }
  if (!myPanel.hidden) {
    closeMyPanel();
    return true;
  }
  if (!dictionaryPanel.hidden) {
    closeDictionary();
    return true;
  }
  if (!strongPanel.hidden) {
    closeStrong();
    return true;
  }
  if (!searchPanel.hidden) {
    closeSearch();
    return true;
  }
  return false;
}

window.handleAndroidBack = handleBackIntent;

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.version) state.version = saved.version;
    if (Array.isArray(saved.compareVersions)) {
      state.compareVersions = saved.compareVersions.filter((version) => typeof version === "string").slice(0, 3);
    }
    if (saved.commentary) state.commentary = saved.commentary;
    state.showStrong = !!saved.showStrong;
    state.audioAutoNext = !!saved.audioAutoNext;
    if (saved.theme) state.theme = saved.theme;
    if (saved.palette) state.palette = saved.palette;
    if (saved.scriptPreference) state.scriptPreference = saved.scriptPreference;
    if (Number.isFinite(saved.fontSize)) state.fontSize = saved.fontSize;
    if (Number.isFinite(saved.lineHeight)) state.lineHeight = saved.lineHeight;
    if (saved.aiProvider) state.aiProvider = saved.aiProvider;
    if (saved.deepseekKey) state.deepseekKey = saved.deepseekKey;
    if (saved.deepseekModel) state.deepseekModel = saved.deepseekModel;
    state.deepseekThinking = !!saved.deepseekThinking;
    if (saved.mimoKey) state.mimoKey = saved.mimoKey;
    if (saved.mimoKeyType) state.mimoKeyType = saved.mimoKeyType;
    if (saved.mimoBaseUrl) state.mimoBaseUrl = saved.mimoBaseUrl;
    if (saved.mimoModel) state.mimoModel = saved.mimoModel;
    if (saved.speechProvider) state.speechProvider = saved.speechProvider;
    if (saved.openaiKey) state.openaiKey = saved.openaiKey;
    if (saved.speechModel) state.speechModel = saved.speechModel;
    if (saved.aiResponseStyle) state.aiResponseStyle = saved.aiResponseStyle;
    if (Array.isArray(saved.recentBooks)) state.recentBooks = saved.recentBooks.filter(Number.isInteger).slice(0, 8);
    if (Number.isInteger(saved.book) && saved.book > 0) state.book = saved.book;
    if (Number.isInteger(saved.chapter) && saved.chapter > 0) state.chapter = saved.chapter;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: state.version,
      compareVersions: state.compareVersions,
      commentary: state.commentary,
      showStrong: state.showStrong,
      audioAutoNext: state.audioAutoNext,
      theme: state.theme,
      palette: state.palette,
      scriptPreference: state.scriptPreference,
      fontSize: state.fontSize,
      lineHeight: state.lineHeight,
      aiProvider: state.aiProvider,
      deepseekKey: state.deepseekKey,
      deepseekModel: state.deepseekModel,
      deepseekThinking: state.deepseekThinking,
      mimoKey: state.mimoKey,
      mimoKeyType: state.mimoKeyType,
      mimoBaseUrl: state.mimoBaseUrl,
      mimoModel: state.mimoModel,
      speechProvider: state.speechProvider,
      openaiKey: state.openaiKey,
      speechModel: state.speechModel,
      aiResponseStyle: state.aiResponseStyle,
      recentBooks: state.recentBooks,
      book: state.book,
      chapter: state.chapter,
    }),
  );
}

function renderVersions() {
  versionSelect.innerHTML = state.versions
    .map((version) => `<option value="${escapeHtml(version.id)}">${escapeHtml(version.name)}</option>`)
    .join("");
  versionSelect.value = state.version;
}

function renderCompareVersions() {
  const selected = new Set(state.compareVersions);
  const maxReached = state.compareVersions.length >= 3;
  compareVersions.innerHTML = state.versions
    .filter((version) => version.id !== state.version)
    .map((version) => {
      const checked = selected.has(version.id);
      const disabled = !checked && maxReached;
      return `
        <label class="compareOption${disabled ? " disabled" : ""}">
          <input type="checkbox" value="${escapeHtml(version.id)}" ${checked ? "checked" : ""} ${
            disabled ? "disabled" : ""
          } />
          <span>${escapeHtml(version.name)}</span>
        </label>
      `;
    })
    .join("");
}

function renderCommentaries() {
  const options = [`<option value="">不显示注释</option>`]
    .concat(
      state.commentaries.map((source) => {
        const label = source.readable ? source.title : `${source.title}（暂不可读）`;
        return `<option value="${escapeHtml(source.id)}">${escapeHtml(label)}</option>`;
      }),
    )
    .join("");
  commentarySelect.innerHTML = options;
  commentarySelect.value = state.commentary;
  const selected = state.commentaries.find((source) => source.id === state.commentary);
  commentaryHint.textContent = selected
    ? `${selected.count} 条 · ${selected.sizeMb} MB${selected.readable ? "" : " · 数据疑似加密"}`
    : `${state.commentaries.length} 个注释源`;
}

function renderStrongToggle() {
  strongToggle.checked = state.showStrong;
  audioAutoNext.checked = state.audioAutoNext;
}

function applySettings() {
  document.body.classList.toggle("darkTheme", state.theme === "dark");
  document.body.dataset.palette = state.palette;
  document.documentElement.style.setProperty("--reader-font-size", `${state.fontSize}px`);
  document.documentElement.style.setProperty("--reader-line-height", String(state.lineHeight));
  themeSelect.value = state.theme;
  paletteSelect.value = state.palette;
  scriptPreference.value = state.scriptPreference;
  fontSizeRange.value = String(state.fontSize);
  lineHeightRange.value = String(state.lineHeight);
  fontSizeValue.textContent = `${state.fontSize}px`;
  lineHeightValue.textContent = state.lineHeight.toFixed(1);
}

function renderDictionaries() {
  dictionarySelect.innerHTML = state.dictionaries
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`)
    .join("");
  const selected = state.dictionaries.find((item) => item.id === dictionarySelect.value) || state.dictionaries[0];
  if (selected) {
    dictionarySelect.value = selected.id;
    dictionaryHint.textContent = `${selected.count} 个词条 · ${selected.imageCount} 张图${
      selected.readable ? "" : " · 正文暂不可读"
    }`;
  } else {
    dictionaryHint.textContent = "未找到辞典库";
  }
}

function renderAiConfig() {
  aiProviderSelect.value = state.aiProvider;
  deepseekKeyInput.value = state.deepseekKey;
  if (state.deepseekModel === "deepseek-chat") state.deepseekModel = "deepseek-v4-flash";
  if (state.deepseekModel === "deepseek-reasoner") state.deepseekModel = "deepseek-v4-pro";
  deepseekModelSelect.value = state.deepseekModel;
  deepseekThinkingToggle.checked = state.deepseekThinking;
  mimoKeyInput.value = state.mimoKey;
  mimoKeyTypeSelect.value = state.mimoKeyType;
  mimoBaseUrlInput.value = state.mimoBaseUrl;
  mimoBaseUrlInput.disabled = state.mimoKeyType !== "codeplan";
  mimoModelSelect.value = state.mimoModel;
  speechProviderSelect.value = state.speechProvider;
  openaiKeyInput.value = state.openaiKey;
  speechModelSelect.value = state.speechModel;
  aiResponseStyleSelect.value = state.aiResponseStyle;
  if (aiConfigHint) {
    aiConfigHint.textContent =
      state.speechProvider === "system"
        ? "系统语音识别依赖手机内置语音服务；不支持时可切换到云端识别。云端录音上传还在接入中。"
        : state.speechProvider === "mimo"
          ? `小米 MiMo 语音识别使用 mimo-v2.5-asr；${state.mimoKeyType === "codeplan" ? "CodePlan/Token Plan 会使用专属 Base URL。" : "普通 Key 使用默认 Base URL。"}`
          : "OpenAI 语音识别推荐 gpt-4o-mini-transcribe；当前版本先保存配置，录音上传下一步接入。";
  }
}

function saveAiConfig() {
  state.aiProvider = aiProviderSelect.value;
  state.deepseekKey = deepseekKeyInput.value.trim();
  state.deepseekModel = deepseekModelSelect.value;
  state.deepseekThinking = deepseekThinkingToggle.checked;
  state.mimoKey = mimoKeyInput.value.trim();
  state.mimoKeyType = mimoKeyTypeSelect.value;
  state.mimoBaseUrl = mimoBaseUrlInput.value.trim() || "https://api.xiaomimimo.com/v1";
  state.mimoModel = mimoModelSelect.value;
  state.speechProvider = speechProviderSelect.value;
  state.openaiKey = openaiKeyInput.value.trim();
  state.speechModel = speechModelSelect.value;
  state.aiResponseStyle = aiResponseStyleSelect.value;
  saveState();
  renderAiConfig();
  aiConfigHint.textContent = "AI 配置已保存。Key 目前保存在本机浏览器/App 本地存储中。";
}

function showAiUses() {
  aiConfigHint.textContent =
    "AI 可做：语音跳转通过底部“语音”按钮触发；经文解释、上下文问答、笔记整理可从经文长按/右键菜单触发；主题查经和搜索意图解析可从顶部搜索框触发。当前已支持 AI 配置检查，云端录音上传和经文菜单 AI 动作会继续接入。";
}

function normalizeMimoChatUrl(value = state.mimoBaseUrl) {
  const source = state.mimoKeyType === "codeplan" ? value : "https://api.xiaomimimo.com/v1";
  const raw = String(source || "").trim() || "https://api.xiaomimimo.com/v1";
  const base = raw.replace(/\/+$/, "");
  if (/\/chat\/completions$/i.test(base)) return base;
  return `${base}/chat/completions`;
}

function mimoKeyTypeLabel() {
  return state.mimoKeyType === "codeplan" ? "CodePlan/Token Plan" : "普通 Key";
}

function currentAiConfig() {
  if (state.aiProvider === "mimo") {
    return {
      provider: "小米 MiMo",
      url: normalizeMimoChatUrl(),
      key: state.mimoKey,
      model: state.mimoModel,
    };
  }
  if (state.aiProvider === "openai") {
    return {
      provider: "OpenAI",
      url: "https://api.openai.com/v1/chat/completions",
      key: state.openaiKey,
      model: "gpt-4o-mini",
    };
  }
  return {
    provider: "DeepSeek",
    url: "https://api.deepseek.com/chat/completions",
    key: state.deepseekKey,
    model: state.deepseekThinking ? "deepseek-v4-pro" : state.deepseekModel,
  };
}

async function requestAiText(prompt) {
  const config = currentAiConfig();
  if (!config.key) throw new Error(`请先在 AI 配置里填写 ${config.provider} Key。`);
  const styleText = {
    concise: "回答简洁，控制在 120 字以内。",
    balanced: "回答适中，给出要点和必要背景。",
    detailed: "回答详细一些，包含背景、结构和应用提醒。",
  }[state.aiResponseStyle] || "回答适中。";
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content:
            "你是一个谨慎的中文圣经研读助手。避免武断教义结论，区分经文本身、解释和应用。不要编造原文或历史背景。",
        },
        { role: "user", content: `${prompt}\n\n${styleText}` },
      ],
      max_tokens: state.aiResponseStyle === "detailed" ? 900 : state.aiResponseStyle === "balanced" ? 520 : 260,
      temperature: 0.2,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
  return data.choices?.[0]?.message?.content?.trim() || "AI 没有返回内容。";
}

async function testAiConfig() {
  saveAiConfig();
  const config = currentAiConfig();
  const checks = [];
  testAiConfigBtn.disabled = true;
  aiConfigHint.textContent = `正在检查 ${config.provider} 配置...`;
  try {
    if (!config.key) {
      checks.push(`${config.provider} 文本模型：未填写 Key`);
    } else {
      if (config.provider === "小米 MiMo") {
        checks.push(`MiMo Key 类型：${mimoKeyTypeLabel()}，测试地址：${config.url}`);
      }
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.key}`,
          "api-key": config.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: "请只回复 OK" }],
          max_tokens: 8,
          temperature: 0,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.error?.message || data.message || `HTTP ${response.status}`;
        if (config.provider === "小米 MiMo" && response.status === 401) {
          throw new Error(`MiMo ${mimoKeyTypeLabel()} 鉴权失败。普通 Key 请切到“普通 Key”；tp- 开头的 CodePlan/Token Plan Key 请切到“CodePlan / Token Plan”并填写后台专属 Base URL。原始信息：${message}`);
        }
        throw new Error(message);
      }
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      checks.push(`${config.provider} 文本模型可用：${text || "已返回响应"}`);
    }
    if (state.speechProvider === "mimo") {
      if (!state.mimoKey) {
        checks.push("MiMo 语音：未填写 MiMo Key");
      } else if (state.mimoKeyType === "codeplan" && !state.mimoBaseUrl.trim()) {
        checks.push("MiMo 语音：CodePlan/Token Plan 需要填写专属 Base URL");
      } else if (state.speechModel !== "mimo-v2.5-asr") {
        checks.push(`MiMo 语音：模型应选择 mimo-v2.5-asr，当前是 ${state.speechModel}`);
      } else {
        checks.push(`MiMo 语音配置可用：${mimoKeyTypeLabel()}，模型为 mimo-v2.5-asr。按住语音按钮可录音上传识别`);
      }
    } else if (state.speechProvider === "openai") {
      checks.push(state.openaiKey ? `OpenAI 语音配置已填写：${state.speechModel}` : "OpenAI 语音：未填写 OpenAI Key");
    } else {
      checks.push("系统语音：使用设备内置语音服务，不检查云端模型");
    }
    aiConfigHint.textContent = checks.join("；");
  } catch (error) {
    aiConfigHint.textContent = `${config.provider} 检查失败：${error.message || String(error)}`;
  } finally {
    testAiConfigBtn.disabled = false;
  }
}

function renderPackages() {
  if (!packageList) return;
  if (!isAndroidOffline()) {
    packageList.innerHTML = "";
    if (packageHint) packageHint.textContent = "资源包下载仅用于 Android APK。";
    return;
  }
  packageList.innerHTML = state.packages.length
    ? state.packages
        .map(
          (item) => `
            <div class="packageItem">
              <div>
                <div class="packageTitle">${escapeHtml(item.title)}</div>
                <div class="packageMeta">${escapeHtml(item.description)} · ${item.installedCount}/${item.fullCount}</div>
              </div>
              <button type="button" data-package-id="${escapeHtml(item.id)}" ${item.installed ? "disabled" : ""}>
                ${item.installed ? "已安装" : "下载"}
              </button>
            </div>
          `,
        )
        .join("")
    : `<div class="panelHint">暂无可下载资源包</div>`;
  if (packageHint) packageHint.textContent = state.packages.length ? "下载后会保存到本机，之后可离线使用。" : "";
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}

function renderDownloadProgress(status = {}) {
  if (!downloadProgress) return;
  const percent = Math.max(0, Math.min(100, Number(status.percent || 0)));
  downloadProgress.hidden = false;
  downloadProgressText.textContent = status.message || "正在下载";
  downloadProgressValue.textContent = status.total
    ? `${percent}% · ${formatBytes(status.downloaded)} / ${formatBytes(status.total)}`
    : `${percent}%`;
  downloadProgressBar.style.width = `${percent}%`;
  downloadProgress.classList.toggle("error", status.state === "error");
  downloadProgress.classList.toggle("done", status.state === "done" || status.state === "cleared");
}

function stopDownloadProgressPolling() {
  if (downloadProgressTimer) window.clearInterval(downloadProgressTimer);
  downloadProgressTimer = null;
}

function pollDownloadProgress(kind = "package", onDone = null, onStop = null) {
  stopDownloadProgressPolling();
  const getStatus = () => {
    if (kind === "update") return window.AndroidUpdateApi?.downloadStatus ? JSON.parse(window.AndroidUpdateApi.downloadStatus()) : {};
    return window.AndroidBibleApi?.downloadStatus ? JSON.parse(window.AndroidBibleApi.downloadStatus()) : {};
  };
  renderDownloadProgress({ message: "准备下载", percent: 0 });
  downloadProgressTimer = window.setInterval(() => {
    try {
      const status = getStatus();
      if (status.error) throw new Error(status.error);
      renderDownloadProgress(status);
      if (status.state === "done") {
        stopDownloadProgressPolling();
        if (onDone) onDone(status);
      } else if (["error", "cleared"].includes(status.state)) {
        stopDownloadProgressPolling();
        if (onStop) onStop(status);
      }
    } catch (error) {
      renderDownloadProgress({ state: "error", message: error.message || String(error), percent: 0 });
      stopDownloadProgressPolling();
      if (onStop) onStop({ state: "error", message: error.message || String(error) });
    }
  }, 500);
}

function clearDownloadCache() {
  try {
    const androidResult = window.AndroidBibleApi?.clearDownloadCache
      ? JSON.parse(window.AndroidBibleApi.clearDownloadCache())
      : { bytes: 0, message: "当前环境没有可清理的 Android 下载缓存。" };
    const updateResult = window.AndroidUpdateApi?.clearDownloadCache
      ? JSON.parse(window.AndroidUpdateApi.clearDownloadCache())
      : { bytes: 0 };
    const bytes = Number(androidResult.bytes || 0) + Number(updateResult.bytes || 0);
    renderDownloadProgress({ state: "cleared", message: `已清理 ${formatBytes(bytes)} 下载缓存`, percent: 100 });
    showStatus(`已清理 ${formatBytes(bytes)} 下载缓存`, "success");
    if (packageHint) packageHint.textContent = androidResult.message || "已清理下载缓存。";
  } catch (error) {
    renderDownloadProgress({ state: "error", message: error.message || String(error), percent: 0 });
    showStatus(error.message || String(error), "error");
  }
}

async function loadPackages() {
  if (!isAndroidOffline()) {
    renderPackages();
    return;
  }
  try {
    const data = await api("/api/packages");
    state.packages = data.packages || [];
    renderPackages();
  } catch (error) {
    if (packageHint) packageHint.textContent = error.message || String(error);
  }
}

async function refreshResourceLists() {
  const [versionData, commentaryData] = await Promise.all([api("/api/versions"), api("/api/commentaries")]);
  state.versions = versionData.versions;
  state.commentaries = commentaryData.commentaries;
  if (!state.versions.some((version) => version.id === state.version)) state.version = state.versions[0]?.id || "";
  state.compareVersions = state.compareVersions.filter((version) =>
    state.versions.some((item) => item.id === version && item.id !== state.version),
  );
  if (!state.commentaries.some((source) => source.id === state.commentary)) state.commentary = "";
  renderVersions();
  renderCompareVersions();
  renderCommentaries();
}

async function installPackage(packageId) {
  if (!isAndroidOffline()) return;
  if (packageInstallInProgress) {
    showStatus("资源包正在下载，请稍候");
    return;
  }
  packageInstallInProgress = true;
  const button = [...(packageList?.querySelectorAll("[data-package-id]") || [])].find(
    (item) => item.dataset.packageId === packageId,
  );
  const packageButtons = [...(packageList?.querySelectorAll("[data-package-id]") || [])];
  packageButtons.forEach((item) => {
    item.disabled = true;
  });
  if (button) {
    button.disabled = true;
    button.textContent = "下载中";
  }
  pollDownloadProgress("package", async () => {
    await loadPackages();
    await refreshResourceLists();
    await loadBooks();
    await loadChapter();
    if (packageHint) packageHint.textContent = "资源包安装完成。";
    packageInstallInProgress = false;
  }, () => {
    packageInstallInProgress = false;
  });
  if (packageHint) packageHint.textContent = "正在从 GitHub 下载资源包，请保持网络连接。";
  try {
    const data = window.AndroidBibleApi?.installPackage
      ? JSON.parse(window.AndroidBibleApi.installPackage(packageId))
      : await postJson("/api/package/install", { id: packageId });
    if (data.error) throw new Error(data.error);
    if (!data.started) {
      state.packages = data.packages || state.packages;
      await refreshResourceLists();
      renderPackages();
      await loadBooks();
      await loadChapter();
      if (packageHint) packageHint.textContent = `已安装 ${data.installed || 0} 个资源文件。`;
      stopDownloadProgressPolling();
      packageInstallInProgress = false;
    }
  } catch (error) {
    packageInstallInProgress = false;
    if (button) {
      button.disabled = false;
      button.textContent = "重试";
    }
    packageButtons.forEach((item) => {
      if (!item.isConnected || item === button) return;
      item.disabled = false;
    });
    if (packageHint) packageHint.textContent = error.message || String(error);
    renderDownloadProgress({ state: "error", message: error.message || String(error), percent: 0 });
  }
}

function setCompareVersion(versionId, checked) {
  if (checked) {
    if (!state.compareVersions.includes(versionId) && state.compareVersions.length < 3) {
      state.compareVersions = [...state.compareVersions, versionId];
    }
  } else {
    state.compareVersions = state.compareVersions.filter((version) => version !== versionId);
  }
  renderCompareVersions();
  loadChapter();
}

function renderBooks() {
  bookSelect.innerHTML = state.books
    .map((book) => `<option value="${book.id}">${escapeHtml(book.longName || book.shortName)}</option>`)
    .join("");
  bookSelect.value = String(state.book);
  renderBookGrid();
}

function bookMatchesFilter(book) {
  const keyword = bookSearchInput.value.trim().toLowerCase();
  const inScope =
    bookFilter === "all" ||
    (bookFilter === "ot" ? book.id <= 39 : bookFilter === "nt" ? book.id >= 40 : state.recentBooks.includes(book.id));
  if (!inScope) return false;
  if (!keyword) return true;
  return `${book.shortName || ""} ${book.longName || ""}`.toLowerCase().includes(keyword);
}

function renderBookGrid() {
  if (!bookGrid) return;
  bookFilterTabs?.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.bookFilter === bookFilter);
  });
  const books =
    bookFilter === "recent"
      ? state.recentBooks.map((id) => state.books.find((book) => book.id === id)).filter(Boolean).filter(bookMatchesFilter)
      : state.books.filter(bookMatchesFilter);
  bookGrid.innerHTML = books.length
    ? books
        .map((book) => {
          const active = book.id === state.book ? " active" : "";
          const testament = book.id <= 39 ? "旧" : "新";
          return `
            <button class="bookBtn${active}" type="button" data-book="${book.id}" title="${escapeHtml(book.longName || book.shortName)}">
              <span>${escapeHtml(book.shortName || book.longName)}</span>
              <small>${testament} · ${book.chapterCount}</small>
            </button>
          `;
        })
        .join("")
    : `<div class="bookEmpty">${bookFilter === "recent" ? "最近读过的书卷会显示在这里" : "没有匹配的书卷"}</div>`;
}

function rememberCurrentBook() {
  if (!state.book) return;
  state.recentBooks = [state.book, ...state.recentBooks.filter((book) => book !== state.book)].slice(0, 8);
}

function renderChapterGrid() {
  const book = currentBook();
  const count = book?.chapterCount || 1;
  const readSet = new Set((state.progress?.readChapters || []).map((item) => `${item.book}:${item.chapter}`));
  if (chapterPanelTitle) chapterPanelTitle.textContent = book ? `${book.longName || book.shortName} 章节` : "章节";
  if (chapterPanelMeta) chapterPanelMeta.textContent = book ? `${count} 章 · 当前第 ${state.chapter} 章` : "";
  if (bookPickerCurrent) bookPickerCurrent.textContent = book ? `${book.longName || book.shortName} ${state.chapter}` : "";
  chapterGrid.innerHTML = Array.from({ length: count }, (_, index) => {
    const chapter = index + 1;
    const active = chapter === state.chapter ? " active" : "";
    const read = readSet.has(`${state.book}:${chapter}`) ? " read" : "";
    return `<button class="chapterBtn${active}${read}" data-chapter="${chapter}" title="${read ? "已读" : "未读"}">${chapter}</button>`;
  }).join("");
}

function renderChrome() {
  const book = currentBook();
  const version = currentVersion();
  chapterTitle.textContent = book ? `${book.longName} ${state.chapter}` : "本地圣经";
  const compareText = state.compareVersions.length ? ` · 对照 ${state.compareVersions.length} 个版本` : "";
  const titleText = version?.titleCount ? ` · 小标题 ${version.titleCount} 条` : " · 暂无小标题";
  versionTitle.textContent = version ? `${version.name}${compareText}${titleText}` : "";
  const atFirstChapter = state.book === 1 && state.chapter === 1;
  const lastBook = state.books[state.books.length - 1];
  const atLastChapter = !!lastBook && state.book === lastBook.id && state.chapter === lastBook.chapterCount;
  prevBtn.disabled = atFirstChapter;
  nextBtn.disabled = atLastChapter;
  if (mobilePrevBtn) mobilePrevBtn.disabled = atFirstChapter;
  if (mobileNextBtn) mobileNextBtn.disabled = atLastChapter;
  renderProgressChrome();
}

function isCurrentChapterRead() {
  return !!state.progress?.readChapters?.some((item) => item.book === state.book && item.chapter === state.chapter);
}

function renderProgressChrome() {
  const read = isCurrentChapterRead();
  if (mobileMarkReadBtn) {
    mobileMarkReadBtn.textContent = read ? "已读" : "标记";
    mobileMarkReadBtn.classList.toggle("active", read);
    mobileMarkReadBtn.disabled = !state.version;
  }
  if (progressSummary) {
    progressSummary.textContent = state.progress ? `${state.progress.read}/${state.progress.total} 章 · ${state.progress.percent}%` : "";
  }
}

function renderVerses(data) {
  const mainChapter = data.chapters?.[0] || data;
  const compareChapters = data.chapters?.slice(1) || [];
  if (!mainChapter.verses.length) {
    content.innerHTML = `<div class="empty">这个版本没有当前章节的经文。可以换一个译本，或选择别的章节。</div>`;
    return;
  }
  const compareByVersion = compareChapters.map((chapter) => ({
    version: chapter.version,
    name: chapter.shortName || chapter.versionName || versionLabel(chapter.version),
    verses: new Map(chapter.verses.map((verse) => [verse.verse, verse.text])),
  }));

  const headings = chapterTitleMap(mainChapter);
  content.innerHTML =
    renderChapterTitleSummary(headings) +
    mainChapter.verses
    .map(
      (verse) => {
        const mark = markForVerse(verse.verse);
        return `
        ${
          headings[verse.verse]
            ? `<div class="sectionHeading" data-section-verse="${verse.verse}">
                <span class="sectionHeadingNo">${verse.verse}</span>
                <span>${escapeHtml(headings[verse.verse])}</span>
              </div>`
            : ""
        }
        <article class="verse ${verseMarkClasses(mark)}" data-verse="${verse.verse}">
          <div class="verseNo" id="v${verse.verse}">${verse.verse}</div>
          <div class="verseBody" data-verse="${verse.verse}">
            <div class="verseText">${escapeHtml(verse.text)}</div>
            ${renderStrongList(verse.strongs || [])}
            ${renderCompareList(verse.verse, compareByVersion)}
            ${renderNoteEditor(verse.verse)}
          </div>
        </article>
      `;
      },
    )
    .join("");
  renderVerseSelectionState();
  focusTargetVerse();
}

function scrollReaderToTop() {
  const top = document.querySelector(".topbar")?.getBoundingClientRect().bottom || 0;
  const target = Math.max(0, window.scrollY + content.getBoundingClientRect().top - top - 8);
  window.scrollTo({ top: target, behavior: "auto" });
}

function markForVerse(verse) {
  return (
    state.marks.get(Number(verse)) || {
      version: state.version,
      book: state.book,
      chapter: state.chapter,
      verse: Number(verse),
      favorite: false,
      highlighted: false,
      note: "",
      tags: "",
    }
  );
}

function verseMarkClasses(mark) {
  return [
    mark.favorite ? "favoriteVerse" : "",
    mark.highlighted ? "highlightedVerse" : "",
    mark.note || mark.tags ? "notedVerse" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function updateVerseMarkDom(mark) {
  const verse = content.querySelector(`.verse[data-verse="${mark.verse}"]`);
  if (!verse) return;
  verse.classList.toggle("favoriteVerse", !!mark.favorite);
  verse.classList.toggle("highlightedVerse", !!mark.highlighted);
  verse.classList.toggle("notedVerse", !!(mark.note || mark.tags));
  const editor = verse.querySelector(`[data-note-editor="${mark.verse}"]`);
  if (editor) {
    const wasHidden = editor.hidden;
    editor.outerHTML = renderNoteEditor(mark.verse);
    const nextEditor = verse.querySelector(`[data-note-editor="${mark.verse}"]`);
    if (nextEditor) nextEditor.hidden = wasHidden;
  }
}

function openVerseMenu(verseNo, x, y) {
  const mark = markForVerse(verseNo);
  state.activeVerse = Number(verseNo);
  verseMenuTitle.textContent = `${currentBook().longName} ${state.chapter}:${verseNo}`;
  verseMenu.querySelector('[data-menu-action="favorite"]').textContent = mark.favorite ? "取消收藏" : "收藏";
  verseMenu.querySelector('[data-menu-action="highlight"]').textContent = mark.highlighted ? "取消高亮" : "高亮";
  verseMenu.hidden = false;
  const rect = verseMenu.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 10;
  const maxY = window.innerHeight - rect.height - 10;
  verseMenu.style.left = `${Math.max(10, Math.min(x, maxX))}px`;
  verseMenu.style.top = `${Math.max(10, Math.min(y, maxY))}px`;
}

function closeVerseMenu() {
  verseMenu.hidden = true;
}

function renderVerseSelectionState() {
  const selected = new Set(selectedVerseNumbers);
  content.querySelectorAll(".verse").forEach((verse) => {
    verse.classList.toggle("selectedVerse", selected.has(Number(verse.dataset.verse)));
  });
  document.body.classList.toggle("verseSelectionMode", verseSelectionMode);
}

function updateManualSelectionBar() {
  if (!selectedVerseNumbers.length) {
    closeSelectionBar();
    return;
  }
  selectedVerseNumbers = [...new Set(selectedVerseNumbers)].sort((a, b) => a - b);
  const first = selectedVerseNumbers[0];
  const last = selectedVerseNumbers[selectedVerseNumbers.length - 1];
  selectionSummary.textContent =
    selectedVerseNumbers.length === 1
      ? `${currentBook().longName} ${state.chapter}:${first} · 点击经文继续选择`
      : `${currentBook().longName} ${state.chapter}:${first}-${last} · ${selectedVerseNumbers.length} 节`;
  copySelectionBtn.textContent = "复制所选";
  selectionBar.hidden = false;
  renderVerseSelectionState();
}

function startVerseSelection(verseNo) {
  verseSelectionMode = true;
  selectedVerseNumbers = Number.isFinite(Number(verseNo)) ? [Number(verseNo)] : [];
  updateManualSelectionBar();
}

function toggleVerseSelection(verseNo) {
  if (!verseSelectionMode) return;
  const value = Number(verseNo);
  if (!Number.isFinite(value)) return;
  selectedVerseNumbers = selectedVerseNumbers.includes(value)
    ? selectedVerseNumbers.filter((item) => item !== value)
    : [...selectedVerseNumbers, value];
  updateManualSelectionBar();
}

function closeSelectionBar() {
  selectionBar.hidden = true;
  selectedVerseNumbers = [];
  verseSelectionMode = false;
  renderVerseSelectionState();
}

function toggleReaderSettings(show = readerSettingsPanel.hidden) {
  readerSettingsPanel.hidden = !show;
  if (show) {
    closeSidebar();
    toggleBookPicker(false);
    closeContentPanels();
    closeVerseMenu();
    closeSelectionBar();
  }
}

function verseTextForNumber(verseNo) {
  return content.querySelector(`.verse[data-verse="${verseNo}"] .verseText`)?.textContent.trim() || "";
}

function verseReference(verseNo) {
  return `${currentBook().longName} ${state.chapter}:${verseNo}`;
}

function chapterContextAround(verseNo, radius = 2) {
  const start = Math.max(1, Number(verseNo) - radius);
  const end = Number(verseNo) + radius;
  return [...content.querySelectorAll(".verse")]
    .map((verse) => Number(verse.dataset.verse))
    .filter((number) => number >= start && number <= end)
    .map((number) => `${number}. ${verseTextForNumber(number)}`)
    .join("\n");
}

function aiPromptForVerse(action, verseNo) {
  const ref = verseReference(verseNo);
  const text = verseTextForNumber(verseNo);
  const context = chapterContextAround(verseNo);
  if (action === "ai-context") {
    return `请结合上下文解释这段经文。\n经文：${ref} ${text}\n上下文：\n${context}\n请按“上下文、重点、应用”三部分回答。`;
  }
  if (action === "ai-note") {
    return `请把这节经文整理成一条个人查经笔记。\n经文：${ref} ${text}\n上下文：\n${context}\n请输出：观察、解释、应用、祷告。`;
  }
  return `请解释这节经文。\n经文：${ref} ${text}\n请说明核心意思、可能的背景和今天的应用，避免过度发挥。`;
}

function aiActionTitle(action, verseNo) {
  const ref = verseReference(verseNo);
  if (action === "ai-context") return `${ref} · AI 上下文`;
  if (action === "ai-note") return `${ref} · AI 笔记`;
  return `${ref} · AI 解释`;
}

async function runVerseAiAction(action, verseNo) {
  saveAiConfig();
  closeContentPanels();
  const token = ++aiRequestToken;
  aiResultPanel.hidden = false;
  aiResultTitle.textContent = aiActionTitle(action, verseNo);
  aiResultContent.innerHTML = `<div class="aiLoading">正在请求 ${escapeHtml(currentAiConfig().provider)}...</div>`;
  try {
    const text = await requestAiText(aiPromptForVerse(action, verseNo));
    if (token !== aiRequestToken) return;
    aiResultContent.innerHTML = `
      <div class="aiResultText">${escapeHtml(text)}</div>
      <div class="aiResultActions">
        <button type="button" data-copy-ai-result>复制结果</button>
      </div>
    `;
    aiResultContent.dataset.aiResultText = text;
    aiResultPanel.scrollIntoView({ block: "start", behavior: "smooth" });
  } catch (error) {
    if (token !== aiRequestToken) return;
    aiResultContent.innerHTML = `<div class="aiError">${escapeHtml(error.message || String(error))}</div>`;
  }
}

function formatVerseLines(verseNumbers, format = "reference") {
  const book = currentBook();
  const lines = verseNumbers
    .map((verseNo) => {
      const verse = verseTextForNumber(verseNo);
      if (!verse) return "";
      if (format === "plain") return verse;
      if (format === "paragraph") return verse;
      return `${book.longName} ${state.chapter}:${verseNo} ${verse}`;
    })
    .filter(Boolean);
  if (format === "paragraph") {
    const first = verseNumbers[0];
    const last = verseNumbers[verseNumbers.length - 1];
    const ref = verseNumbers.length === 1 ? `${book.longName} ${state.chapter}:${first}` : `${book.longName} ${state.chapter}:${first}-${last}`;
    return `${ref} ${lines.join("")}`;
  }
  return lines.join("\n");
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

function selectedVersesFromRange(range) {
  return [...content.querySelectorAll(".verse")]
    .filter((verse) => {
      try {
        return range.intersectsNode(verse);
      } catch {
        return false;
      }
    })
    .map((verse) => Number(verse.dataset.verse))
    .filter(Number.isFinite);
}

function updateSelectionBar() {
  if (verseSelectionMode) {
    updateManualSelectionBar();
    return;
  }
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) {
    closeSelectionBar();
    return;
  }
  const range = selection.getRangeAt(0);
  const common = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;
  if (!common || !content.contains(common)) {
    closeSelectionBar();
    return;
  }
  selectedVerseNumbers = selectedVersesFromRange(range);
  if (!selectedVerseNumbers.length) {
    closeSelectionBar();
    return;
  }
  const first = selectedVerseNumbers[0];
  const last = selectedVerseNumbers[selectedVerseNumbers.length - 1];
  selectionSummary.textContent =
    selectedVerseNumbers.length === 1
      ? `${currentBook().longName} ${state.chapter}:${first}`
      : `${currentBook().longName} ${state.chapter}:${first}-${last} · ${selectedVerseNumbers.length} 节`;
  copySelectionBtn.textContent = "复制所选";
  selectionBar.hidden = false;
}

async function copySelectedVerses() {
  if (!selectedVerseNumbers.length) updateSelectionBar();
  if (!selectedVerseNumbers.length) return;
  await writeClipboard(formatVerseLines(selectedVerseNumbers, copyFormatSelect?.value || "reference"));
  copySelectionBtn.textContent = "已复制";
  showStatus(`已复制 ${selectedVerseNumbers.length} 节经文`, "success");
  window.setTimeout(closeSelectionBar, 900);
}

async function runVerseAction(action, verseNo = state.activeVerse) {
  if (!verseNo) return;
  const mark = markForVerse(verseNo);
  if (action === "select") {
    startVerseSelection(verseNo);
  } else if (action === "favorite") {
    await saveVerseMark({ ...mark, favorite: !mark.favorite });
  } else if (action === "highlight") {
    await saveVerseMark({ ...mark, highlighted: !mark.highlighted });
  } else if (action === "note") {
    const editor = content.querySelector(`[data-note-editor="${verseNo}"]`);
    if (editor) editor.hidden = !editor.hidden;
  } else if (action === "copy") {
    await copyVerse(verseNo);
  } else if (action === "dictionary") {
    const text = content.querySelector(`.verse[data-verse="${verseNo}"] .verseText`)?.textContent || "";
    dictionaryInput.value = text.match(/[\u4e00-\u9fff]{2,6}/)?.[0] || text.split(/\s+/).find(Boolean) || "";
    await searchDictionary();
  } else if (action === "commentary") {
    focusCommentaryForVerse(Number(verseNo));
  } else if (action.startsWith("ai-")) {
    await runVerseAiAction(action, Number(verseNo));
  }
}

function renderNoteEditor(verse) {
  const mark = markForVerse(verse);
  const hasContent = mark.note || mark.tags;
  return `
    <div class="noteEditor ${hasContent ? "hasContent" : ""}" data-note-editor="${verse}" hidden>
      <textarea data-note-text="${verse}" placeholder="写下这节经文的笔记">${escapeHtml(mark.note)}</textarea>
      <input data-note-tags="${verse}" type="text" placeholder="标签，用逗号分隔" value="${escapeHtml(mark.tags)}" />
      <button class="verseTool active" type="button" data-action="save-note" data-verse="${verse}">保存笔记</button>
    </div>
    ${
      hasContent
        ? `<div class="notePreview">
            ${mark.tags ? `<div class="noteTags">${escapeHtml(mark.tags)}</div>` : ""}
            ${mark.note ? `<div class="noteText">${escapeHtml(mark.note)}</div>` : ""}
          </div>`
        : ""
    }
  `;
}

function renderStrongList(strongs) {
  if (!state.showStrong || !strongs.length) return "";
  return `
    <div class="strongList">
      ${strongs
        .map(
          (strong) =>
            `<button class="strongBtn" type="button" data-code="${escapeHtml(strong.code)}">${escapeHtml(strong.code)}</button>`,
        )
        .join("")}
    </div>
  `;
}

function focusTargetVerse() {
  if (!state.targetVerse) return;
  const marker = document.querySelector(`#v${state.targetVerse}`);
  const verse = marker?.closest(".verse");
  if (!verse) return;
  verse.classList.add("targetVerse");
  verse.scrollIntoView({ block: "center", behavior: "smooth" });
}

function renderCompareList(verseNo, compareByVersion) {
  const items = compareByVersion
    .map((chapter) => {
      const text = chapter.verses.get(verseNo);
      if (!text) return "";
      return `
        <div class="compareText">
          <div class="compareName">${escapeHtml(chapter.name)}</div>
          <div class="compareVerse">${escapeHtml(text)}</div>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  return items ? `<div class="compareList">${items}</div>` : "";
}

async function loadBooks() {
  const data = await api(`/api/books?version=${encodeURIComponent(state.version)}`);
  state.books = data.books;
  if (!state.books.some((book) => book.id === state.book)) state.book = 1;
  const book = currentBook();
  if (book && state.chapter > book.chapterCount) state.chapter = book.chapterCount;
  renderBooks();
  renderChapterGrid();
}

async function loadChapter(options = {}) {
  const token = (options.token ?? ++chapterLoadToken);
  const snapshot = {
    version: state.version,
    compareVersions: [...state.compareVersions],
    book: state.book,
    chapter: state.chapter,
    commentary: state.commentary,
  };
  setLoading("正在读取经文");
  rememberCurrentBook();
  renderChrome();
  renderChapterGrid();
  try {
    const params = new URLSearchParams({ book: String(snapshot.book), chapter: String(snapshot.chapter) });
    [snapshot.version, ...snapshot.compareVersions].forEach((version) => params.append("version", version));
    const data = await api(`/api/chapters?${params.toString()}`);
    if (token !== chapterLoadToken) return;
    await Promise.all([loadMarks(snapshot, token), loadProgress(snapshot.version, token)]);
    if (token !== chapterLoadToken) return;
    renderVerses(data);
    if (options.scrollTop && !state.targetVerse) scrollReaderToTop();
    await loadCommentary(snapshot, token);
    if (token !== chapterLoadToken) return;
    await loadAudio(snapshot, token);
    if (token !== chapterLoadToken) return;
    saveReadingHistory(snapshot);
    saveState();
  } catch (error) {
    if (token !== chapterLoadToken) return;
    setError(error);
  }
  if (token !== chapterLoadToken) return;
  renderChrome();
}

async function loadDashboard() {
  const [diagnosticData, exportData, progressData] = await Promise.all([
    api("/api/diagnostics"),
    api("/api/user/export"),
    state.version ? api(`/api/user/progress?version=${encodeURIComponent(state.version)}`) : Promise.resolve(null),
  ]);
  if (progressData) state.progress = progressData;
  const favorites = exportData.marks.filter((mark) => mark.favorite).length;
  const notes = exportData.marks.filter((mark) => mark.note || mark.tags).length;
  const history = exportData.history;
  dashboardPanel.innerHTML = `
    <div class="dashboardItem">
      <div class="dashboardLabel">最近阅读</div>
      <button class="dashboardAction" type="button" ${
        history ? `data-book="${history.book}" data-chapter="${history.chapter}" data-version="${escapeHtml(history.version)}"` : "disabled"
      }>
        ${history ? `${escapeHtml(versionLabel(history.version))} · ${history.book}:${history.chapter}` : "暂无记录"}
      </button>
    </div>
    <div class="dashboardItem">
      <div class="dashboardLabel">个人资料</div>
      <button class="dashboardAction" type="button" data-open-my="all">${favorites} 收藏 · ${notes} 笔记</button>
    </div>
    <div class="dashboardItem">
      <div class="dashboardLabel">阅读进度</div>
      <button class="dashboardAction" type="button" data-continue-unread>
        ${progressData ? `${progressData.read}/${progressData.total} 章 · ${progressData.percent}%` : "暂无进度"}
      </button>
      <button class="dashboardMiniAction" type="button" data-mark-current-read>${isCurrentChapterRead() ? "取消本章已读" : "标记本章已读"}</button>
    </div>
    <div class="dashboardItem">
      <div class="dashboardLabel">数据状态</div>
      <div class="dashboardValue">${diagnosticData.ok ? "正常" : "需检查"}</div>
    </div>
  `;
}

function findNextUnreadChapter() {
  const readSet = new Set((state.progress?.readChapters || []).map((item) => `${item.book}:${item.chapter}`));
  const chapters = state.books.flatMap((book) =>
    Array.from({ length: book.chapterCount }, (_, index) => ({ book: book.id, chapter: index + 1 })),
  );
  const currentIndex = chapters.findIndex((item) => item.book === state.book && item.chapter === state.chapter);
  const ordered = [...chapters.slice(Math.max(0, currentIndex + 1)), ...chapters.slice(0, Math.max(0, currentIndex + 1))];
  return ordered.find((item) => !readSet.has(`${item.book}:${item.chapter}`)) || null;
}

async function loadAudio(snapshot = {}, token = null) {
  const params = new URLSearchParams({
    book: String(snapshot.book ?? state.book),
    chapter: String(snapshot.chapter ?? state.chapter),
  });
  const data = await api(`/api/audio?${params.toString()}`);
  if (!isFreshChapterLoad(token)) return;
  renderAudio(data.audio || []);
}

function renderAudio(items) {
  if (!items.length) {
    audioPanel.hidden = true;
    audioPanel.innerHTML = "";
    return;
  }
  audioPanel.hidden = false;
  audioPanel.innerHTML = `
    <div class="audioHeader">
      <div>
        <div class="audioTitle">朗读音频</div>
        <div class="audioMeta">${items.length} 个来源</div>
      </div>
      <select id="audioSourceSelect">
        ${items
          .map((item, index) => `<option value="${index}">${escapeHtml(item.source)} · ${escapeHtml(item.fileName)}</option>`)
          .join("")}
      </select>
    </div>
    <audio id="chapterAudio" controls src="${escapeHtml(items[0].url)}"></audio>
  `;
  const select = audioPanel.querySelector("#audioSourceSelect");
  const audio = audioPanel.querySelector("#chapterAudio");
  select.addEventListener("change", () => {
    audio.src = items[Number(select.value)].url;
    audio.load();
  });
  audio.addEventListener("ended", () => {
    if (state.audioAutoNext) moveChapter(1);
  });
}

async function loadMarks(snapshot = {}, token = null) {
  const params = new URLSearchParams({
    version: snapshot.version ?? state.version,
    book: String(snapshot.book ?? state.book),
    chapter: String(snapshot.chapter ?? state.chapter),
  });
  const data = await api(`/api/user/marks?${params.toString()}`);
  if (!isFreshChapterLoad(token)) return;
  state.marks = new Map(data.marks.map((mark) => [Number(mark.verse), mark]));
}

async function loadProgress(version = state.version, token = null) {
  if (!version) return;
  const progress = await api(`/api/user/progress?version=${encodeURIComponent(version)}`);
  if (!isFreshChapterLoad(token)) return;
  state.progress = progress;
  renderProgressChrome();
  renderChapterGrid();
}

async function setCurrentChapterRead(read) {
  if (progressSaving) return;
  progressSaving = true;
  const buttons = [mobileMarkReadBtn, ...dashboardPanel.querySelectorAll("[data-mark-current-read]")].filter(Boolean);
  buttons.forEach((button) => {
    button.disabled = true;
  });
  try {
    const data = await postJson("/api/user/progress", {
      version: state.version,
      book: state.book,
      chapter: state.chapter,
      read,
    });
    state.progress = data.progress;
    renderProgressChrome();
    renderChapterGrid();
    await loadDashboard();
    showStatus(read ? "已标记本章已读" : "已取消本章已读", "success");
  } finally {
    progressSaving = false;
    buttons.forEach((button) => {
      button.disabled = false;
    });
    renderProgressChrome();
  }
}

function saveReadingHistory(snapshot = {}) {
  postJson("/api/user/history", {
    version: snapshot.version ?? state.version,
    book: snapshot.book ?? state.book,
    chapter: snapshot.chapter ?? state.chapter,
  }).catch(() => {});
}

async function saveVerseMark(mark) {
  const data = await postJson("/api/user/mark", mark);
  state.marks.set(Number(data.mark.verse), data.mark);
  updateVerseMarkDom(data.mark);
  renderChrome();
  loadDashboard().catch(() => {});
}

async function loadCommentary(snapshot = {}, token = null) {
  const commentary = snapshot.commentary ?? state.commentary;
  if (!commentary) {
    if (!isFreshChapterLoad(token)) return;
    commentaryContent.innerHTML = "";
    return;
  }
  if (!isFreshChapterLoad(token)) return;
  commentaryContent.innerHTML = `<div class="commentaryBlock"><div class="commentaryHeader"><div class="commentaryTitle">正在读取注释</div></div></div>`;
  try {
    const params = new URLSearchParams({
      source: commentary,
      book: String(snapshot.book ?? state.book),
      chapter: String(snapshot.chapter ?? state.chapter),
    });
    const data = await api(`/api/commentary?${params.toString()}`);
    if (!isFreshChapterLoad(token)) return;
    renderCommentary(data);
  } catch (error) {
    if (!isFreshChapterLoad(token)) return;
    commentaryContent.innerHTML = `<div class="commentaryBlock"><div class="commentaryEntry error">${escapeHtml(
      error.message || error,
    )}</div></div>`;
  }
}

function renderCommentary(data) {
  if (!data.readable) {
    commentaryContent.innerHTML = `
      <div class="commentaryBlock">
        <div class="commentaryHeader">
          <div class="commentaryTitle">${escapeHtml(data.title)}</div>
          <div class="commentaryMeta">暂不可读</div>
        </div>
        <div class="commentaryEntry">
          <div class="commentaryText">这个注释库的数据疑似加密或压缩，后续版本再处理解码。</div>
        </div>
      </div>
    `;
    return;
  }
  if (!data.entries.length) {
    commentaryContent.innerHTML = `
      <div class="commentaryBlock">
        <div class="commentaryHeader">
          <div class="commentaryTitle">${escapeHtml(data.title)}</div>
          <div class="commentaryMeta">当前章节暂无注释</div>
        </div>
      </div>
    `;
    return;
  }
  commentaryContent.innerHTML = `
    <div class="commentaryBlock">
      <div class="commentaryHeader">
        <div class="commentaryTitle">${escapeHtml(data.title)}</div>
        <div class="commentaryMeta">${data.entries.length} 条</div>
      </div>
      <div class="commentaryEntries">
        ${data.entries.map(renderCommentaryEntry).join("")}
      </div>
    </div>
  `;
}

function renderCommentaryEntry(entry) {
  return `
    <article class="commentaryEntry" data-chapter="${entry.chapter}" data-from="${entry.fromVerse}" data-to="${entry.toVerse}">
      <div class="commentaryRef">${escapeHtml(formatCommentaryRef(entry))}</div>
      <div class="commentaryText">${escapeHtml(entry.text || "无文本内容")}</div>
      ${entry.hasImages ? `<div class="imageNote">包含图片资料，图片显示将在后续版本处理。</div>` : ""}
    </article>
  `;
}

function formatCommentaryRef(entry) {
  if (entry.chapter === 0) return "书卷导论";
  if (!entry.fromVerse && !entry.toVerse) return `第 ${entry.chapter} 章`;
  if (entry.fromVerse === entry.toVerse || !entry.toVerse) return `${entry.chapter}:${entry.fromVerse}`;
  return `${entry.chapter}:${entry.fromVerse}-${entry.toVerse}`;
}

function parseReference(input) {
  const value = input.trim().replace(/\s+/g, "");
  const match = value.match(/^(.+?)(\d+)[:：.．,，](\d+)$/);
  if (!match) return null;
  const [, rawBook, rawChapter, rawVerse] = match;
  const found = bookAliases().find(([alias]) => rawBook === alias || rawBook.startsWith(alias));
  if (!found) return null;
  return {
    book: found[1].id,
    chapter: Number(rawChapter),
    verse: Number(rawVerse),
  };
}

async function jumpToReference(ref) {
  state.book = ref.book;
  state.chapter = ref.chapter;
  resetVerseInteraction(ref.verse || null);
  renderBooks();
  renderChapterGrid();
  closeTopPanels();
  await loadChapter({ scrollTop: !state.targetVerse });
  const book = currentBook();
  if (book) showStatus(`${book.longName} ${state.chapter}${state.targetVerse ? `:${state.targetVerse}` : ""}`);
}

async function handleVoiceText(text) {
  quickInput.value = text;
  const ref = parseSpokenReference(text);
  if (!ref) {
    quickInput.value = text ? `未识别经文：${text}` : "未识别到经文";
    return;
  }
  await jumpToReference(ref);
}

window.handleAndroidVoice = (type, text) => {
  if (!voiceBtn) return;
  if (type === "start" || type === "ready" || type === "speech") {
    voiceBtn.classList.add("active");
    voiceBtn.textContent = "聆听";
    return;
  }
  if (type === "partial") {
    if (text) quickInput.value = text;
    return;
  }
  voiceBtn.classList.remove("active");
  voiceBtn.textContent = "语音";
  if (type === "result") {
    handleVoiceText(text).catch(setError);
  } else if (type === "error") {
    quickInput.value = text || "语音识别失败";
  }
};

async function runSearch(query, options = {}) {
  const append = !!options.append;
  if (append && searchState.loading) return;
  if (!append) closeContentPanels();
  const token = ++searchRequestToken;
  const offset = append ? searchState.nextOffset : 0;
  const scope = append ? searchState.scope : searchScope.value;
  const book = append ? searchState.book : state.book;
  searchState.loading = true;
  const params = new URLSearchParams({
    version: state.version,
    q: query,
    scope,
    book: String(book),
    limit: "40",
    offset: String(offset),
  });
  searchSummary.textContent = append ? "正在加载更多" : "正在搜索";
  if (!append) searchResults.innerHTML = "";
  searchPanel.hidden = false;
  try {
    const data = await api(`/api/search?${params.toString()}`);
    if (token !== searchRequestToken) return;
    searchState = {
      query,
      scope,
      book,
      results: append ? [...searchState.results, ...(data.results || [])] : data.results || [],
      nextOffset: Number(data.nextOffset || 0),
      hasMore: !!data.hasMore,
      loading: false,
    };
    renderSearchResults(data);
  } catch (error) {
    if (token === searchRequestToken) searchState.loading = false;
    throw error;
  }
}

function renderSearchResults(data) {
  const count = searchState.results.length;
  const moreText = searchState.hasMore ? "，可继续加载" : "";
  searchSummary.textContent = count ? `已显示 ${count} 条结果${moreText}：${data.query}` : `没有找到：${data.query}`;
  searchResults.innerHTML = count
    ? `${searchState.results
        .map(
          (item) => `
            <button class="searchResult" type="button" data-book="${item.book}" data-chapter="${item.chapter}" data-verse="${item.verse}">
              <span class="searchRef">${escapeHtml(item.bookName)} ${item.chapter}:${item.verse}</span>
              <span class="searchText">${highlightText(item.text, data.query)}</span>
            </button>
          `,
        )
        .join("")}
        ${
          searchState.hasMore
            ? `<button class="searchMoreBtn" type="button" data-search-more>加载更多</button>`
            : ""
        }`
    : `<div class="empty">换一个关键词，或调整搜索范围。</div>`;
}

function highlightText(text, query) {
  const safe = escapeHtml(text);
  const keyword = String(query || "").trim();
  if (!keyword) return safe;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(escaped, "gi"), (match) => `<mark>${match}</mark>`);
}

function closeSearch() {
  searchRequestToken += 1;
  searchState.loading = false;
  searchPanel.hidden = true;
}

function closeStrong() {
  strongRequestToken += 1;
  strongPanel.hidden = true;
}

function closeDictionary() {
  dictionaryRequestToken += 1;
  dictionaryPanel.hidden = true;
}

function closeAiResult() {
  aiRequestToken += 1;
  aiResultPanel.hidden = true;
}

function closeMyPanel() {
  myPanelRequestToken += 1;
  myPanel.hidden = true;
}

function closeReleaseNotes() {
  releaseNotesPanel.hidden = true;
}

function renderReleaseNotes(release = null) {
  const releaseNotes = release?.body ? `<pre>${escapeHtml(release.body)}</pre>` : "";
  releaseNotesContent.innerHTML = `
    <div class="releaseCurrent">
      <div class="releaseVersion">当前版本 ${APP_VERSION}</div>
      <div class="releaseHint">${
        release ? `GitHub 最新版本 ${escapeHtml(release.tagName || release.version || "")}` : "可在此查看本地更新记录和 GitHub Release 说明。"
      }</div>
    </div>
    ${RELEASE_NOTES.map(
      (item) => `
        <article class="releaseNote">
          <div class="releaseNoteTitle">V${escapeHtml(item.version)} <span>${escapeHtml(item.date)}</span></div>
          <ul>
            ${item.items.map((text) => `<li>${escapeHtml(text)}</li>`).join("")}
          </ul>
        </article>
      `,
    ).join("")}
    ${releaseNotes ? `<article class="releaseNote"><div class="releaseNoteTitle">GitHub Release</div>${releaseNotes}</article>` : ""}
  `;
}

function openReleaseNotes(release = lastUpdateInfo) {
  renderReleaseNotes(release);
  closeTopPanels();
  releaseNotesPanel.hidden = false;
  releaseNotesPanel.scrollIntoView({ block: "start", behavior: "smooth" });
}

function setUpdateStatus(text) {
  if (updateStatus) updateStatus.textContent = text;
}

function setLatestApkAsset(asset) {
  latestApkAsset = asset || null;
  if (downloadLatestApkBtn) downloadLatestApkBtn.disabled = !latestApkAsset;
  if (copyApkLinkBtn) copyApkLinkBtn.disabled = !latestApkAsset;
}

async function checkForUpdates() {
  if (updateCheckInProgress) {
    showStatus("正在检查更新，请稍候");
    return;
  }
  updateCheckInProgress = true;
  checkUpdateBtn.disabled = true;
  setLatestApkAsset(null);
  setUpdateStatus("正在检查 GitHub Release...");
  try {
    const info = await fetchLatestRelease();
    lastUpdateInfo = info;
    renderReleaseNotes(info);
    const asset = apkAssetFromRelease(info);
    if (!asset) {
      setUpdateStatus(`当前版本 ${APP_VERSION}，最新 ${info.tagName || ""} 未找到 APK。`);
      return;
    }
    setLatestApkAsset(asset);
    const latestVersion = String(info.version || info.tagName || "").replace(/^v/i, "");
    if (compareAppVersions(latestVersion, APP_VERSION) <= 0) {
      setUpdateStatus(`已是最新版本 ${APP_VERSION}。仍可复制或重新下载 APK：${asset.name}`);
      return;
    }
    setUpdateStatus(`发现新版本 ${latestVersion}：${asset.name}。可点击“下载最新 APK”或“复制 APK 链接”。`);
  } catch (error) {
    setUpdateStatus(error.message || String(error));
    renderDownloadProgress({ state: "error", message: error.message || String(error), percent: 0 });
  } finally {
    updateCheckInProgress = false;
    checkUpdateBtn.disabled = false;
  }
}

async function downloadLatestApk() {
  if (apkDownloadInProgress) {
    showStatus("APK 正在下载，请稍候");
    return;
  }
  if (!latestApkAsset) {
    await checkForUpdates();
    if (!latestApkAsset) return;
  }
  if (!window.AndroidUpdateApi?.downloadAndInstall) {
    window.open(latestApkAsset.url, "_blank", "noopener");
    setUpdateStatus(`已打开 APK 下载链接：${latestApkAsset.name}`);
    return;
  }
  apkDownloadInProgress = true;
  downloadLatestApkBtn.disabled = true;
  setUpdateStatus(`正在下载 APK：${latestApkAsset.name}`);
  pollDownloadProgress("update", () => {
    setUpdateStatus("APK 已下载，请在系统安装界面确认更新。");
    apkDownloadInProgress = false;
    downloadLatestApkBtn.disabled = false;
  }, () => {
    apkDownloadInProgress = false;
    downloadLatestApkBtn.disabled = false;
  });
  try {
    const result = JSON.parse(window.AndroidUpdateApi.downloadAndInstall(latestApkAsset.url, latestApkAsset.name));
    if (result.error) throw new Error(result.error);
    if (!result.started) {
      setUpdateStatus(result.message || "APK 已下载，请在系统安装界面确认更新。");
      stopDownloadProgressPolling();
      apkDownloadInProgress = false;
      downloadLatestApkBtn.disabled = false;
    }
  } catch (error) {
    const message = `${error.message || String(error)}。如果进度停在 0%，请点“复制 APK 链接”后用浏览器下载。`;
    setUpdateStatus(message);
    renderDownloadProgress({ state: "error", message, percent: 0 });
    showStatus("下载失败，可复制 APK 链接", "error");
    stopDownloadProgressPolling();
    apkDownloadInProgress = false;
    downloadLatestApkBtn.disabled = false;
    copyApkLinkBtn.disabled = false;
  }
}

async function copyLatestApkLink() {
  if (!latestApkAsset) {
    await checkForUpdates();
    if (!latestApkAsset) return;
  }
  await writeClipboard(latestApkAsset.url);
  setUpdateStatus(`已复制 APK 链接：${latestApkAsset.name}`);
  showStatus("已复制 APK 链接", "success");
  copyApkLinkBtn.textContent = "已复制链接";
  window.setTimeout(() => {
    copyApkLinkBtn.textContent = "复制 APK 链接";
  }, 1200);
}

async function openMyPanel(kind = "all") {
  closeContentPanels();
  const token = ++myPanelRequestToken;
  const params = new URLSearchParams({ kind, tag: myTagFilter.value.trim(), limit: "300" });
  const data = await api(`/api/user/marks/all?${params.toString()}`);
  if (token !== myPanelRequestToken) return;
  myPanel.hidden = false;
  renderMyResults(data.marks);
  myPanel.scrollIntoView({ block: "start", behavior: "smooth" });
}

function renderMyResults(marks) {
  myResults.innerHTML = marks.length
    ? marks
        .map(
          (mark) => `
            <button class="myResult" type="button" data-version="${escapeHtml(mark.version)}" data-book="${mark.book}" data-chapter="${mark.chapter}" data-verse="${mark.verse}">
              <span class="myRef">${escapeHtml(mark.bookName)} ${mark.chapter}:${mark.verse}</span>
              <span class="myBadges">${mark.favorite ? "收藏" : ""}${mark.highlighted ? " 高亮" : ""}${mark.tags ? ` #${escapeHtml(mark.tags)}` : ""}</span>
              ${mark.note ? `<span class="myNote">${escapeHtml(mark.note)}</span>` : ""}
            </button>
          `,
        )
        .join("")
    : `<div class="empty">还没有匹配的收藏或笔记。</div>`;
}

async function searchDictionary() {
  const source = dictionarySelect.value;
  const query = dictionaryInput.value.trim();
  if (!source || !query) return;
  closeContentPanels();
  const token = ++dictionaryRequestToken;
  const params = new URLSearchParams({ source, q: query, limit: "30" });
  dictionarySummary.textContent = "正在搜索词条";
  dictionaryResults.innerHTML = "";
  dictionaryPanel.hidden = false;
  const data = await api(`/api/dictionary/search?${params.toString()}`);
  if (token !== dictionaryRequestToken) return;
  renderDictionaryResults(data);
}

function renderDictionaryResults(data) {
  dictionarySummary.textContent = data.results.length ? `${data.title} · ${data.results.length} 条：${data.query}` : `没有找到：${data.query}`;
  dictionaryResults.innerHTML = data.results.length
    ? data.results
        .map(
          (item) => `
            <article class="dictionaryResult">
              <div class="dictionaryWord">${escapeHtml(item.word)}</div>
              <div class="dictionaryFrom">${escapeHtml(item.comeFrom || data.title)}</div>
              <div class="dictionaryText">${escapeHtml(item.text || "词条正文疑似加密，暂不可读。")}</div>
              ${renderDictionaryImages(item.images || [])}
            </article>
          `,
        )
        .join("")
    : `<div class="empty">换一个关键词再试。</div>`;
}

function renderDictionaryImages(images) {
  if (!images.length) return "";
  return `
    <div class="dictionaryImages">
      ${images.map((image) => `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.name)}" loading="lazy" />`).join("")}
    </div>
  `;
}

async function openStrong(code) {
  closeContentPanels();
  const token = ++strongRequestToken;
  strongTitle.textContent = `Strong ${code}`;
  strongContent.innerHTML = `<div class="loading">正在读取原文释义</div>`;
  strongPanel.hidden = false;
  const data = await api(`/api/strong?code=${encodeURIComponent(code)}`);
  if (token !== strongRequestToken) return;
  strongTitle.textContent = `Strong ${data.code}`;
  strongContent.innerHTML = `
    <div class="strongOriginal">${escapeHtml(data.original || data.code)}</div>
    <div class="strongTranslit">${escapeHtml(data.transliteration || "")}</div>
    <div class="strongDefinition">${escapeHtml(data.definition)}</div>
    ${renderStrongOccurrences(data.occurrences || [])}
  `;
  strongPanel.scrollIntoView({ block: "start", behavior: "smooth" });
}

function renderStrongOccurrences(occurrences) {
  if (!occurrences.length) return "";
  return `
    <div class="strongOccurrences">
      <div class="strongOccurrenceTitle">出现位置</div>
      ${occurrences
        .map(
          (item) =>
            `<button class="strongOccurrence" type="button" data-book="${item.book}" data-chapter="${item.chapter}" data-verse="${item.verse}">
              ${escapeHtml(item.bookName)} ${item.chapter}:${item.verse}
            </button>`,
        )
        .join("")}
    </div>
  `;
}

function focusCommentaryForVerse(verseNo) {
  if (!state.commentary) return;
  const entries = [...commentaryContent.querySelectorAll(".commentaryEntry")];
  entries.forEach((entry) => entry.classList.remove("activeCommentary"));
  const match = entries.find((entry) => {
    const chapter = Number(entry.dataset.chapter);
    const from = Number(entry.dataset.from);
    const to = Number(entry.dataset.to);
    if (chapter === 0) return false;
    if (!from && !to) return true;
    return verseNo >= from && verseNo <= (to || from);
  });
  if (match) {
    match.classList.add("activeCommentary");
    match.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

async function init() {
  setLoading("正在扫描本地译本");
  try {
    restoreState();
    const data = await api("/api/versions");
    const commentaryData = await api("/api/commentaries");
    const dictionaryData = await api("/api/dictionaries");
    state.versions = data.versions;
    state.commentaries = commentaryData.commentaries;
    state.dictionaries = dictionaryData.dictionaries;
    if (!state.versions.length) {
      content.innerHTML = `<div class="empty">没有找到可用的离线经文译本。</div>`;
      return;
    }
    const preferred = state.versions.find((version) => version.fileName.includes("和合本.db"));
    if (!state.versions.some((version) => version.id === state.version)) {
      const simplified = state.versions.find((version) => version.fileName === "和合本.db");
      const traditional = state.versions.find((version) => version.fileName === "和合本(繁體).db");
      state.version =
        (state.scriptPreference === "simplified" && simplified?.id) ||
        (state.scriptPreference === "traditional" && traditional?.id) ||
        preferred?.id ||
        state.versions[0].id;
    }
    state.compareVersions = state.compareVersions.filter((version) =>
      state.versions.some((item) => item.id === version && item.id !== state.version),
    );
    renderVersions();
    renderCompareVersions();
    if (!state.commentaries.some((source) => source.id === state.commentary)) state.commentary = "";
    renderCommentaries();
    renderStrongToggle();
    renderDictionaries();
    renderAiConfig();
    setUpdateStatus(`当前版本 ${APP_VERSION}`);
    await loadPackages();
    applySettings();
    await loadBooks();
    await loadProgress();
    await loadDashboard();
    await loadChapter();
  } catch (error) {
    setError(error);
  }
}

function moveChapter(delta) {
  const book = currentBook();
  if (!book) return false;
  const lastBook = state.books[state.books.length - 1];
  if (delta < 0 && state.book === 1 && state.chapter === 1) {
    showStatus("已经是第一章");
    return false;
  }
  if (delta > 0 && lastBook && state.book === lastBook.id && state.chapter === lastBook.chapterCount) {
    showStatus("已经是最后一章");
    return false;
  }
  resetVerseInteraction();
  state.chapter += delta;
  if (state.chapter < 1) {
    const index = state.books.findIndex((item) => item.id === state.book);
    if (index > 0) {
      const prevBook = state.books[index - 1];
      state.book = prevBook.id;
      state.chapter = prevBook.chapterCount;
    } else {
      state.chapter = 1;
    }
  } else if (state.chapter > book.chapterCount) {
    const index = state.books.findIndex((item) => item.id === state.book);
    if (index < state.books.length - 1) {
      const nextBook = state.books[index + 1];
      state.book = nextBook.id;
      state.chapter = 1;
    } else {
      state.chapter = book.chapterCount;
    }
  }
  renderBooks();
  loadChapter({ scrollTop: true });
  const nextBook = currentBook();
  if (nextBook) showStatus(`${nextBook.longName} ${state.chapter}`);
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

versionSelect.addEventListener("change", async () => {
  state.version = versionSelect.value;
  state.compareVersions = state.compareVersions.filter((version) => version !== state.version);
  state.chapter = 1;
  resetVerseInteraction();
  renderCompareVersions();
  await loadBooks();
  await loadProgress();
  await loadDashboard();
  await loadChapter({ scrollTop: true });
});

compareVersions.addEventListener("click", (event) => {
  const option = event.target.closest(".compareOption");
  if (!option) return;
  const checkbox = option.querySelector("input[type='checkbox']");
  if (!checkbox || checkbox.disabled) return;
  event.preventDefault();
  setCompareVersion(checkbox.value, !state.compareVersions.includes(checkbox.value));
});

compareVersions.addEventListener("change", (event) => {
  const checkbox = event.target.closest("input[type='checkbox']");
  if (!checkbox) return;
  setCompareVersion(checkbox.value, checkbox.checked);
});

commentarySelect.addEventListener("change", () => {
  state.commentary = commentarySelect.value;
  renderCommentaries();
  loadCommentary();
  saveState();
});

bookSelect.addEventListener("change", () => {
  state.book = Number(bookSelect.value);
  state.chapter = 1;
  resetVerseInteraction();
  renderBooks();
  renderChapterGrid();
  loadChapter({ scrollTop: true });
});

chapterTitleBtn.addEventListener("click", () => toggleBookPicker());
closeBookPickerBtn.addEventListener("click", () => toggleBookPicker(false));

bookSearchInput.addEventListener("input", renderBookGrid);

bookFilterTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-book-filter]");
  if (!button) return;
  bookFilter = button.dataset.bookFilter;
  bookFilterTabs.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  renderBookGrid();
});

bookGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-book]");
  if (!button) return;
  state.book = Number(button.dataset.book);
  state.chapter = 1;
  resetVerseInteraction();
  renderBooks();
  renderChapterGrid();
  loadChapter({ scrollTop: true });
});

chapterGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-chapter]");
  if (!button) return;
  state.chapter = Number(button.dataset.chapter);
  resetVerseInteraction();
  document.body.classList.remove("sidebarOpen");
  toggleBookPicker(false);
  loadChapter({ scrollTop: true });
});

quickForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = quickInput.value.trim();
  if (!query) return;
  try {
    const ref = parseReference(query);
    if (ref) {
      await jumpToReference(ref);
    } else {
      await runSearch(query);
    }
  } catch (error) {
    setError(error);
  }
});

searchResults.addEventListener("click", async (event) => {
  if (event.target.closest("[data-search-more]")) {
    await runSearch(searchState.query, { append: true });
    return;
  }
  const result = event.target.closest(".searchResult");
  if (!result) return;
  await jumpToReference({
    book: Number(result.dataset.book),
    chapter: Number(result.dataset.chapter),
    verse: Number(result.dataset.verse),
  });
});

content.addEventListener("click", (event) => {
  showReadingChrome();
  const strong = event.target.closest(".strongBtn");
  if (strong) {
    openStrong(strong.dataset.code).catch(setError);
    return;
  }
  const tool = event.target.closest(".verseTool");
  if (tool) {
    const verseNo = Number(tool.dataset.verse);
    const action = tool.dataset.action;
    if (action === "save-note") {
      const mark = markForVerse(verseNo);
      const note = content.querySelector(`[data-note-text="${verseNo}"]`)?.value || "";
      const tags = content.querySelector(`[data-note-tags="${verseNo}"]`)?.value || "";
      saveVerseMark({ ...mark, note, tags }).catch(setError);
    } else {
      runVerseAction(action, verseNo).catch(setError);
    }
    return;
  }
  const verse = event.target.closest(".verse");
  if (!verse) return;
  if (verseSelectionMode) {
    toggleVerseSelection(Number(verse.dataset.verse));
    return;
  }
  focusCommentaryForVerse(Number(verse.dataset.verse));
});

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateReadingChromeVisibility);
  },
  { passive: true },
);

content.addEventListener("contextmenu", (event) => {
  const verse = event.target.closest(".verse");
  if (!verse) return;
  event.preventDefault();
  openVerseMenu(Number(verse.dataset.verse), event.clientX, event.clientY);
});

content.addEventListener("pointerdown", (event) => {
  const verse = event.target.closest(".verse");
  if (event.pointerType !== "mouse" && !hasBlockingOverlayOpen() && !isInteractiveTarget(event.target)) {
    swipeState = startSwipeGesture(event.pointerId, event.clientX, event.clientY, event.target);
  }
  if (!verse || event.pointerType === "mouse") return;
  longPressTimer = window.setTimeout(() => {
    openVerseMenu(Number(verse.dataset.verse), event.clientX, event.clientY);
  }, 520);
});

content.addEventListener("pointermove", (event) => {
  if (!swipeState || event.pointerId !== swipeState.id) return;
  updateSwipeGesture(swipeState, event.clientX, event.clientY);
});

content.addEventListener("pointerup", (event) => {
  cancelLongPress();
  if (swipeState && event.pointerId === swipeState.id) {
    finishSwipeGesture(swipeState, event.clientX, event.clientY);
    swipeState = null;
  }
  window.setTimeout(updateSelectionBar, 0);
});

content.addEventListener("pointercancel", () => {
  cancelLongPress();
  swipeState = null;
});

if (!window.PointerEvent) {
  content.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      const verse = event.target.closest(".verse");
      touchFallbackState = startSwipeGesture(touch.identifier, touch.clientX, touch.clientY, event.target);
      if (!verse) return;
      longPressTimer = window.setTimeout(() => {
        openVerseMenu(Number(verse.dataset.verse), touch.clientX, touch.clientY);
      }, 520);
    },
    { passive: true },
  );

  content.addEventListener(
    "touchmove",
    (event) => {
      if (!touchFallbackState) return;
      const touch = findTouchById(event.touches, touchFallbackState.id);
      if (!touch) return;
      updateSwipeGesture(touchFallbackState, touch.clientX, touch.clientY);
    },
    { passive: true },
  );

  content.addEventListener("touchend", (event) => {
    cancelLongPress();
    if (touchFallbackState) {
      const touch = findTouchById(event.changedTouches, touchFallbackState.id);
      if (touch) finishSwipeGesture(touchFallbackState, touch.clientX, touch.clientY);
      touchFallbackState = null;
    }
    window.setTimeout(updateSelectionBar, 0);
  });

  content.addEventListener("touchcancel", () => {
    cancelLongPress();
    touchFallbackState = null;
  });
}

document.addEventListener("selectionchange", () => {
  if (selectionFrame) return;
  selectionFrame = window.requestAnimationFrame(() => {
    selectionFrame = 0;
    updateSelectionBar();
  });
});

content.addEventListener("dblclick", () => {
  const selected = window.getSelection()?.toString().trim();
  if (verseSelectionMode) return;
  if (!selected || selected.length > 30) return;
  dictionaryInput.value = selected;
  searchDictionary().catch(setError);
});

strongToggle.addEventListener("change", () => {
  state.showStrong = strongToggle.checked;
  saveState();
  loadChapter();
});

audioAutoNext.addEventListener("change", () => {
  state.audioAutoNext = audioAutoNext.checked;
  saveState();
});

dictionaryBtn.addEventListener("click", () => searchDictionary().catch(setError));
dictionaryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchDictionary().catch(setError);
  }
});
dictionarySelect.addEventListener("change", renderDictionaries);
packageList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-package-id]");
  if (!button) return;
  installPackage(button.dataset.packageId).catch(setError);
});
clearDownloadCacheBtn?.addEventListener("click", clearDownloadCache);
closeDictionaryBtn.addEventListener("click", closeDictionary);
closeAiResultBtn.addEventListener("click", closeAiResult);
aiResultContent.addEventListener("click", (event) => {
  if (!event.target.closest("[data-copy-ai-result]")) return;
  const text = aiResultContent.dataset.aiResultText || aiResultContent.textContent.trim();
  writeClipboard(text).then(() => {
    event.target.textContent = "已复制";
  }).catch(setError);
});
closeMyPanelBtn.addEventListener("click", closeMyPanel);

myPanel.addEventListener("click", async (event) => {
  const filter = event.target.closest("[data-my-filter]");
  if (filter) {
    await openMyPanel(filter.dataset.myFilter);
    return;
  }
  const result = event.target.closest(".myResult");
  if (!result) return;
  if (result.dataset.version && state.versions.some((version) => version.id === result.dataset.version)) {
    state.version = result.dataset.version;
    renderVersions();
    await loadBooks();
  }
  await jumpToReference({
    book: Number(result.dataset.book),
    chapter: Number(result.dataset.chapter),
    verse: Number(result.dataset.verse),
  });
});

myTagFilter.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    openMyPanel("all").catch(setError);
  }
});

dashboardPanel.addEventListener("click", async (event) => {
  const openMy = event.target.closest("[data-open-my]");
  if (openMy) {
    await openMyPanel(openMy.dataset.openMy);
    return;
  }
  if (event.target.closest("[data-continue-unread]")) {
    const nextUnread = findNextUnreadChapter();
    if (!nextUnread) return;
    state.book = nextUnread.book;
    state.chapter = nextUnread.chapter;
    resetVerseInteraction();
    renderBooks();
    await loadChapter({ scrollTop: true });
    return;
  }
  if (event.target.closest("[data-mark-current-read]")) {
    await setCurrentChapterRead(!isCurrentChapterRead());
    return;
  }
  const action = event.target.closest(".dashboardAction");
  if (!action || action.disabled) return;
  if (action.dataset.version && state.versions.some((version) => version.id === action.dataset.version)) {
    state.version = action.dataset.version;
    renderVersions();
  }
  state.book = Number(action.dataset.book);
  state.chapter = Number(action.dataset.chapter);
  resetVerseInteraction();
  await loadBooks();
  await loadChapter({ scrollTop: true });
});

themeSelect.addEventListener("change", () => {
  state.theme = themeSelect.value;
  applySettings();
  saveState();
});

paletteSelect.addEventListener("change", () => {
  state.palette = paletteSelect.value;
  applySettings();
  saveState();
});

scriptPreference.addEventListener("change", () => {
  state.scriptPreference = scriptPreference.value;
  saveState();
});

fontSizeRange.addEventListener("input", () => {
  state.fontSize = Number(fontSizeRange.value);
  applySettings();
  saveState();
});

lineHeightRange.addEventListener("input", () => {
  state.lineHeight = Number(lineHeightRange.value);
  applySettings();
  saveState();
});

mobileMarkReadBtn.addEventListener("click", () => {
  setCurrentChapterRead(!isCurrentChapterRead()).catch(setError);
});

async function copyVerse(verseNo) {
  const book = currentBook();
  const verse = verseTextForNumber(verseNo);
  const text = `${book.longName} ${state.chapter}:${verseNo} ${verse}`;
  await writeClipboard(text);
  showStatus("已复制经文", "success");
}

document.addEventListener("keydown", (event) => {
  const tag = event.target.tagName;
  if (event.key === "Escape" && handleBackIntent()) {
    event.preventDefault();
    return;
  }
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (event.key === "/") {
    event.preventDefault();
    quickInput.focus();
  } else if (event.key === "ArrowLeft") {
    moveChapter(-1);
  } else if (event.key === "ArrowRight") {
    moveChapter(1);
  }
});

exportDataBtn.addEventListener("click", async () => {
  const data = await api("/api/user/export");
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bible-reader-data-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

importDataBtn.addEventListener("click", () => importDataFile.click());
importDataFile.addEventListener("change", async () => {
  if (importInProgress) return;
  const file = importDataFile.files?.[0];
  if (!file) return;
  importInProgress = true;
  importDataBtn.disabled = true;
  userDataHint.textContent = "正在导入数据...";
  try {
    const payload = JSON.parse(await file.text());
    const result = await postJson("/api/user/import", payload);
    userDataHint.textContent = `已导入 ${result.imported} 条，阅读进度 ${result.progressImported || 0} 章`;
    showStatus("数据导入完成", "success");
    await loadMarks();
    await loadProgress();
    await loadDashboard();
    await loadChapter();
  } catch (error) {
    const message = error.message || String(error);
    userDataHint.textContent = `导入失败：${message}`;
    showStatus("导入失败，请检查文件", "error");
  } finally {
    importInProgress = false;
    importDataBtn.disabled = false;
    importDataFile.value = "";
  }
});

closeSearchBtn.addEventListener("click", closeSearch);
closeStrongBtn.addEventListener("click", closeStrong);
closeReleaseNotesBtn.addEventListener("click", closeReleaseNotes);
showReleaseNotesBtn.addEventListener("click", () => openReleaseNotes());
checkUpdateBtn.addEventListener("click", () => checkForUpdates());
downloadLatestApkBtn.addEventListener("click", () => downloadLatestApk().catch(setError));
copyApkLinkBtn.addEventListener("click", () => copyLatestApkLink().catch(setError));
saveAiConfigBtn.addEventListener("click", saveAiConfig);
testAiConfigBtn.addEventListener("click", () => testAiConfig());
showAiUsesBtn.addEventListener("click", showAiUses);
speechProviderSelect.addEventListener("change", () => {
  state.speechProvider = speechProviderSelect.value;
  if (state.speechProvider === "mimo") state.speechModel = "mimo-v2.5-asr";
  if (state.speechProvider === "openai" && state.speechModel === "mimo-v2.5-asr") {
    state.speechModel = "gpt-4o-mini-transcribe";
  }
  saveState();
  renderAiConfig();
});
mimoKeyTypeSelect.addEventListener("change", () => {
  state.mimoKeyType = mimoKeyTypeSelect.value;
  if (state.mimoKeyType === "standard") state.mimoBaseUrl = "https://api.xiaomimimo.com/v1";
  saveState();
  renderAiConfig();
});

verseMenu.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-menu-action]");
  if (!button) return;
  runVerseAction(button.dataset.menuAction).catch(setError);
  closeVerseMenu();
});

copySelectionBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
});

copySelectionBtn.addEventListener("click", () => {
  copySelectedVerses().catch(setError);
});
cancelSelectionBtn.addEventListener("click", closeSelectionBar);

document.addEventListener("click", (event) => {
  if (!verseMenu.hidden && !verseMenu.contains(event.target)) {
    closeVerseMenu();
  }
  if (
    !readerSettingsPanel.hidden &&
    !readerSettingsPanel.contains(event.target) &&
    !readerSettingsBtn.contains(event.target)
  ) {
    toggleReaderSettings(false);
  }
  if (
    !bookPickerPanel.hidden &&
    !bookPickerPanel.contains(event.target) &&
    !chapterTitleBtn.contains(event.target)
  ) {
    toggleBookPicker(false);
  }
});

strongContent.addEventListener("click", async (event) => {
  const occurrence = event.target.closest(".strongOccurrence");
  if (!occurrence) return;
  await jumpToReference({
    book: Number(occurrence.dataset.book),
    chapter: Number(occurrence.dataset.chapter),
    verse: Number(occurrence.dataset.verse),
  });
});
prevBtn.addEventListener("click", () => {
  moveChapter(-1);
});
nextBtn.addEventListener("click", () => {
  moveChapter(1);
});
menuBtn.addEventListener("click", () => {
  openSidebar("reading");
});
closeSidebarBtn.addEventListener("click", () => document.body.classList.remove("sidebarOpen"));
sidebarTabs?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sidebar-target]");
  if (!button) return;
  showSidebarPanel(button.dataset.sidebarTarget);
});
readerSettingsBtn.addEventListener("click", () => toggleReaderSettings());
closeReaderSettingsBtn.addEventListener("click", () => toggleReaderSettings(false));
overlay.addEventListener("click", () => {
  handleBackIntent();
});
mobilePrevBtn.addEventListener("click", () => moveChapter(-1));
mobileNextBtn.addEventListener("click", () => moveChapter(1));
mobileMenuBtn.addEventListener("click", () => {
  openSidebar("reading");
});
mobileMyBtn.addEventListener("click", () => openMyPanel("all").catch(setError));

function startVoiceInput(event) {
  event.preventDefault();
  saveAiConfig();
  if (state.speechProvider === "mimo") {
    if (!state.mimoKey) {
      quickInput.value = "请先在 AI 配置里填写小米 MiMo Key。";
      return;
    }
    if (state.mimoKeyType === "codeplan" && !state.mimoBaseUrl.trim()) {
      quickInput.value = "CodePlan / Token Plan 需要填写小米后台专属 Base URL。";
      return;
    }
    if (!window.AndroidVoiceApi?.startCloud) {
      quickInput.value = "当前版本不支持 MiMo 录音上传，请安装最新版 APK。";
      return;
    }
    voiceBtn.classList.add("active");
    voiceBtn.textContent = "录音";
    quickInput.value = "正在录音，松开后上传 MiMo 识别...";
    window.AndroidVoiceApi.startCloud("mimo", state.mimoKey, "mimo-v2.5-asr", normalizeMimoChatUrl());
    return;
  }
  if (state.speechProvider === "openai") {
    quickInput.value = state.openaiKey
      ? `已配置 OpenAI ${state.speechModel}。OpenAI 云端录音上传将在下一步接入。`
      : "请先在 AI 配置里填写 OpenAI Key。";
    return;
  }
  if (!window.AndroidVoiceApi?.start) {
    quickInput.value = "当前环境不支持系统语音识别，可在 AI 配置里切换到 OpenAI 云端识别。";
    return;
  }
  if (window.AndroidVoiceApi?.isAvailable) {
    const availability = JSON.parse(window.AndroidVoiceApi.isAvailable());
    if (!availability.available) {
      quickInput.value = "当前设备没有可用的系统语音识别服务，可在 AI 配置里切换到 OpenAI 云端识别。";
      return;
    }
  }
  voiceBtn.classList.add("active");
  voiceBtn.textContent = "按住";
  window.AndroidVoiceApi.start();
}

function stopVoiceInput(event) {
  event.preventDefault();
  if (state.speechProvider === "mimo" && window.AndroidVoiceApi?.stopCloud) {
    voiceBtn.textContent = "上传";
    quickInput.value = "正在上传语音并识别...";
    window.AndroidVoiceApi.stopCloud();
    return;
  }
  if (!window.AndroidVoiceApi?.stop) return;
  window.AndroidVoiceApi.stop();
}

voiceBtn.addEventListener("pointerdown", startVoiceInput);
voiceBtn.addEventListener("pointerup", stopVoiceInput);
voiceBtn.addEventListener("pointercancel", stopVoiceInput);
voiceBtn.addEventListener("pointerleave", (event) => {
  if (event.buttons) stopVoiceInput(event);
});

init();
