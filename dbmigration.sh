# 用户
npx sequelize-cli model:generate --name mdaUser --attributes uid:string,username:string,password:string,realname:string,age:number,tel:string,email:string,status:nubmer,avatar:string,memo:string

# 问答记录（msgid 可能需要连 mongodb，待定……）
npx sequelize-cli model:generate --name mdaQaRecord --attributes uid:string,msgid:string,reviewid:string,chatcount:number,startAt:date,endAt:date

# 问答总结
npx sequelize-cli model:generate --name mdaQaReview --attributes uid:string,recordid:string,tags:string,content:string,helpful:number,comment:string

# 计划总览
npx sequelize-cli model:generate --name mdaPlanOverview --attributes uid:string,summary:string,title:string,target:string,cycle:string,status:number

# 计划完成后情况分析
npx sequelize-cli model:generate --name mdaPlanReview --attributes uid:string,overviewid:string,tags:string,content:string,helpful:number,comment:string

# 每日计划打卡
npx sequelize-cli model:generate --name mdaPlanRecord --attributes uid:string,overviewid:string,content:string,status:number

# 每日计划、资讯
npx sequelize-cli model:generate --name mdaPlanRecordAna --attributes uid:string

# 病例
npx sequelize-cli model:generate --name mdaCase --attributes uid:string

# 病例分析
npx sequelize-cli model:generate --name mdaCaseAna --attributes uid:string

