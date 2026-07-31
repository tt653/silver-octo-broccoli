const Database = require('better-sqlite3');
const path = require('path');

// Create or open the SQLite database file
const dbPath = path.join(__dirname, 'blog.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published')),
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Insert default categories if table is empty
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoryCount.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  const categories = [
    ['前端开发', 'HTML、CSS、JavaScript、Vue、React 等前端技术'],
    ['后端开发', 'Node.js、Python、Java、Go 等后端技术'],
    ['数据库', 'MySQL、MongoDB、Redis 等数据库相关'],
    ['工具与效率', '开发工具、效率技巧分享'],
    ['生活随笔', '日常感悟与生活记录']
  ];
  const insertMany = db.transaction((cats) => {
    for (const cat of cats) {
      insertCategory.run(cat[0], cat[1]);
    }
  });
  insertMany(categories);
}

module.exports = db;
