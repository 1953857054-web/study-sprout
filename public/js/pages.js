/**
 * ============================================================
 *  学芽 App — 页面渲染模块
 *  负责所有5个页面的HTML生成和事件处理
 * ============================================================
 */
var Pages = (function () {

  /* 当前页面状态 */
  var state = {
    page: 'home',
    studySubject: 'chinese',
    studyMode: 'online',
    answers: {},
    errorFilter: 'all',
    photoList: []
  };

  /* ========================================================
   *  工具函数
   * ====================================================== */

  /** 简单HTML转义 */
  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /** Toast通知 */
  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast' + (type ? ' ' + type : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 2500);
  }

  /** 获取学科配置 */
  function subjectCfg(s) { return CONFIG.SUBJECTS[s]; }

  /** 获取选项标签 A/B/C/D */
  function optionLabel(i) { return String.fromCharCode(65 + i); }

  /* ========================================================
   *  底部Tab栏
   * ====================================================== */
  function renderTabBar() {
    var html = '';
    CONFIG.TABS.forEach(function(tab) {
      var active = tab.id === state.page ? ' active' : '';
      html += '<div class="tab-item' + active + '" onclick="Pages.go(\'' + tab.id + '\')">' +
        '<span class="tab-icon">' + tab.icon + '</span>' +
        '<span class="tab-name">' + tab.name + '</span>' +
      '</div>';
    });
    document.getElementById('tabBar').innerHTML = html;
  }

  /* ========================================================
   *  路由
   * ====================================================== */
  function go(pageId) {
    state.page = pageId;
    render();
    // 滚动到顶部
    window.scrollTo(0, 0);
  }

  /** 主渲染入口 */
  function render() {
    renderTabBar();
    var app = document.getElementById('app');
    switch (state.page) {
      case 'home':       app.innerHTML = renderHome(); attachHomeEvents(); break;
      case 'study':      app.innerHTML = renderStudy(); attachStudyEvents(); break;
      case 'error-book': app.innerHTML = renderErrorBook(); break;
      case 'garden':     app.innerHTML = renderGarden(); attachGardenEvents(); break;
      case 'parent':     app.innerHTML = renderParent(); attachParentEvents(); break;
    }
  }

  /* ========================================================
   *  1. 首页
   * ====================================================== */
  function renderHome() {
    var settings = Storage.getSettings();
    var today = DateUtils.today();
    var task = Tasks.getTodayStatus();
    var water = Storage.getWater();
    var plantStatus = Plant.getStatus();
    var weekly = Tasks.checkWeeklyReview();

    // 水滴显示
    var waterHtml = '<div class="home-water water-display">' +
      '<span class="water-drop-icon">💧</span>' +
      '<span>' + water.balance + '</span></div>';

    // 植物迷你状态
    var plantMini = '';
    if (plantStatus) {
      plantMini = '<div class="home-plant-mini" onclick="Pages.go(\'garden\')">' +
        plantStatus.stage.emoji + ' HP:' + plantStatus.plant.health + ' | ' +
        plantStatus.plant.growthDays + '/' + CONFIG.PLANT_MATURE_DAYS + '天</div>';
    } else {
      plantMini = '<div class="home-plant-mini" onclick="Pages.go(\'garden\')">🌱 去种植物</div>';
    }

    // 任务卡片
    var taskCardsHtml = '';
    ['chinese', 'math'].forEach(function(subject) {
      var cfg = subjectCfg(subject);
      var t = task[subject];
      var statusBadge = t.completed ?
        '<span class="badge badge-green">✅ 已完成</span>' :
        '<span class="badge badge-gray">⏳ 待完成</span>';
      var cardClass = subject === 'chinese' ? 'card-chinese' : 'card-math';

      // 显示题目分类
      var categoriesHtml = '';
      if (t.questions && t.questions.length > 0) {
        t.questions.forEach(function(q) {
          if (q.categoryName) {
            categoriesHtml += '<span class="badge ' + (subject === 'chinese' ? 'badge-pink' : 'badge-blue') + '">' +
              (q.categoryIcon || '') + ' ' + esc(q.categoryName) + '</span> ';
          }
        });
      }

      var lesson = Tasks.getCurrentLesson(subject);
      var totalLessons = Tasks.getTotalLessons(subject);
      var lessonLabel = '第' + (lesson.globalIndex + 1) + '/' + totalLessons + '课 · ' + esc(t.title);

      taskCardsHtml += '<div class="task-card ' + cardClass + '" onclick="Pages.go(\'study\'); Pages.setSubject(\'' + subject + '\')">' +
        '<div class="task-status">' + statusBadge + '</div>' +
        '<div class="task-header">' +
          '<span class="task-icon">' + cfg.icon + '</span>' +
          '<div><div class="task-title">' + cfg.name + '</div>' +
          '<div class="task-subtitle">' + lessonLabel + '</div>' +
          '<div class="task-subtitle" style="margin-top:2px;">' + (t.completed ? '✅ 正确' + t.correctCount + '题' : CONFIG.QUESTIONS_PER_SUBJECT + '道轻量练习 · 约15分钟') + '</div></div>' +
        '</div>' +
        (categoriesHtml ? '<div class="flex-wrap gap-sm">' + categoriesHtml + '</div>' : '') +
      '</div>';
    });

    // 周末复习卡片
    var weeklyHtml = '';
    if (weekly && weekly.errorCount > 0 && !weekly.completed) {
      weeklyHtml = '<div class="weekly-review-card" onclick="Pages.go(\'error-book\')">' +
        '<div class="wr-title">📒 本周错题复习</div>' +
        '<div class="wr-desc">本周共' + weekly.errorCount + '道错题，周末来复习一下吧！</div>' +
      '</div>';
    }

    // 单元测试提示
    var testPrompt = Tasks.checkLessonTest();
    var testHtml = '';
    if (testPrompt.chinese || testPrompt.math) {
      var testSubjects = [];
      if (testPrompt.chinese) testSubjects.push('语文');
      if (testPrompt.math) testSubjects.push('数学');
      testHtml = '<div class="callout" style="background:linear-gradient(135deg,rgba(255,167,38,0.1),rgba(255,167,38,0.04));border-left:4px solid var(--c-secondary);border-radius:0 12px 12px 0;padding:14px 18px;margin-bottom:16px;">' +
        '<p style="font-weight:600;">📢 家长注意：' + testSubjects.join('、') + '可以打印一课一测试卷了！</p>' +
        '<p style="font-size:14px;color:var(--c-text-light);">请前往「家长中心」搜索本课题库并打印。</p></div>';
    }

    return '<div class="page">' +
      '<div class="home-greeting">' +
        '<div class="hello">你好，' + esc(settings.childName) + '！👋</div>' +
        '<div class="date">' + DateUtils.friendlyDate(today) + '</div>' +
      '</div>' +
      '<div class="home-top-bar">' + plantMini + waterHtml + '</div>' +
      testHtml +
      weeklyHtml +
      taskCardsHtml +
      '<div class="card text-center" style="border:2px dashed var(--c-border);background:transparent;">' +
        '<p style="font-size:14px;color:var(--c-text-light);">💡 每日只需完成2科轻量练习（每科仅' + CONFIG.QUESTIONS_PER_SUBJECT + '题），就能获得水滴浇灌你的小植物！</p>' +
      '</div>' +
    '</div>';
  }

  function attachHomeEvents() {
    // 首页事件通过onclick内联处理，无需额外绑定
  }

  /* ========================================================
   *  2. 学习任务页
   * ====================================================== */
  function renderStudy() {
    var today = DateUtils.today();
    var task = Tasks.getTodayStatus();
    var subject = state.studySubject;
    var cfg = subjectCfg(subject);
    var subTask = task[subject];

    // 学科切换
    var subjectToggleHtml = '<div class="subject-toggle">' +
      '<div class="toggle-btn ' + (subject === 'chinese' ? 'active chinese' : '') + '" onclick="Pages.setSubject(\'chinese\')">📖 语文</div>' +
      '<div class="toggle-btn ' + (subject === 'math' ? 'active math' : '') + '" onclick="Pages.setSubject(\'math\')">🔢 数学</div>' +
    '</div>';

    // 如果已完成，显示结果
    if (subTask.completed) {
      return '<div class="page">' +
        subjectToggleHtml +
        renderStudyResult(subTask, cfg) +
      '</div>';
    }

    // 模式切换
    var modeToggleHtml = '<div class="mode-toggle">' +
      '<div class="mode-btn ' + (state.studyMode === 'online' ? 'active' : '') + '" onclick="Pages.setMode(\'online\')">💻 线上练习</div>' +
      '<div class="mode-btn ' + (state.studyMode === 'offline' ? 'active' : '') + '" onclick="Pages.setMode(\'offline\')">📷 纸质拍照</div>' +
    '</div>';

    var contentHtml = '';
    if (state.studyMode === 'online') {
      contentHtml = renderOnlineQuiz(subTask, subject);
    } else {
      contentHtml = renderOfflineUpload(subTask, subject);
    }

    return '<div class="page">' +
      '<h2 class="page-title">' + cfg.icon + ' ' + esc(subTask.title) + '</h2>' +
      subjectToggleHtml +
      modeToggleHtml +
      contentHtml +
    '</div>';
  }

  /** 线上练习渲染 */
  function renderOnlineQuiz(subTask, subject) {
    var html = '';
    subTask.questions.forEach(function(q, idx) {
      html += '<div class="card study-question-card">' +
        '<div class="q-category">' + (q.categoryIcon || '📋') + ' ' + esc(q.categoryName || '') + '</div>' +
        '<div class="q-num">第' + (idx + 1) + '题 / 共' + subTask.questions.length + '题</div>' +
        '<div class="q-text">' + esc(q.question) + '</div>' +
        (q.figure ? '<div class="q-figure" style="text-align:center;margin:12px 0;padding:16px;background:#fff8f0;border-radius:12px;border:2px dashed #ffe0b2;">' + q.figure + '</div>' : '');

      if (q.type === 'choice') {
        q.options.forEach(function(opt, i) {
          var selected = state.answers[idx] === optionLabel(i) ? ' selected' : '';
          html += '<div class="option-btn' + selected + '" onclick="Pages.selectAnswer(' + idx + ',\'' + optionLabel(i) + '\')">' +
            '<span class="option-label">' + optionLabel(i) + '</span>' + esc(opt) + '</div>';
        });
      } else if (q.type === 'fill') {
        var val = state.answers[idx] || '';
        html += '<input type="text" class="fill-input" placeholder="在这里写答案..." value="' + esc(val) + '" ' +
          'oninput="Pages.setAnswer(' + idx + ', this.value)" />';
      } else if (q.type === 'truefalse') {
        var isTrue = state.answers[idx] === true;
        var isFalse = state.answers[idx] === false;
        html += '<div class="tf-group">' +
          '<div class="tf-btn ' + (isTrue ? 'selected' : '') + '" onclick="Pages.selectAnswer(' + idx + ',true)">✓ 对</div>' +
          '<div class="tf-btn ' + (isFalse ? 'selected' : '') + '" onclick="Pages.selectAnswer(' + idx + ',false)">✗ 错</div>' +
        '</div>';
      }

      html += '</div>';
    });

    html += '<button class="btn btn-primary btn-lg" onclick="Pages.submitOnline()">提交批改 ✨</button>';

    return html;
  }

  /** 线下拍照上传渲染（支持多张） */
  function renderOfflineUpload(subTask, subject) {
    var html = '<div class="card">' +
      '<p style="font-size:14px;margin-bottom:12px;">请完成纸质练习后，拍照上传（可拍多页）：</p>' +
      '<div id="photoPreviewList" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">';

    state.photoList.forEach(function(src, i) {
      html += '<div style="position:relative;width:80px;height:80px;">' +
        '<img src="' + src + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid var(--c-border);" />' +
        '<div onclick="Pages.removePhoto(' + i + ')" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:#ff5252;color:#fff;border-radius:50%;text-align:center;line-height:20px;font-size:12px;cursor:pointer;">×</div>' +
      '</div>';
    });

    html += '</div>' +
      '<div class="upload-area" id="uploadArea">' +
        '<div class="upload-icon">📷</div>' +
        '<div class="upload-text">' + (state.photoList.length > 0 ? '继续添加照片' : '点击拍照或选择图片') + '</div>' +
        '<div style="font-size:11px;color:var(--c-text-muted);margin-top:8px;">' + AI.OCR_NOTICE + '</div>' +
      '</div>' +
      '<input type="file" accept="image/*" capture="environment" id="fileInput" style="display:none" />' +
    '</div>';

    var canSubmit = state.photoList.length > 0;
    html += '<button class="btn btn-secondary btn-lg' + (canSubmit ? '' : ' disabled') + '" onclick="Pages.submitOffline()" ' + (canSubmit ? '' : 'disabled') + '>上传并批改 ✨' + (state.photoList.length > 0 ? '（' + state.photoList.length + '张）' : '') + '</button>';

    html += '<div class="callout" style="background:linear-gradient(135deg,rgba(116,185,255,0.08),rgba(116,185,255,0.03));border-left:4px solid var(--c-math);padding:12px 16px;border-radius:0 12px 12px 0;">' +
      '<p style="font-size:13px;">🧠 <strong>智能去重</strong>：纸质学习批改后，系统会自动识别已掌握的知识点，从后续线上练习中剔除，不浪费时间！</p></div>';

    return html;
  }

  /** 批改结果渲染 */
  function renderStudyResult(subTask, cfg) {
    var isOffline = subTask.mode === 'offline';
    var waterTotal = CONFIG.WATER_PER_SUBJECT;
    if (subTask.wrongCount > 0) {
      waterTotal = CONFIG.WATER_PER_SUBJECT + Math.floor(CONFIG.WATER_BONUS_RATIO_POOL * subTask.correctCount / (subTask.correctCount + subTask.wrongCount));
    }

    var html = '<div class="card text-center card-success">' +
      '<div style="font-size:48px;margin-bottom:8px;">' + (subTask.allCorrect ? '🎉' : '👍') + '</div>' +
      '<h3>' + (subTask.allCorrect ? '全部答对！太棒了！' : '完成了！继续加油！') + '</h3>' +
      '<p style="color:var(--c-text-light);">正确 ' + subTask.correctCount + ' 题，错误 ' + subTask.wrongCount + ' 题</p>' +
      '<p style="color:var(--c-primary);font-weight:700;">💧 +' + waterTotal + ' 水滴' +
        (subTask.wrongCount > 0 ? '（含错题比例奖励）' : '') + '</p>' +
    '</div>';

    // 显示新掌握的知识点
    if (subTask.masteredPoints && subTask.masteredPoints.length > 0) {
      html += '<div class="ai-bubble">' +
        '<div class="ai-text">🎉 你已经掌握了：<strong>' + subTask.masteredPoints.join('、') + '</strong><br>' +
        '后续练习将自动跳过这些内容，不浪费时间！</div></div>';
    }

    // 拍照批改：显示OCR识别结果和AI讲解
    if (isOffline) {
      if (subTask.ocrText && !subTask.ocrText.startsWith('(')) {
        html += '<div class="card">' +
          '<h4>📝 OCR识别结果</h4>' +
          '<div style="background:var(--c-bg);padding:12px;border-radius:8px;font-size:13px;white-space:pre-wrap;max-height:200px;overflow-y:auto;">' + esc(subTask.ocrText) + '</div>' +
        '</div>';
      }
      if (subTask.aiSummary) {
        html += '<div class="ai-bubble">' +
          '<div class="ai-text">🤖 <strong>AI批改总结</strong><br>' + esc(subTask.aiSummary) + '</div>' +
        '</div>';
      }
      if (subTask.isSimulated === false) {
        html += '<div style="text-align:center;font-size:12px;color:var(--c-primary);margin:8px 0;">✅ 由真实OCR+AI大模型批改</div>';
      } else {
        html += '<div style="text-align:center;font-size:12px;color:var(--c-text-muted);margin:8px 0;">⚠ 模拟模式批改（配置API后启用真实批改）</div>';
      }
    }

    // 拍照模式：从AI批改结果渲染（不再显示线上练习题）
    if (isOffline && subTask.aiResults && subTask.aiResults.length > 0) {
      var wrongItems = subTask.aiResults.filter(function(r) { return !r.correct; });
      var correctItems = subTask.aiResults.filter(function(r) { return r.correct; });

      if (wrongItems.length > 0) {
        html += '<h3 style="margin-top:20px;">📖 AI错题讲解</h3>';
        wrongItems.forEach(function(w, i) {
          html += '<div class="result-card wrong-item">' +
            '<div class="r-status">❌ 第' + (i+1) + '题' + (w.knowledgePoint ? ' · ' + esc(w.knowledgePoint) : '') + '</div>' +
            '<div class="r-q">' + esc(w.question || w.question_text || '') + '</div>' +
            '<div class="r-answer">你的答案：' + esc(w.studentAnswer || '') + ' | 正确答案：' + esc(w.correctAnswer || '') + '</div>' +
            (w.explanation ? '<div class="ai-bubble" style="margin-top:8px;"><div class="ai-text">' + esc(w.explanation) + '</div></div>' : '') +
          '</div>';
        });
      }

      if (correctItems.length > 0) {
        html += '<h3 style="margin-top:20px;">✅ 答对的题目</h3>';
        correctItems.forEach(function(c, i) {
          html += '<div class="result-card correct-item">' +
            '<div class="r-status">✓ 第' + (i+1) + '题</div>' +
            '<div class="r-q">' + esc(c.question || c.question_text || '') + '</div>' +
            '<div class="r-answer">答案：' + esc(c.studentAnswer || '') + '</div>' +
          '</div>';
        });
      }
    } else {
      // 线上练习模式：从题目列表渲染
      if (subTask.wrongList && subTask.wrongList.length > 0) {
        html += '<h3 style="margin-top:20px;">📖 AI错题讲解</h3>';
        subTask.wrongList.forEach(function(w, i) {
          html += '<div class="result-card wrong-item">' +
            '<div class="r-status">❌ 第' + (i+1) + '题 · ' + esc(w.knowledgePoint) + '</div>' +
            '<div class="r-q">' + esc(w.question.question) + '</div>' +
            (w.question.figure ? '<div class="q-figure" style="text-align:center;margin:12px 0;padding:16px;background:#fff8f0;border-radius:12px;border:2px dashed #ffe0b2;">' + w.question.figure + '</div>' : '') +
            '<div class="r-answer">你的答案：' + esc(w.studentAnswer) + ' | 正确答案：' + esc(w.correctAnswer) + '</div>' +
            '<div class="ai-bubble" style="margin-top:8px;"><div class="ai-text">' + esc(w.explanation) + '</div></div>' +
          '</div>';
        });
      }

      var correctList = [];
      if (subTask.questions) {
        subTask.questions.forEach(function(q, i) {
          var w = subTask.wrongList.find(function(x) { return x.question === q; });
          if (!w) correctList.push({ q: q, idx: i });
        });
      }
      if (correctList.length > 0) {
        html += '<h3 style="margin-top:20px;">✅ 答对的题目</h3>';
        correctList.forEach(function(c) {
          html += '<div class="result-card correct-item">' +
            '<div class="r-status">✓ 第' + (c.idx+1) + '题</div>' +
            '<div class="r-q">' + esc(c.q.question) + '</div>' +
            (c.q.figure ? '<div class="q-figure" style="text-align:center;margin:8px 0;padding:12px;background:#f0fff4;border-radius:8px;border:2px dashed #c8e6c9;">' + c.q.figure + '</div>' : '') +
          '</div>';
        });
      }
    }

    html += '<button class="btn btn-outline btn-lg" style="margin-top:16px;" onclick="Pages.go(\'home\')">返回首页</button>';

    return html;
  }

  function attachStudyEvents() {
    if (state.studyMode === 'offline') {
      var uploadArea = document.getElementById('uploadArea');
      var fileInput = document.getElementById('fileInput');
      if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', function() { fileInput.click(); });
        fileInput.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (file) {
            var reader = new FileReader();
            reader.onload = function(ev) {
              state.photoList.push(ev.target.result);
              render();
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  }

  /* ========================================================
   *  3. 错题本页
   * ====================================================== */
  function renderErrorBook() {
    var stats = ErrorBook.getStats();
    var errors = [];
    var filter = state.errorFilter;

    if (filter === 'chinese') errors = ErrorBook.getBySubject('chinese');
    else if (filter === 'math') errors = ErrorBook.getBySubject('math');
    else if (filter === 'daily') errors = ErrorBook.getBySource('daily');
    else if (filter === 'lesson_test') errors = ErrorBook.getBySource('lesson_test');
    else if (filter === 'pending') errors = ErrorBook.getPending();
    else errors = ErrorBook.getAll();

    // 统计卡片
    var statsHtml = '<div class="stat-grid">' +
      '<div class="stat-card"><div class="stat-num" style="color:var(--c-danger)">' + stats.total + '</div><div class="stat-label">总错题</div></div>' +
      '<div class="stat-card"><div class="stat-num" style="color:var(--c-secondary)">' + stats.pending + '</div><div class="stat-label">待复习</div></div>' +
      '<div class="stat-card"><div class="stat-num" style="color:var(--c-primary)">' + stats.mastered + '</div><div class="stat-label">已掌握</div></div>' +
    '</div>';

    // 筛选
    var filters = [
      { id: 'all', name: '全部' }, { id: 'chinese', name: '语文' },
      { id: 'math', name: '数学' }, { id: 'daily', name: '日常' },
      { id: 'lesson_test', name: '一课一测' }, { id: 'pending', name: '待复习' }
    ];
    var filterHtml = '<div class="error-filter">';
    filters.forEach(function(f) {
      filterHtml += '<div class="filter-chip ' + (filter === f.id ? 'active' : '') + '" onclick="Pages.setErrorFilter(\'' + f.id + '\')">' + f.name + '</div>';
    });
    filterHtml += '</div>';

    // 周末复习入口
    var weekly = Tasks.checkWeeklyReview();
    var weeklyHtml = '';
    if (weekly && weekly.errorCount > 0) {
      weeklyHtml = '<div class="weekly-review-card" onclick="Pages.showWeeklyReview()">' +
        '<div class="wr-title">📒 ' + (weekly.completed ? '本周复习已完成' : '本周错题复习') + '</div>' +
        '<div class="wr-desc">本周共' + weekly.errorCount + '道错题' + (weekly.completed ? '（已完成复习）' : '，点击开始复习') + '</div>' +
      '</div>';
    }

    // 错题列表
    var listHtml = '';
    if (errors.length === 0) {
      listHtml = '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">还没有错题哦！继续保持！</div></div>';
    } else {
      errors.slice().reverse().forEach(function(e) {
        var cfg = subjectCfg(e.subject);
        var sourceBadge = e.source === 'unit_test' ?
          '<span class="badge badge-orange">单元测试</span>' :
          '<span class="badge badge-gray">日常练习</span>';
        var statusBadge = e.reviewStatus === 'mastered' ?
          '<span class="badge badge-green">已掌握</span>' :
          e.reviewStatus === 'still_wrong' ?
          '<span class="badge badge-red">仍出错</span>' :
          '<span class="badge badge-gray">待复习</span>';

        listHtml += '<div class="error-item">' +
          '<div class="e-subject"><span class="badge ' + (e.subject === 'chinese' ? 'badge-pink' : 'badge-blue') + '">' + cfg.icon + ' ' + cfg.name + '</span>' +
          sourceBadge + statusBadge + '</div>' +
          '<div class="e-question">' + esc(e.question) + '</div>' +
          '<div class="e-answer">你的答案：' + esc(e.studentAnswer) + ' → 正确：' + esc(e.correctAnswer) + '</div>' +
          '<div class="e-answer" style="color:var(--c-text-light);">知识点：' + esc(e.knowledgePoint) + '</div>' +
          '<div class="ai-bubble" style="margin-top:6px;"><div class="ai-text">' + esc(e.explanation) + '</div></div>' +
          (e.reviewStatus !== 'mastered' ?
            '<div class="e-actions">' +
              '<button class="btn btn-primary btn-sm" onclick="Pages.markErrorMastered(\'' + e.id + '\')">✓ 已掌握</button>' +
            '</div>' : '') +
        '</div>';
      });
    }

    return '<div class="page">' +
      '<h2 class="page-title">📒 错题本</h2>' +
      statsHtml +
      weeklyHtml +
      filterHtml +
      listHtml +
    '</div>';
  }

  /* ========================================================
   *  4. 种植园页
   * ====================================================== */
  function renderGarden() {
    var plantStatus = Plant.getStatus();
    var water = Storage.getWater();

    // 还没种植 → 显示选种子
    if (!plantStatus) {
      var seedHtml = '<div class="seed-grid">';
      CONFIG.FRUIT_SEEDS.forEach(function(s) {
        seedHtml += '<div class="seed-card" onclick="Pages.plantSeed(\'' + s.id + '\')">' +
          '<div class="seed-emoji">' + s.emoji + '</div>' +
          '<div class="seed-name">' + s.name + '</div>' +
        '</div>';
      });
      seedHtml += '</div>';

      return '<div class="page">' +
        '<h2 class="page-title">🌱 选择你想种的水果</h2>' +
        '<div class="card text-center"><p style="color:var(--c-text-light);">完成学习任务获得水滴，每天浇水，' + CONFIG.PLANT_MATURE_DAYS + '天后就能收获真实水果！</p></div>' +
        seedHtml +
      '</div>';
    }

    var plant = plantStatus.plant;
    var stage = plantStatus.stage;

    // 成熟状态
    if (plant.matured) {
      return '<div class="page garden-container">' +
        '<div class="matured-banner">' +
          '<div class="mb-emoji">' + (CONFIG.FRUIT_SEEDS.find(function(f){return f.id===plant.fruitId;}) || {}).emoji + '</div>' +
          '<div class="mb-title">🎉 ' + plant.fruitName + '成熟啦！</div>' +
          '<div class="mb-desc">可以兑换真实的' + plant.fruitName + '了！请家长在「家长中心」确认兑换</div>' +
        '</div>' +
        '<button class="btn btn-outline" onclick="Pages.resetPlant()">重新种植</button>' +
      '</div>';
    }

    // HP显示
    var hpColor = plantStatus.healthStatus === 'critical' ? 'var(--c-danger)' :
                  plantStatus.healthStatus === 'wilting' ? 'var(--c-danger)' :
                  plantStatus.healthStatus === 'weak' ? 'var(--c-warning)' :
                  'var(--c-primary)';
    var hpHtml = '<div class="plant-hp-section">' +
      '<div class="plant-hp-label"><span>❤️ 生命值</span><span style="color:' + hpColor + '">' + plant.health + '/' + CONFIG.HP_MAX + '</span></div>' +
      '<div class="hp-bar"><div class="hp-fill" style="width:' + plant.health + '%"></div></div>' +
    '</div>';

    if (plantStatus.healthStatus === 'wilting' || plantStatus.healthStatus === 'critical') {
      hpHtml += '<p style="color:var(--c-danger);font-size:14px;text-align:center;margin-top:8px;">😟 植物有点枯萎了，快完成任务恢复生命值！</p>';
    }

    // 成长进度
    var stagesHtml = '<div class="growth-stages">';
    CONFIG.GROWTH_STAGES.forEach(function(s) {
      var reached = plant.growthDays >= s.minDay;
      stagesHtml += '<div class="growth-stage-dot ' + (reached ? 'reached' : '') + '">' +
        '<div class="dot">' + (reached ? '✓' : s.stage + 1) + '</div>' +
        '<div class="dot-name">' + s.name + '</div>' +
      '</div>';
    });
    stagesHtml += '</div>';

    var growthHtml = '<div class="plant-growth-section">' +
      '<div class="plant-hp-label"><span>🌱 成长进度</span><span>' + plant.growthDays + '/' + CONFIG.PLANT_MATURE_DAYS + '天</span></div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + plantStatus.progressPercent + '%"></div></div>' +
      stagesHtml +
      '<p style="text-align:center;color:var(--c-text-light);font-size:14px;margin-top:12px;">距成熟还有 <strong style="color:var(--c-primary);">' + plantStatus.daysToMature + '</strong> 天</p>' +
    '</div>';

    // 浇水按钮
    var waterBtnHtml = '';
    if (plantStatus.wateredToday) {
      waterBtnHtml = '<div class="card text-center"><p>💧 今天已经浇过水啦！明天再来吧～</p></div>';
    } else if (plantStatus.canWater) {
      waterBtnHtml = '<div class="text-center">' +
        '<button class="water-button" onclick="Pages.waterPlant()">💧 浇水 (' + CONFIG.PLANT_WATER_PER_DAY + '滴)</button>' +
        '<p style="font-size:14px;color:var(--c-text-light);margin-top:8px;">当前水滴：' + water.balance + ' | 浇水消耗' + CONFIG.PLANT_WATER_PER_DAY + '滴，生命值+' + CONFIG.HP_RESTORE_PER_WATERING + '</p>' +
      '</div>';
    } else if (water.balance < CONFIG.PLANT_WATER_PER_DAY) {
      waterBtnHtml = '<div class="card text-center">' +
        '<p style="color:var(--c-secondary);">💧 水滴不够啦！还差' + (CONFIG.PLANT_WATER_PER_DAY - water.balance) + '滴</p>' +
        '<p style="font-size:14px;color:var(--c-text-light);">快去完成任务获得水滴吧～</p>' +
      '</div>';
    }

    return '<div class="page garden-container">' +
      '<div class="plant-display">' + stage.emoji + '</div>' +
      '<div class="plant-name">' + plant.fruitName + '</div>' +
      '<div class="plant-stage">' + stage.name + ' · ' + stage.desc + '</div>' +
      hpHtml +
      growthHtml +
      waterBtnHtml +
    '</div>';
  }

  function attachGardenEvents() {}

  /* ========================================================
   *  5. 家长中心页
   * ====================================================== */
  function renderParent() {
    var settings = Storage.getSettings();
    var masteryList = Storage.getMasteredList();
    var stats = ErrorBook.getStats();
    var history = Storage.getHistory().slice(-15).reverse();
    var testPrompt = Tasks.checkLessonTest();

    // 按课推进控制
    var cLesson = Tasks.getCurrentLesson('chinese');
    var mLesson = Tasks.getCurrentLesson('math');
    var cTotal = Tasks.getTotalLessons('chinese');
    var mTotal = Tasks.getTotalLessons('math');

    var lessonControlHtml = '<div class="card">' +
      '<h3>📚 当前学习进度（按课推进）</h3>' +
      '<div class="unit-control">' +
        '<div><div class="uc-label">📖 语文 · 第' + (settings.chineseLesson + 1) + '/' + cTotal + '课</div>' +
        '<div class="font-sm text-light">' + esc(cLesson.title) + ' | ' + cLesson.unitTitle + '</div></div>' +
        '<div class="uc-btns">' +
          '<button class="uc-btn" onclick="Pages.adjustLesson(\'chinese\',-1)">−</button>' +
          '<span class="uc-num">' + (settings.chineseLesson + 1) + '</span>' +
          '<button class="uc-btn" onclick="Pages.adjustLesson(\'chinese\',1)">+</button>' +
        '</div>' +
      '</div>' +
      '<div class="unit-control">' +
        '<div><div class="uc-label">🔢 数学 · 第' + (settings.mathLesson + 1) + '/' + mTotal + '课</div>' +
        '<div class="font-sm text-light">' + esc(mLesson.title) + ' | ' + mLesson.unitTitle + '</div></div>' +
        '<div class="uc-btns">' +
          '<button class="uc-btn" onclick="Pages.adjustLesson(\'math\',-1)">−</button>' +
          '<span class="uc-num">' + (settings.mathLesson + 1) + '</span>' +
          '<button class="uc-btn" onclick="Pages.adjustLesson(\'math\',1)">+</button>' +
        '</div>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--c-text-muted);">⏳ 严格按课推进，学完一课才进入下一课，不超前学习</p>' +
    '</div>';

    // 一课一测提示
    var testHtml = '';
    if (testPrompt.chinese || testPrompt.math) {
      testHtml = '<div class="card card-math">' +
        '<h3>📢 一课一测提醒</h3>';
      if (testPrompt.chinese) testHtml += '<p>📖 语文《' + esc(cLesson.title) + '》已学完' + CONFIG.LESSON_TEST_TRIGGER + '天，请搜索本课题库打印试卷</p>';
      if (testPrompt.math) testHtml += '<p>🔢 数学《' + esc(mLesson.title) + '》已学完' + CONFIG.LESSON_TEST_TRIGGER + '天，请搜索本课题库打印试卷</p>';
      testHtml += '<button class="btn btn-secondary btn-sm" onclick="Pages.showLessonTestUpload()">📷 上传试卷批改</button></div>';
    }

    // API配置区（密钥在后端环境变量，前端仅显示状态）
    var apiCfg = API.getConfig();
    var apiConfigHtml = '<div class="card">' +
      '<h3>🔧 OCR & AI 批改接口</h3>' +
      '<p style="font-size:12px;color:var(--c-text-muted);margin-bottom:12px;">拍照上传批改使用后端代理，API密钥安全存储在服务器端，不暴露在前端</p>' +
      '<div style="margin-bottom:12px;padding:12px;background:var(--c-bg-light);border-radius:8px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span style="font-size:14px;font-weight:600;">📷 OCR文字识别</span>' +
          '<span style="font-size:13px;color:' + (apiCfg.ocr.provider !== 'simulation' ? 'var(--c-primary)' : 'var(--c-text-muted)') + ';">' +
            (apiCfg.ocr.provider !== 'simulation' ? '✅ 百度OCR' : '⚠ 模拟模式') +
          '</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<span style="font-size:14px;font-weight:600;">🤖 AI大模型批改</span>' +
          '<span style="font-size:13px;color:' + (apiCfg.ai.provider !== 'simulation' ? 'var(--c-primary)' : 'var(--c-text-muted)') + ';">' +
            (apiCfg.ai.provider !== 'simulation' ? '✅ 豆包AI' : '⚠ 模拟模式') +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:12px;">' +
        '<label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">运行模式</label>' +
        '<select id="apiMode" style="width:100%;padding:8px;border:1px solid var(--c-border);border-radius:8px;font-size:14px;">' +
          '<option value="real"' + (API.isRealMode() ? ' selected' : '') + '>真实接口（OCR+AI批改）</option>' +
          '<option value="simulation"' + (!API.isRealMode() ? ' selected' : '') + '>模拟模式（测试用）</option>' +
        '</select>' +
      '</div>' +
      '<button class="btn btn-primary btn-sm" style="width:100%;" onclick="Pages.saveApiConfig()">💾 保存设置</button>' +
      '<p style="font-size:11px;color:var(--c-text-muted);margin-top:8px;">当前状态：' + (API.isRealMode() ? '✅ 真实接口已启用（百度OCR + 豆包AI）' : '⚠ 模拟模式') + '</p>' +
    '</div>';

    // 掌握情况
    var masteryHtml = '<div class="card"><h3>🧠 已掌握知识点</h3>';
    if (masteryList.length === 0) {
      masteryHtml += '<p style="color:var(--c-text-light);font-size:14px;">暂无已掌握知识点，继续加油！</p>';
    } else {
      masteryList.forEach(function(m) {
        masteryHtml += '<div class="mastery-item">' +
          '<span class="m-icon">' + (m.subject === 'chinese' ? '📖' : '🔢') + '</span>' +
          '<span class="m-text">' + esc(m.kp) + '</span>' +
          '<span class="m-check">✓</span>' +
        '</div>';
      });
    }
    masteryHtml += '</div>';

    // 错题统计
    var errorStatsHtml = '<div class="card">' +
      '<h3>📊 学习数据</h3>' +
      '<div class="stat-grid">' +
        '<div class="stat-card"><div class="stat-num" style="color:var(--c-danger)">' + stats.total + '</div><div class="stat-label">总错题</div></div>' +
        '<div class="stat-card"><div class="stat-num" style="color:var(--c-primary)">' + stats.mastered + '</div><div class="stat-label">已掌握</div></div>' +
        '<div class="stat-card"><div class="stat-num" style="color:var(--c-secondary)">' + masteryList.length + '</div><div class="stat-label">已掌握知识点</div></div>' +
      '</div></div>';

    // 最近历史
    var historyHtml = '<div class="card"><h3>📋 最近记录</h3>';
    if (history.length === 0) {
      historyHtml += '<p style="color:var(--c-text-light);font-size:14px;">暂无记录</p>';
    } else {
      history.forEach(function(h) {
        var text = '';
        if (h.type === 'task_complete') {
          var cfg = subjectCfg(h.subject);
          text = cfg.icon + ' ' + cfg.name + '：正确' + h.correct + '题，错误' + h.wrong + '题';
          if (h.waterEarned) text += '，+' + h.waterEarned + '滴水';
        } else if (h.type === 'plant_water') {
          text = '💧 浇灌植物，消耗' + h.amount + '滴水';
        } else if (h.type === 'plant_seed') {
          text = '🌱 种下了' + h.fruit;
        } else if (h.type === 'hp_loss') {
          text = '💔 生命值-' + h.amount + '（' + h.days + '天未完成任务）';
        } else if (h.type === 'hp_restore') {
          text = '❤️ 生命值恢复至' + h.amount;
        } else if (h.type === 'lesson_test') {
          text = subjectCfg(h.subject).icon + ' 一课一测《' + (h.lessonTitle || '') + '》：' + h.score + '分' + (h.passed ? '✓' : '✗');
        } else if (h.type === 'unit_test') {
          text = subjectCfg(h.subject).icon + ' 单元测试：' + h.score + '分' + (h.passed ? '✓' : '✗');
        } else if (h.type === 'weekly_review') {
          text = '📒 完成周末复习';
        } else if (h.type === 'water_earn') {
          text = '💧 获得' + h.amount + '滴水（' + h.reason + '）';
        } else {
          text = h.type;
        }
        historyHtml += '<div class="history-item"><div>' + text + '</div><div class="h-time">' + h.date + '</div></div>';
      });
    }
    historyHtml += '</div>';

    // 清除数据按钮
    var clearHtml = '<button class="btn btn-danger btn-sm" style="margin-top:16px;" onclick="Pages.clearData()">⚠️ 清除所有数据（调试用）</button>';

    return '<div class="page">' +
      '<h2 class="page-title">👨‍👩‍👧 家长中心</h2>' +
      lessonControlHtml +
      apiConfigHtml +
      testHtml +
      masteryHtml +
      errorStatsHtml +
      historyHtml +
      clearHtml +
    '</div>';
  }

  function attachParentEvents() {}

  /* ========================================================
   *  事件处理方法（通过onclick内联调用）
   * ====================================================== */

  function setSubject(s) { state.studySubject = s; state.answers = {}; state.photoList = []; render(); }
  function setMode(m) { state.studyMode = m; state.answers = {}; state.photoList = []; render(); }
  function removePhoto(i) { state.photoList.splice(i, 1); render(); }

  function selectAnswer(qIdx, val) {
    state.answers[qIdx] = val;
    render();
  }
  function setAnswer(qIdx, val) {
    state.answers[qIdx] = val;
  }

  function submitOnline() {
    var subject = state.studySubject;
    var task = Tasks.getTodayStatus();
    var questions = task[subject].questions;
    var answers = [];
    for (var i = 0; i < questions.length; i++) {
      if (state.answers[i] === undefined || state.answers[i] === '') {
        toast('还有题目没做完哦！请完成所有题目再提交～', 'warning');
        return;
      }
      answers.push(state.answers[i]);
    }
    var result = Tasks.submitOnlineTask(subject, answers);
    if (result) {
      toast('批改完成！正确' + result.result.correctCount + '题，获得' + result.waterEarned + '滴水！🎉', 'success');
      state.answers = {};
      render();
    }
  }

  async function submitOffline() {
    var subject = state.studySubject;
    if (state.photoList.length === 0) {
      toast('请先拍照或选择图片！📷', 'warning');
      return;
    }
    toast('正在批改' + state.photoList.length + '张照片，请稍候...⏳', 'info');
    try {
      var result = await Tasks.submitOfflineTaskAsync(subject, state.photoList);
      if (result) {
        var msg = '拍照批改完成！获得' + result.waterEarned + '滴水！🎉';
        if (result.result && result.result.summary) msg += '\n' + result.result.summary;
        toast(msg, 'success');
        state.photoList = [];
        state.showOfflineResult = true;
        state.offlineResult = result;
        render();
      }
    } catch (e) {
      toast('批改失败：' + e.message + '，请重试', 'warning');
    }
  }

  function setErrorFilter(f) { state.errorFilter = f; render(); }

  function markErrorMastered(id) {
    ErrorBook.markMastered(id);
    toast('已标记为掌握！👍', 'success');
    render();
  }

  function plantSeed(fruitId) {
    Plant.plantSeed(fruitId);
    var seed = CONFIG.FRUIT_SEEDS.find(function(f) { return f.id === fruitId; });
    toast('种下了' + seed.name + '种子！加油浇水吧～🌱', 'success');
    render();
  }

  function waterPlant() {
    var result = Plant.water();
    if (result.success) {
      toast(result.msg, 'success');
    } else {
      toast(result.msg, 'warning');
    }
    render();
  }

  function resetPlant() {
    if (confirm('确定要重新种植吗？当前植物数据将清除。')) {
      Plant.reset();
      render();
    }
  }

  function adjustLesson(subject, delta) {
    var settings = Storage.getSettings();
    var max = Tasks.getTotalLessons(subject) - 1;
    var newLesson = (settings[subject + 'Lesson'] || 0) + delta;
    if (newLesson < 0) newLesson = 0;
    if (newLesson > max) newLesson = max;
    var update = {};
    update[subject + 'Lesson'] = newLesson;
    // 同步更新unit
    var lesson = Tasks.getLessonList(subject)[newLesson];
    if (lesson) update[subject + 'Unit'] = lesson.unit;
    Storage.updateSettings(update);
    var lessonTitle = lesson ? lesson.title : '';
    toast(subject === 'chinese' ? '语文进度调整为第' + (newLesson + 1) + '课：' + lessonTitle : '数学进度调整为第' + (newLesson + 1) + '课：' + lessonTitle, 'success');
    render();
  }

  function showLessonTestUpload() {
    var subject = state.studySubject;
    var settings = Storage.getSettings();
    var lessonIdx = settings[subject + 'Lesson'] || 0;
    var lesson = Tasks.getLessonList(subject)[lessonIdx];
    var lessonTitle = lesson ? lesson.title : '当前课';
    if (confirm('将上传' + (subject === 'chinese' ? '语文' : '数学') + '《' + lessonTitle + '》一课一测试卷并AI批改，确认？')) {
      var result = Tasks.submitLessonTest(subject, lessonIdx, 'demo_test');
      toast('一课一测批改完成！得分' + result.result.score + '分' + (result.result.passed ? '，达标+' + result.waterEarned + '滴水！已进入下一课 🎉' : '，未达标，继续加油！'), result.result.passed ? 'success' : 'warning');
      render();
    }
  }

  function saveApiConfig() {
    var mode = document.getElementById('apiMode').value;
    var cfg = {
      ocr: { provider: mode === 'real' ? 'baidu' : 'simulation' },
      ai: { provider: mode === 'real' ? 'doubao' : 'simulation' }
    };
    API.saveConfig(cfg);
    toast('设置已保存！' + (API.isRealMode() ? '✅ 真实接口已启用' : '⚠ 模拟模式'), 'success');
    render();
  }

  function showWeeklyReview() {
    var today = DateUtils.today();
    var weekKey = DateUtils.getWeekKey(today);
    var weekly = Storage.getWeekly(weekKey);
    if (!weekly || weekly.errorCount === 0) {
      toast('本周没有错题，做得很好！🎉', 'success');
      return;
    }
    if (weekly.completed) {
      toast('本周复习已完成！', 'success');
      return;
    }
    if (confirm('开始本周错题复习？共' + weekly.errorCount + '道错题。')) {
      var result = Tasks.completeWeeklyReview();
      toast('复习完成！获得' + result.waterEarned + '滴水！🎉', 'success');
      render();
    }
  }

  function clearData() {
    if (confirm('⚠️ 确定清除所有数据？此操作不可恢复！')) {
      Storage.clearAll();
      toast('数据已清除', 'warning');
      setTimeout(function() { location.reload(); }, 1000);
    }
  }

  /* ===== 暴露接口 ===== */
  return {
    go: go, render: render,
    setSubject: setSubject, setMode: setMode,
    selectAnswer: selectAnswer, setAnswer: setAnswer,
    submitOnline: submitOnline, submitOffline: submitOffline,
    setErrorFilter: setErrorFilter, markErrorMastered: markErrorMastered,
    plantSeed: plantSeed, waterPlant: waterPlant, resetPlant: resetPlant,
    adjustLesson: adjustLesson, showLessonTestUpload: showLessonTestUpload,
    saveApiConfig: saveApiConfig,
    showWeeklyReview: showWeeklyReview, clearData: clearData
  };
})();
