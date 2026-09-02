/**
 * ============================================================
 *  学芽 App — 错题本管理模块
 *  错题筛选、统计、复习状态管理
 * ============================================================
 */
var ErrorBook = (function () {

  /**
   * 获取全部错题
   */
  function getAll() {
    return Storage.getErrors();
  }

  /**
   * 按学科筛选错题
   */
  function getBySubject(subject) {
    return Storage.filterErrors({ subject: subject });
  }

  /**
   * 按单元筛选错题
   */
  function getByUnit(subject, unit) {
    return Storage.filterErrors({ subject: subject, unit: unit });
  }

  /**
   * 按日期范围筛选
   */
  function getByDateRange(dateFrom, dateTo) {
    return Storage.filterErrors({ dateFrom: dateFrom, dateTo: dateTo });
  }

  /**
   * 按来源筛选（日常练习 / 单元测试）
   */
  function getBySource(source) {
    return getAll().filter(function (e) {
      return e.source === source;
    });
  }

  /**
   * 获取待复习错题
   */
  function getPending() {
    return getAll().filter(function (e) {
      return e.reviewStatus === 'pending';
    });
  }

  /**
   * 获取已掌握错题
   */
  function getMastered() {
    return getAll().filter(function (e) {
      return e.reviewStatus === 'mastered';
    });
  }

  /**
   * 标记错题为已掌握
   */
  function markMastered(errorId) {
    Storage.updateErrorStatus(errorId, 'mastered');
  }

  /**
   * 标记错题为仍出错
   */
  function markStillWrong(errorId) {
    var list = getAll();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === errorId) {
        list[i].reviewStatus = 'still_wrong';
        list[i].errorCount = (list[i].errorCount || 1) + 1;
        break;
      }
    }
    // 直接写回
    localStorage.setItem('sprout_errors', JSON.stringify(list));
  }

  /**
   * 获取错题统计
   */
  function getStats() {
    var all = getAll();
    var stats = {
      total: all.length,
      pending: 0,
      mastered: 0,
      stillWrong: 0,
      bySubject: { chinese: 0, math: 0 },
      bySource: { daily: 0, unit_test: 0 },
      byUnit: {}
    };

    all.forEach(function (e) {
      // 按状态
      if (e.reviewStatus === 'pending') stats.pending++;
      else if (e.reviewStatus === 'mastered') stats.mastered++;
      else if (e.reviewStatus === 'still_wrong') stats.stillWrong++;

      // 按学科
      if (stats.bySubject[e.subject] !== undefined) {
        stats.bySubject[e.subject]++;
      }

      // 按来源
      if (stats.bySource[e.source] !== undefined) {
        stats.bySource[e.source]++;
      }

      // 按单元
      var key = e.subject + '_u' + e.unit;
      if (!stats.byUnit[key]) stats.byUnit[key] = 0;
      stats.byUnit[key]++;
    });

    return stats;
  }

  /**
   * 获取本周错题
   */
  function getThisWeekErrors() {
    var weekStart = DateUtils.getWeekStart(DateUtils.today());
    return Storage.getWeekErrors(weekStart);
  }

  /**
   * 获取高频错题知识点（出现2次以上）
   */
  function getHighFreqErrors() {
    var all = getAll();
    var kpMap = {};

    all.forEach(function (e) {
      var kp = e.knowledgePoint || '其他';
      if (!kpMap[kp]) kpMap[kp] = { count: 0, errors: [] };
      kpMap[kp].count++;
      kpMap[kp].errors.push(e);
    });

    // 返回出现≥2次的知识点
    var result = [];
    for (var kp in kpMap) {
      if (kpMap[kp].count >= 2) {
        result.push({
          knowledgePoint: kp,
          count: kpMap[kp].count,
          errors: kpMap[kp].errors
        });
      }
    }

    result.sort(function (a, b) { return b.count - a.count; });
    return result;
  }

  return {
    getAll: getAll,
    getBySubject: getBySubject,
    getByUnit: getByUnit,
    getByDateRange: getByDateRange,
    getBySource: getBySource,
    getPending: getPending,
    getMastered: getMastered,
    markMastered: markMastered,
    markStillWrong: markStillWrong,
    getStats: getStats,
    getThisWeekErrors: getThisWeekErrors,
    getHighFreqErrors: getHighFreqErrors
  };
})();
