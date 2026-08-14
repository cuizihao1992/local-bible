const base = process.env.BIBLE_READER_URL || "http://127.0.0.1:8765";

async function getJson(path) {
  const response = await fetch(`${base}${path}`);
  const data = await response.json();
  if (!response.ok) throw new Error(`${path}: ${data.error || response.status}`);
  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const health = await getJson("/api/health");
assert(health.versionCount > 0, "No Bible versions detected");

const chapter = await getJson("/api/chapters?version=KJV.db&book=1&chapter=1");
assert(chapter.chapters[0].verses[0].strongs.length > 0, "KJV Strong numbers missing");

const versions = await getJson("/api/versions");
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
      progress: `${progress.read}/${progress.total}`,
    },
    null,
    2,
  ),
);
