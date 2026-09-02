/**
 * 学芽API — Cloudflare Worker
 * 处理百度OCR + 豆包AI批改请求
 * 路由: /api/baidu-token, /api/baidu-ocr, /api/ai-chat
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/baidu-token') {
        return await handleBaiduToken(env, corsHeaders);
      } else if (path === '/api/baidu-ocr') {
        return await handleBaiduOcr(request, env, corsHeaders);
      } else if (path === '/api/ai-chat') {
        return await handleAiChat(request, env, corsHeaders);
      } else {
        return new Response(JSON.stringify({ error: 'Not Found', path: path }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

async function handleBaiduToken(env, corsHeaders) {
  const apiKey = env.BAIDU_OCR_API_KEY;
  const secretKey = env.BAIDU_OCR_SECRET_KEY;
  if (!apiKey || !secretKey) {
    return new Response(JSON.stringify({ error: '百度OCR密钥未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(secretKey)}`;
  const resp = await fetch(tokenUrl, { method: 'POST' });
  const data = await resp.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleBaiduOcr(request, env, corsHeaders) {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get('access_token');
  if (!accessToken) {
    return new Response(JSON.stringify({ error: '缺少access_token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  const body = await request.text();
  const ocrUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting?access_token=${accessToken}`;
  const resp = await fetch(ocrUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  });
  const data = await resp.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleAiChat(request, env, corsHeaders) {
  const apiKey = env.DOUBAO_API_KEY;
  const model = env.DOUBAO_MODEL || 'doubao-seed-2-1-turbo-260628';
  if (!apiKey) {
    return new Response(JSON.stringify({ error: '豆包API密钥未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  const reqBody = await request.json();
  reqBody.model = model;
  const arkUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
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
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
