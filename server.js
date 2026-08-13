import { DatabaseSync } from "node:sqlite";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.BIBLE_DATA_ROOT || "D:\\bibleDownload";
const BIBLES_DIR = path.join(ROOT, "bibles");
const COMMENTARIES_DIR = path.join(ROOT, "cj");
const DICTIONARIES_DIR = path.join(ROOT, "cd");
const AUDIO_DIR = path.join(ROOT, "ld");
const ORIG_DB = path.join(ROOT, "orig", "cbol.db");
const STATIC_DIR = path.join(__dirname, "static");
const USER_DATA_DIR = process.env.BIBLE_READER_USER_DATA_DIR || path.join(__dirname, "data");
const USER_DB = path.join(USER_DATA_DIR, "user.sqlite");
const HOST = process.env.BIBLE_READER_HOST || "127.0.0.1";
const PORT = Number(process.env.BIBLE_READER_PORT || 8765);
let versionCache = null;
let commentaryCache = null;
let dictionaryCache = null;
let audioCache = null;
const MAX_SEARCH_RESULTS = 80;

function initUserDb() {
  mkdirSync(USER_DATA_DIR, { recursive: true });
  const db = new DatabaseSync(USER_DB);
  try {
    db.exec(`
      create table if not exists verse_marks (
        version text not null,
        book integer not null,
        chapter integer not null,
        verse integer not null,
        favorite integer not null default 0,
        highlighted integer not null default 0,
        note text not null default '',
        tags text not null default '',
        updated_at text not null,
        primary key (version, book, chapter, verse)
      );
      create table if not exists reading_history (
        id integer primary key check (id = 1),
        version text not null,
        book integer not null,
        chapter integer not null,
        updated_at text not null
      );
      create table if not exists reading_progress (
        version text not null,
        book integer not null,
        chapter integer not null,
        read_at text not null,
        primary key (version, book, chapter)
      );
    `);
  } finally {
    db.close();
  }
}

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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024 * 5) {
        reject(httpError("请求体过大", 413));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(httpError("JSON 格式无效"));
      }
    });
    req.on("error", reject);
  });
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
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;|&rdquo;/g, "\"")
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksReadable(value = "") {
  const text = String(value).slice(0, 500);
  if (!text) return true;
  if (/[<>\u4e00-\u9fff]/.test(text)) return true;
  const alphaNum = (text.match(/[A-Za-z0-9+/=]/g) || []).length;
  return alphaNum / text.length < 0.82;
}

