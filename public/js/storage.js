/**
 * ============================================================
 *  学芽 App — 数据存储层 (localStorage)
 *  统一管理所有数据的读取和写入
 * ============================================================
 */
var Storage = (function () {

  /* localStorage key */
  var K = {
    SETTINGS:  'sprout_settings',
    TASKS:     'sprout_tasks',
    ERRORS:    'sprout_errors',
    PLANT:     'sprout_plant',
    WATER:     'sprout_water',
    HISTORY:   'sprout_history',
    WEEKLY:    'sprout_weekly',
    LAST_DATE: 'sprout_last_date',
    MASTERY:   'sprout_mastery'  // 已掌握知识点
  };

  /* 通用读 */
  function get(key, def) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : def;
    } catch (e) { return def; }
  }
  /* 通用写 */
  function set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  /* ===== 设置 ===== */
  function getSettings() {
    return get(K.SETTINGS, {
      childName: '同学', parentName: '家长',
      chineseLesson: 0, mathLesson: 0,
      chineseUnit: 1, mathUnit: 1,
      chineseSemester: '上册', mathSemester: '上册',
      selectedFruit: null, notifications: true
    });
  }
  function updateSettings(partial) {
    var s = getSettings();
    for (var k in partial) if (partial.hasOwnProperty(k)) s[k] = partial[k];
    set(K.SETTINGS, s);
    return s;
  }

  /* ===== 每日任务 ===== */
  function getTask(dateStr) { return (get(K.TASKS, {}))[dateStr] || null; }
  function getAllTasks() { return get(K.TASKS, {}); }
  function setTask(dateStr, data) {
    var all = get(K.TASKS, {});
    all[dateStr] = data;
    set(K.TASKS, all);
  }

  /* ===== 错题本 ===== */
  function getErrors() { return get(K.ERRORS, []); }
  function addError(err) {
    var list = getErrors();
    err.id = 'err_' + Date.now() + '_' + Math.floor(Math.random()*1000);
    err.createdAt = new Date().toISOString();
    list.push(err);
    set(K.ERRORS, list);
    return err;
  }
  function updateErrorStatus(id, status) {
    var list = getErrors();
    list.forEach(function(e) { if (e.id === id) { e.reviewStatus = status; e.reviewedAt = new Date().toISOString(); } });
    set(K.ERRORS, list);
  }
  function filterErrors(f) {
    return getErrors().filter(function(e) {
      if (f.subject && e.subject !== f.subject) return false;
      if (f.unit && e.unit !== f.unit) return false;
      if (f.dateFrom && e.date < f.dateFrom) return false;
      if (f.dateTo && e.date > f.dateTo) return false;
      return true;
    });
  }
  function getWeekErrors(weekStart) {
    return getErrors().filter(function(e) { return e.date >= weekStart; });
  }

  /* ===== 植物 ===== */
  function getPlant() { return get(K.PLANT, null); }
  function setPlant(p) { set(K.PLANT, p); return p; }

  /* ===== 水滴 ===== */
  function getWater() { return get(K.WATER, { balance: 0, totalEarned: 0, totalSpent: 0 }); }
  function addWater(amount, reason) {
    var w = getWater();
    w.balance += amount; w.totalEarned += amount;
    set(K.WATER, w);
    addHistory({ type: 'water_earn', amount: amount, reason: reason });
    return w;
  }
  function spendWater(amount, reason) {
    var w = getWater();
    if (w.balance < amount) return null;
    w.balance -= amount; w.totalSpent += amount;
    set(K.WATER, w);
    addHistory({ type: 'water_spend', amount: amount, reason: reason });
    return w;
  }

  /* ===== 历史记录 ===== */
  function getHistory() { return get(K.HISTORY, []); }
  function addHistory(rec) {
    var list = getHistory();
    rec.date = rec.date || formatDate(new Date());
    rec.timestamp = new Date().toISOString();
    list.push(rec);
    if (list.length > 500) list = list.slice(-500);
    set(K.HISTORY, list);
  }

  /* ===== 周末复习 ===== */
  function getWeekly(weekKey) { return (get(K.WEEKLY, {}))[weekKey] || null; }
  function setWeekly(weekKey, data) {
    var all = get(K.WEEKLY, {});
    all[weekKey] = data;
    set(K.WEEKLY, all);
  }
  function getAllWeekly() { return get(K.WEEKLY, {}); }

  /* ===== 跨天结算 ===== */
  function getLastDate() { return get(K.LAST_DATE, null); }
  function setLastDate(d) { set(K.LAST_DATE, d); }

  /* ===== 已掌握知识点（智能去重核心）===== */
  function getMastery() {
    // 格式: { "chinese_1_识字写字": { count: 2, mastered: true, dates: [...] }, ... }
    return get(K.MASTERY, {});
  }
  function recordMastery(subject, unit, knowledgePoint, correct) {
    var all = getMastery();
    var key = subject + '_' + unit + '_' + knowledgePoint;
    if (!all[key]) all[key] = { count: 0, mastered: false, dates: [], subject: subject, unit: unit, kp: knowledgePoint };
    if (correct) all[key].count++;
    else all[key].count = 0; // 答错重置计数
    all[key].dates.push(DateUtils.today());
    // 达到阈值 = 已掌握
    if (all[key].count >= CONFIG.MASTERY_THRESHOLD) {
      all[key].mastered = true;
    }
    set(K.MASTERY, all);
    return all[key];
  }
  function isMastered(subject, unit, knowledgePoint) {
    var all = getMastery();
    var key = subject + '_' + unit + '_' + knowledgePoint;
    return all[key] && all[key].mastered;
  }
  function getMasteredList() {
    var all = getMastery();
    return Object.keys(all).filter(function(k) { return all[k].mastered; }).map(function(k) { return all[k]; });
  }

  /* ===== 工具 ===== */
  function formatDate(d) {
    return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2);
  }
  function getWeekKey(d) {
    var date = new Date(d.getTime());
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var w1 = new Date(date.getFullYear(), 0, 4);
    var wn = 1 + Math.round(((date - w1)/86400000 - 3 + (w1.getDay()+6)%7)/7);
    return date.getFullYear() + '-W' + ('0'+wn).slice(-2);
  }
  function clearAll() {
    Object.keys(K).forEach(function(k) { localStorage.removeItem(K[k]); });
  }

  return {
    getSettings: getSettings, updateSettings: updateSettings,
    getTask: getTask, getAllTasks: getAllTasks, setTask: setTask,
    getErrors: getErrors, addError: addError, updateErrorStatus: updateErrorStatus,
    filterErrors: filterErrors, getWeekErrors: getWeekErrors,
    getPlant: getPlant, setPlant: setPlant,
    getWater: getWater, addWater: addWater, spendWater: spendWater,
    getHistory: getHistory, addHistory: addHistory,
    getWeekly: getWeekly, setWeekly: setWeekly, getAllWeekly: getAllWeekly,
    getLastDate: getLastDate, setLastDate: setLastDate,
    getMastery: getMastery, recordMastery: recordMastery,
    isMastered: isMastered, getMasteredList: getMasteredList,
    formatDate: formatDate, getWeekKey: getWeekKey, clearAll: clearAll
  };
})();
