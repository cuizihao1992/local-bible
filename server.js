import { DatabaseSync } from "node:sqlite";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.BIBLE_DATA_ROOT || "D:\\bibleDownload";
const BIBLES_DIR = path.join(ROOT, "bibles");
const STATIC_DIR = path.join(__dirname, "static");
const HOST = process.env.BIBLE_READER_HOST || "127.0.0.1";
const PORT = Number(process.env.BIBLE_READER_PORT || 8765);
let versionCache = null;
const MAX_SEARCH_RESULTS = 80;

const BOOKS_CN = [
  ["创", "创世记", 50],
  ["出", "出埃及记", 40],
  ["利", "利未记", 27],
  ["民", "民数记", 36],
  ["申", "申命记", 34],
  ["书", "约书亚记", 24],
  ["士", "士师记", 21],
  ["得", "路得记", 4],
  ["撒上", "撒母耳记上", 31],
  ["撒下", "撒母耳记下", 24],
  ["王上", "列王纪上", 22],
  ["王下", "列王纪下", 25],
  ["代上", "历代志上", 29],
  ["代下", "历代志下", 36],
  ["拉", "以斯拉记", 10],
  ["尼", "尼希米记", 13],
  ["斯", "以斯帖记", 10],
  ["伯", "约伯记", 42],
  ["诗", "诗篇", 150],
  ["箴", "箴言", 31],
  ["传", "传道书", 12],
  ["歌", "雅歌", 8],
  ["赛", "以赛亚书", 66],
  ["耶", "耶利米书", 52],
  ["哀", "耶利米哀歌", 5],
  ["结", "以西结书", 48],
  ["但", "但以理书", 12],
  ["何", "何西阿书", 14],
  ["珥", "约珥书", 3],
  ["摩", "阿摩司书", 9],
  ["俄", "俄巴底亚书", 1],
  ["拿", "约拿书", 4],
  ["弥", "弥迦书", 7],
  ["鸿", "那鸿书", 3],
  ["哈", "哈巴谷书", 3],
  ["番", "西番雅书", 3],
  ["该", "哈该书", 2],
  ["亚", "撒迦利亚书", 14],
  ["玛", "玛拉基书", 4],
  ["太", "马太福音", 28],
  ["可", "马可福音", 16],
  ["路", "路加福音", 24],
  ["约", "约翰福音", 21],
  ["徒", "使徒行传", 28],
  ["罗", "罗马书", 16],
  ["林前", "哥林多前书", 16],
  ["林后", "哥林多后书", 13],
  ["加", "加拉太书", 6],
  ["弗", "以弗所书", 6],
  ["腓", "腓立比书", 4],
  ["西", "歌罗西书", 4],
  ["帖前", "帖撒罗尼迦前书", 5],
  ["帖后", "帖撒罗尼迦后书", 3],
  ["提前", "提摩太前书", 6],
  ["提后", "提摩太后书", 4],
  ["多", "提多书", 3],
  ["门", "腓利门书", 1],
  ["来", "希伯来书", 13],
  ["雅", "雅各书", 5],
  ["彼前", "彼得前书", 5],
  ["彼后", "彼得后书", 3],
  ["约一", "约翰一书", 5],
  ["约二", "约翰二书", 1],
  ["约三", "约翰三书", 1],
  ["犹", "犹大书", 1],
  ["启", "启示录", 22],
];

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".svg", "image/svg+xml"],
]);

function sendJson(res, payload, status = 200) {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
  });
  res.end(body);
}

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parsePositiveInt(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw httpError(`${name} 必须是正整数`);
  }
  return number;
}

function clampPositiveInt(value, fallback, max) {
  const number = Number(value || fallback);
  if (!Number.isInteger(number) || number < 1) return fallback;
  return Math.min(number, max);
}

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasTable(db, tableName) {
  return !!db.prepare("select name from sqlite_master where type='table' and name=?").get(tableName);
}

