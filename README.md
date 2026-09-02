# 学芽 — 二年级自主学习工作台 (PWA)

青岛西海岸公立学校二年级学生课外自主学习Web应用。

## 部署到 Cloudflare Pages（国内可访问）

### 第1步：推送到 GitHub（已完成）
仓库地址：https://github.com/1953857054-web/study-sprout

### 第2步：在 Cloudflare 创建 Pages 项目
1. 打开 https://dash.cloudflare.com → 注册/登录
2. 左侧菜单 → Workers & Pages → Create → Pages → Connect to Git
3. 选择 GitHub → 授权 → 选择 `study-sprout` 仓库
4. 构建设置：
   - Framework preset: None
   - Build command: (留空)
   - Build output directory: `public`
5. 点击 "Save and Deploy"

### 第3步：配置环境变量
部署完成后 → Settings → Environment variables → 添加：

| 名称 | 值 |
|------|-----|
| `BAIDU_OCR_API_KEY` | 百度OCR API Key |
| `BAIDU_OCR_SECRET_KEY` | 百度OCR Secret Key |
| `DOUBAO_API_KEY` | 豆包API Key |
| `DOUBAO_MODEL` | `doubao-seed-2-1-turbo-260628` |

### 第4步：重新部署
Settings → Environment variables 添加完成后 → Deployments → Retry deployment

### 访问地址
部署成功后获得 `https://study-sprout.pages.dev`（国内可访问）

## 项目结构
```
├── functions/api/         # Cloudflare Pages Functions（后端代理）
│   ├── baidu-token.js     # 百度OCR Token
│   ├── baidu-ocr.js       # OCR文字识别
│   └── ai-chat.js         # 豆包AI批改
├── api/                   # Vercel Serverless（备用）
├── public/                # 前端静态资源
└── vercel.json            # Vercel配置（备用）
```
