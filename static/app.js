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
};
const STORAGE_KEY = "localBibleReaderState";

const versionSelect = document.querySelector("#versionSelect");
const compareVersions = document.querySelector("#compareVersions");
const bookSelect = document.querySelector("#bookSelect");
const chapterGrid = document.querySelector("#chapterGrid");
const chapterTitle = document.querySelector("#chapterTitle");
const versionTitle = document.querySelector("#versionTitle");
const markReadBtn = document.querySelector("#markReadBtn");
const progressSummary = document.querySelector("#progressSummary");
const content = document.querySelector("#content");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const menuBtn = document.querySelector("#menuBtn");
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
const exportDataBtn = document.querySelector("#exportDataBtn");
const importDataBtn = document.querySelector("#importDataBtn");
const importDataFile = document.querySelector("#importDataFile");
const userDataHint = document.querySelector("#userDataHint");
const packageList = document.querySelector("#packageList");
const packageHint = document.querySelector("#packageHint");
const dashboardPanel = document.querySelector("#dashboardPanel");
const verseMenu = document.querySelector("#verseMenu");
const verseMenuTitle = document.querySelector("#verseMenuTitle");
const selectionBar = document.querySelector("#selectionBar");
const selectionSummary = document.querySelector("#selectionSummary");
const copySelectionBtn = document.querySelector("#copySelectionBtn");
const mobilePrevBtn = document.querySelector("#mobilePrevBtn");
const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const mobileSearchBtn = document.querySelector("#mobileSearchBtn");
const mobileMyBtn = document.querySelector("#mobileMyBtn");
const mobileNextBtn = document.querySelector("#mobileNextBtn");
const myPanel = document.querySelector("#myPanel");
const myResults = document.querySelector("#myResults");
const myTagFilter = document.querySelector("#myTagFilter");
const closeMyPanelBtn = document.querySelector("#closeMyPanelBtn");
let longPressTimer = null;
let selectedVerseNumbers = [];
let selectionFrame = 0;

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
  const button = packageList?.querySelector(`[data-package-id="${CSS.escape(packageId)}"]`);
  if (button) {
    button.disabled = true;
    button.textContent = "下载中";
  }
  if (packageHint) packageHint.textContent = "正在从 GitHub 下载资源包，请保持网络连接。";
  try {
    const data = window.AndroidBibleApi?.installPackage
      ? JSON.parse(window.AndroidBibleApi.installPackage(packageId))
      : await postJson("/api/package/install", { id: packageId });
    if (data.error) throw new Error(data.error);
    state.packages = data.packages || state.packages;
    await refreshResourceLists();
    renderPackages();
    await loadBooks();
    await loadChapter();
    if (packageHint) packageHint.textContent = `已安装 ${data.installed || 0} 个资源文件。`;
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = "重试";
    }
    if (packageHint) packageHint.textContent = error.message || String(error);
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
}

function renderChapterGrid() {
  const book = currentBook();
  const count = book?.chapterCount || 1;
  const readSet = new Set((state.progress?.readChapters || []).map((item) => `${item.book}:${item.chapter}`));
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
  if (markReadBtn) {
    markReadBtn.textContent = read ? "已读" : "标记已读";
    markReadBtn.classList.toggle("active", read);
    markReadBtn.disabled = !state.version;
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
  state.targetVerse = ref.verse;
  renderBooks();
  renderChapterGrid();
  closeSearch();
  await loadChapter();
}

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

markReadBtn.addEventListener("click", () => {
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
menuBtn.addEventListener("click", () => document.body.classList.add("sidebarOpen"));
overlay.addEventListener("click", () => document.body.classList.remove("sidebarOpen"));
mobilePrevBtn.addEventListener("click", () => moveChapter(-1));
mobileNextBtn.addEventListener("click", () => moveChapter(1));
mobileMenuBtn.addEventListener("click", () => document.body.classList.add("sidebarOpen"));
mobileSearchBtn.addEventListener("click", () => quickInput.focus());
mobileMyBtn.addEventListener("click", () => openMyPanel("all").catch(setError));

init();
