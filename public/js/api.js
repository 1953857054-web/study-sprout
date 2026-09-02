/**
 * ============================================================
 *  学芽 App — OCR + AI 接口模块（Vercel部署版）
 *
 *  密钥存储在后端Vercel环境变量中，前端不暴露任何API Key
 *  前端通过 /api/* 路径调用后端Serverless函数
 *
 *  支持的 OCR: 百度OCR (后端代理)
 *  支持的 AI:  豆包 (后端代理)
 *  未开启时自动降级为模拟模式
 *  ============================================================
 */
var API = (function () {

  var CONFIG_VERSION = 5;
  var API_BASE = 'https://study-sprout-api.1953857054.workers.dev';

  /* 默认配置 — 无密钥，仅选择provider */
  var DEFAULTS = {
    ocr: { provider: 'baidu' },
    ai: { provider: 'doubao' },
    version: CONFIG_VERSION
  };

  function getConfig() {
    var raw = localStorage.getItem('sprout_api_config');
    if (!raw) {
      var cfg = JSON.parse(JSON.stringify(DEFAULTS));
      localStorage.setItem('sprout_api_config', JSON.stringify(cfg));
      return cfg;
    }
    try {
      var cfg = JSON.parse(raw);
      if (!cfg.version || cfg.version < CONFIG_VERSION) {
        cfg = JSON.parse(JSON.stringify(DEFAULTS));
        localStorage.setItem('sprout_api_config', JSON.stringify(cfg));
      }
      return {
        ocr: Object.assign({}, DEFAULTS.ocr, cfg.ocr || {}),
        ai: Object.assign({}, DEFAULTS.ai, cfg.ai || {}),
        version: cfg.version || CONFIG_VERSION
      };
    } catch (e) {
      var cfg2 = JSON.parse(JSON.stringify(DEFAULTS));
      localStorage.setItem('sprout_api_config', JSON.stringify(cfg2));
      return cfg2;
    }
  }

  function saveConfig(config) {
    config.version = CONFIG_VERSION;
    localStorage.setItem('sprout_api_config', JSON.stringify(config));
  }

  function isOCRConfigured() {
    return getConfig().ocr.provider !== 'simulation';
  }

  function isAIConfigured() {
    return getConfig().ai.provider !== 'simulation';
  }

  function isRealMode() {
    return isOCRConfigured() && isAIConfigured();
  }

  /* ===== 百度OCR Token（后端代理，密钥在环境变量）===== */
  var _baiduToken = null;
  var _baiduTokenExpiry = 0;

  async function getBaiduToken() {
    var now = Date.now();
    if (_baiduToken && now < _baiduTokenExpiry) return _baiduToken;

    var resp = await fetch(API_BASE + '/api/baidu-token', { method: 'GET' });
    var data = await resp.json();
    if (data.access_token) {
      _baiduToken = data.access_token;
      _baiduTokenExpiry = now + (data.expires_in - 60) * 1000;
      return _baiduToken;
    }
    throw new Error('百度OCR Token获取失败: ' + (data.error || JSON.stringify(data)));
  }

  /* ===== OCR识别 ===== */
  async function ocrRecognize(imageBase64) {
    var cfg = getConfig();

    if (cfg.ocr.provider === 'baidu') {
      var token = await getBaiduToken();
      var body = 'image=' + encodeURIComponent(imageBase64) + '&language_type=CHN_ENG';
      var resp = await fetch(API_BASE + '/api/baidu-ocr?access_token=' + token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      });
      var data = await resp.json();
      if (data.words_result) {
        return data.words_result.map(function(w) { return w.words; }).join('\n');
      }
      throw new Error('OCR识别失败: ' + JSON.stringify(data));
    }

    throw new Error('OCR未配置');
  }

  /* ===== AI大模型批改（后端代理，密钥在环境变量）===== */
  async function aiGrade(ocrText, subject, lessonInfo) {
    var cfg = getConfig();

    var subjectName = subject === 'chinese' ? '语文' : '数学';
    var lessonTitle = lessonInfo ? lessonInfo.title : '当前课';

    var systemPrompt = '你是一位经验丰富、温和耐心的小学二年级老师，正在批改学生手写作业。' +
      'OCR识别的手写文字可能有误差，请你根据上下文智能推断学生的真实答题内容。\\n\\n' +
      '批改要求：\\n' +
      '1. 逐题分离：将OCR文本按行/题号拆分为独立题目，识别每题的题目要求和学生作答内容\\n' +
      '2. 判断对错：根据二年级知识点判断每题答案是否正确，计算题验证计算结果，语文题验证字词拼写\\n' +
      '3. 容错处理：如果OCR识别有误但能推断出学生本意，按推断结果批改并在explanation中说明\\n' +
      '4. 讲解：错误的题目用简单、儿童化语言讲解，不要超过2句话\\n' +
      '5. 知识点：根据题目内容归纳已掌握和未掌握的知识点\\n' +
      '6. 鼓励：总评以鼓励为主，先表扬再建议\\n\\n' +
      '请严格用JSON格式返回，不要加markdown代码块：\\n' +
      '{"results":[{"correct":true,"question":"题目内容","studentAnswer":"学生答案","correctAnswer":"正确答案","explanation":"讲解(仅错题需要)"}],' +
      '"masteredPoints":["已掌握知识点"],"weakPoints":["薄弱知识点"],' +
      '"summary":"鼓励性总评","correctCount":正确题数,"wrongCount":错误题数}';

    var userPrompt = '学科：' + subjectName + '\\n课题：' + lessonTitle + '\\n年级：小学二年级\\n' +
      '教材版本：' + (subject === 'chinese' ? '人教统编版' : '青岛版') + '\\n' +
      '---学生作业OCR识别原文（可能有识别误差）---\\n' + ocrText + '\\n---OCR原文结束---\\n\\n' +
      '请你：1.先按行或题号拆分题目 2.推断每题的题目和学生答案 3.逐题批改 4.返回JSON';

    var resp = await fetch(API_BASE + '/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'doubao-seed-2-1-turbo-260628',
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    var data = await resp.json();
    if (data.error) throw new Error('AI批改失败: ' + (data.error.message || JSON.stringify(data.error)));
    var content = data.choices ? data.choices[0].message.content : '';
    return parseAIResult(content, ocrText);
  }

  /* ===== 解析AI返回结果 ===== */
  function parseAIResult(content, ocrText) {
    if (!content) throw new Error('AI返回为空');
    var jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        var result = JSON.parse(jsonMatch[0]);
        if (!result.results) result.results = [];
        if (!result.masteredPoints) result.masteredPoints = [];
        if (!result.weakPoints) result.weakPoints = [];
        if (!result.summary) result.summary = content.substring(0, 100);
        if (typeof result.correctCount !== 'number')
          result.correctCount = result.results.filter(function(r) { return r.correct; }).length;
        if (typeof result.wrongCount !== 'number')
          result.wrongCount = result.results.filter(function(r) { return !r.correct; }).length;
        return result;
      } catch (e) {}
    }
    return {
      results: [], masteredPoints: [], weakPoints: [],
      summary: content, correctCount: 0, wrongCount: 0, parseFailed: true
    };
  }

  /* ===== 统一接口：拍照 → OCR → AI批改 ===== */
  async function gradePhotoWithAI(imageBase64, subject, lessonInfo) {
    var steps = [];
    var ocrText = '';

    if (isOCRConfigured()) {
      try {
        ocrText = await ocrRecognize(imageBase64);
        steps.push({ step: 'ocr', success: true, text: ocrText });
      } catch (e) {
        steps.push({ step: 'ocr', success: false, error: e.message });
        ocrText = '(OCR识别失败)';
      }
    } else {
      ocrText = '(OCR未配置)';
    }

    var aiResult = null;
    if (isAIConfigured() && ocrText && !ocrText.startsWith('(')) {
      try {
        aiResult = await aiGrade(ocrText, subject, lessonInfo);
        steps.push({ step: 'ai', success: true, result: aiResult });
      } catch (e) {
        steps.push({ step: 'ai', success: false, error: e.message });
      }
    }

    return { ocrText: ocrText, aiResult: aiResult, steps: steps, usedRealAPI: aiResult !== null };
  }

  return {
    getConfig: getConfig, saveConfig: saveConfig,
    isOCRConfigured: isOCRConfigured, isAIConfigured: isAIConfigured, isRealMode: isRealMode,
    ocrRecognize: ocrRecognize, aiGrade: aiGrade, gradePhotoWithAI: gradePhotoWithAI,
    DEFAULTS: DEFAULTS
  };
})();
