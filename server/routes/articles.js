const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/articles — Get article list (public, with pagination)
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const categoryId = req.query.categoryId;
    const keyword = req.query.keyword || '';

    let where = "WHERE a.status = 'published'";
    const params = [];

    if (categoryId) {
      where += ' AND a.category_id = ?';
      params.push(categoryId);
    }
    if (keyword) {
      where += ' AND (a.title LIKE ? OR a.summary LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM articles a ${where}`
    ).get(...params).count;

    const offset = (page - 1) * pageSize;
    const articles = db.prepare(
      `SELECT a.id, a.title, a.summary, a.cover_image, a.view_count, a.created_at, a.updated_at,
              u.id as author_id, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar,
              c.id as category_id, c.name as category_name
       FROM articles a
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category_id = c.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(...params, pageSize, offset);

    res.json({
      code: 0,
      data: {
        list: articles,
        total,
        page,
        pageSize
      }
    });
  } catch (err) {
    console.error('Get articles error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/articles/my/list — Get current user's articles (auth required)
// NOTE: Must be defined before /:id to avoid route conflict
router.get('/my/list', authMiddleware, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const total = db.prepare(
      'SELECT COUNT(*) as count FROM articles WHERE author_id = ?'
    ).get(req.user.id).count;

    const offset = (page - 1) * pageSize;
    const articles = db.prepare(
      `SELECT a.*, c.name as category_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.author_id = ?
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(req.user.id, pageSize, offset);

    res.json({
      code: 0,
      data: { list: articles, total, page, pageSize }
    });
  } catch (err) {
    console.error('Get my articles error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/articles/:id — Get article detail (public)
router.get('/:id', (req, res) => {
  try {
    const article = db.prepare(
      `SELECT a.*,
              u.id as author_id, u.username as author_name, u.nickname as author_nickname, u.avatar as author_avatar,
              c.id as category_id, c.name as category_name
       FROM articles a
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`
    ).get(req.params.id);

    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }

    // Increment view count
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

    res.json({ code: 0, data: article });
  } catch (err) {
    console.error('Get article error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// POST /api/articles — Create article (auth required)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, content, summary, cover_image, category_id, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    }

    const result = db.prepare(
      `INSERT INTO articles (title, content, summary, cover_image, category_id, author_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(title, content, summary || '', cover_image || '', category_id || null, req.user.id, status || 'published');

    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid);

    res.json({ code: 0, message: '文章创建成功', data: article });
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// PUT /api/articles/:id — Update article (auth required)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }
    if (article.author_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权修改他人文章' });
    }

    const { title, content, summary, cover_image, category_id, status } = req.body;

    db.prepare(
      `UPDATE articles
       SET title = ?, content = ?, summary = ?, cover_image = ?, category_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      title || article.title,
      content || article.content,
      summary !== undefined ? summary : article.summary,
      cover_image !== undefined ? cover_image : article.cover_image,
      category_id !== undefined ? category_id : article.category_id,
      status || article.status,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    res.json({ code: 0, message: '文章更新成功', data: updated });
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// DELETE /api/articles/:id — Delete article (auth required)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    if (!article) {
      return res.status(404).json({ code: 404, message: '文章不存在' });
    }
    if (article.author_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权删除他人文章' });
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
    res.json({ code: 0, message: '文章删除成功' });
  } catch (err) {
    console.error('Delete article error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
