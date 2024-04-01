/** @description 暂时废弃 */

import cron from 'cron'

const CronJob = cron.CronJob

// 每天 0-8 收集一下当日的资讯
new CronJob('0 0 0-8 * * *', function () {
    console.log('获取今日资讯')
})
