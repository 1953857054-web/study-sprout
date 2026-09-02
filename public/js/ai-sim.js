/**
 * ============================================================
 *  学芽 App — AI批改模拟模块
 *  当前为演示版本，所有批改和讲解均为前端模拟
 *  后续接入真实AI时，只需替换此文件方法实现
 *  预留接口: AI.grade() / AI.explain() / AI.gradePhoto()
 * ============================================================
 */
var AI = (function () {

  var OCR_NOTICE = '📷 此处后续对接OCR识别与AI大模型接口，当前为演示版本';

  /**
   * 批改单道客观题
   */
  function grade(question, studentAnswer) {
    var correct = false;
    var correctAnswer = question.answer;

    if (question.type === 'choice' || question.type === 'truefalse') {
      correct = (studentAnswer === correctAnswer);
    } else if (question.type === 'fill') {
      var acceptable = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      var userAns = (studentAnswer || '').toString().trim();
      correct = acceptable.some(function(a) { return a.toString().trim() === userAns; });
    }

    return {
      correct: correct,
      correctAnswer: Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer,
      studentAnswer: studentAnswer,
      knowledgePoint: question.knowledgePoint || ''
    };
  }

  /**
   * 批改整份练习 + 记录知识点掌握度
   */
  function gradeAll(questions, answers, subject, unit) {
    var results = [];
    var correctCount = 0;
    var wrongCount = 0;
    var wrongList = [];

    questions.forEach(function(q, i) {
      var ans = answers[i];
      var result = grade(q, ans);

      // 记录知识点掌握度（智能去重核心）
      if (CONFIG.MASTERY_ENABLED && subject && unit) {
        Storage.recordMastery(subject, unit, result.knowledgePoint, result.correct);
      }

      results.push({
        questionIndex: i,
        question: q,
        correct: result.correct,
        correctAnswer: result.correctAnswer,
        studentAnswer: ans,
        knowledgePoint: result.knowledgePoint
      });

      if (result.correct) {
        correctCount++;
      } else {
        wrongCount++;
        wrongList.push({
          question: q,
          studentAnswer: ans,
          correctAnswer: result.correctAnswer,
          knowledgePoint: result.knowledgePoint,
          explanation: explain(q, ans, result.correctAnswer)
        });
      }
    });

    return {
      results: results,
      correctCount: correctCount,
      wrongCount: wrongCount,
      wrongList: wrongList,
      allCorrect: wrongCount === 0,
      masteredPoints: getNewlyMastered(subject, unit)
    };
  }

  /**
   * 获取本次新掌握的知识点
   */
  function getNewlyMastered(subject, unit) {
    var mastery = Storage.getMastery();
    var key = subject + '_' + unit + '_';
    var newlyMastered = [];
    for (var k in mastery) {
      if (k.indexOf(key) === 0 && mastery[k].mastered && mastery[k].dates[mastery[k].dates.length-1] === DateUtils.today()) {
        newlyMastered.push(mastery[k].kp);
      }
    }
    return newlyMastered;
  }

  /**
   * 生成儿童版讲解
   */
  function explain(question, studentAnswer, correctAnswer) {
    var kp = question.knowledgePoint || '这道题';

    if (question.type === 'choice') {
      var choiceTips = [
        '正确答案是 ' + correctAnswer + '。这题考的是【' + kp + '】，再看看题目关键词哦～',
        '别灰心！答案是 ' + correctAnswer + '。' + kp + '可以这样理解：仔细读题就能选对！',
        '这题选' + correctAnswer + '才对～先理解题目意思，再排除不对的选项，下次一定能选对！💪'
      ];
      return choiceTips[Math.floor(Math.random()*choiceTips.length)];
    }

    if (question.type === 'fill') {
      var fillTips = [
        '正确答案填"' + correctAnswer + '"。【' + kp + '】想一想课堂上学过的内容～',
        '你填的是"' + studentAnswer + '"，正确是"' + correctAnswer + '"。复习一下课本就记牢了！💪',
        '答案是"' + correctAnswer + '"。' + kp + '：仔细看题目，找找线索就能找到答案！'
      ];
      return fillTips[Math.floor(Math.random()*fillTips.length)];
    }

    if (question.type === 'truefalse') {
      return '你判断为"' + (studentAnswer ? '对' : '错') + '"，正确答案是"' +
        (correctAnswer ? '对' : '错') + '"。【' + kp + '】再想想课本里怎么说的～';
    }

    return '这题的正确答案是"' + correctAnswer + '"。' + kp + '再复习一下，你一定能做对的！💪';
  }

  /**
   * 模拟拍照上传后的AI批改
   * 返回模拟批改结果 + 新掌握知识点
   */
  function gradePhoto(subject, unit) {
    var total = 5;
    var wrongCount = Math.floor(Math.random()*2); // 0-1题错（纸质通常掌握较好）
    var correctCount = total - wrongCount;
    var wrongList = [];

    // 模拟所有知识点都答对了（纸质资料学习通常掌握度提升）
    var unitData = Tasks.getUnitData(subject, unit);
    var masteredPoints = [];

    // 从各分类中收集所有知识点
    var allKPs = [];
    var categories = subject === 'chinese'
      ? ['basic', 'reading', 'writing']
      : ['calc', 'logic', 'shape', 'fun'];
    categories.forEach(function(cat) {
      var pool = unitData && unitData[cat];
      if (pool) {
        pool.forEach(function(q) {
          if (q.knowledgePoint && allKPs.indexOf(q.knowledgePoint) < 0) allKPs.push(q.knowledgePoint);
        });
      }
    });

    if (allKPs.length > 0) {
      // 随机选取2-3个知识点标记为已掌握
      var pickCount = Math.min(3, allKPs.length);
      for (var i = 0; i < pickCount; i++) {
        var kp = allKPs[Math.floor(Math.random()*allKPs.length)];
        // 记录掌握度（连续答对）
        Storage.recordMastery(subject, unit, kp, true);
        if (Storage.isMastered(subject, unit, kp)) masteredPoints.push(kp);
      }
    }

    // 生成模拟错题
    for (var j = 0; j < wrongCount; j++) {
      var mockQ = {
        subject: subject, unit: unit, type: 'fill',
        question: '(拍照批改) 第' + (j+1) + '题',
        knowledgePoint: subject === 'chinese' ? '识字写字' : '计算',
        studentAnswer: '×(未识别)', correctAnswer: '√'
      };
      wrongList.push({
        question: mockQ,
        studentAnswer: mockQ.studentAnswer,
        correctAnswer: mockQ.correctAnswer,
        knowledgePoint: mockQ.knowledgePoint,
        explanation: '拍照识别后批改：考查【' + mockQ.knowledgePoint + '】，注意检查书写和计算过程～💪'
      });
    }

    return {
      correctCount: correctCount, wrongCount: wrongCount,
      wrongList: wrongList, allCorrect: wrongCount === 0,
      masteredPoints: masteredPoints,
      notice: OCR_NOTICE, isSimulated: true
    };
  }

  /**
   * 模拟单元测试批改
   */
  function gradeUnitTest(subject, unit) {
    var total = 10;
    var wrongCount = Math.floor(Math.random()*4);
    var correctCount = total - wrongCount;
    var score = Math.round(correctCount/total*100);
    var wrongList = [];

    for (var i = 0; i < wrongCount; i++) {
      var mockQ = {
        subject: subject, unit: unit, type: 'fill',
        question: '(单元测试) 第'+(i+1)+'题',
        knowledgePoint: subject==='chinese' ? '阅读理解' : '计算',
        studentAnswer: '×', correctAnswer: '√'
      };
      wrongList.push({
        question: mockQ,
        studentAnswer: mockQ.studentAnswer,
        correctAnswer: mockQ.correctAnswer,
        knowledgePoint: mockQ.knowledgePoint,
        explanation: '单元测试错题：考查【' + mockQ.knowledgePoint + '】，请对照课本复习，再做一遍～💪'
      });
    }

    return {
      total: total, correctCount: correctCount, wrongCount: wrongCount,
      score: score, passed: score >= 80, wrongList: wrongList,
      notice: OCR_NOTICE, isSimulated: true
    };
  }

  /**
   * 异步拍照批改 — 优先使用真实OCR+AI接口，未配置时降级为模拟
   * @param {String} subject  学科
   * @param {Number} unit    单元号
   * @param {String} imageBase64  图片base64（不含data:image前缀）
   * @param {Object} lessonInfo  当前课信息
   * @returns {Promise} 批改结果
   */
  async function gradePhotoAsync(subject, unit, imageBase64, lessonInfo) {
    // 尝试真实API
    if (API && API.isRealMode() && imageBase64) {
      try {
        var apiResult = await API.gradePhotoWithAI(imageBase64, subject, lessonInfo);
        if (apiResult.usedRealAPI && apiResult.aiResult) {
          return formatAIResult(apiResult.aiResult, subject, unit);
        }
      } catch (e) {
        console.warn('AI批改失败，降级为模拟模式:', e.message);
      }
    }
    // 降级：模拟模式
    return gradePhoto(subject, unit);
  }

  /** 将AI返回结果格式化为统一结构 */
  function formatAIResult(aiResult, subject, unit) {
    var wrongList = [];
    var masteredPoints = aiResult.masteredPoints || [];
    var correctCount = aiResult.correctCount || 0;
    var wrongCount = aiResult.wrongCount || 0;

    // 记录已掌握知识点到Storage
    masteredPoints.forEach(function(kp) {
      Storage.recordMastery(subject, unit, kp, true);
    });

    // 构建错题列表
    if (aiResult.results) {
      aiResult.results.forEach(function(r) {
        if (!r.correct) {
          wrongList.push({
            question: { question: r.question || '(未识别)', type: 'fill', knowledgePoint: r.knowledgePoint || '未知' },
            studentAnswer: r.studentAnswer || '',
            correctAnswer: r.correctAnswer || '',
            knowledgePoint: r.knowledgePoint || '未知',
            explanation: r.explanation || '请对照课本复习～'
          });
        }
      });
    }

    return {
      correctCount: correctCount,
      wrongCount: wrongCount,
      wrongList: wrongList,
      allCorrect: wrongCount === 0,
      masteredPoints: masteredPoints,
      summary: aiResult.summary || '',
      ocrText: aiResult.ocrText || '',
      isSimulated: false
    };
  }

  return {
    OCR_NOTICE: OCR_NOTICE,
    grade: grade, gradeAll: gradeAll, explain: explain,
    gradePhoto: gradePhoto, gradePhotoAsync: gradePhotoAsync,
    gradeUnitTest: gradeUnitTest, formatAIResult: formatAIResult
  };
})();
