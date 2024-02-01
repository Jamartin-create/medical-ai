# 用户
npx sequelize-cli model:generate --name mdaUser --attributes uid:string,username:string,password:string,avatar:string,realname:string,age:number,tel:string,email:string,status:number

# 问答记录（msgid 可能需要连 mongodb，待定……）
npx sequelize-cli model:generate --name mdaQaRecord --attributes uid:string,reviewid:string,chatDetail:string,chatcount:number,startAt:date,endAt:date

# 问答总结
npx sequelize-cli model:generate --name mdaQaReview --attributes uid:string,tags:string,content:string,helpful:number,comment:string

# ai生成 计划总览
npx sequelize-cli model:generate --name mdaPlanOverview --attributes uid:string,summary:string,title:string,target:string,cycle:string,helpful:number,status:number

# 计划完成后情况分析
npx sequelize-cli model:generate --name mdaPlanReview --attributes uid:string,overviewid:string,tags:string,content:string,comment:string,helpful:number

# 每日计划打卡
npx sequelize-cli model:generate --name mdaPlanRecord --attributes uid:string,overviewid:string,diet:string,sleep:string,medical:string,memo:string,status:number

# ai 生成每日计划、资讯
npx sequelize-cli model:generate --name mdaPlanRecordAna --attributes uid:string,overviewid:string,newsid:string,summary:string,helpful:number,genAt:date

# 资讯
npx sequelize-cli model:generate --name mdaNews --attributes uid:string,content:string,tags:string,source:string,genAt:date

# 病例/健康状况（cursituation：0=差、1=一般、2=好）
npx sequelize-cli model:generate --name mdaCase --attributes uid:string,curSituation:number,summary:string,caseid:string,medical:string,mdHistory:string,recordDate:string

# 病例分析（type：0=症状描述-分析病情+给建议，1=病情描述-给建议；diseases：可能的病情，reason：病因)
npx sequelize-cli model:generate --name mdaCaseAna --attributes uid:string,helpful:number,type:number,advice:string,diseases:string,reasons:string,helpful:number,genAt:date

