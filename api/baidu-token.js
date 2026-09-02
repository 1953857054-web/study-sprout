// 百度OCR — 获取Access Token（密钥在后端环境变量，不暴露给前端）
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return res.status(500).json({ error: '百度OCR密钥未配置，请在Vercel环境变量中设置 BAIDU_OCR_API_KEY 和 BAIDU_OCR_SECRET_KEY' });
  }

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(secretKey)}`;

  try {
    const resp = await fetch(url, { method: 'POST' });
    const data = await resp.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: '百度Token获取失败: ' + e.message });
  }
}
