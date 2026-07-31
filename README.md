# VueBlog — 全栈博客系统

基于 Vue 3 + Express + SQLite 的全栈博客实战项目。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| HTTP 客户端 | Axios |
| 后端框架 | Express |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT (jsonwebtoken + bcryptjs) |

## 项目结构

```
vue-blog/
├── client/                  # 前端
│   └── src/
│       ├── api/             # Axios 封装 + 拦截器
│       ├── components/      # 公共组件 (Navbar, ArticleCard, Pagination)
│       ├── router/          # 路由 + 导航守卫
│       ├── stores/          # Pinia 状态管理 (auth, article, category)
│       └── views/           # 页面组件
├── server/                  # 后端
│   ├── db.js                # 数据库初始化 + 建表
│   ├── middleware/          # JWT 认证中间件
│   └── routes/              # 接口路由 (auth, articles, categories)
└── README.md
```

## 功能

- 用户注册 / 登录 / JWT 认证
- 文章发布、编辑、删除
- 文章分类筛选与关键词搜索
- 分页浏览
- 我的文章管理

## 快速开始

### 1. 安装依赖

```bash
# 后端
cd server
npm install

# 前端
cd client
npm install
```

### 2. 启动服务

```bash
# 启动后端 (端口 3000)
cd server
node index.js

# 启动前端 (端口 5173)
cd client
npm run dev
```

### 3. 访问

打开浏览器访问 `http://localhost:5173`

### 演示账号

- 用户名: `demo`
- 密码: `123456`

## API 接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| GET | /api/auth/me | 获取当前用户 | 是 |
| GET | /api/articles | 文章列表（分页+搜索） | 否 |
| GET | /api/articles/:id | 文章详情 | 否 |
| POST | /api/articles | 创建文章 | 是 |
| PUT | /api/articles/:id | 更新文章 | 是 |
| DELETE | /api/articles/:id | 删除文章 | 是 |
| GET | /api/articles/my/list | 我的文章 | 是 |
| GET | /api/categories | 分类列表 | 否 |
| POST | /api/categories | 创建分类 | 是 |

## 预置数据

- 5 个文章分类：前端开发、后端开发、数据库、工具与效率、生活随笔
