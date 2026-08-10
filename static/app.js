const state = {
  versions: [],
  books: [],
  commentaries: [],
  version: "",
  compareVersions: [],
  commentary: "",
  showStrong: false,
  book: 1,
  chapter: 1,
  targetVerse: null,
};
const STORAGE_KEY = "localBibleReaderState";

const versionSelect = document.querySelector("#versionSelect");
const compareVersions = document.querySelector("#compareVersions");
const bookSelect = document.querySelector("#bookSelect");
const chapterGrid = document.querySelector("#chapterGrid");
const chapterTitle = document.querySelector("#chapterTitle");
const versionTitle = document.querySelector("#versionTitle");
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

function api(path) {
  return fetch(path).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "请求失败");
    return data;
  });
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

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.version) state.version = saved.version;
    if (Array.isArray(saved.compareVersions)) {
      state.compareVersions = saved.compareVersions.filter((version) => typeof version === "string").slice(0, 3);
    }
    if (saved.commentary) state.commentary = saved.commentary;
    state.showStrong = !!saved.showStrong;
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
  chapterGrid.innerHTML = Array.from({ length: count }, (_, index) => {
    const chapter = index + 1;
    const active = chapter === state.chapter ? " active" : "";
    return `<button class="chapterBtn${active}" data-chapter="${chapter}">${chapter}</button>`;
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
      (verse) => `
        <article class="verse" data-verse="${verse.verse}">
          <div class="verseNo" id="v${verse.verse}">${verse.verse}</div>
          <div class="verseBody" data-verse="${verse.verse}">
            <div class="verseText">${escapeHtml(verse.text)}</div>
            ${renderStrongList(verse.strongs || [])}
            ${renderCompareList(verse.verse, compareByVersion)}
          </div>
        </article>
      `,
    )
    .join("");
  focusTargetVerse();
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
    renderVerses(data);
    await loadCommentary();
    saveState();
  } catch (error) {
    setError(error);
  }
  renderChrome();
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
              <span class="searchText">${escapeHtml(item.text)}</span>
            </button>
          `,
        )
        .join("")
    : `<div class="empty">换一个关键词，或调整搜索范围。</div>`;
}

function closeSearch() {
  searchPanel.hidden = true;
}

function closeStrong() {
  strongPanel.hidden = true;
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
    state.versions = data.versions;
    state.commentaries = commentaryData.commentaries;
    if (!state.versions.length) {
      content.innerHTML = `<div class="empty">没有在 D:\\bibleDownload\\bibles 找到 .db 译本。</div>`;
      return;
    }
    const preferred = state.versions.find((version) => version.fileName.includes("和合本.db"));
    if (!state.versions.some((version) => version.id === state.version)) {
      state.version = preferred?.id || state.versions[0].id;
    }
    state.compareVersions = state.compareVersions.filter((version) =>
      state.versions.some((item) => item.id === version && item.id !== state.version),
    );
    renderVersions();
    renderCompareVersions();
    if (!state.commentaries.some((source) => source.id === state.commentary)) state.commentary = "";
    renderCommentaries();
    renderStrongToggle();
    await loadBooks();
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
  const verse = event.target.closest(".verse");
  if (!verse) return;
  focusCommentaryForVerse(Number(verse.dataset.verse));
});

strongToggle.addEventListener("change", () => {
  state.showStrong = strongToggle.checked;
  saveState();
  loadChapter();
});

closeSearchBtn.addEventListener("click", closeSearch);
closeStrongBtn.addEventListener("click", closeStrong);

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

init();
