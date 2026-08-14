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
assert(appJs.includes("function resetVerseInteraction"), "Navigation state reset helper missing");
assert(appJs.includes("let chapterLoadToken = 0;"), "Chapter load token missing");
assert(appJs.includes("let progressSaving = false;"), "Progress save busy guard missing");
assert(appJs.includes("let importInProgress = false;"), "Import busy guard missing");
assert(appJs.includes("function isFreshChapterLoad"), "Stale chapter load guard missing");
assert(appJs.includes("const snapshot = {"), "Chapter load snapshot missing");
assert(appJs.includes("mobilePrevBtn.disabled = atFirstChapter"), "Mobile previous button boundary state missing");
assert(appJs.includes("mobileNextBtn.disabled = atLastChapter"), "Mobile next button boundary state missing");
assert(appJs.includes("importDataBtn.disabled = true"), "Import button busy state missing");
assert(appJs.includes("showStatus(\"已经是第一章\")"), "First chapter boundary feedback missing");
assert(appJs.includes("closeAiResult();"), "Top panel close flow does not include AI panel");
assert(appJs.includes("overlay.addEventListener(\"click\", () => {\n  handleBackIntent();"), "Overlay does not use back intent close flow");
assert(indexHtml.includes('role="status" aria-live="polite"'), "Status panel accessibility attributes missing");
assert(stylesCss.includes(".mobileNav #voiceBtn::before") && stylesCss.includes("border-radius: 999px"), "Voice button indicator CSS missing");
assert(stylesCss.includes(".mobileNav button:disabled"), "Mobile nav disabled style missing");

console.log(
  JSON.stringify(
    {
      ok: true,
      versions: health.versionCount,
      commentaries: health.commentaryCount,
      dictionaries: health.dictionaryCount,
      audio: health.audioCount,
      sampleSearchResults: search.results.length,
      titleVersion: titleSample.version,
      titleCount: titleSample.titles.length,
      philemonTitleCount: philemonTitles.length,
      progress: `${progress.read}/${progress.total}`,
    },
    null,
    2,
  ),
);
