// 豆包AI大模型批改 — Cloudflare Pages Function
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const apiKey = env.DOUBAO_API_KEY;
  const model = env.DOUBAO_MODEL || 'doubao-seed-2-1-turbo-260628';

  if (!apiKey) {
    return new Response(JSON.stringify({ error: '豆包API密钥未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const reqBody = await request.json();
  reqBody.model = model;

  const arkUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  try {
    const resp = await fetch(arkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(reqBody)
    });
    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'AI请求失败: ' + e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
