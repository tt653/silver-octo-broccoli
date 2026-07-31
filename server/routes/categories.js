const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories — List all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(
      `SELECT c.*, COUNT(a.id) as article_count
       FROM categories c
       LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
       GROUP BY c.id
       ORDER BY c.id ASC`
    ).all();

    res.json({ code: 0, data: categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// POST /api/categories — Create category (auth required)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ code: 400, message: '分类名称不能为空' });
    }

    const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ code: 400, message: '分类名称已存在' });
    }

    const result = db.prepare(
      'INSERT INTO categories (name, description) VALUES (?, ?)'
    ).run(name, description || '');

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.json({ code: 0, message: '分类创建成功', data: category });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// PUT /api/categories/:id — Update category (auth required)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }

    const { name, description } = req.body;
    db.prepare(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?'
    ).run(name || category.name, description !== undefined ? description : category.description, req.params.id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json({ code: 0, message: '分类更新成功', data: updated });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// DELETE /api/categories/:id — Delete category (auth required)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!category) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ code: 0, message: '分类删除成功' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
