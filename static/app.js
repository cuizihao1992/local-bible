const state = {
  versions: [],
  books: [],
  version: "",
  compareVersions: [],
  book: 1,
  chapter: 1,
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
        <article class="verse">
          <div class="verseNo">${verse.verse}</div>
          <div>
            <div class="verseText">${escapeHtml(verse.text)}</div>
            ${renderCompareList(verse.verse, compareByVersion)}
          </div>
        </article>
      `,
    )
    .join("");
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
    saveState();
  } catch (error) {
    setError(error);
  }
  renderChrome();
}

async function init() {
  setLoading("正在扫描本地译本");
  try {
    restoreState();
    const data = await api("/api/versions");
    state.versions = data.versions;
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

bookSelect.addEventListener("change", () => {
  state.book = Number(bookSelect.value);
  state.chapter = 1;
  renderChapterGrid();
  loadChapter();
});

chapterGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-chapter]");
  if (!button) return;
  state.chapter = Number(button.dataset.chapter);
  document.body.classList.remove("sidebarOpen");
  loadChapter();
});

prevBtn.addEventListener("click", () => moveChapter(-1));
nextBtn.addEventListener("click", () => moveChapter(1));
menuBtn.addEventListener("click", () => document.body.classList.add("sidebarOpen"));
overlay.addEventListener("click", () => document.body.classList.remove("sidebarOpen"));

init();
