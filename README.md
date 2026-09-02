# 学芽 — 二年级自主学习工作台 (PWA)

青岛西海岸公立学校二年级学生课外自主学习Web应用，移动端优先，PWA可安装到手机/平板主屏幕。

## 项目结构

```
study-sprout-vercel/
├── api/                    # Vercel Serverless 后端（密钥安全存储）
│   ├── baidu-token.js      # 百度OCR Token获取
│   ├── baidu-ocr.js        # 百度OCR文字识别
│   └── ai-chat.js          # 豆包AI大模型批改
├── public/                 # 前端静态资源
│   ├── index.html          # 入口页面
│   ├── manifest.json       # PWA清单
│   ├── sw.js               # Service Worker（离线缓存）
│   ├── icons/              # 应用图标
│   ├── css/                # 样式文件
│   └── js/                 # JavaScript模块
│       ├── config.js       # 常量配置
│       ├── api.js          # OCR+AI接口（调用后端，无密钥）
│       ├── date-utils.js   # 日期工具
│       ├── storage.js      # 本地存储
│       ├── ai-sim.js       # AI模拟（降级备用）
│       ├── error-book.js   # 错题本
│       ├── tasks.js        # 题库+任务管理
│       ├── plant.js       # 植物养成
│       ├── pages.js       # 页面渲染
│       └── app.js          # 主入口
├── vercel.json             # Vercel部署配置
├── package.json
├── .env.example            # 环境变量模板
└── README.md
```

## 部署到 Vercel（5分钟完成）

### 第1步：推送到 GitHub
1. 在GitHub创建新仓库（如 `study-sprout`）
2. 将本项目目录推送到该仓库

### 第2步：导入到 Vercel
1. 打开 https://vercel.com → 登录 → 点击「Add New Project」
2. 选择刚才的GitHub仓库 → 点击「Import」

### 第3步：配置环境变量
在 Vercel 部署页面的「Environment Variables」中添加以下4个变量：

| 名称 | 值 |
|------|-----|
| `BAIDU_OCR_API_KEY` | 你的百度OCR API Key |
| `BAIDU_OCR_SECRET_KEY` | 你的百度OCR Secret Key |
| `DOUBAO_API_KEY` | 你的豆包API Key |
| `DOUBAO_MODEL` | `doubao-seed-2-1-turbo-260628` |

### 第4步：部署
点击「Deploy」→ 等待约1分钟 → 获得 `https://study-sprout-xxx.vercel.app` 公开网址

### 第5步：手机/平板使用
1. 在iPhone Safari或华为平板浏览器中打开公开网址
2. 添加到主屏幕 → 像App一样使用
3. **不需要电脑保持开机** — Vercel云端7x24运行

## 安全说明
- 所有API密钥存储在Vercel后端环境变量中
- 前端代码不包含任何密钥
- 前端通过 `/api/*` 调用后端Serverless函数
- 后端代理请求百度OCR和豆包AI，密钥不暴露给浏览器

## 核心功能
- 每日语文+数学学习任务（一课一练，15分钟/科）
- 数学看图题带SVG图形
- 拍照上传 → OCR识别 → AI批改讲解
- 智能去重（拍照批改后自动剔除已掌握知识点）
- 错题本 + 周末复习 + 一课一测
- 水滴积分 + 水果植物养成（45天成熟）
- 离线缓存（PWA Service Worker）
