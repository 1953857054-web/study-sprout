/**
 * ============================================================
 *  学芽 App — 主入口
 *  初始化、跨天结算、任务生成、页面路由
 * ============================================================
 */
(function () {

  /**
   * App 初始化
   * 在DOM加载完成后执行
   */
  function init() {
    console.log('🌱 学芽 App 启动中...');

    // 1. 跨天结算：检查上次活跃日期，如有未完成任务扣减HP
    var settleResult = Plant.settleCrossDay();
    if (settleResult && settleResult.totalHPLoss > 0) {
      console.log('跨天结算：HP-' + settleResult.totalHPLoss, settleResult);
      // 延迟提示，等页面渲染后
      setTimeout(function() {
        Pages.render(); // 先渲染
        // 显示跨天结算通知
        var msg = '💔 跨天结算：你有' + settleResult.daysSettled + '天未完成任务，生命值-' + settleResult.totalHPLoss;
        var t = document.createElement('div');
        t.className = 'toast warning';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 4000);
      }, 300);
    }

    // 2. 生成今日任务
    var today = DateUtils.today();
    var task = Tasks.getTodayStatus();
    console.log('今日任务已生成:', today, task);

    // 3. 检查周末复习
    var weekly = Tasks.checkWeeklyReview();
    if (weekly && weekly.errorCount > 0 && !weekly.completed) {
      console.log('本周错题复习任务:', weekly.errorCount + '道');
    }

    // 4. 更新最后活跃日期
    Storage.setLastDate(today);

    // 5. 渲染首页
    Pages.render();

    // 6. 如果是周末且有错题，提示
    if (DateUtils.isSaturday(today)) {
      var weekErrors = ErrorBook.getThisWeekErrors();
      if (weekErrors.length > 0) {
        setTimeout(function() {
          var t = document.createElement('div');
          t.className = 'toast warning';
          t.textContent = '📒 本周有' + weekErrors.length + '道错题，周末来复习吧！';
          document.body.appendChild(t);
          setTimeout(function() { t.remove(); }, 3500);
        }, 1000);
      }
    }

    console.log('🌱 学芽 App 启动完成！');
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 离线时提示
  window.addEventListener('offline', function() {
    var t = document.createElement('div');
    t.className = 'toast warning';
    t.textContent = '网络断开了，但数据不会丢失，可继续学习～';
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
  });

  // 页面可见性变化（从后台切回前台时触发跨天结算）
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      var lastDate = Storage.getLastDate();
      var today = DateUtils.today();
      if (lastDate && lastDate !== today) {
        // 跨天了，重新结算
        Plant.settleCrossDay();
        Tasks.generateTodayTasks();
        Storage.setLastDate(today);
        Pages.render();
      }
    }
  });

})();
