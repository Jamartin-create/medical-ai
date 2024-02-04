# 用户
npx sequelize-cli model:generate --name mdaUser --attributes uid:string,username:string,password:string,avatar:string,realname:string,age:integer,gender:integer,tel:string,email:string,status:integer

# 问答记录（msgid 可能需要连 mongodb，待定……）
npx sequelize-cli model:generate --name mdaQaRecord --attributes uid:string,userid:string,chatDetail:string,chatcount:integer,startAt:date,endAt:date

# 问答总结
npx sequelize-cli model:generate --name mdaQaReview --attributes uid:string,recordid:string,tags:string,content:string,helpful:integer,comment:string

# 用户输入计划目标（type：0=病例，1=养生，2=康复）
npx sequelize-cli model:generate --name mdaPlan --attributes uid:string,userid:string,type:integer,caseid:string,target:string,cycle:string,startAt:date,endAt:date

# ai生成 计划总览
npx sequelize-cli model:generate --name mdaPlanOverview --attributes uid:string,planid:string,content:string,title:string,helpful:integer

# 计划完成后情况分析
npx sequelize-cli model:generate --name mdaPlanReview --attributes uid:string,planid:string,tags:string,content:string,comment:string,helpful:integer

# 每日计划打卡
npx sequelize-cli model:generate --name mdaPlanRecord --attributes uid:string,planid:string,diet:string,sleep:string,medical:string,memo:string,status:integer

# ai 生成每日计划、资讯
npx sequelize-cli model:generate --name mdaPlanRecordAna --attributes uid:string,recordid:string,newsid:string,content:string,helpful:integer,genAt:date

# 资讯
npx sequelize-cli model:generate --name mdaNews --attributes uid:string,content:string,tags:string,source:string,genAt:date

# 病例/健康状况（cursituation：0=差、1=一般、2=好）
npx sequelize-cli model:generate --name mdaCase --attributes uid:string,curSituation:integer,summary:string,userid:string,medical:string,mdHistory:string,status:integer

# 病例分析（type：0=症状描述-分析病情+给建议，1=病情描述-给建议；diseases：可能的病情，reason：病因)
npx sequelize-cli model:generate --name mdaCaseAna --attributes uid:string,caseid:string,helpful:integer,type:integer,advice:string,diseases:string,reasons:string,helpful:integer,genAt:date

