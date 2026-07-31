const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register — User registration
router.post('/register', (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ code: 400, message: '用户名长度需要 3-20 个字符' });
    }
    if (password.length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度不能少于 6 位' });
    }

    // Check if username already exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ code: 400, message: '用户名已被占用' });
    }

    // Hash password and create user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)'
    ).run(username, hashedPassword, nickname || username);

    const user = db.prepare('SELECT id, username, nickname, avatar, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user);

    res.json({
      code: 0,
      message: '注册成功',
      data: { user, token }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// POST /api/auth/login — User login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '请输入用户名和密码' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误' });
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    res.json({
      code: 0,
      message: '登录成功',
      data: { user: userData, token }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/auth/me — Get current user info
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, username, nickname, avatar, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    res.json({ code: 0, data: user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
