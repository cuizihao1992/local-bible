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
  deepseekModel: "deepseek-chat",
  deepseekThinking: false,
  mimoKey: "",
  mimoModel: "mimo-v2.5",
  speechProvider: "system",
  openaiKey: "",
  speechModel: "gpt-4o-mini-transcribe",
  aiResponseStyle: "concise",
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
const chapterTitle = document.querySelector("#chapterTitle");
const versionTitle = document.querySelector("#versionTitle");
const progressSummary = document.querySelector("#progressSummary");
const content = document.querySelector("#content");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const menuBtn = document.querySelector("#menuBtn");
const closeSidebarBtn = document.querySelector("#closeSidebarBtn");
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
const showReleaseNotesBtn = document.querySelector("#showReleaseNotesBtn");
const aiProviderSelect = document.querySelector("#aiProviderSelect");
const deepseekKeyInput = document.querySelector("#deepseekKeyInput");
const deepseekModelSelect = document.querySelector("#deepseekModelSelect");
const deepseekThinkingToggle = document.querySelector("#deepseekThinkingToggle");
const mimoKeyInput = document.querySelector("#mimoKeyInput");
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
const verseMenu = document.querySelector("#verseMenu");
const verseMenuTitle = document.querySelector("#verseMenuTitle");
const selectionBar = document.querySelector("#selectionBar");
const selectionSummary = document.querySelector("#selectionSummary");
const copySelectionBtn = document.querySelector("#copySelectionBtn");
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
let selectedVerseNumbers = [];
let selectionFrame = 0;
let lastUpdateInfo = null;
let bookFilter = "all";
let downloadProgressTimer = null;
const APP_VERSION = "1.9.4";
const RELEASE_NOTES = [
  {
    version: "1.9.4",
    date: "2026-08-12",
    items: ["菜单打开时 Android 系统返回手势只关闭菜单", "增加检查更新、下载更新和版本更新说明", "阅读设置迁移到右上角按钮，菜单关闭按钮固定显示"],
  },
  {
    version: "1.9.0",
    date: "2026-08-12",
    items: ["Android APK 改为轻量离线包", "常用译本内置，其他译本和注释支持按需下载", "增加语音跳转、移动端菜单与高亮优化"],
  },
];

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
  content.innerHTML = `<div class="loading">${text}</div>`;
}