function readMetadata(filePath) {
  const metadata = {};
  try {
    const db = new DatabaseSync(filePath, { readOnly: true });
    try {
      if (hasTable(db, "metadata")) {
        for (const row of db.prepare("select name, value from metadata").all()) {
          metadata[String(row.name)] = row.value == null ? "" : String(row.value);
        }
      }
      if (hasTable(db, "Details")) {
        const row = db.prepare("select * from Details limit 1").get();
        if (row) {
          for (const [key, value] of Object.entries(row)) {
            if (value != null) metadata[key] = String(value);
          }
        }
      }
    } finally {
      db.close();
    }
  } catch {
    return metadata;
  }
  return metadata;
}

function bibleFiles() {
  if (versionCache) return versionCache;
  if (!existsSync(BIBLES_DIR)) return [];
  versionCache = readdirSync(BIBLES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".db"))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"))
    .map((entry) => {
      const filePath = path.join(BIBLES_DIR, entry.name);
      const metadata = readMetadata(filePath);
      const name = metadata.title || metadata.Title || metadata.Description || entry.name.replace(/\.db$/i, "");
      const shortName = metadata.abbreviation || metadata.Abbreviation || entry.name.replace(/\.db$/i, "");
      return {
        id: entry.name,
        name,
        shortName,
        fileName: entry.name,
        sizeMb: Number((statSync(filePath).size / 1024 / 1024).toFixed(2)),
      };
    });
  return versionCache;
}

function biblePath(versionId) {
  const fileName = path.basename(decodeURIComponent(versionId || ""));
  const filePath = path.join(BIBLES_DIR, fileName);
  if (!fileName.toLowerCase().endsWith(".db") || !existsSync(filePath)) {
    throw httpError(`找不到版本：${fileName}`, 404);
  }
  return filePath;
}

function fallbackBooks() {
  return BOOKS_CN.map(([shortName, longName, chapterCount], index) => ({
    id: index + 1,
    shortName,
    longName,
    chapterCount,
  }));
}

function getBooks(versionId) {
  if (!versionId) return fallbackBooks();
  try {
    const db = new DatabaseSync(biblePath(versionId), { readOnly: true });
    try {
      if (!hasTable(db, "Books")) return fallbackBooks();
      const rows = db.prepare("select id, ShortName, LongName, ChapterCount from Books order by id").all();
      if (!rows.length) return fallbackBooks();
      return rows.map((row) => ({
        id: Number(row.id),
        shortName: row.ShortName,
        longName: row.LongName,
        chapterCount: Number(row.ChapterCount),
      }));
    } finally {
      db.close();
    }
  } catch {
    return fallbackBooks();
  }
}

function getChapter(versionId, book, chapter) {
  const db = new DatabaseSync(biblePath(versionId), { readOnly: true });
  try {
    const rows = db
      .prepare("select Verse, Scripture from Bible where Book=? and Chapter=? order by Verse")
      .all(book, chapter);
    const books = getBooks(versionId);
    const bookInfo = books.find((item) => item.id === book);
    const versionInfo = bibleFiles().find((item) => item.id === versionId);
    return {
      version: versionId,
      versionName: versionInfo?.name || versionId,
      shortName: versionInfo?.shortName || versionId,
      book,
      bookName: bookInfo?.longName || `第 ${book} 卷`,
      chapter,
      verses: rows.map((row) => ({
        verse: Number(row.Verse),
        text: cleanText(row.Scripture),
      })),
    };
  } finally {
    db.close();
  }
}

function getChapters(versionIds, book, chapter) {
  const versions = [...new Set(versionIds.filter(Boolean))].slice(0, 4);
  if (!versions.length) throw httpError("至少需要一个 version 参数");

  const chapters = [];
  const errors = [];
  for (const version of versions) {
    try {
      chapters.push(getChapter(version, book, chapter));
    } catch (error) {
      errors.push({
        version,
        error: error.message || "读取失败",
      });
    }
  }

  return { chapters, errors };
}

