/**
 * ============================================================
 *  学芽 App — 日期工具
 *  处理周末识别、跨天结算、周计算等日期逻辑
 * ============================================================
 */
var DateUtils = (function () {

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  function formatDate(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }

  /**
   * 将 "YYYY-MM-DD" 字符串还原为 Date 对象
   */
  function parseDate(str) {
    var parts = str.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  /**
   * 获取今天的日期字符串
   */
  function today() {
    return formatDate(new Date());
  }

  /**
   * 获取当前是星期几 (0=周日, 1=周一, ..., 6=周六)
   */
  function dayOfWeek(dateStr) {
    var d = dateStr ? parseDate(dateStr) : new Date();
    return d.getDay();
  }

  /**
   * 是否是周末（周六或周日）
   */
  function isWeekend(dateStr) {
    var dow = dayOfWeek(dateStr);
    return dow === 0 || dow === 6;
  }

  /**
   * 是否是周六（触发周末错题汇总）
   */
  function isSaturday(dateStr) {
    return dayOfWeek(dateStr) === 6;
  }

  /**
   * 获取本周一日期字符串
   * 周一为一周的开始
   */
  function getWeekStart(dateStr) {
    var d = dateStr ? parseDate(dateStr) : new Date();
    var dow = d.getDay(); // 0=周日
    var diff = dow === 0 ? -6 : 1 - dow; // 周一为起点
    d.setDate(d.getDate() + diff);
    return formatDate(d);
  }

  /**
   * 获取ISO周数 key，如 "2026-W36"
   */
  function getWeekKey(dateStr) {
    var d = dateStr ? parseDate(dateStr) : new Date();
    return Storage.getWeekKey(d);
  }

  /**
   * 计算两个日期字符串之间相隔的天数
   * 返回正整数表示 date2 比 date1 晚几天
   */
  function daysBetween(date1Str, date2Str) {
    var d1 = parseDate(date1Str);
    var d2 = parseDate(date2Str);
    var diff = d2.getTime() - d1.getTime();
    return Math.floor(diff / 86400000); // 毫秒转天数
  }

  /**
   * 在某日期上加/减天数，返回新日期字符串
   */
  function addDays(dateStr, days) {
    var d = parseDate(dateStr);
    d.setDate(d.getDate() + days);
    return formatDate(d);
  }

  /**
   * 获取日期的中文星期几
   */
  function weekdayName(dateStr) {
    var names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return names[dayOfWeek(dateStr)];
  }

  /**
   * 获取友好的日期显示文字
   * 如 "9月2日 周二"
   */
  function friendlyDate(dateStr) {
    var d = dateStr ? parseDate(dateStr) : new Date();
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + weekdayName(dateStr);
  }

  return {
    formatDate: formatDate,
    parseDate: parseDate,
    today: today,
    dayOfWeek: dayOfWeek,
    isWeekend: isWeekend,
    isSaturday: isSaturday,
    getWeekStart: getWeekStart,
    getWeekKey: getWeekKey,
    daysBetween: daysBetween,
    addDays: addDays,
    weekdayName: weekdayName,
    friendlyDate: friendlyDate
  };
})();