function setError(error) {
  content.innerHTML = `<div class="error">${error.message || error}</div>`;
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

function closeSidebar() {
  document.body.classList.remove("sidebarOpen");
}

function closeTopPanels() {
  toggleReaderSettings(false);
  closeSearch();
  closeStrong();
  closeDictionary();
  closeMyPanel();
  closeReleaseNotes();
  closeVerseMenu();
}

function handleBackIntent() {
  if (document.body.classList.contains("sidebarOpen")) {
    closeSidebar();
    return true;
  }
  if (!readerSettingsPanel.hidden) {
    toggleReaderSettings(false);
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
  if (!verseMenu.hidden) {
    closeVerseMenu();
    return true;
  }
  if (!selectionBar.hidden) {
    closeSelectionBar();
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
    if (saved.mimoModel) state.mimoModel = saved.mimoModel;
    if (saved.speechProvider) state.speechProvider = saved.speechProvider;
    if (saved.openaiKey) state.openaiKey = saved.openaiKey;
    if (saved.speechModel) state.speechModel = saved.speechModel;
    if (saved.aiResponseStyle) state.aiResponseStyle = saved.aiResponseStyle;
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
      mimoModel: state.mimoModel,
      speechProvider: state.speechProvider,
      openaiKey: state.openaiKey,
      speechModel: state.speechModel,
      aiResponseStyle: state.aiResponseStyle,
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
  deepseekModelSelect.value = state.deepseekModel;
  deepseekThinkingToggle.checked = state.deepseekThinking;
  mimoKeyInput.value = state.mimoKey;
  mimoModelSelect.value = state.mimoModel;
  speechProviderSelect.value = state.speechProvider;
  openaiKeyInput.value = state.openaiKey;
  speechModelSelect.value = state.speechModel;
  aiResponseStyleSelect.value = state.aiResponseStyle;
  if (aiConfigHint) {
    aiConfigHint.textContent =
      state.speechProvider === "system"
        ? "系统语音识别依赖手机内置语音服务；不支持时可切换到 OpenAI 云端识别。"
        : state.speechProvider === "mimo"
          ? "小米 MiMo 云端识别需要网络和 MiMo Key，语音模型可选 mimo-v2.5-asr。"
          : "OpenAI 云端识别需要网络和 OpenAI Key，推荐模型 gpt-4o-mini-transcribe。";
  }
}

function saveAiConfig() {
  state.aiProvider = aiProviderSelect.value;
  state.deepseekKey = deepseekKeyInput.value.trim();
  state.deepseekModel = deepseekModelSelect.value;
  state.deepseekThinking = deepseekThinkingToggle.checked;
  state.mimoKey = mimoKeyInput.value.trim();
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
    "DeepSeek/MiMo 可用于经文解释、上下文问答、笔记整理、主题查经、搜索意图解析；OpenAI/MiMo 语音模型可做跳转指令识别，例如“马太福音三章十一节”。";
}

function currentAiConfig() {
  if (state.aiProvider === "mimo") {
    return {
      provider: "小米 MiMo",
      url: "https://api.xiaomimimo.com/v1/chat/completions",
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
    model: state.deepseekThinking ? "deepseek-reasoner" : state.deepseekModel,
  };
}

async function testAiConfig() {
  saveAiConfig();
  const config = currentAiConfig();
  if (!config.key) {
    aiConfigHint.textContent = `请先填写 ${config.provider} Key。`;
    return;
  }
  testAiConfigBtn.disabled = true;
  aiConfigHint.textContent = `正在检查 ${config.provider} 配置...`;
  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
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
    if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    aiConfigHint.textContent = `${config.provider} 可用：${text || "已返回响应"}`;
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

function pollDownloadProgress(kind = "package", onDone = null) {
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
      }
    } catch (error) {
      renderDownloadProgress({ state: "error", message: error.message || String(error), percent: 0 });
      stopDownloadProgressPolling();
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
    if (packageHint) packageHint.textContent = androidResult.message || "已清理下载缓存。";
  } catch (error) {
    renderDownloadProgress({ state: "error", message: error.message || String(error), percent: 0 });
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
  const button = [...(packageList?.querySelectorAll("[data-package-id]") || [])].find(
    (item) => item.dataset.packageId === packageId,
  );
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
    }
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = "重试";
    }
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
  const inScope = bookFilter === "all" || (bookFilter === "ot" ? book.id <= 39 : book.id >= 40);
  if (!inScope) return false;
  if (!keyword) return true;
  return `${book.shortName || ""} ${book.longName || ""}`.toLowerCase().includes(keyword);
}

function renderBookGrid() {
  if (!bookGrid) return;
  const books = state.books.filter(bookMatchesFilter);
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
    : `<div class="bookEmpty">没有匹配的书卷</div>`;
}

function renderChapterGrid() {
  const book = currentBook();
  const count = book?.chapterCount || 1;
  const readSet = new Set((state.progress?.readChapters || []).map((item) => `${item.book}:${item.chapter}`));
  if (chapterPanelTitle) chapterPanelTitle.textContent = book ? `${book.longName || book.shortName} 章节` : "章节";
  if (chapterPanelMeta) chapterPanelMeta.textContent = book ? `${count} 章 · 当前第 ${state.chapter} 章` : "";
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
  versionTitle.textContent = version ? `${version.name}${compareText}` : "";
  prevBtn.disabled = state.book === 1 && state.chapter === 1;
  const lastBook = state.books[state.books.length - 1];
  nextBtn.disabled = !!lastBook && state.book === lastBook.id && state.chapter === lastBook.chapterCount;
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

  content.innerHTML = mainChapter.verses
    .map(
      (verse) => {
        const mark = markForVerse(verse.verse);
        return `
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
  focusTargetVerse();
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

function closeSelectionBar() {
  selectionBar.hidden = true;
  selectedVerseNumbers = [];
}

function toggleReaderSettings(show = readerSettingsPanel.hidden) {
  readerSettingsPanel.hidden = !show;
}

function verseTextForNumber(verseNo) {
  return content.querySelector(`.verse[data-verse="${verseNo}"] .verseText`)?.textContent.trim() || "";
}

function formatVerseLines(verseNumbers) {
  const book = currentBook();
  return verseNumbers
    .map((verseNo) => {
      const verse = verseTextForNumber(verseNo);
      return verse ? `${book.longName} ${state.chapter}:${verseNo} ${verse}` : "";
    })
    .filter(Boolean)
    .join("\n");
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
  await writeClipboard(formatVerseLines(selectedVerseNumbers));
  copySelectionBtn.textContent = "已复制";
  window.setTimeout(closeSelectionBar, 900);
}

async function runVerseAction(action, verseNo = state.activeVerse) {
  if (!verseNo) return;
  const mark = markForVerse(verseNo);
  if (action === "favorite") {
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

async function loadChapter() {
  setLoading("正在读取经文");
  renderChrome();
  renderChapterGrid();
  try {
    const params = new URLSearchParams({ book: String(state.book), chapter: String(state.chapter) });
    [state.version, ...state.compareVersions].forEach((version) => params.append("version", version));
    const data = await api(`/api/chapters?${params.toString()}`);
    await Promise.all([loadMarks(), loadProgress()]);
    renderVerses(data);
    await loadCommentary();
    await loadAudio();
    saveReadingHistory();
    saveState();
  } catch (error) {
    setError(error);
  }
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

async function loadAudio() {
  const params = new URLSearchParams({
    book: String(state.book),
    chapter: String(state.chapter),
  });
  const data = await api(`/api/audio?${params.toString()}`);
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

async function loadMarks() {
  const params = new URLSearchParams({
    version: state.version,
    book: String(state.book),
    chapter: String(state.chapter),
  });
  const data = await api(`/api/user/marks?${params.toString()}`);
  state.marks = new Map(data.marks.map((mark) => [Number(mark.verse), mark]));
}

async function loadProgress() {
  if (!state.version) return;
  state.progress = await api(`/api/user/progress?version=${encodeURIComponent(state.version)}`);
  renderProgressChrome();
  renderChapterGrid();
}

async function setCurrentChapterRead(read) {
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
}

function saveReadingHistory() {
  postJson("/api/user/history", {
    version: state.version,
    book: state.book,
    chapter: state.chapter,
  }).catch(() => {});
}

async function saveVerseMark(mark) {
  const data = await postJson("/api/user/mark", mark);
  state.marks.set(Number(data.mark.verse), data.mark);
  updateVerseMarkDom(data.mark);
  renderChrome();
  loadDashboard().catch(() => {});
}

async function loadCommentary() {
  if (!state.commentary) {
    commentaryContent.innerHTML = "";
    return;
  }
  commentaryContent.innerHTML = `<div class="commentaryBlock"><div class="commentaryHeader"><div class="commentaryTitle">正在读取注释</div></div></div>`;
  try {
    const params = new URLSearchParams({
      source: state.commentary,
      book: String(state.book),
      chapter: String(state.chapter),
    });
    const data = await api(`/api/commentary?${params.toString()}`);
    renderCommentary(data);
  } catch (error) {
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
  state.targetVerse = ref.verse || null;
  renderBooks();
  renderChapterGrid();
  closeSearch();
  await loadChapter();
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

async function runSearch(query) {
  const params = new URLSearchParams({
    version: state.version,
    q: query,
    scope: searchScope.value,
    book: String(state.book),
    limit: "60",
  });
  searchSummary.textContent = "正在搜索";
  searchResults.innerHTML = "";
  searchPanel.hidden = false;
  const data = await api(`/api/search?${params.toString()}`);
  renderSearchResults(data);
}

function renderSearchResults(data) {
  const count = data.results.length;
  searchSummary.textContent = count ? `找到 ${count} 条结果：${data.query}` : `没有找到：${data.query}`;
  searchResults.innerHTML = count
    ? data.results
        .map(
          (item) => `
            <button class="searchResult" type="button" data-book="${item.book}" data-chapter="${item.chapter}" data-verse="${item.verse}">
              <span class="searchRef">${escapeHtml(item.bookName)} ${item.chapter}:${item.verse}</span>
              <span class="searchText">${highlightText(item.text, data.query)}</span>
            </button>
          `,
        )
        .join("")
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
  searchPanel.hidden = true;
}

function closeStrong() {
  strongPanel.hidden = true;
}

function closeDictionary() {
  dictionaryPanel.hidden = true;
}

function closeMyPanel() {
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

async function checkForUpdates() {
  if (!window.AndroidUpdateApi?.checkLatest) {
    setUpdateStatus(`当前版本 ${APP_VERSION}。检查与下载更新仅用于 Android APK。`);
    openReleaseNotes();
    return;
  }
  checkUpdateBtn.disabled = true;
  setUpdateStatus("正在检查 GitHub Release...");
  let startedDownload = false;
  try {
    const info = JSON.parse(window.AndroidUpdateApi.checkLatest());
    if (info.error) throw new Error(info.error);
    lastUpdateInfo = info;
    renderReleaseNotes(info);
    const asset = apkAssetFromRelease(info);
    if (!asset) {
      setUpdateStatus(`当前版本 ${APP_VERSION}，最新 ${info.tagName || ""} 未找到 APK。`);
      return;
    }
    const latestVersion = String(info.version || info.tagName || "").replace(/^v/i, "");
    if (compareAppVersions(latestVersion, APP_VERSION) <= 0) {
      setUpdateStatus(`已是最新版本 ${APP_VERSION}。`);
      return;
    }
    setUpdateStatus(`发现新版本 ${latestVersion}，正在下载 APK...`);
    pollDownloadProgress("update", () => {
      setUpdateStatus("APK 已下载，请在系统安装界面确认更新。");
      checkUpdateBtn.disabled = false;
    });
    const result = JSON.parse(window.AndroidUpdateApi.downloadAndInstall(asset.url, asset.name));
    if (result.error) throw new Error(result.error);
    startedDownload = !!result.started;
    if (!startedDownload) setUpdateStatus(result.message || "APK 已下载，请在系统安装界面确认更新。");
  } catch (error) {
    setUpdateStatus(error.message || String(error));
    renderDownloadProgress({ state: "error", message: error.message || String(error), percent: 0 });
    checkUpdateBtn.disabled = false;
  } finally {
    if (!startedDownload) stopDownloadProgressPolling();
  }
}

async function openMyPanel(kind = "all") {
  const params = new URLSearchParams({ kind, tag: myTagFilter.value.trim(), limit: "300" });
  const data = await api(`/api/user/marks/all?${params.toString()}`);
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
  const params = new URLSearchParams({ source, q: query, limit: "30" });
  dictionarySummary.textContent = "正在搜索词条";
  dictionaryResults.innerHTML = "";
  dictionaryPanel.hidden = false;
  const data = await api(`/api/dictionary/search?${params.toString()}`);
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
  strongTitle.textContent = `Strong ${code}`;
  strongContent.innerHTML = `<div class="loading">正在读取原文释义</div>`;
  strongPanel.hidden = false;
  const data = await api(`/api/strong?code=${encodeURIComponent(code)}`);
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
  if (!book) return;
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
  loadChapter();
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
  state.targetVerse = null;
  renderCompareVersions();
  await loadBooks();
  await loadProgress();
  await loadDashboard();
  await loadChapter();
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
  state.targetVerse = null;
  renderBooks();
  renderChapterGrid();
  loadChapter();
});

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
  state.targetVerse = null;
  renderBooks();
  renderChapterGrid();
  loadChapter();
});

chapterGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-chapter]");
  if (!button) return;
  state.chapter = Number(button.dataset.chapter);
  state.targetVerse = null;
  document.body.classList.remove("sidebarOpen");
  loadChapter();
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
  const result = event.target.closest(".searchResult");
  if (!result) return;
  await jumpToReference({
    book: Number(result.dataset.book),
    chapter: Number(result.dataset.chapter),
    verse: Number(result.dataset.verse),
  });
});

content.addEventListener("click", (event) => {
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
  focusCommentaryForVerse(Number(verse.dataset.verse));
});

content.addEventListener("contextmenu", (event) => {
  const verse = event.target.closest(".verse");
  if (!verse) return;
  event.preventDefault();
  openVerseMenu(Number(verse.dataset.verse), event.clientX, event.clientY);
});

content.addEventListener("pointerdown", (event) => {
  const verse = event.target.closest(".verse");
  if (!verse || event.pointerType === "mouse") return;
  longPressTimer = window.setTimeout(() => {
    openVerseMenu(Number(verse.dataset.verse), event.clientX, event.clientY);
  }, 520);
});

content.addEventListener("pointerup", () => {
  clearTimeout(longPressTimer);
  window.setTimeout(updateSelectionBar, 0);
});

content.addEventListener("pointercancel", () => {
  clearTimeout(longPressTimer);
});

document.addEventListener("selectionchange", () => {
  if (selectionFrame) return;
  selectionFrame = window.requestAnimationFrame(() => {
    selectionFrame = 0;
    updateSelectionBar();
  });
});

content.addEventListener("dblclick", () => {
  const selected = window.getSelection()?.toString().trim();
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
    state.targetVerse = null;
    renderBooks();
    await loadChapter();
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
  state.targetVerse = null;
  await loadBooks();
  await loadChapter();
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
}

document.addEventListener("keydown", (event) => {
  const tag = event.target.tagName;
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
  const file = importDataFile.files?.[0];
  if (!file) return;
  const payload = JSON.parse(await file.text());
  const result = await postJson("/api/user/import", payload);
  userDataHint.textContent = `已导入 ${result.imported} 条，阅读进度 ${result.progressImported || 0} 章`;
  await loadMarks();
  await loadProgress();
  await loadDashboard();
  await loadChapter();
});

closeSearchBtn.addEventListener("click", closeSearch);
closeStrongBtn.addEventListener("click", closeStrong);
closeReleaseNotesBtn.addEventListener("click", closeReleaseNotes);
showReleaseNotesBtn.addEventListener("click", () => openReleaseNotes());
checkUpdateBtn.addEventListener("click", () => checkForUpdates());
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

document.addEventListener("click", (event) => {
  if (verseMenu.hidden || verseMenu.contains(event.target)) return;
  closeVerseMenu();
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
  state.targetVerse = null;
  moveChapter(-1);
});
nextBtn.addEventListener("click", () => {
  state.targetVerse = null;
  moveChapter(1);
});
menuBtn.addEventListener("click", () => {
  toggleReaderSettings(false);
  document.body.classList.add("sidebarOpen");
});
closeSidebarBtn.addEventListener("click", () => document.body.classList.remove("sidebarOpen"));
readerSettingsBtn.addEventListener("click", () => toggleReaderSettings());
closeReaderSettingsBtn.addEventListener("click", () => toggleReaderSettings(false));
overlay.addEventListener("click", () => {
  document.body.classList.remove("sidebarOpen");
  toggleReaderSettings(false);
});
mobilePrevBtn.addEventListener("click", () => moveChapter(-1));
mobileNextBtn.addEventListener("click", () => moveChapter(1));
mobileMenuBtn.addEventListener("click", () => {
  toggleReaderSettings(false);
  document.body.classList.add("sidebarOpen");
});
mobileMyBtn.addEventListener("click", () => openMyPanel("all").catch(setError));

function startVoiceInput(event) {
  event.preventDefault();
  if (state.speechProvider === "openai" || state.speechProvider === "mimo") {
    const providerName = state.speechProvider === "mimo" ? "小米 MiMo" : "OpenAI";
    const hasKey = state.speechProvider === "mimo" ? state.mimoKey : state.openaiKey;
    quickInput.value = hasKey
      ? `已配置 ${providerName} ${state.speechModel}，云端录音识别将在下一步接入。`
      : `请先在 AI 配置里填写 ${providerName} Key。`;
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
