// 豆包AI大模型 — 作业批改代理（密钥在后端环境变量）
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = process.env.DOUBAO_API_KEY;
  const model = process.env.DOUBAO_MODEL || 'doubao-seed-2-1-turbo-260628';

  if (!apiKey) {
    return res.status(500).json({ error: '豆包API密钥未配置，请在Vercel环境变量中设置 DOUBAO_API_KEY' });
  }

  // 解析前端传来的请求体
  let reqBody = '';
  for await (const chunk of req.body || '') reqBody += chunk;
  if (!reqBody) reqBody = typeof req.body === 'object' ? JSON.stringify(req.body) : '{}';

  let parsed;
  try { parsed = JSON.parse(reqBody); } catch { parsed = {}; }

  // 注入正确的模型名（前端不需要知道模型ID）
  parsed.model = model;

  const url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(parsed)
    });
    const data = await resp.json();
    res.status(resp.statusCode || 200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'AI请求失败: ' + e.message });
  }
}
