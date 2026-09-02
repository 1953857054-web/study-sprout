/**
 * ============================================================
 *  学芽 App — 全局常量配置
 *  所有数值参数集中在此，修改只需改这一个文件
 * ============================================================
 */
var CONFIG = {

  /* ===== 水滴积分规则（严格按需求，不可改）===== */
  WATER_PER_SUBJECT: 5,           // 完成1科任务奖励5滴
  WATER_BONUS_ALL_CORRECT: 2,     // 单科全对额外奖励2滴
  WATER_WEEKLY_REVIEW: 3,        // 周末复习完成奖励3滴
  WATER_UNIT_TEST_PASS: 10,     // 一课一测达标(≥80分)奖励10滴

  /* ===== 植物养成规则（严格按需求，不可改）===== */
  PLANT_WATER_PER_DAY: 10,       // 每日至少消耗10滴完成灌溉
  PLANT_MATURE_DAYS: 45,          // 45天成熟
  PLANT_INITIAL_HP: 100,          // 初始生命值100
  HP_MAX: 100,                    // 生命值上限100
  HP_LOSS_PER_TASK: 5,            // 每有1项任务未完成，-5
  HP_RESTORE_PER_WATERING: 2,    // 灌溉10滴水可增加2点生命值
  HP_WILTING: 30,                 // <30 显示枯萎
  HP_CRITICAL: 10,                // <10 危急状态

  /* ===== 每日任务量（15分钟，循序渐进）===== */
  QUESTIONS_PER_SUBJECT: 8,       // 每科8题（约15分钟）
  // 语文：基础3题+阅读3题+写话2题 = 8题
  // 数学：计算2+逻辑2+图形2+趣味2 = 8题

  /* ===== 按课推进规则（一课一练，不按单元）===== */
  DAYS_PER_LESSON: 2,             // 每课至少学2天才能进入下一课
  LESSON_TEST_TRIGGER: 2,         // 连续完成2天本课 → 提示一课一测
  LESSON_TEST_PASS_SCORE: 80,     // 一课一测达标分数≥80

  /* ===== 智能去重机制 ===== */
  MASTERY_THRESHOLD: 2,           // 同一知识点连续答对2次 = 已掌握
  MASTERY_ENABLED: true,           // 开启智能去重

  /* ===== 周末复习 ===== */
  WEEKEND_REVIEW_DAY: 6,          // 周六触发

  /* ===== 语文内容分类 ===== */
  CHINESE_CATEGORIES: [
    { id: 'basic',    name: '课本基础', icon: '📚', desc: '字词句·课文重点' },
    { id: 'reading',  name: '阅读理解', icon: '📖', desc: '短篇·图文结合' },
    { id: 'writing',  name: '看图写话', icon: '✏️', desc: '低门槛·鼓励为主' }
  ],

  /* ===== 数学内容分类 ===== */
  MATH_CATEGORIES: [
    { id: 'calc',     name: '计算基础', icon: '🔢', desc: '少量口算' },
    { id: 'logic',    name: '逻辑思维', icon: '🧩', desc: '找规律·推理' },
    { id: 'shape',    name: '图形认知', icon: '📐', desc: '认图形·数图形' },
    { id: 'fun',      name: '趣味生活', icon: '🎉', desc: '生活化·有趣味' }
  ],

  /* ===== 科目配置 ===== */
  SUBJECTS: {
    chinese: {
      name: '语文', icon: '📖',
      color: '#F48FB1', colorLight: '#FCE4EC',
      textbook: '人教统编版', grade: '二年级'
    },
    math: {
      name: '数学', icon: '🔢',
      color: '#64B5F6', colorLight: '#E3F2FD',
      textbook: '青岛版', grade: '二年级'
    }
  },

  /* ===== 可选水果种子 ===== */
  FRUIT_SEEDS: [
    { id: 'strawberry', name: '草莓', emoji: '🍓' },
    { id: 'tomato',     name: '小番茄', emoji: '🍅' },
    { id: 'blueberry',  name: '蓝莓', emoji: '🫐' },
    { id: 'lemon',      name: '柠檬', emoji: '🍋' },
    { id: 'apple',      name: '苹果', emoji: '🍏' },
    { id: 'cherry',     name: '樱桃', emoji: '🍒' }
  ],

  /* ===== 植物成长阶段 ===== */
  GROWTH_STAGES: [
    { stage: 0, name: '种子',  emoji: '🌰', minDay: 0,  desc: '种子刚刚种下...' },
    { stage: 1, name: '发芽',  emoji: '🌱', minDay: 9,  desc: '嫩绿小芽冒出来啦！' },
    { stage: 2, name: '生长',  emoji: '🌿', minDay: 18, desc: '正在茁壮成长～' },
    { stage: 3, name: '开花',  emoji: '🌸', minDay: 27, desc: '花朵绽放了！' },
    { stage: 4, name: '结果',  emoji: '🫐', minDay: 36, desc: '果实正在成熟...' },
    { stage: 5, name: '成熟',  emoji: '🎉', minDay: 45, desc: '成熟啦！可以兑换真实水果！' }
  ],

  /* ===== 马卡龙配色 ===== */
  COLORS: {
    primary: '#66BB6A', primaryLight: '#A5D6A7',
    secondary: '#FFA726', secondaryLight: '#FFCC80',
    chinese: '#F48FB1', chineseLight: '#FCE4EC',
    math: '#64B5F6', mathLight: '#E3F2FD',
    danger: '#EF5350', warning: '#FFB74D',
    bg: '#FFFDE7', card: '#FFFFFF',
    text: '#4E342E', textLight: '#8D6E63',
    border: '#FFE082', shadow: 'rgba(255,193,7,0.12)'
  },

  /* ===== 底部Tab ===== */
  TABS: [
    { id: 'home',       name: '首页',   icon: '🏠' },
    { id: 'study',      name: '学习',   icon: '✏️' },
    { id: 'error-book', name: '错题本', icon: '📒' },
    { id: 'garden',     name: '种植园', icon: '🌱' },
    { id: 'parent',     name: '家长',   icon: '👨‍👩‍👧' }
  ]
};
