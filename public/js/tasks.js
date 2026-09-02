/**
 * ============================================================
 *  学芽 App — 课程题库 & 任务管理（扩充版）
 *  语文(人教统编版)3类×8单元 + 数学(青岛版)4类×6单元
 *  每科8题≈15-20分钟 | 含SVG图形 | 智能去重
 * ============================================================
 */
var Tasks = (function () {

  /* ========================================================
   *  SVG图形库 — 数学看图题用
   * ====================================================== */
  var SVG = {
    // 单个图形
    circle:   '<svg viewBox="0 0 100 100" width="72" height="72"><circle cx="50" cy="50" r="40" fill="#FFCC80" stroke="#F57C00" stroke-width="3"/></svg>',
    triangle: '<svg viewBox="0 0 100 100" width="72" height="72"><polygon points="50,10 92,88 8,88" fill="#A5D6A7" stroke="#388E3C" stroke-width="3"/></svg>',
    square:   '<svg viewBox="0 0 100 100" width="72" height="72"><rect x="12" y="12" width="76" height="76" fill="#90CAF9" stroke="#1976D2" stroke-width="3"/></svg>',
    rect:     '<svg viewBox="0 0 120 80" width="96" height="64"><rect x="8" y="8" width="104" height="64" fill="#F8BBD0" stroke="#C2185B" stroke-width="3"/></svg>',
    // 多个圆形（数图形用）
    circles3: '<svg viewBox="0 0 200 70" width="180" height="63"><circle cx="35" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><circle cx="100" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><circle cx="165" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/></svg>',
    circles4: '<svg viewBox="0 0 260 70" width="234" height="63"><circle cx="35" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><circle cx="95" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><circle cx="155" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><circle cx="215" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/></svg>',
    triangles2: '<svg viewBox="0 0 140 80" width="126" height="72"><polygon points="35,10 65,70 5,70" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/><polygon points="105,10 135,70 75,70" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/></svg>',
    squares3: '<svg viewBox="0 0 210 70" width="189" height="63"><rect x="5" y="5" width="56" height="56" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/><rect x="77" y="5" width="56" height="56" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/><rect x="149" y="5" width="56" height="56" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/></svg>',
    // 混合图形
    mixed3: '<svg viewBox="0 0 210 70" width="189" height="63"><circle cx="35" cy="35" r="28" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><polygon points="105,8 138,62 72,62" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/><rect x="150" y="7" width="54" height="54" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/></svg>',
    mixed5: '<svg viewBox="0 0 280 70" width="252" height="63"><circle cx="28" cy="35" r="22" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><polygon points="70,12 96,58 44,58" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/><rect x="112" y="14" width="42" height="42" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/><circle cx="186" cy="35" r="22" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><polygon points="230,12 256,58 204,58" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/></svg>',
    // 圆形平分（4份）
    circle4: '<svg viewBox="0 0 100 100" width="80" height="80"><circle cx="50" cy="50" r="40" fill="none" stroke="#F57C00" stroke-width="3"/><line x1="10" y1="50" x2="90" y2="50" stroke="#F57C00" stroke-width="2"/><line x1="50" y1="10" x2="50" y2="90" stroke="#F57C00" stroke-width="2"/></svg>',
    // 圆形平分（2份）
    circle2: '<svg viewBox="0 0 100 100" width="80" height="80"><circle cx="50" cy="50" r="40" fill="none" stroke="#F57C00" stroke-width="3"/><line x1="10" y1="50" x2="90" y2="50" stroke="#F57C00" stroke-width="2"/></svg>',
    // 正方形对角线（分2个三角形）
    squareDiag: '<svg viewBox="0 0 100 100" width="80" height="80"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#1976D2" stroke-width="3"/><line x1="10" y1="10" x2="90" y2="90" stroke="#1976D2" stroke-width="2"/></svg>',
    // 正方形分4个小正方形
    square4: '<svg viewBox="0 0 100 100" width="80" height="80"><rect x="10" y="10" width="80" height="80" fill="none" stroke="#1976D2" stroke-width="3"/><line x1="50" y1="10" x2="50" y2="90" stroke="#1976D2" stroke-width="2"/><line x1="10" y1="50" x2="90" y2="50" stroke="#1976D2" stroke-width="2"/></svg>',
    // 规律序列
    pattern1: '<svg viewBox="0 0 260 60" width="234" height="54"><circle cx="25" cy="30" r="20" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><polygon points="65,10 95,50 35,50" fill="#A5D6A7" stroke="#388E3C" stroke-width="2"/><rect x="105" y="10" width="40" height="40" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/><circle cx="175" cy="30" r="20" fill="#FFCC80" stroke="#F57C00" stroke-width="2"/><text x="225" y="38" font-size="28" fill="#999">?</text></svg>',
    // 长方形
    rectShape: '<svg viewBox="0 0 120 70" width="100" height="58"><rect x="10" y="10" width="100" height="50" fill="#F8BBD0" stroke="#C2185B" stroke-width="3"/></svg>',
    // 长方形分2个三角形
    rectTri: '<svg viewBox="0 0 120 70" width="100" height="58"><rect x="10" y="10" width="100" height="50" fill="none" stroke="#C2185B" stroke-width="3"/><line x1="10" y1="10" x2="110" y2="60" stroke="#C2185B" stroke-width="2"/></svg>'
  };

  /* ========================================================
   *  语文课程库 — 人教统编版二年级上册（扩充版）
   *  每单元: basic(5-6题) + reading(4-5题) + writing(3-4题)
   * ====================================================== */
  var CHINESE_UNITS = [
    { unit:1, title:'第一单元·自然的秘密', lessons:['小蝌蚪找妈妈','我是什么','植物妈妈有办法'],
      basic:[
        { type:'choice', question:'"小蝌蚪找妈妈"中，小蝌蚪先遇到了谁？', options:['鲤鱼妈妈','乌龟','白鹅','青蛙'], answer:'A', knowledgePoint:'课文理解' },
        { type:'fill', question:'"我是什么"中，太阳一晒，我就变成____。', answer:'汽', knowledgePoint:'识字写字' },
        { type:'choice', question:'"植物妈妈有办法"中，蒲公英靠什么传播种子？', options:['风','水','动物','太阳'], answer:'A', knowledgePoint:'课文理解' },
        { type:'fill', question:'"蝌蚪"的"蝌"偏旁是____。', answer:'虫', knowledgePoint:'偏旁部首' },
        { type:'truefalse', question:'小蝌蚪的妈妈是青蛙。', answer:true, knowledgePoint:'课文理解' },
        { type:'fill', question:'"植物妈妈有办法"中，豌豆靠什么传播？', answer:['弹','弹力'], knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'choice', question:'小蝌蚪先长出什么？', options:['后腿','前腿','尾巴','眼睛'], answer:'A', knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'"我是什么"中的"我"指的是水。', answer:true, knowledgePoint:'阅读理解' },
        { type:'choice', question:'"植物妈妈有办法"告诉我们什么？', options:['植物很聪明','植物不好吃','植物很难种','植物没有用'], answer:'A', knowledgePoint:'阅读理解' },
        { type:'fill', question:'小蝌蚪找妈妈，最后在____边找到了妈妈。（填荷叶/荷花）', answer:'荷叶', knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：小蝌蚪找妈妈，最后它们____了。（写一句话）', answer:['找到','见到','见到妈妈'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"办法"写一句话：____。', answer:['办法','我想到了好办法'], knowledgePoint:'造句练习' },
        { type:'fill', question:'用"如果"写一句话：如果____。', answer:['如果','如果下雨了'], knowledgePoint:'造句练习' }
      ]
    },
    { unit:2, title:'第二单元·识字乐园', lessons:['场景歌','树之歌','拍手歌','田家四季歌'],
      basic:[
        { type:'fill', question:'一____帆船（填量词）', answer:'艘', knowledgePoint:'量词运用' },
        { type:'fill', question:'一____小树（填量词）', answer:'棵', knowledgePoint:'量词运用' },
        { type:'choice', question:'"拍手歌"告诉我们什么道理？', options:['保护动物','努力学习','锻炼身体','热爱劳动'], answer:'A', knowledgePoint:'课文理解' },
        { type:'fill', question:'"树之歌"中，杨树____。（填两个字）', answer:['高高','高大'], knowledgePoint:'课文背诵' },
        { type:'fill', question:'一____石桥（填量词）', answer:'座', knowledgePoint:'量词运用' },
        { type:'truefalse', question:'"田家四季歌"写的是农村四季的景色。', answer:true, knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'choice', question:'"场景歌"中，海边有什么？', options:['帆船和海鸥','大树和小鸟','稻田和水牛','花朵和蝴蝶'], answer:'A', knowledgePoint:'阅读理解' },
        { type:'fill', question:'"树之歌"写了____种树。（填数字）', answer:'十一', knowledgePoint:'阅读理解' },
        { type:'choice', question:'"拍手歌"中，哪些动物在玩耍？', options:['孔雀和锦鸡','猫和狗','鸡和鸭','牛和羊'], answer:'A', knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'"场景歌"中出现的量词有"艘""只""方"等。', answer:true, knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：公园里有____。（写一句完整的话）', answer:['公园里','很多','花'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"四季"写一句话：____。', answer:['四季','一年有四季'], knowledgePoint:'造句练习' },
        { type:'fill', question:'用"保护"写一句话：____。', answer:['保护','我们要保护小动物'], knowledgePoint:'造句练习' }
      ]
    },
    { unit:3, title:'第三单元·想象世界', lessons:['彩虹','去外婆家','数星星的孩子'],
      basic:[
        { type:'choice', question:'"数星星的孩子"中，那个孩子是谁？', options:['张衡','李白','孔子','华佗'], answer:'A', knowledgePoint:'课文理解' },
        { type:'fill', question:'"彩虹"有____道颜色。（填数字）', answer:'七', knowledgePoint:'课文理解' },
        { type:'fill', question:'"数星星"的"数"读音是____。', answer:['shǔ','数'], knowledgePoint:'多音字' },
        { type:'choice', question:'"彩虹"中，"我"想到桥上做什么？', options:['把爸爸拿上来','看风景','数星星','玩耍'], answer:'A', knowledgePoint:'课文理解' },
        { type:'truefalse', question:'张衡长大后成了一位天文学家。', answer:true, knowledgePoint:'课文理解' },
        { type:'fill', question:'"彩虹"像一座____。（填两个字）', answer:'彩桥', knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'choice', question:'"数星星的孩子"告诉我们什么道理？', options:['要善于观察和思考','要早睡早起','要多运动','要少吃零食'], answer:'A', knowledgePoint:'阅读理解' },
        { type:'fill', question:'张衡数星星，星星一闪一闪的，像____。', answer:['眼睛','宝石','灯'], knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'"彩虹"中的"我"是个爱想象的孩子。', answer:true, knowledgePoint:'阅读理解' },
        { type:'fill', question:'张衡小时候喜欢看____。（填两个字）', answer:'星星', knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：雨后天晴，天上出现了____。（写一句话）', answer:['彩虹','美丽的彩虹'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"想象"写一句话：____。', answer:['想象','我喜欢想象'], knowledgePoint:'造句练习' },
        { type:'fill', question:'用"如果"写一句话：如果我____。', answer:['如果','如果我有一座彩虹桥'], knowledgePoint:'造句练习' }
      ]
    },
    { unit:4, title:'第四单元·祖国风光', lessons:['古诗二首','黄山奇石','日月潭','葡萄沟'],
      basic:[
        { type:'fill', question:'补全诗句：欲穷千里目，__________。', answer:'更上一层楼', knowledgePoint:'古诗背诵' },
        { type:'choice', question:'"登鹳雀楼"的作者是谁？', options:['王之涣','李白','杜甫','白居易'], answer:'A', knowledgePoint:'古诗积累' },
        { type:'fill', question:'日月潭在我国的____省。', answer:'台湾', knowledgePoint:'课文理解' },
        { type:'truefalse', question:'"望庐山瀑布"写的是庐山的风景。', answer:true, knowledgePoint:'古诗理解' },
        { type:'fill', question:'补全诗句：飞流直下三千尺，__________。', answer:'疑是银河落九天', knowledgePoint:'古诗背诵' },
        { type:'choice', question:'葡萄沟在我国的哪里？', options:['新疆','西藏','云南','甘肃'], answer:'A', knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'choice', question:'"登鹳雀楼"表达了什么情感？', options:['积极向上','思乡','悲伤','愤怒'], answer:'A', knowledgePoint:'阅读理解' },
        { type:'fill', question:'黄山以____闻名。（填两个字）', answer:'奇石', knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'日月潭在山上，水很清。', answer:true, knowledgePoint:'阅读理解' },
        { type:'fill', question:'葡萄沟的葡萄又____又甜。', answer:['多','大'], knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：我去过最美的地方是____。（写一句话）', answer:['地方','我去过'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"风景"写一句话：____。', answer:['风景','这里的风景真美'], knowledgePoint:'造句练习' },
        { type:'fill', question:'用"祖国"写一句话：____。', answer:['祖国','我爱祖国'], knowledgePoint:'造句练习' }
      ]
    },
    { unit:5, title:'第五单元·寓言故事', lessons:['坐井观天','寒号鸟','我要的是葫芦'],
      basic:[
        { type:'choice', question:'"坐井观天"告诉我们什么道理？', options:['眼界要开阔','要勇敢','要勤劳','要诚实'], answer:'A', knowledgePoint:'寓言寓意' },
        { type:'truefalse', question:'寒号鸟最后冻死了，因为它不垒窝。', answer:true, knowledgePoint:'寓言理解' },
        { type:'fill', question:'"坐井观天"中，____坐在井里看天。', answer:'青蛙', knowledgePoint:'课文理解' },
        { type:'fill', question:'"我要的是葫芦"中，种葫芦的人最后____。', answer:['没有','什么也没得到'], knowledgePoint:'课文理解' },
        { type:'choice', question:'"坐井观天"中，谁说天只有井口那么大？', options:['青蛙','小鸟','蛇','鱼'], answer:'A', knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'fill', question:'"寒号鸟"中，喜鹊劝寒号鸟做什么？', answer:['垒窝','做窝','搭窝'], knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'"我要的是葫芦"告诉我们不能只看结果不顾过程。', answer:true, knowledgePoint:'阅读理解' },
        { type:'choice', question:'"坐井观天"中，小鸟认为天有多大？', options:['无边无际','井口那么大','像房子','像碗'], answer:'A', knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：小青蛙跳出井口后，它看到____。（写一句话）', answer:['天空','很大的天空'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"道理"写一句话：____。', answer:['道理','这个故事告诉我们一个道理'], knowledgePoint:'造句练习' }
      ]
    },
    { unit:6, title:'第六单元·伟人故事', lessons:['八角楼上','朱德的扁担','难忘的泼水节','刘胡兰'],
      basic:[
        { type:'choice', question:'朱德是什么军的总司令？', options:['红军','八路军','解放军','志愿军'], answer:'A', knowledgePoint:'课文理解' },
        { type:'truefalse', question:'刘胡兰是一位少年英雄。', answer:true, knowledgePoint:'课文理解' },
        { type:'fill', question:'"难忘的泼水节"中，____总理和傣族人民一起过泼水节。', answer:'周', knowledgePoint:'课文理解' },
        { type:'fill', question:'朱德同志挑粮食用的是一根____。', answer:'扁担', knowledgePoint:'识字写字' },
        { type:'choice', question:'"八角楼上"写的是谁？', options:['毛主席','周总理','朱德','刘胡兰'], answer:'A', knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'fill', question:'泼水节是____族的传统节日。', answer:'傣', knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'朱德和战士们一起挑粮，说明他不怕苦。', answer:true, knowledgePoint:'阅读理解' },
        { type:'choice', question:'刘胡兰面对敌人时表现怎样？', options:['坚强不屈','害怕','逃跑','投降'], answer:'A', knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：我最敬佩的人是____，因为____。（写一句话）', answer:['敬佩','我最敬佩'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"勇敢"写一句话：____。', answer:['勇敢','刘胡兰很勇敢'], knowledgePoint:'造句练习' }
      ]
    },
    { unit:7, title:'第七单元·古诗与想象', lessons:['古诗二首(江雪/敕勒歌)','雾在哪里','雪孩子'],
      basic:[
        { type:'fill', question:'补全诗句：孤舟蓑笠翁，__________。', answer:'独钓寒江雪', knowledgePoint:'古诗背诵' },
        { type:'choice', question:'"江雪"的作者是谁？', options:['柳宗元','李白','杜甫','白居易'], answer:'A', knowledgePoint:'古诗积累' },
        { type:'fill', question:'"敕勒歌"中，天似____笼盖四野。', answer:'穹庐', knowledgePoint:'古诗背诵' },
        { type:'truefalse', question:'"雪孩子"中，雪孩子救了小白兔。', answer:true, knowledgePoint:'课文理解' },
        { type:'fill', question:'"雾在哪里"中，雾把____藏起来了。', answer:['大海','天空','一切'], knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'choice', question:'"雾在哪里"中，雾把什么藏起来了？', options:['大海和天空','房子','树木','道路'], answer:'A', knowledgePoint:'阅读理解' },
        { type:'fill', question:'"雪孩子"变成了____飞上了天空。', answer:['云','水汽','白云'], knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'"江雪"描写的是冬天的景色。', answer:true, knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：下雪了，我和小伙伴们在____。（写一句话）', answer:['雪','下雪了','堆雪人'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"想象"写一句话：____。', answer:['想象','雪孩子想象自己飞上了天空'], knowledgePoint:'造句练习' }
      ]
    },
    { unit:8, title:'第八单元·友爱之歌', lessons:['称赞','纸船和风筝','快乐的小河'],
      basic:[
        { type:'choice', question:'"纸船和风筝"中，小熊和松鼠用什么传递友情？', options:['纸船和风筝','信件','电话','礼物'], answer:'A', knowledgePoint:'课文理解' },
        { type:'truefalse', question:'"称赞"告诉我们，要学会发现别人的优点。', answer:true, knowledgePoint:'课文理解' },
        { type:'fill', question:'"纸船和风筝"中，小熊住在____上。', answer:'山顶', knowledgePoint:'课文理解' },
        { type:'fill', question:'"称赞"中，小刺猬和小獾互相____。', answer:'称赞', knowledgePoint:'识字写字' },
        { type:'choice', question:'"快乐的小河"中小河为什么快乐？', options:['帮助了别人','流到了大海','遇到了朋友','水温很暖'], answer:'A', knowledgePoint:'课文理解' }
      ],
      reading:[
        { type:'fill', question:'松鼠住在____上，小熊住在____上。', answer:['山顶','山脚'], knowledgePoint:'阅读理解' },
        { type:'truefalse', question:'"纸船和风筝"告诉我们友情很珍贵。', answer:true, knowledgePoint:'阅读理解' },
        { type:'choice', question:'"称赞"中小獾做的是什么？', options:['小板凳','房子','蛋糕','衣服'], answer:'A', knowledgePoint:'阅读理解' }
      ],
      writing:[
        { type:'fill', question:'看图写话：我的好朋友是____，我们经常一起____。（写一句话）', answer:['朋友','我的好朋友'], knowledgePoint:'看图写话' },
        { type:'fill', question:'用"友爱"写一句话：____。', answer:['友爱','同学之间要友爱'], knowledgePoint:'造句练习' }
      ]
    }
  ];

  /* ========================================================
   *  数学课程库 — 青岛版二年级上册（扩充版+SVG图形）
   *  每单元: calc(4-5题) + logic(3-4题) + shape(4题带图) + fun(4题)
   * ====================================================== */
  var MATH_UNITS = [
    { unit:1, title:'第1单元·分类与整理',
      calc:[
        { type:'fill', question:'圆有5个，三角形有3个，一共有____个。', answer:'8', knowledgePoint:'分类统计' },
        { type:'fill', question:'苹果3个+香蕉4个=____个水果。', answer:'7', knowledgePoint:'分类统计' },
        { type:'fill', question:'红色4个+蓝色2个=____个。', answer:'6', knowledgePoint:'分类统计' },
        { type:'choice', question:'按颜色分类后，红色有5个，蓝色有3个，一共多少个？', options:['8个','15个','2个','53个'], answer:'A', knowledgePoint:'分类统计' }
      ],
      logic:[
        { type:'choice', question:'下列哪个是按颜色分类？', options:['红的放一起','大的放一起','圆的放一起','重的放一起'], answer:'A', knowledgePoint:'分类标准' },
        { type:'truefalse', question:'分类的标准不同，分的结果也不同。', answer:true, knowledgePoint:'分类逻辑' },
        { type:'choice', question:'把文具和水果分开，这是按什么分类？', options:['用途','颜色','大小','形状'], answer:'A', knowledgePoint:'分类标准' },
        { type:'truefalse', question:'同一种东西可以用不同的标准来分类。', answer:true, knowledgePoint:'分类逻辑' }
      ],
      shape:[
        { type:'choice', figure: SVG.mixed3, question:'看图数一数，图中有几种不同的形状？', options:['3种','2种','4种','1种'], answer:'A', knowledgePoint:'图形分类' },
        { type:'fill', figure: SVG.circles3, question:'看图数一数，图中有几个圆形？', answer:'3', knowledgePoint:'图形计数' },
        { type:'choice', figure: SVG.circle, question:'这是什么图形？', options:['圆形','三角形','正方形','长方形'], answer:'A', knowledgePoint:'图形识别' },
        { type:'choice', figure: SVG.triangle, question:'这是什么图形？', options:['三角形','圆形','正方形','长方形'], answer:'A', knowledgePoint:'图形识别' }
      ],
      fun:[
        { type:'choice', question:'把书包、铅笔、苹果分类，苹果属于哪类？', options:['食物','学习用品','玩具','衣服'], answer:'A', knowledgePoint:'生活分类' },
        { type:'fill', question:'你的书包里有____种学习用品。（填数字）', answer:['3','2','4','5'], knowledgePoint:'生活分类' },
        { type:'choice', question:'整理房间时，玩具和书应该怎么分？', options:['玩具放一起，书放一起','混在一起','随便放','扔掉'], answer:'A', knowledgePoint:'生活分类' },
        { type:'truefalse', question:'分类可以帮助我们更快地找到东西。', answer:true, knowledgePoint:'生活分类' }
      ]
    },
    { unit:2, title:'第2单元·1-6的乘法',
      calc:[
        { type:'fill', question:'2×3 = ____', answer:'6', knowledgePoint:'2的乘法口诀' },
        { type:'fill', question:'4×5 = ____', answer:'20', knowledgePoint:'4的乘法口诀' },
        { type:'choice', question:'3×4 = ?', options:['12','7','1','8'], answer:'A', knowledgePoint:'3的乘法口诀' },
        { type:'fill', question:'2+2+2+2+2 = 2×____', answer:'5', knowledgePoint:'乘法意义' },
        { type:'fill', question:'5×6 = ____', answer:'30', knowledgePoint:'5的乘法口诀' }
      ],
      logic:[
        { type:'choice', question:'找规律：2,4,6,8,__，下一个是？', options:['10','9','7','12'], answer:'A', knowledgePoint:'找规律' },
        { type:'truefalse', question:'3×4 和 4×3 的结果相同。', answer:true, knowledgePoint:'乘法规律' },
        { type:'choice', question:'找规律：5,10,15,__，下一个是？', options:['20','16','25','10'], answer:'A', knowledgePoint:'找规律' },
        { type:'fill', question:'3×___= 12', answer:'4', knowledgePoint:'乘法推理' }
      ],
      shape:[
        { type:'fill', figure: SVG.circles3, question:'看图，每组有3个圆，一共3组，用乘法算：3×3=____', answer:'9', knowledgePoint:'图形与乘法' },
        { type:'fill', figure: SVG.squares3, question:'看图，每组有2个正方形，一共3组，用乘法算：2×3=____', answer:'6', knowledgePoint:'图形与乘法' },
        { type:'choice', figure: SVG.triangles2, question:'看图，2个三角形一共有几条边？', options:['6条','3条','2条','4条'], answer:'A', knowledgePoint:'图形计算' },
        { type:'fill', figure: SVG.circles4, question:'看图，4个圆形排成一排，每个圆形有1个圆心，一共几个圆心？', answer:'4', knowledgePoint:'图形与乘法' }
      ],
      fun:[
        { type:'fill', question:'三五____（填乘法口诀）', answer:'十五', knowledgePoint:'乘法口诀' },
        { type:'choice', question:'一只手有5根手指，两只手有几根？', options:['10','5','15','20'], answer:'A', knowledgePoint:'生活乘法' },
        { type:'fill', question:'一双筷子有2根，3双筷子有____根。', answer:'6', knowledgePoint:'生活乘法' },
        { type:'choice', question:'一只兔子有4条腿，3只兔子有几条腿？', options:['12条','7条','4条','8条'], answer:'A', knowledgePoint:'生活乘法' }
      ]
    },
    { unit:3, title:'第3单元·1-6的除法',
      calc:[
        { type:'fill', question:'6÷2 = ____', answer:'3', knowledgePoint:'除法计算' },
        { type:'choice', question:'12÷4 = ?', options:['3','4','8','16'], answer:'A', knowledgePoint:'除法计算' },
        { type:'fill', question:'15÷5 = ____', answer:'3', knowledgePoint:'除法计算' },
        { type:'fill', question:'20÷4 = ____', answer:'5', knowledgePoint:'除法计算' },
        { type:'fill', question:'18÷6 = ____', answer:'3', knowledgePoint:'除法计算' }
      ],
      logic:[
        { type:'truefalse', question:'把8个苹果平均分给4个人，每人分2个。', answer:true, knowledgePoint:'平均分' },
        { type:'fill', question:'6÷____ = 2', answer:'3', knowledgePoint:'除法推理' },
        { type:'truefalse', question:'12÷3和12÷4的结果不同。', answer:true, knowledgePoint:'除法推理' },
        { type:'choice', question:'哪个算式的结果最大？', options:['12÷2','12÷3','12÷4','12÷6'], answer:'A', knowledgePoint:'除法比较' }
      ],
      shape:[
        { type:'fill', figure: SVG.circles4, question:'看图，4个圆形平均分成2份，每份____个。', answer:'2', knowledgePoint:'图形分配' },
        { type:'choice', figure: SVG.circle2, question:'看图，一个圆形被平均分成了几份？', options:['2份','3份','4份','1份'], answer:'A', knowledgePoint:'图形分割' },
        { type:'fill', figure: SVG.circles3, question:'看图，3个圆形平均分成3份，每份____个。', answer:'1', knowledgePoint:'图形分配' },
        { type:'choice', figure: SVG.square4, question:'看图，正方形被分成了几个小正方形？', options:['4个','2个','3个','1个'], answer:'A', knowledgePoint:'图形分割' }
      ],
      fun:[
        { type:'fill', question:'10颗糖平均分给2个小朋友，每人____颗。', answer:'5', knowledgePoint:'生活除法' },
        { type:'choice', question:'6个气球平均分给3个小朋友，每人几个？', options:['2个','3个','6个','1个'], answer:'A', knowledgePoint:'生活除法' },
        { type:'fill', question:'12支铅笔平均分给4个同学，每人____支。', answer:'3', knowledgePoint:'生活除法' },
        { type:'truefalse', question:'把一袋糖平均分给几个人，就是除法。', answer:true, knowledgePoint:'生活除法' }
      ]
    },
    { unit:4, title:'第4单元·厘米与米',
      calc:[
        { type:'fill', question:'50厘米 + 50厘米 = ____米', answer:'1', knowledgePoint:'单位换算' },
        { type:'fill', question:'1米 = ____厘米', answer:'100', knowledgePoint:'单位换算' },
        { type:'fill', question:'30厘米 + 40厘米 = ____厘米', answer:'70', knowledgePoint:'长度计算' },
        { type:'choice', question:'2米 - 50厘米 = ?', options:['150厘米','150米','50厘米','250厘米'], answer:'A', knowledgePoint:'长度计算' },
        { type:'fill', question:'1米 - 30厘米 = ____厘米', answer:'70', knowledgePoint:'长度计算' }
      ],
      logic:[
        { type:'truefalse', question:'量操场的长度用厘米作单位比较合适。', answer:false, knowledgePoint:'单位选择' },
        { type:'choice', question:'下面哪个更长？', options:['1米','50厘米','80厘米','90厘米'], answer:'A', knowledgePoint:'长度比较' },
        { type:'truefalse', question:'1米比99厘米长。', answer:true, knowledgePoint:'长度比较' },
        { type:'choice', question:'量铅笔长度用什么单位？', options:['厘米','米','分米','千克'], answer:'A', knowledgePoint:'单位选择' }
      ],
      shape:[
        { type:'fill', figure: SVG.rect, question:'看图，这个长方形的长大约是10厘米，宽大约是5厘米，周长大约____厘米。（提示：长+宽+长+宽）', answer:'30', knowledgePoint:'图形测量' },
        { type:'choice', figure: SVG.square, question:'看图，这个正方形的边长大约是？', options:['8厘米','8米','8毫米','8分米'], answer:'A', knowledgePoint:'估测长度' },
        { type:'fill', figure: SVG.rect, question:'看图，长方形的宽大约是____厘米。', answer:'5', knowledgePoint:'图形测量' },
        { type:'choice', figure: SVG.rectShape, question:'看图，这个图形是？', options:['长方形','正方形','三角形','圆形'], answer:'A', knowledgePoint:'图形识别' }
      ],
      fun:[
        { type:'fill', question:'铅笔大约长15____。（填单位）', answer:'厘米', knowledgePoint:'生活测量' },
        { type:'choice', question:'课桌的高度大约是？', options:['70厘米','7米','7厘米','70米'], answer:'A', knowledgePoint:'生活估测' },
        { type:'fill', question:'教室的门大约高2____。（填单位）', answer:'米', knowledgePoint:'生活估测' },
        { type:'truefalse', question:'用拃（zhǎ）量一量课桌的长大约是4拃。', answer:true, knowledgePoint:'生活测量' }
      ]
    },
    { unit:5, title:'第5单元·7-9的乘除法',
      calc:[
        { type:'fill', question:'7×8 = ____', answer:'56', knowledgePoint:'7的口诀' },
        { type:'choice', question:'9×9 = ?', options:['81','72','18','99'], answer:'A', knowledgePoint:'9的口诀' },
        { type:'fill', question:'63÷9 = ____', answer:'7', knowledgePoint:'除法计算' },
        { type:'fill', question:'七九____（填口诀）', answer:'六十三', knowledgePoint:'7的口诀' },
        { type:'fill', question:'8×9 = ____', answer:'72', knowledgePoint:'8的口诀' }
      ],
      logic:[
        { type:'truefalse', question:'8×7 和 7×8 的结果相同。', answer:true, knowledgePoint:'乘法规律' },
        { type:'choice', question:'找规律：7,14,21,28,__，下一个是？', options:['35','29','30','36'], answer:'A', knowledgePoint:'找规律' },
        { type:'fill', question:'___×9 = 81', answer:'9', knowledgePoint:'乘法推理' },
        { type:'choice', question:'下面哪个算式结果最大？', options:['9×9','8×8','7×7','6×6'], answer:'A', knowledgePoint:'乘法比较' }
      ],
      shape:[
        { type:'fill', figure: SVG.squares3, question:'看图，3个正方形一共有____条边。', answer:'12', knowledgePoint:'图形计算' },
        { type:'choice', figure: SVG.squareDiag, question:'看图，正方形画了一条对角线，分成了几个三角形？', options:['2个','3个','4个','1个'], answer:'A', knowledgePoint:'图形分割' },
        { type:'fill', figure: SVG.circles4, question:'看图，4个圆排成1行，行宽=4个圆，如果排2行每行2个，还剩____个。', answer:'0', knowledgePoint:'图形与除法' },
        { type:'choice', figure: SVG.mixed5, question:'看图，图中一共有几个图形？', options:['5个','4个','3个','6个'], answer:'A', knowledgePoint:'图形计数' }
      ],
      fun:[
        { type:'choice', question:'一周有7天，8周有多少天？', options:['56天','48天','63天','64天'], answer:'A', knowledgePoint:'生活乘法' },
        { type:'fill', question:'9个小朋友每人分2块糖，一共需要____块。', answer:'18', knowledgePoint:'生活乘法' },
        { type:'fill', question:'72颗糖平均分给9个小朋友，每人____颗。', answer:'8', knowledgePoint:'生活除法' },
        { type:'choice', question:'一盒有8个鸡蛋，7盒有多少个？', options:['56个','15个','1个','64个'], answer:'A', knowledgePoint:'生活乘法' }
      ]
    },
    { unit:6, title:'第6单元·复习与关联',
      calc:[
        { type:'fill', question:'36÷6 + 5 = ____', answer:'11', knowledgePoint:'综合计算' },
        { type:'choice', question:'下列结果最大的是？', options:['9×9','8×8','7×7','6×6'], answer:'A', knowledgePoint:'综合计算' },
        { type:'fill', question:'2米 = ____厘米', answer:'200', knowledgePoint:'单位换算' },
        { type:'fill', question:'4×5 + 3 = ____', answer:'23', knowledgePoint:'综合计算' }
      ],
      logic:[
        { type:'truefalse', question:'把12个球平均分成3份，每份4个。', answer:true, knowledgePoint:'综合推理' },
        { type:'choice', question:'一个数乘5得45，这个数是？', options:['9','5','8','40'], answer:'A', knowledgePoint:'逆向推理' },
        { type:'fill', question:'找规律：3,6,9,12,____', answer:'15', knowledgePoint:'找规律' },
        { type:'truefalse', question:'24÷6和4×1的结果相同。', answer:true, knowledgePoint:'综合推理' }
      ],
      shape:[
        { type:'fill', figure: SVG.mixed5, question:'看图，图中圆形有____个。', answer:'2', knowledgePoint:'图形分类计数' },
        { type:'choice', figure: SVG.square4, question:'看图，大正方形里有几个小正方形？', options:['4个','2个','3个','1个'], answer:'A', knowledgePoint:'图形分割' },
        { type:'choice', figure: SVG.rectTri, question:'看图，长方形被对角线分成了什么图形？', options:['三角形','正方形','圆形','长方形'], answer:'A', knowledgePoint:'图形分割' },
        { type:'fill', figure: SVG.pattern1, question:'看图找规律，问号处应该填____。（填：圆形/三角形/正方形）', answer:['圆形','圆'], knowledgePoint:'图形规律' }
      ],
      fun:[
        { type:'fill', question:'小明买了3支铅笔，每支2元，一共花了____元。', answer:'6', knowledgePoint:'生活应用' },
        { type:'choice', question:'一箱有9个苹果，7箱有多少个？', options:['63个','16个','2个','70个'], answer:'A', knowledgePoint:'生活应用' },
        { type:'fill', question:'一支铅笔2元，一支钢笔9元，一共____元。', answer:'11', knowledgePoint:'生活应用' },
        { type:'truefalse', question:'买4本书每本5元，需要20元。', answer:true, knowledgePoint:'生活应用' }
      ]
    }
  ];

  /* ========================================================
   *  工具方法
   * ====================================================== */

  function getUnitData(subject, unitNum) {
    var list = subject === 'chinese' ? CHINESE_UNITS : MATH_UNITS;
    return list[unitNum - 1] || list[0];
  }

  function getTotalUnits(subject) {
    return subject === 'chinese' ? CHINESE_UNITS.length : MATH_UNITS.length;
  }

  /* ========================================================
   *  按课推进：生成课表（一课一课推进，不按单元）
   * ====================================================== */
  var _lessonCache = {};

  function getLessonList(subject) {
    if (_lessonCache[subject]) return _lessonCache[subject];
    var units = subject === 'chinese' ? CHINESE_UNITS : MATH_UNITS;
    var list = [];
    var idx = 0;
    units.forEach(function(u) {
      if (u.lessons && u.lessons.length > 0) {
        u.lessons.forEach(function(lessonTitle) {
          list.push({
            globalIndex: idx,
            unit: u.unit,
            unitTitle: u.title,
            lessonIndex: list.length,
            title: lessonTitle
          });
          idx++;
        });
      } else {
        // 数学无课名，按单元拆成2课
        var parts = ['（一）', '（二）'];
        parts.forEach(function(p) {
          list.push({
            globalIndex: idx,
            unit: u.unit,
            unitTitle: u.title,
            lessonIndex: list.length,
            title: u.title.replace(/^第\d+单元·/, '') + p
          });
          idx++;
        });
      }
    });
    _lessonCache[subject] = list;
    return list;
  }

  function getCurrentLesson(subject) {
    var settings = Storage.getSettings();
    var lessonIdx = settings[subject + 'Lesson'] || 0;
    var list = getLessonList(subject);
    if (lessonIdx >= list.length) lessonIdx = list.length - 1;
    return list[lessonIdx] || list[0];
  }

  function getTotalLessons(subject) {
    return getLessonList(subject).length;
  }

  function advanceLesson(subject) {
    var settings = Storage.getSettings();
    var current = settings[subject + 'Lesson'] || 0;
    var max = getTotalLessons(subject) - 1;
    var next = Math.min(current + 1, max);
    var update = {};
    update[subject + 'Lesson'] = next;
    // 同步更新unit
    var lesson = getLessonList(subject)[next];
    if (lesson) update[subject + 'Unit'] = lesson.unit;
    Storage.updateSettings(update);
    return next !== current;
  }

  /** 智能去重选题：跳过已掌握知识点 */
  function pickQuestions(pool, count, subject, unit) {
    if (!pool || pool.length === 0) return [];
    var notMastered = [], mastered = [];
    pool.forEach(function(q) {
      q.subject = q.subject || subject;
      if (CONFIG.MASTERY_ENABLED && Storage.isMastered(subject, unit, q.knowledgePoint)) {
        mastered.push(q);
      } else {
        notMastered.push(q);
      }
    });
    var candidates = notMastered.length >= count ? notMastered.slice()
      : notMastered.concat(mastered.slice(0, count - notMastered.length));
    var arr = candidates.slice(), result = [];
    for (var i = 0; i < count && arr.length > 0; i++) {
      var idx = Math.floor(Math.random() * arr.length);
      result.push(arr.splice(idx, 1)[0]);
    }
    return result;
  }

  /* ========================================================
   *  每日任务生成（按课推进，每科8题≈15分钟）
   * ====================================================== */
  function generateTodayTasks() {
    var settings = Storage.getSettings();
    var today = DateUtils.today();
    var existing = Storage.getTask(today);
    if (existing && existing.chinese && existing.math) return existing;

    // 获取当前课信息
    var cLesson = getCurrentLesson('chinese');
    var mLesson = getCurrentLesson('math');

    // 语文：基础3题 + 阅读3题 + 写话2题 = 8题
    var cUnit = getUnitData('chinese', cLesson.unit);
    var cQuestions = [];
    cQuestions = cQuestions.concat(pickQuestions(cUnit.basic || [], 3, 'chinese', cLesson.unit));
    cQuestions = cQuestions.concat(pickQuestions(cUnit.reading || [], 3, 'chinese', cLesson.unit));
    cQuestions = cQuestions.concat(pickQuestions(cUnit.writing || [], 2, 'chinese', cLesson.unit));
    cQuestions.forEach(function(q) {
      if (!q.category) { q.category = 'basic'; q.categoryName = '课本基础'; q.categoryIcon = '📚'; }
    });

    // 数学：计算2题 + 逻辑2题 + 图形2题 + 趣味2题 = 8题
    var mUnit = getUnitData('math', mLesson.unit);
    var mQuestions = [];
    mQuestions = mQuestions.concat(pickQuestions(mUnit.calc || [], 2, 'math', mLesson.unit));
    mQuestions = mQuestions.concat(pickQuestions(mUnit.logic || [], 2, 'math', mLesson.unit));
    mQuestions = mQuestions.concat(pickQuestions(mUnit.shape || [], 2, 'math', mLesson.unit));
    mQuestions = mQuestions.concat(pickQuestions(mUnit.fun || [], 2, 'math', mLesson.unit));
    mQuestions.forEach(function(q) {
      if (!q.category) { q.category = 'calc'; q.categoryName = '计算基础'; q.categoryIcon = '🔢'; }
    });

    var task = {
      date: today,
      chinese: { subject:'chinese', title:cLesson.title, unit:cLesson.unit, lesson:cLesson.globalIndex,
        mode:null, questions:cQuestions, completed:false, allCorrect:false,
        correctCount:0, wrongCount:0, wrongList:[], submittedAt:null, photoData:null },
      math: { subject:'math', title:mLesson.title, unit:mLesson.unit, lesson:mLesson.globalIndex,
        mode:null, questions:mQuestions, completed:false, allCorrect:false,
        correctCount:0, wrongCount:0, wrongList:[], submittedAt:null, photoData:null }
    };
    Storage.setTask(today, task);
    return task;
  }

  /* ========================================================
   *  提交练习
   * ====================================================== */
  function submitOnlineTask(subject, answers) {
    var today = DateUtils.today();
    var task = Storage.getTask(today);
    if (!task || !task[subject]) return null;
    var subTask = task[subject];
    var questions = subTask.questions;
    var result = AI.gradeAll(questions, answers, subject, subTask.unit);
    subTask.completed = true; subTask.allCorrect = result.allCorrect;
    subTask.correctCount = result.correctCount; subTask.wrongCount = result.wrongCount;
    subTask.wrongList = result.wrongList; subTask.submittedAt = new Date().toISOString();
    subTask.mode = 'online';
    result.wrongList.forEach(function(w) {
      Storage.addError({ date:today, subject:subject, unit:subTask.unit, source:'daily',
        question:w.question.question, questionType:w.question.type,
        studentAnswer:String(w.studentAnswer), correctAnswer:String(w.correctAnswer),
        knowledgePoint:w.knowledgePoint, explanation:w.explanation, reviewStatus:'pending' });
    });
    var water = CONFIG.WATER_PER_SUBJECT;
    if (result.allCorrect) water += CONFIG.WATER_BONUS_ALL_CORRECT;
    Storage.addWater(water, (subject === 'chinese' ? '语文' : '数学') + '任务完成');
    if (subject === 'math') checkAndRestoreHP(task);
    Storage.setTask(today, task);
    Storage.addHistory({ type:'task_complete', subject:subject,
      correct:result.correctCount, wrong:result.wrongCount, waterEarned:water });
    return { result:result, waterEarned:water };
  }

  function submitOfflineTask(subject, photoDataUrl) {
    var today = DateUtils.today();
    var task = Storage.getTask(today);
    if (!task || !task[subject]) return null;
    var subTask = task[subject];
    var result = AI.gradePhoto(subject, subTask.unit);
    subTask.completed = true; subTask.allCorrect = result.allCorrect;
    subTask.correctCount = result.correctCount; subTask.wrongCount = result.wrongCount;
    subTask.wrongList = result.wrongList; subTask.submittedAt = new Date().toISOString();
    subTask.mode = 'offline'; subTask.photoData = photoDataUrl;
    subTask.masteredPoints = result.masteredPoints;
    result.wrongList.forEach(function(w) {
      Storage.addError({ date:today, subject:subject, unit:subTask.unit, source:'daily',
        question:w.question.question, questionType:'photo',
        studentAnswer:w.studentAnswer, correctAnswer:w.correctAnswer,
        knowledgePoint:w.knowledgePoint, explanation:w.explanation, reviewStatus:'pending' });
    });
    var water = CONFIG.WATER_PER_SUBJECT;
    Storage.addWater(water, (subject === 'chinese' ? '语文' : '数学') + '任务完成(拍照)');
    if (subject === 'math') checkAndRestoreHP(task);
    Storage.setTask(today, task);
    Storage.addHistory({ type:'task_complete', subject:subject,
      correct:result.correctCount, wrong:result.wrongCount, waterEarned:water, mode:'offline' });
    return { result:result, waterEarned:water };
  }

  /**
   * 异步拍照提交 — 优先使用真实OCR+AI接口，未配置时降级为模拟
   */
  async function submitOfflineTaskAsync(subject, photoDataUrl) {
    var today = DateUtils.today();
    var task = Storage.getTask(today);
    if (!task || !task[subject]) return null;
    var subTask = task[subject];
    var lesson = getCurrentLesson(subject);

    // 提取base64（去掉data:image前缀）
    var imageBase64 = photoDataUrl;
    if (imageBase64 && imageBase64.indexOf(',') > -1) {
      imageBase64 = imageBase64.split(',')[1];
    }

    // 调用异步批改（真实API或模拟）
    var result = await AI.gradePhotoAsync(subject, subTask.unit, imageBase64, lesson);

    subTask.completed = true; subTask.allCorrect = result.allCorrect;
    subTask.correctCount = result.correctCount; subTask.wrongCount = result.wrongCount;
    subTask.wrongList = result.wrongList; subTask.submittedAt = new Date().toISOString();
    subTask.mode = 'offline'; subTask.photoData = photoDataUrl;
    subTask.masteredPoints = result.masteredPoints || [];
    subTask.aiSummary = result.summary || '';
    subTask.ocrText = result.ocrText || '';
    subTask.isSimulated = result.isSimulated !== false;

    result.wrongList.forEach(function(w) {
      Storage.addError({ date:today, subject:subject, unit:subTask.unit, source:'daily',
        question:w.question.question, questionType:'photo',
        studentAnswer:w.studentAnswer, correctAnswer:w.correctAnswer,
        knowledgePoint:w.knowledgePoint, explanation:w.explanation, reviewStatus:'pending' });
    });
    var water = CONFIG.WATER_PER_SUBJECT;
    Storage.addWater(water, (subject === 'chinese' ? '语文' : '数学') + '任务完成(拍照)');
    if (subject === 'math') checkAndRestoreHP(task);
    Storage.setTask(today, task);
    Storage.addHistory({ type:'task_complete', subject:subject,
      correct:result.correctCount, wrong:result.wrongCount, waterEarned:water, mode:'offline' });
    return { result:result, waterEarned:water };
  }

  function checkAndRestoreHP(task) {
    var plant = Storage.getPlant();
    if (!plant) return;
    if (task.chinese.completed && task.math.completed && plant.health < CONFIG.HP_MAX) {
      plant.health = CONFIG.HP_MAX;
      Storage.setPlant(plant);
      Storage.addHistory({ type:'hp_restore', amount:CONFIG.HP_MAX, reason:'全部任务完成' });
    }
  }

  function getTodayStatus() {
    var today = DateUtils.today();
    var task = Storage.getTask(today);
    if (!task) task = generateTodayTasks();
    return task;
  }

  /* ===== 周末复习 ===== */
  function checkWeeklyReview() {
    var today = DateUtils.today();
    if (!DateUtils.isSaturday(today)) return null;
    var weekKey = DateUtils.getWeekKey(today);
    var existing = Storage.getWeekly(weekKey);
    if (existing && existing.generated) return existing;
    var weekStart = DateUtils.getWeekStart(today);
    var weekErrors = Storage.getWeekErrors(weekStart);
    var reviewData = { weekKey:weekKey, generatedDate:today, generated:true, completed:false,
      errorCount:weekErrors.length, errors:weekErrors, reviewQuestions:generateReviewQuestions(weekErrors) };
    Storage.setWeekly(weekKey, reviewData);
    return reviewData;
  }

  function generateReviewQuestions(errors) {
    if (errors.length === 0) return [];
    var kpMap = {};
    errors.forEach(function(e) {
      var kp = e.knowledgePoint || '其他';
      if (!kpMap[kp]) kpMap[kp] = { count:0, errors:[] };
      kpMap[kp].count++; kpMap[kp].errors.push(e);
    });
    var sorted = Object.keys(kpMap).sort(function(a,b) { return kpMap[b].count - kpMap[a].count; });
    var reviewQs = [];
    sorted.slice(0, 3).forEach(function(kp) {
      var err = kpMap[kp].errors[0];
      reviewQs.push({ knowledgePoint:kp, question:err.question, correctAnswer:err.correctAnswer, explanation:err.explanation });
    });
    return reviewQs;
  }

  /* ===== 一课一测（替代单元测试）===== */
  function checkLessonTest() {
    var s = Storage.getSettings();
    return {
      chinese: shouldPromptLessonTest('chinese', s.chineseLesson || 0),
      math: shouldPromptLessonTest('math', s.mathLesson || 0)
    };
  }

  function shouldPromptLessonTest(subject, lessonIdx) {
    var all = Storage.getAllTasks(), count = 0, date = DateUtils.today();
    for (var i = 0; i < 7; i++) {
      var d = DateUtils.addDays(date, -i);
      var t = all[d];
      if (t && t[subject] && t[subject].completed && (t[subject].lesson === lessonIdx || t[subject].unit === Storage.getSettings()[subject + 'Unit'])) count++;
    }
    return count >= CONFIG.LESSON_TEST_TRIGGER;
  }

  function submitLessonTest(subject, lessonIdx, photoDataUrl) {
    var lesson = getLessonList(subject)[lessonIdx] || getCurrentLesson(subject);
    var unit = lesson ? lesson.unit : 1;
    var result = AI.gradeUnitTest(subject, unit);
    result.wrongList.forEach(function(w) {
      Storage.addError({ date:DateUtils.today(), subject:subject, unit:unit, lesson:lessonIdx, source:'lesson_test',
        question:w.question.question, questionType:'lesson_test',
        studentAnswer:w.studentAnswer, correctAnswer:w.correctAnswer,
        knowledgePoint:w.knowledgePoint, explanation:w.explanation, reviewStatus:'pending' });
    });
    var water = 0;
    if (result.passed) {
      water = CONFIG.WATER_UNIT_TEST_PASS;
      Storage.addWater(water, (subject === 'chinese' ? '语文' : '数学') + '《' + (lesson ? lesson.title : '') + '》一课一测达标');
      // 达标后自动进入下一课
      advanceLesson(subject);
    }
    Storage.addHistory({ type:'lesson_test', subject:subject, unit:unit, lesson:lessonIdx,
      lessonTitle:(lesson ? lesson.title : ''), score:result.score, passed:result.passed, waterEarned:water });
    return { result:result, waterEarned:water, lessonTitle:(lesson ? lesson.title : '') };
  }

  function completeWeeklyReview() {
    var today = DateUtils.today();
    var weekKey = DateUtils.getWeekKey(today);
    var weekly = Storage.getWeekly(weekKey);
    if (weekly) { weekly.completed = true; weekly.completedDate = today; Storage.setWeekly(weekKey, weekly); }
    var water = CONFIG.WATER_WEEKLY_REVIEW;
    Storage.addWater(water, '完成周末错题复习');
    Storage.addHistory({ type:'weekly_review', waterEarned:water });
    return { waterEarned:water };
  }

  return {
    CHINESE_UNITS:CHINESE_UNITS, MATH_UNITS:MATH_UNITS,
    getUnitData:getUnitData, getTotalUnits:getTotalUnits,
    getLessonList:getLessonList, getCurrentLesson:getCurrentLesson,
    getTotalLessons:getTotalLessons, advanceLesson:advanceLesson,
    generateTodayTasks:generateTodayTasks, getTodayStatus:getTodayStatus,
    submitOnlineTask:submitOnlineTask, submitOfflineTask:submitOfflineTask,
    submitOfflineTaskAsync:submitOfflineTaskAsync,
    checkWeeklyReview:checkWeeklyReview, checkLessonTest:checkLessonTest,
    submitLessonTest:submitLessonTest, completeWeeklyReview:completeWeeklyReview
  };
})();