function searchBible(versionId, query, options = {}) {
  const keyword = String(query || "").trim();
  if (keyword.length < 1) throw httpError("请输入搜索关键词");

  const scope = options.scope || "all";
  const currentBook = Number(options.book || 0);
  const limit = clampPositiveInt(options.limit, 40, MAX_SEARCH_RESULTS);
  const params = [`%${keyword}%`];
  const where = ["Scripture like ?"];

  if (scope === "ot") {
    where.push("Book between 1 and 39");
  } else if (scope === "nt") {
    where.push("Book between 40 and 66");
  } else if (scope === "book" && currentBook > 0) {
    where.push("Book = ?");
    params.push(currentBook);
  }

  const db = new DatabaseSync(biblePath(versionId), { readOnly: true });
  try {
    const rows = db
      .prepare(
        `select Book, Chapter, Verse, Scripture
         from Bible
         where ${where.join(" and ")}
         order by Book, Chapter, Verse
         limit ?`,
      )
      .all(...params, limit);
    const books = getBooks(versionId);
    return {
      version: versionId,
      query: keyword,
      scope,
      limit,
      results: rows.map((row) => {
        const book = books.find((item) => item.id === Number(row.Book));
        return {
          book: Number(row.Book),
          bookName: book?.longName || `第 ${row.Book} 卷`,
          chapter: Number(row.Chapter),
          verse: Number(row.Verse),
          text: cleanText(row.Scripture),
        };
      }),
    };
  } finally {
    db.close();
  }
}

async function sendStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.resolve(STATIC_DIR, `.${safePath}`);
  const relativePath = path.relative(STATIC_DIR, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not file");
    const ext = path.extname(filePath).toLowerCase();
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES.get(ext) || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
  try {
    if (url.pathname === "/api/health") {
      sendJson(res, {
        ok: true,
        dataRoot: ROOT,
        biblesDir: BIBLES_DIR,
        versionCount: bibleFiles().length,
      });
      return;
    }
    if (url.pathname === "/api/versions") {
      sendJson(res, { versions: bibleFiles() });
      return;
    }
    if (url.pathname === "/api/books") {
      sendJson(res, { books: getBooks(url.searchParams.get("version")) });
      return;
    }
    if (url.pathname === "/api/chapter") {
      const version = url.searchParams.get("version") || "";
      const book = parsePositiveInt(url.searchParams.get("book") || 1, "book");
      const chapter = parsePositiveInt(url.searchParams.get("chapter") || 1, "chapter");
      sendJson(res, getChapter(version, book, chapter));
      return;
    }
    if (url.pathname === "/api/chapters") {
      const versions = url.searchParams.getAll("version");
      const book = parsePositiveInt(url.searchParams.get("book") || 1, "book");
      const chapter = parsePositiveInt(url.searchParams.get("chapter") || 1, "chapter");
      sendJson(res, getChapters(versions, book, chapter));
      return;
    }
    if (url.pathname === "/api/search") {
      const version = url.searchParams.get("version") || "";
      const query = url.searchParams.get("q") || "";
      const scope = url.searchParams.get("scope") || "all";
      const book = Number(url.searchParams.get("book") || 0);
      const limit = url.searchParams.get("limit") || 40;
      sendJson(res, searchBible(version, query, { scope, book, limit }));
      return;
    }
    await sendStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, { error: error.message || "服务器错误" }, error.status || 400);
  }
});

if (!existsSync(BIBLES_DIR)) {
  console.error(`Bible directory not found: ${BIBLES_DIR}`);
  process.exit(1);
}

server.listen(PORT, HOST, () => {
  console.log(`Bible Reader running at http://${HOST}:${PORT}`);
  console.log(`Reading databases from ${BIBLES_DIR}`);
});
