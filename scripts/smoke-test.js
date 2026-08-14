import { readFileSync } from "node:fs";

const base = process.env.BIBLE_READER_URL || "http://127.0.0.1:8765";

async function getJson(path) {
  const response = await fetch(`${base}${path}`);
  const data = await response.json();
  if (!response.ok) throw new Error(`${path}: ${data.error || response.status}`);
  return data;
}

async function getText(path) {
  const response = await fetch(`${base}${path}`);
  const text = await response.text();
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return text;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const health = await getJson("/api/health");
assert(health.versionCount > 0, "No Bible versions detected");

const chapter = await getJson("/api/chapters?version=KJV.db&book=1&chapter=1");
assert(chapter.chapters[0].verses[0].strongs.length > 0, "KJV Strong numbers missing");

const versions = await getJson("/api/versions");
const hhbVersion = versions.versions.find((version) => version.id === "和合本.db");
assert(hhbVersion?.titleCount > 0, "和合本 titleCount metadata missing");

const philemon = await getJson("/api/chapters?version=%E5%92%8C%E5%90%88%E6%9C%AC.db&book=57&chapter=1");
const philemonTitles = philemon.chapters?.[0]?.titles || [];
assert(philemonTitles.length === 4, "和合本腓利门书 1 章小标题缺失");
assert(philemonTitles.some((title) => title.verse === 8 && title.text.includes("阿尼西母")), "腓利门书小标题内容异常");

let titleSample = null;
for (const version of versions.versions) {
  const sample = await getJson(`/api/chapters?version=${encodeURIComponent(version.id)}&book=1&chapter=1`);
  const titles = sample.chapters?.[0]?.titles || [];
  if (titles.length) {
    titleSample = { version: version.id, titles };
    break;
  }
}
assert(titleSample && titleSample.titles[0].text, "Bible title data missing from all title-enabled versions");

const search = await getJson("/api/search?version=%E5%92%8C%E5%90%88%E6%9C%AC.db&q=%E6%B0%B8%E7%94%9F&scope=nt&limit=2");
assert(search.results.length > 0, "Search returned no results");
assert(Number.isInteger(search.nextOffset) && typeof search.hasMore === "boolean", "Search pagination metadata missing");
const searchNext = await getJson(
  `/api/search?version=%E5%92%8C%E5%90%88%E6%9C%AC.db&q=%E6%B0%B8%E7%94%9F&scope=nt&limit=2&offset=${search.nextOffset}`,
);
assert(Array.isArray(searchNext.results), "Search pagination next page shape invalid");

const strong = await getJson("/api/strong?code=H7225");
assert(strong.definition && strong.occurrences.length > 0, "Strong lookup incomplete");

const diagnostics = await getJson("/api/diagnostics");
assert(diagnostics.ok, "Diagnostics failed");

const marks = await getJson("/api/user/marks/all?limit=5");
assert(Array.isArray(marks.marks), "Marks endpoint shape invalid");

const progress = await getJson("/api/user/progress?version=KJV.db");
assert(Number.isInteger(progress.total) && progress.total > 1000, "Progress total chapter count invalid");
assert(Array.isArray(progress.readChapters), "Progress endpoint shape invalid");

const appJs = await getText("/app.js");
const indexHtml = await getText("/index.html");
const stylesCss = await getText("/styles.css");
const androidApi = readFileSync("android/app/src/main/java/local/bible/reader/OfflineApi.java", "utf8");
assert(appJs.includes("function resetVerseInteraction"), "Navigation state reset helper missing");
assert(appJs.includes("let readingChromePinnedUntil = 0;"), "Reading chrome pin state missing");
assert(appJs.includes("function keepReadingChromeVisible"), "Reading chrome pin helper missing");
assert(appJs.includes("Date.now() < readingChromePinnedUntil"), "Reading chrome pin guard missing");
assert(appJs.includes("let chapterLoadToken = 0;"), "Chapter load token missing");
assert(appJs.includes("let chapterLoading = false;"), "Chapter loading state missing");
assert(appJs.includes("let selectionCopyInProgress = false;"), "Selection copy busy state missing");
assert(appJs.includes("chapterLoading = true;") && appJs.includes("chapterLoading = false;"), "Chapter loading lifecycle missing");
assert(appJs.includes("prevBtn.disabled = chapterLoading || atFirstChapter"), "Desktop previous loading disabled state missing");
assert(appJs.includes("nextBtn.disabled = chapterLoading || atLastChapter"), "Desktop next loading disabled state missing");
assert(appJs.includes("mobilePrevBtn.disabled = chapterLoading || atFirstChapter"), "Mobile previous loading disabled state missing");
assert(appJs.includes("mobileNextBtn.disabled = chapterLoading || atLastChapter"), "Mobile next loading disabled state missing");
assert(appJs.includes('chapterLoading ? "disabled" : ""'), "Chapter grid loading disabled state missing");
assert(appJs.includes('showStatus("正在读取经文，请稍候")'), "Chapter loading duplicate navigation feedback missing");
assert(appJs.includes("function setChapterError"), "Chapter retry error renderer missing");
assert(appJs.includes("data-retry-chapter"), "Chapter retry button missing");
assert(appJs.includes('loadChapter({ scrollTop: true });') && appJs.includes('[data-retry-chapter]'), "Chapter retry click handler missing");
assert(appJs.includes("let progressSaving = false;"), "Progress save busy guard missing");
assert(appJs.includes("let importInProgress = false;"), "Import busy guard missing");
assert(appJs.includes("let packageInstallInProgress = false;"), "Package install busy guard missing");
assert(appJs.includes("let updateCheckInProgress = false;"), "Update check busy guard missing");
assert(appJs.includes("let apkDownloadInProgress = false;"), "APK download busy guard missing");
assert(appJs.includes("let searchState ="), "Search pagination state missing");
assert(appJs.includes("let searchRequestToken = 0;"), "Search stale request token missing");
assert(appJs.includes("let dictionaryRequestToken = 0;"), "Dictionary stale request token missing");
assert(appJs.includes("let strongRequestToken = 0;"), "Strong stale request token missing");
assert(appJs.includes("let aiRequestToken = 0;"), "AI stale request token missing");
assert(appJs.includes("let myPanelRequestToken = 0;"), "My panel stale request token missing");
assert(appJs.includes("const markSavingKeys = new Set();"), "Verse mark save guard missing");
assert(appJs.includes("markSavingKeys.has(key)") && appJs.includes("markSavingKeys.delete(key)"), "Verse mark save guard lifecycle missing");
assert(appJs.includes("正在保存标注，请稍候"), "Duplicate verse mark save feedback missing");
assert(appJs.includes("successMessage: mark.favorite ?") && appJs.includes("successMessage: mark.highlighted ?"), "Favorite/highlight save feedback missing");
assert(appJs.includes('tool.textContent = "保存中"') && appJs.includes('tool.textContent = "已保存"'), "Note save busy feedback missing");
assert(appJs.includes("let touchFallbackState = null;"), "Touch fallback gesture state missing");
assert(appJs.includes("let voiceInputActive = false;"), "Voice active state guard missing");
assert(appJs.includes("let voiceStopPending = false;"), "Voice stop pending guard missing");
assert(appJs.includes("function isFreshChapterLoad"), "Stale chapter load guard missing");
assert(appJs.includes("function setSearchBusy") && appJs.includes('searchPanel.setAttribute("aria-busy"'), "Search busy feedback missing");
assert(appJs.includes("quickSearchBtn.textContent = loading && !append"), "Search button busy text missing");
assert(appJs.includes("moreButton.disabled = loading && append"), "Search load-more busy guard missing");
assert(appJs.includes("function setDictionaryBusy") && appJs.includes("dictionaryBtn.disabled = loading"), "Dictionary busy feedback missing");
assert(appJs.includes("function closeContentPanels"), "Shared content panel close helper missing");
assert((appJs.match(/closeContentPanels\(\);/g) || []).length >= 7, "Content panel mutual-exclusion coverage missing");
assert((appJs.match(/keepReadingChromeVisible\(\);/g) || []).length >= 8, "Reading chrome keep-visible coverage missing");
assert((appJs.match(/token !== .*RequestToken/g) || []).length >= 5, "Stale async result guards missing");
assert(appJs.includes("searchRequestToken += 1;") && appJs.includes("searchState.loading = false;"), "Search close invalidation missing");
assert(appJs.includes("function startSwipeGesture"), "Shared swipe gesture helper missing");
assert(appJs.includes("function finishSwipeGesture"), "Shared swipe finish helper missing");
assert(appJs.includes("if (!window.PointerEvent)"), "Legacy touch fallback gate missing");
assert(appJs.includes('"touchstart"') && appJs.includes("touchFallbackState = startSwipeGesture"), "Legacy touchstart fallback missing");
assert(appJs.includes('"touchmove"') && appJs.includes("updateSwipeGesture(touchFallbackState"), "Legacy touchmove fallback missing");
assert(appJs.includes('content.addEventListener("touchend"'), "Legacy touchend fallback missing");
assert(appJs.includes('content.addEventListener("touchcancel"'), "Legacy touchcancel fallback missing");
assert(/voiceBtn\.addEventListener\(\s*"touchstart"[\s\S]*startVoiceInput\(event\)/.test(appJs), "Legacy voice touchstart fallback missing");
assert(/voiceBtn\.addEventListener\("touchend", stopVoiceInput/.test(appJs) && /voiceBtn\.addEventListener\("touchcancel", stopVoiceInput/.test(appJs), "Legacy voice touch stop fallback missing");
assert(appJs.includes("语音识别正在进行，请先松开按钮"), "Voice duplicate start feedback missing");
assert(appJs.includes('function pollDownloadProgress(kind = "package", onDone = null, onStop = null)'), "Download polling stop callback missing");
assert(appJs.includes("const snapshot = {"), "Chapter load snapshot missing");
assert(appJs.includes("mobilePrevBtn.disabled = chapterLoading || atFirstChapter"), "Mobile previous button boundary/loading state missing");
assert(appJs.includes("mobileNextBtn.disabled = chapterLoading || atLastChapter"), "Mobile next button boundary/loading state missing");
assert(appJs.includes("importDataBtn.disabled = true"), "Import button busy state missing");
assert(appJs.includes("资源包正在下载，请稍候"), "Package install duplicate feedback missing");
assert(appJs.includes("APK 正在下载，请稍候"), "APK duplicate download feedback missing");
assert(appJs.includes("data-search-more"), "Search load more button missing");
assert(appJs.includes("正在复制经文，请稍候"), "Selection duplicate copy feedback missing");
assert(appJs.includes('copySelectionBtn.textContent = "复制中"') && appJs.includes('copySelectionBtn.textContent = "已复制"'), "Selection copy busy text missing");
assert(appJs.includes("copyFormatSelect.disabled = selectionCopyInProgress"), "Selection format disabled state missing");
assert(appJs.includes("window.getSelection()?.removeAllRanges();"), "Selection close should clear native selection");
assert(appJs.includes("function chapterTitleInfo"), "Chapter title info helper missing");
assert(appJs.includes("function renderNoChapterTitleNotice"), "No-title chapter notice missing");
assert(appJs.includes("当前译本没有小标题数据"), "No-title version feedback missing");
assert(appJs.includes("真实小标题") && appJs.includes("内置小标题"), "Chapter title source labels missing");
assert(appJs.includes("titleLabel = Number(version.titleCount) > 0"), "Version title-count option label missing");
assert(appJs.includes('class="sectionHeading" data-section-verse='), "Inline section heading renderer missing");
assert(appJs.includes("sectionHeadingNo"), "Section heading verse marker missing");
assert(androidApi.includes('int offset = Math.max(0, intQuery(uri, "offset", 0));'), "Android search offset support missing");
assert(androidApi.includes('"hasMore", hasMore'), "Android search hasMore metadata missing");
assert(appJs.includes("showStatus(\"已经是第一章\")"), "First chapter boundary feedback missing");
assert(appJs.includes("closeAiResult();"), "Top panel close flow does not include AI panel");
assert(appJs.includes("overlay.addEventListener(\"click\", () => {\n  handleBackIntent();"), "Overlay does not use back intent close flow");
assert(indexHtml.includes('role="status" aria-live="polite"'), "Status panel accessibility attributes missing");
assert(stylesCss.includes(".mobileNav #voiceBtn::before") && stylesCss.includes("border-radius: 999px"), "Voice button indicator CSS missing");
assert(stylesCss.includes(".mobileNav button:disabled"), "Mobile nav disabled style missing");
assert(stylesCss.includes(".chapterBtn:disabled"), "Chapter grid disabled style missing");
assert(stylesCss.includes(".searchMoreBtn"), "Search load more style missing");
assert(stylesCss.includes(".verseTool:disabled"), "Verse tool disabled style missing");
assert(stylesCss.includes(".selectionBar button:disabled"), "Selection copy disabled style missing");
assert(stylesCss.includes(".quickForm button.loading"), "Search button loading style missing");
assert(stylesCss.includes(".searchMoreBtn:disabled"), "Search load-more disabled style missing");
assert(stylesCss.includes(".sectionHeadingNo"), "Visible section heading style missing");
assert(stylesCss.includes(".emptyTitleSummary"), "No-title notice style missing");
assert(stylesCss.includes(".chapterTitleEmpty"), "No-title notice text style missing");
assert(stylesCss.includes(".chapterError button"), "Chapter retry button style missing");

console.log(
  JSON.stringify(
    {
      ok: true,
      versions: health.versionCount,
      commentaries: health.commentaryCount,
      dictionaries: health.dictionaryCount,
      audio: health.audioCount,
      sampleSearchResults: search.results.length,
      searchHasMore: search.hasMore,
      titleVersion: titleSample.version,
      titleCount: titleSample.titles.length,
      philemonTitleCount: philemonTitles.length,
      progress: `${progress.read}/${progress.total}`,
    },
    null,
    2,
  ),
);
