/**
 * ============================================================
 *  学芽 App — 植物养成系统
 *  种植、浇水、成长阶段、生命值、跨天结算
 *
 *  核心数值（严格遵循需求）:
 *   - 每日灌溉消耗: 10滴水
 *   - 成熟周期: 45天
 *   - 初始生命值: 100
 *   - 每项任务未完成: 生命值-5
 * ============================================================
 */
var Plant = (function () {

  /**
   * 种植水果种子
   * @param {String} fruitId 水果ID（如 'strawberry'）
   */
  function plantSeed(fruitId) {
    var seed = CONFIG.FRUIT_SEEDS.find(function (f) {
      return f.id === fruitId;
    });
    if (!seed) return null;

    var today = DateUtils.today();
    var plant = {
      fruitId: fruitId,
      fruitName: seed.name,
      emoji: seed.emoji,
      plantedDate: today,
      growthDays: 0,            // 已生长天数（浇灌天数）
      health: CONFIG.PLANT_INITIAL_HP,  // 初始生命值100
      matured: false,           // 是否已成熟
      wateredDates: [],          // 已浇灌日期记录
      lastSettleDate: today,     // 上次结算日期
      created: new Date().toISOString()
    };

    Storage.setPlant(plant);
    Storage.updateSettings({ selectedFruit: fruitId });
    Storage.addHistory({ type: 'plant_seed', fruit: seed.name });
    return plant;
  }

  /**
   * 浇水（消耗水滴，推进成长）
   * 每次浇水消耗 PLANT_WATER_PER_DAY(10)滴水，成长+1天
   */
  function water() {
    var plant = Storage.getPlant();
    if (!plant || plant.matured) return { success: false, msg: '植物不存在或已成熟' };

    var today = DateUtils.today();
    // 今天已经浇过水了
    if (plant.wateredDates && plant.wateredDates.indexOf(today) >= 0) {
      return { success: false, msg: '今天已经浇过水啦！明天再来吧～' };
    }

    // 检查水滴余额
    var water = Storage.getWater();
    if (water.balance < CONFIG.PLANT_WATER_PER_DAY) {
      return {
        success: false,
        msg: '水滴不够哦！还差' + (CONFIG.PLANT_WATER_PER_DAY - water.balance) + '滴，快去完成任务获得水滴吧～'
      };
    }

    // 消耗水滴
    Storage.spendWater(CONFIG.PLANT_WATER_PER_DAY, '浇灌植物');

    // 记录浇灌
    if (!plant.wateredDates) plant.wateredDates = [];
    plant.wateredDates.push(today);
    plant.growthDays++;

    // 灌溉10滴水 → 生命值+2（上限100）
    var hpBefore = plant.health;
    plant.health = Math.min(CONFIG.HP_MAX, plant.health + CONFIG.HP_RESTORE_PER_WATERING);
    var hpGained = plant.health - hpBefore;

    // 检查是否成熟
    if (plant.growthDays >= CONFIG.PLANT_MATURE_DAYS) {
      plant.matured = true;
      Storage.addHistory({ type: 'plant_mature', fruit: plant.fruitName });
    }

    Storage.setPlant(plant);
    Storage.addHistory({
      type: 'plant_water',
      amount: CONFIG.PLANT_WATER_PER_DAY,
      growthDays: plant.growthDays,
      hpGained: hpGained
    });

    return {
      success: true,
      growthDays: plant.growthDays,
      matured: plant.matured,
      hpGained: hpGained,
      msg: plant.matured ? '恭喜！你的' + plant.fruitName + '成熟啦！可以兑换真实水果啦！🎉' :
        '浇水成功！' + plant.fruitName + '又长大了一点～' + (hpGained > 0 ? ' 生命值+' + hpGained + '！' : '')
    };
  }

  /**
   * 获取当前成长阶段
   */
  function getGrowthStage(plant) {
    if (!plant) return CONFIG.GROWTH_STAGES[0];
    var days = plant.growthDays;
    var stage = CONFIG.GROWTH_STAGES[0];

    for (var i = 0; i < CONFIG.GROWTH_STAGES.length; i++) {
      if (days >= CONFIG.GROWTH_STAGES[i].minDay) {
        stage = CONFIG.GROWTH_STAGES[i];
      }
    }

    // 如果已成熟，使用成熟阶段
    if (plant.matured) {
      stage = CONFIG.GROWTH_STAGES[CONFIG.GROWTH_STAGES.length - 1];
    }

    return stage;
  }

  /**
   * 获取植物完整状态（含派生数据）
   */
  function getStatus() {
    var plant = Storage.getPlant();
    if (!plant) return null;

    var stage = getGrowthStage(plant);
    var today = DateUtils.today();
    var wateredToday = plant.wateredDates && plant.wateredDates.indexOf(today) >= 0;
    var water = Storage.getWater();

    // 计算距离成熟的天数
    var daysToMature = Math.max(0, CONFIG.PLANT_MATURE_DAYS - plant.growthDays);

    // 生命值状态
    var healthStatus = 'healthy';
    if (plant.health < CONFIG.HP_CRITICAL) {
      healthStatus = 'critical';
    } else if (plant.health < CONFIG.HP_WILTING) {
      healthStatus = 'wilting';
    } else if (plant.health < 60) {
      healthStatus = 'weak';
    }

    return {
      plant: plant,
      stage: stage,
      wateredToday: wateredToday,
      daysToMature: daysToMature,
      healthStatus: healthStatus,
      waterBalance: water.balance,
      canWater: !wateredToday && water.balance >= CONFIG.PLANT_WATER_PER_DAY && !plant.matured,
      progressPercent: Math.round(plant.growthDays / CONFIG.PLANT_MATURE_DAYS * 100)
    };
  }

  /**
   * 跨天结算 — 核心！
   * 检查上次活跃日期到今天之间，是否有未完成的任务，扣减生命值
   * 此方法在App启动时调用
   */
  function settleCrossDay() {
    var plant = Storage.getPlant();
    if (!plant) return null; // 还没种植物，无需结算

    var today = DateUtils.today();
    var lastDate = Storage.getLastDate();

    // 如果没有上次日期记录，或上次就是今天，无需结算
    if (!lastDate || lastDate === today) {
      Storage.setLastDate(today);
      return null;
    }

    // 计算需要结算的天数（不含今天，今天还没结束）
    var daysToSettle = DateUtils.daysBetween(lastDate, today);
    var totalHPLoss = 0;
    var settleDetails = [];

    // 遍历每一天（不含今天）
    for (var i = 0; i < daysToSettle; i++) {
      var settleDate = DateUtils.addDays(lastDate, i);
      var task = Storage.getTask(settleDate);

      // 统计未完成任务数
      var uncompleted = 0;
      if (!task || !task.chinese || !task.chinese.completed) {
        uncompleted++;
      }
      if (!task || !task.math || !task.math.completed) {
        uncompleted++;
      }

      // 扣减生命值：每项未完成 -5
      if (uncompleted > 0) {
        var loss = uncompleted * CONFIG.HP_LOSS_PER_TASK;
        totalHPLoss += loss;
        settleDetails.push({
          date: settleDate,
          uncompleted: uncompleted,
          hpLoss: loss
        });
      }
    }

    // 应用生命值扣减
    if (totalHPLoss > 0) {
      plant.health = Math.max(0, plant.health - totalHPLoss);
    }

    // 更新结算日期
    plant.lastSettleDate = today;
    Storage.setPlant(plant);
    Storage.setLastDate(today);

    // 记录历史
    if (totalHPLoss > 0) {
      Storage.addHistory({
        type: 'hp_loss',
        amount: totalHPLoss,
        days: daysToSettle,
        details: settleDetails
      });
    }

    return {
      settled: true,
      daysSettled: daysToSettle,
      totalHPLoss: totalHPLoss,
      details: settleDetails,
      currentHP: plant.health
    };
  }

  /**
   * 重置植物（枯死后重新种植）
   */
  function reset() {
    Storage.setPlant(null);
    Storage.updateSettings({ selectedFruit: null });
  }

  return {
    plantSeed: plantSeed,
    water: water,
    getGrowthStage: getGrowthStage,
    getStatus: getStatus,
    settleCrossDay: settleCrossDay,
    reset: reset
  };
})();
