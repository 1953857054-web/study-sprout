// 百度OCR — 通用文字识别
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const accessToken = req.query.access_token;
  if (!accessToken) {
    return res.status(400).json({ error: '缺少 access_token 参数' });
  }

  let body = '';
  for await (const chunk of req.body || '') body += chunk;
  if (!body && req.body) body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });
    const data = await resp.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'OCR识别失败: ' + e.message });
  }
}