function extractStrongNumbers(value = "") {
  const matches = [...String(value).matchAll(/<W([HG])0*(\d{1,5})>/gi)];
  const seen = new Set();
  return matches
    .map((match) => {
      const type = match[1].toUpperCase();
      const number = match[2].padStart(5, "0");
      const code = `${type}${Number(match[2])}`;
      return { code, type, number };
    })
    .filter((item) => {
      const key = `${item.type}${item.number}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function hasTable(db, tableName) {
  return !!db.prepare("select name from sqlite_master where type='table' and name=?").get(tableName);
}

function readChapterTitles(db, book, chapter) {
  if (!hasTable(db, "Titles")) return [];
  return db
    .prepare("select Verse, Scripture from Titles where Book=? and Chapter=? order by Verse")
    .all(book, chapter)
    .map((row) => ({
      verse: Number(row.Verse),
      text: cleanText(row.Scripture),
    }))
    .filter((item) => item.verse > 0 && item.text);
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

function commentaryFiles() {
  if (commentaryCache) return commentaryCache;
  if (!existsSync(COMMENTARIES_DIR)) return [];
  commentaryCache = readdirSync(COMMENTARIES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".db"))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"))
    .map((entry) => {
      const filePath = path.join(COMMENTARIES_DIR, entry.name);
      const metadata = readMetadata(filePath);
      let count = 0;
      let readable = true;
      try {
        const db = new DatabaseSync(filePath, { readOnly: true });
        try {
          if (hasTable(db, "commentary")) {
            count = Number(db.prepare("select count(*) count from commentary").get().count);
            const sample = db.prepare("select Data from commentary where Data is not null and Data <> '' limit 1").get();
            readable = looksReadable(sample?.Data || "");
          }
        } finally {
          db.close();
        }
      } catch {
        readable = false;
      }
      const title = metadata.Title || metadata.title || metadata.Description || entry.name.replace(/\.db$/i, "");
      return {
        id: entry.name,
        title,
        fileName: entry.name,
        sizeMb: Number((statSync(filePath).size / 1024 / 1024).toFixed(2)),
        count,
        readable,
      };
    });
  return commentaryCache;
}

function dictionaryFiles() {
  if (dictionaryCache) return dictionaryCache;
  if (!existsSync(DICTIONARIES_DIR)) return [];
  dictionaryCache = readdirSync(DICTIONARIES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".db"))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"))
    .map((entry) => {
      const filePath = path.join(DICTIONARIES_DIR, entry.name);
      const metadata = readMetadata(filePath);
      const db = new DatabaseSync(filePath, { readOnly: true });
      try {
        const count = hasTable(db, "Dictionary") ? Number(db.prepare("select count(*) count from Dictionary").get().count) : 0;
        const imageCount = hasTable(db, "Images") ? Number(db.prepare("select count(*) count from Images").get().count) : 0;
        const sample = hasTable(db, "Dictionary")
          ? db.prepare("select Description from Dictionary where Description is not null and Description <> '' limit 1").get()
          : null;
        return {
          id: entry.name,
          title: metadata.Title || metadata.title || metadata.Description || entry.name.replace(/\.db$/i, ""),
          fileName: entry.name,
          count,
          imageCount,
          readable: looksReadable(sample?.Description || ""),
        };
      } finally {
        db.close();
      }
    });
  return dictionaryCache;
}

function audioFiles() {
  if (audioCache) return audioCache;
  if (!existsSync(AUDIO_DIR)) return [];
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".mp3")) {
        const rel = path.relative(AUDIO_DIR, fullPath);
        const parts = rel.split(path.sep);
        const bookMatch = parts.find((part) => /^\d+/.test(part))?.match(/^(\d+)/);
        const chapterMatch = entry.name.match(/_(\d+)\.mp3$/i);
        if (bookMatch && chapterMatch) {
          files.push({
            id: rel.replaceAll(path.sep, "/"),
            source: parts[0] || "朗读",
            fileName: entry.name,
            book: Number(bookMatch[1]),
            chapter: Number(chapterMatch[1]),
            sizeMb: Number((statSync(fullPath).size / 1024 / 1024).toFixed(2)),
          });
        }
      }
    }
  }
  walk(AUDIO_DIR);
  audioCache = files.sort((a, b) => a.source.localeCompare(b.source, "zh-Hans-CN") || a.chapter - b.chapter);
  return audioCache;
}

function biblePath(versionId) {
  const fileName = path.basename(decodeURIComponent(versionId || ""));
  const filePath = path.join(BIBLES_DIR, fileName);
  if (!fileName.toLowerCase().endsWith(".db") || !existsSync(filePath)) {
    throw httpError(`找不到版本：${fileName}`, 404);
  }
  return filePath;
}

function commentaryPath(sourceId) {
  const fileName = path.basename(decodeURIComponent(sourceId || ""));
  const filePath = path.join(COMMENTARIES_DIR, fileName);
  if (!fileName.toLowerCase().endsWith(".db") || !existsSync(filePath)) {
    throw httpError(`找不到注释：${fileName}`, 404);
  }
  return filePath;
}

function dictionaryPath(sourceId) {
  const fileName = path.basename(decodeURIComponent(sourceId || ""));
  const filePath = path.join(DICTIONARIES_DIR, fileName);
  if (!fileName.toLowerCase().endsWith(".db") || !existsSync(filePath)) {
    throw httpError(`找不到辞典：${fileName}`, 404);
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
    const titles = readChapterTitles(db, book, chapter);
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
      titles,
      verses: rows.map((row) => ({
        verse: Number(row.Verse),
        text: cleanText(row.Scripture),
        strongs: extractStrongNumbers(row.Scripture),
      })),
    };
  } finally {
    db.close();
  }
}

function lookupStrong(code) {
  const match = String(code || "").trim().toUpperCase().match(/^(?:W)?([HG])0*(\d{1,5})$/);
  if (!match) throw httpError("Strong 编号格式无效");
  if (!existsSync(ORIG_DB)) throw httpError("找不到原文库 cbol.db", 404);

  const type = match[1];
  const number = match[2].padStart(5, "0");
  const db = new DatabaseSync(ORIG_DB, { readOnly: true });
  try {
    const table = type === "H" ? "hfhl" : "gfhl";
    const numberColumn = type === "H" ? "hsnum" : "gsnum";
    const row = db.prepare(`select ${numberColumn} number, txt, orig, orig_fhl from ${table} where ${numberColumn}=?`).get(number);
    if (!row) throw httpError(`找不到 Strong 编号：${type}${Number(number)}`, 404);
    return {
      code: `${type}${Number(number)}`,
      type,
      number,
      original: cleanText(row.orig || ""),
      transliteration: cleanText(row.orig_fhl || ""),
      definition: cleanText(row.txt || ""),
      occurrences: findStrongOccurrences(type, number),
    };
  } finally {
    db.close();
  }
}

function getMarks(version, book, chapter) {
  const db = new DatabaseSync(USER_DB);
  try {
    return db
      .prepare(
        `select version, book, chapter, verse, favorite, highlighted, note, tags, updated_at updatedAt
         from verse_marks
         where version=? and book=? and chapter=?
         order by verse`,
      )
      .all(version, book, chapter)
      .map((row) => ({
        ...row,
        favorite: !!row.favorite,
        highlighted: !!row.highlighted,
      }));
  } finally {
    db.close();
  }
}

function getAllMarks(filter = {}) {
  const db = new DatabaseSync(USER_DB);
  try {
    const where = [];
    const params = [];
    if (filter.kind === "favorite") where.push("favorite = 1");
    if (filter.kind === "note") where.push("(note <> '' or tags <> '')");
    if (filter.tag) {
      where.push("tags like ?");
      params.push(`%${filter.tag}%`);
    }
    const rows = db
      .prepare(
        `select version, book, chapter, verse, favorite, highlighted, note, tags, updated_at updatedAt
         from verse_marks
         ${where.length ? `where ${where.join(" and ")}` : ""}
         order by updated_at desc
         limit ?`,
      )
      .all(...params, clampPositiveInt(filter.limit, 200, 1000));
    const books = fallbackBooks();
    return rows.map((row) => {
      const book = books.find((item) => item.id === Number(row.book));
      return {
        ...row,
        bookName: book?.longName || `第 ${row.book} 卷`,
        favorite: !!row.favorite,
        highlighted: !!row.highlighted,
      };
    });
  } finally {
    db.close();
  }
}

function saveMark(payload) {
  const version = String(payload.version || "");
  const book = parsePositiveInt(payload.book, "book");
  const chapter = parsePositiveInt(payload.chapter, "chapter");
  const verse = parsePositiveInt(payload.verse, "verse");
  const favorite = payload.favorite ? 1 : 0;
  const highlighted = payload.highlighted ? 1 : 0;
  const note = String(payload.note || "").slice(0, 4000);
  const tags = String(payload.tags || "").slice(0, 500);
  const updatedAt = new Date().toISOString();
  biblePath(version);

  const db = new DatabaseSync(USER_DB);
  try {
    db.prepare(
      `insert into verse_marks (version, book, chapter, verse, favorite, highlighted, note, tags, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)
       on conflict(version, book, chapter, verse)
       do update set favorite=excluded.favorite, highlighted=excluded.highlighted,
         note=excluded.note, tags=excluded.tags, updated_at=excluded.updated_at`,
    ).run(version, book, chapter, verse, favorite, highlighted, note, tags, updatedAt);
    return {
      version,
      book,
      chapter,
      verse,
      favorite: !!favorite,
      highlighted: !!highlighted,
      note,
      tags,
      updatedAt,
    };
  } finally {
    db.close();
  }
}

function saveHistory(payload) {
  const version = String(payload.version || "");
  const book = parsePositiveInt(payload.book, "book");
  const chapter = parsePositiveInt(payload.chapter, "chapter");
  biblePath(version);
  const updatedAt = new Date().toISOString();
  const db = new DatabaseSync(USER_DB);
  try {
    db.prepare(
      `insert into reading_history (id, version, book, chapter, updated_at)
       values (1, ?, ?, ?, ?)
       on conflict(id) do update set version=excluded.version, book=excluded.book,
         chapter=excluded.chapter, updated_at=excluded.updated_at`,
    ).run(version, book, chapter, updatedAt);
    return { version, book, chapter, updatedAt };
  } finally {
    db.close();
  }
}

function getHistory() {
  const db = new DatabaseSync(USER_DB);
  try {
    return db.prepare("select version, book, chapter, updated_at updatedAt from reading_history where id=1").get() || null;
  } finally {
    db.close();
  }
}

function totalChapterCount() {
  return fallbackBooks().reduce((sum, book) => sum + Number(book.chapterCount || 0), 0);
}

function getReadingProgress(version) {
  const safeVersion = String(version || "");
  biblePath(safeVersion);
  const db = new DatabaseSync(USER_DB);
  try {
    const readChapters = db
      .prepare(
        `select version, book, chapter, read_at readAt
         from reading_progress
         where version=?
         order by book, chapter`,
      )
      .all(safeVersion);
    const readSet = new Set(readChapters.map((item) => `${item.book}:${item.chapter}`));
    const books = fallbackBooks().map((book) => {
      const read = Array.from({ length: book.chapterCount }, (_, index) => index + 1).filter((chapter) =>
        readSet.has(`${book.id}:${chapter}`),
      ).length;
      return {
        id: book.id,
        shortName: book.shortName,
        longName: book.longName,
        chapterCount: book.chapterCount,
        read,
        unread: book.chapterCount - read,
      };
    });
    return {
      version: safeVersion,
      total: totalChapterCount(),
      read: readChapters.length,
      percent: Math.round((readChapters.length / totalChapterCount()) * 1000) / 10,
      readChapters,
      books,
    };
  } finally {
    db.close();
  }
}

function setChapterRead(payload) {
  const version = String(payload.version || "");
  const book = parsePositiveInt(payload.book, "book");
  const chapter = parsePositiveInt(payload.chapter, "chapter");
  const read = payload.read !== false;
  biblePath(version);
  const updatedAt = new Date().toISOString();
  const db = new DatabaseSync(USER_DB);
  try {
    if (read) {
      db.prepare(
        `insert into reading_progress (version, book, chapter, read_at)
         values (?, ?, ?, ?)
         on conflict(version, book, chapter) do update set read_at=excluded.read_at`,
      ).run(version, book, chapter, updatedAt);
    } else {
      db.prepare("delete from reading_progress where version=? and book=? and chapter=?").run(version, book, chapter);
    }
  } finally {
    db.close();
  }
  return {
    version,
    book,
    chapter,
    read,
    readAt: read ? updatedAt : null,
    progress: getReadingProgress(version),
  };
}

function exportUserData() {
  const db = new DatabaseSync(USER_DB);
  try {
    return {
      exportedAt: new Date().toISOString(),
      marks: db.prepare("select * from verse_marks order by updated_at desc").all(),
      history: getHistory(),
      progress: db.prepare("select * from reading_progress order by read_at desc").all(),
    };
  } finally {
    db.close();
  }
}

function importUserData(payload) {
  const marks = Array.isArray(payload.marks) ? payload.marks : [];
  const progress = Array.isArray(payload.progress) ? payload.progress : [];
  const db = new DatabaseSync(USER_DB);
  let committed = false;
  try {
    const insert = db.prepare(
      `insert into verse_marks (version, book, chapter, verse, favorite, highlighted, note, tags, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)
       on conflict(version, book, chapter, verse)
       do update set favorite=excluded.favorite, highlighted=excluded.highlighted,
         note=excluded.note, tags=excluded.tags, updated_at=excluded.updated_at`,
    );
    const insertProgress = db.prepare(
      `insert into reading_progress (version, book, chapter, read_at)
       values (?, ?, ?, ?)
       on conflict(version, book, chapter) do update set read_at=excluded.read_at`,
    );
    db.exec("begin");
    for (const item of marks.filter((mark) => mark.version && mark.book && mark.chapter && mark.verse)) {
      insert.run(
        String(item.version || ""),
        Number(item.book),
        Number(item.chapter),
        Number(item.verse),
        item.favorite ? 1 : 0,
        item.highlighted ? 1 : 0,
        String(item.note || ""),
        String(item.tags || ""),
        String(item.updated_at || item.updatedAt || new Date().toISOString()),
      );
    }
    for (const item of progress.filter((chapter) => chapter.version && chapter.book && chapter.chapter)) {
      insertProgress.run(
        String(item.version || ""),
        Number(item.book),
        Number(item.chapter),
        String(item.read_at || item.readAt || new Date().toISOString()),
      );
    }
    db.exec("commit");
    committed = true;
  } finally {
    if (!committed) {
      try {
        db.exec("rollback");
      } catch {}
    }
    db.close();
  }
  if (payload.history) saveHistory(payload.history);
  return { imported: marks.length, progressImported: progress.length };
}

function diagnostics() {
  const checks = [];
  function add(name, ok, detail = "") {
    checks.push({ name, ok: !!ok, detail });
  }
  add("圣经目录", existsSync(BIBLES_DIR), BIBLES_DIR);
  add("注释目录", existsSync(COMMENTARIES_DIR), COMMENTARIES_DIR);
  add("辞典目录", existsSync(DICTIONARIES_DIR), DICTIONARIES_DIR);
  add("音频目录", existsSync(AUDIO_DIR), AUDIO_DIR);
  add("原文库", existsSync(ORIG_DB), ORIG_DB);
  add("用户数据库", existsSync(USER_DB), USER_DB);
  add("圣经译本", bibleFiles().length > 0, `${bibleFiles().length} 个`);
  add("注释源", commentaryFiles().length > 0, `${commentaryFiles().length} 个`);
  add("辞典源", dictionaryFiles().length > 0, `${dictionaryFiles().length} 个`);
  add("音频文件", audioFiles().length > 0, `${audioFiles().length} 个`);
  return { ok: checks.every((check) => check.ok), checks };
}

function findStrongOccurrences(type, number, limit = 30) {
  const tagNumber = String(Number(number));
  const candidates = bibleFiles()
    .filter((version) => /KJV|Strong|原文|編碼|编码/i.test(`${version.id} ${version.name}`))
    .slice(0, 6);
  const books = fallbackBooks();
  const occurrences = [];
  for (const version of candidates) {
    const db = new DatabaseSync(biblePath(version.id), { readOnly: true });
    try {
      const rows = db
        .prepare(
          `select Book, Chapter, Verse
           from Bible
           where Scripture like ? or Scripture like ?
           order by Book, Chapter, Verse
           limit ?`,
        )
        .all(`%<W${type}${tagNumber}>%`, `%<W${type}${number}>%`, limit - occurrences.length);
      for (const row of rows) {
        const book = books.find((item) => item.id === Number(row.Book));
        occurrences.push({
          version: version.shortName || version.name,
          book: Number(row.Book),
          bookName: book?.longName || `第 ${row.Book} 卷`,
          chapter: Number(row.Chapter),
          verse: Number(row.Verse),
        });
      }
    } finally {
      db.close();
    }
    if (occurrences.length >= limit) break;
  }
  return occurrences;
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

function getCommentary(sourceId, book, chapter) {
  const source = commentaryFiles().find((item) => item.id === sourceId);
  const db = new DatabaseSync(commentaryPath(sourceId), { readOnly: true });
  try {
    if (!hasTable(db, "commentary")) {
      throw httpError("这个数据库没有 commentary 表", 400);
    }
    const rows = db
      .prepare(
        `select Book, Chapter, FromVerse, ToVerse, Data
         from commentary
         where Book = ? and (Chapter = ? or Chapter = 0)
         order by Chapter, FromVerse, ToVerse`,
      )
      .all(book, chapter);
    return {
      source: sourceId,
      title: source?.title || sourceId,
      readable: source?.readable !== false,
      book,
      chapter,
      entries: rows.map((row) => ({
        book: Number(row.Book),
        chapter: Number(row.Chapter),
        fromVerse: Number(row.FromVerse),
        toVerse: Number(row.ToVerse),
        text: source?.readable === false ? "" : cleanText(row.Data),
        hasImages: /\bImages?\b|<img/i.test(String(row.Data || "")),
      })),
    };
  } finally {
    db.close();
  }
}

function searchDictionary(sourceId, query, limit = 30) {
  const keyword = String(query || "").trim();
  if (!keyword) throw httpError("请输入词条关键词");
  const source = dictionaryFiles().find((item) => item.id === sourceId);
  const db = new DatabaseSync(dictionaryPath(sourceId), { readOnly: true });
  try {
    const columns = db.prepare("pragma table_info(Dictionary)").all().map((column) => column.name);
    const hasImages = columns.includes("Images");
    const rows = db
      .prepare(
        `select id, Word, Description, ComeFrom${hasImages ? ", Images" : ""}
         from Dictionary
         where Word like ?
         order by length(Word), Word
         limit ?`,
      )
      .all(`%${keyword}%`, clampPositiveInt(limit, 30, 80));
    return {
      source: sourceId,
      title: source?.title || sourceId,
      readable: source?.readable !== false,
      query: keyword,
      results: rows.map((row) => ({
        id: Number(row.id),
        word: row.Word,
        comeFrom: row.ComeFrom || "",
        text: source?.readable === false ? "" : cleanText(row.Description || ""),
        images: String(row.Images || "")
          .split(";")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((name) => ({
            name,
            url: `/api/dictionary/image?source=${encodeURIComponent(sourceId)}&name=${encodeURIComponent(name)}`,
          })),
      })),
    };
  } finally {
    db.close();
  }
}

function sendDictionaryImage(res, sourceId, imageName) {
  const db = new DatabaseSync(dictionaryPath(sourceId), { readOnly: true });
  try {
    if (!hasTable(db, "Images")) throw httpError("这个辞典没有图片表", 404);
    const row = db.prepare("select FileName, Data from Images where FileName=?").get(imageName);
    if (!row) throw httpError("找不到图片", 404);
    const ext = path.extname(row.FileName).toLowerCase();
    res.writeHead(200, {
      "Content-Type": ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png",
      "Content-Length": row.Data.length,
      "Cache-Control": "no-store",
    });
    res.end(row.Data);
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

function sendAudio(res, audioId) {
  const safeId = String(audioId || "").replaceAll("/", path.sep);
  const filePath = path.resolve(AUDIO_DIR, safeId);
  const relativePath = path.relative(AUDIO_DIR, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !existsSync(filePath)) {
    throw httpError("找不到音频", 404);
  }
  const body = readFileSync(filePath);
  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
  try {
    if (url.pathname === "/api/health") {
      sendJson(res, {
        ok: true,
        dataRoot: ROOT,
        biblesDir: BIBLES_DIR,
        commentariesDir: COMMENTARIES_DIR,
        dictionariesDir: DICTIONARIES_DIR,
        audioDir: AUDIO_DIR,
        origDb: ORIG_DB,
        userDb: USER_DB,
        versionCount: bibleFiles().length,
        commentaryCount: commentaryFiles().length,
        dictionaryCount: dictionaryFiles().length,
        audioCount: audioFiles().length,
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
    if (url.pathname === "/api/commentaries") {
      sendJson(res, { commentaries: commentaryFiles() });
      return;
    }
    if (url.pathname === "/api/commentary") {
      const source = url.searchParams.get("source") || "";
      const book = parsePositiveInt(url.searchParams.get("book") || 1, "book");
      const chapter = parsePositiveInt(url.searchParams.get("chapter") || 1, "chapter");
      sendJson(res, getCommentary(source, book, chapter));
      return;
    }
    if (url.pathname === "/api/strong") {
      sendJson(res, lookupStrong(url.searchParams.get("code") || ""));
      return;
    }
    if (url.pathname === "/api/user/marks") {
      const version = url.searchParams.get("version") || "";
      const book = parsePositiveInt(url.searchParams.get("book") || 1, "book");
      const chapter = parsePositiveInt(url.searchParams.get("chapter") || 1, "chapter");
      sendJson(res, { marks: getMarks(version, book, chapter) });
      return;
    }
    if (url.pathname === "/api/user/marks/all") {
      sendJson(res, {
        marks: getAllMarks({
          kind: url.searchParams.get("kind") || "",
          tag: url.searchParams.get("tag") || "",
          limit: url.searchParams.get("limit") || 200,
        }),
      });
      return;
    }
    if (url.pathname === "/api/user/history" && req.method === "GET") {
      sendJson(res, { history: getHistory() });
      return;
    }
    if (url.pathname === "/api/user/progress" && req.method === "GET") {
      sendJson(res, getReadingProgress(url.searchParams.get("version") || ""));
      return;
    }
    if (url.pathname === "/api/user/export") {
      sendJson(res, exportUserData());
      return;
    }
    if (url.pathname === "/api/user/mark" && req.method === "POST") {
      sendJson(res, { mark: saveMark(await readJsonBody(req)) });
      return;
    }
    if (url.pathname === "/api/user/history" && req.method === "POST") {
      sendJson(res, { history: saveHistory(await readJsonBody(req)) });
      return;
    }
    if (url.pathname === "/api/user/progress" && req.method === "POST") {
      sendJson(res, setChapterRead(await readJsonBody(req)));
      return;
    }
    if (url.pathname === "/api/user/import" && req.method === "POST") {
      sendJson(res, importUserData(await readJsonBody(req)));
      return;
    }
    if (url.pathname === "/api/audio") {
      const book = parsePositiveInt(url.searchParams.get("book") || 1, "book");
      const chapter = parsePositiveInt(url.searchParams.get("chapter") || 1, "chapter");
      const matches = audioFiles()
        .filter((audio) => audio.book === book && audio.chapter === chapter)
        .map((audio) => ({ ...audio, url: `/api/audio/file?id=${encodeURIComponent(audio.id)}` }));
      sendJson(res, { audio: matches });
      return;
    }
    if (url.pathname === "/api/audio/file") {
      sendAudio(res, url.searchParams.get("id") || "");
      return;
    }
    if (url.pathname === "/api/dictionaries") {
      sendJson(res, { dictionaries: dictionaryFiles() });
      return;
    }
    if (url.pathname === "/api/dictionary/search") {
      const source = url.searchParams.get("source") || "";
      const query = url.searchParams.get("q") || "";
      const limit = url.searchParams.get("limit") || 30;
      sendJson(res, searchDictionary(source, query, limit));
      return;
    }
    if (url.pathname === "/api/dictionary/image") {
      sendDictionaryImage(res, url.searchParams.get("source") || "", url.searchParams.get("name") || "");
      return;
    }
    if (url.pathname === "/api/diagnostics") {
      sendJson(res, diagnostics());
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

initUserDb();

server.listen(PORT, HOST, () => {
  console.log(`Bible Reader running at http://${HOST}:${PORT}`);
  console.log(`Reading databases from ${BIBLES_DIR}`);
});
