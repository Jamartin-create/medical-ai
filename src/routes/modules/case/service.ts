import { DataTypes } from 'sequelize'
import CaseModel from '../../../database/models/mdacase'
import CaseAnaModel from '../../../database/models/mdacaseana'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { ErrorCode } from '../../../utils/exceptions'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'
import Prompts, { defaultCaseAnalizePrompt } from '../prompts'

const Case = CaseModel(sequelize, DataTypes)
const CaseAna = CaseAnaModel(sequelize, DataTypes)

Case.addHook('beforeCreate', (caseModel, _) => {
    caseModel.dataValues.status = 0 // 默认该病还没好 0=病ing，1=痊愈
})

CaseAna.addHook('beforeCreate', (caseAnaModel, _) => {
    if(caseAnaModel.dataValues.status == undefined) caseAnaModel.dataValues.status = 0
})

type BaseModelT = typeof Case | typeof CaseAna

function BaseDao(model: BaseModelT) {
    return {
        async insertOne(data: any) {
            return await transactionAction(async function (tran) {
                return await model.create(
                    beforeCreateOne(data),
                    { transaction: tran }
                )
            })
        },
        async updateOne(data: any, wrapper: any = {}) {
            return await transactionAction(async function (tran) {
                return await model.update(
                    beforeUpdateOne(data),
                    { where: { uid: data.uid, ...wrapper }, transaction: tran }
                )
            })
        },
        // 获取一条数据
        async selectOne(data: any) {
            return await model.findOne({ where: data.wrp, ...data.options })
        },

        // 获取多条数据
        async selectList(data: any) {
            return await model.findAll({ where: data.wrp, ...data.options })
        }
    }
}

export const CaseDao = BaseDao(Case)
export const CaseAnaDao = BaseDao(CaseAna)

export default class CaseService {
    // 创建病例
    static async createCase(data: any) {
        const { curSituation, summary, medical, mdHistory, auth } = data
        if (!curSituation || !summary) throw ErrorCode.PARAMS_MISS_ERROR
        const mdCase = await CaseDao.insertOne({ curSituation, summary, medical, mdHistory, userid: auth.uid })
        this.analizeCase(mdCase.uid, auth.uid); // 开始分析
    }

    // 病情反馈
    static async caseFeedBack(data: any) {
        const { status, summary, uid } = data
        if (!status || !uid) throw ErrorCode.PARAMS_MISS_ERROR
        // TODO: summary 用于提交给 AI 进行一些分析
        console.log(summary) // 对于自己恢复情况的描述，或者一些其他的信息
        await CaseDao.updateOne({ status, uid })
    }


    // 查询病例列表
    static async getCaseList(data: any) {
        const { auth, pageIndex, pageSize } = data
        if (!pageIndex || !pageSize) throw ErrorCode.PARAMS_MISS_PAGE_ERROR
        const limit = parseInt(pageSize)
        const offset = parseInt(pageIndex) 
        const list = await Case.findAll({ where: { userid: auth.uid }, limit, offset: offset * limit })
        
        const total = await Case.count({ where: { userid: auth.uid }})

        const pageCount = Math.ceil(total / limit)
        const hasNext = offset + 1 < pageCount
        const hasPrevious = offset > 0
        
        return { list, total, pageCount, hasNext, hasPrevious }
    }

    // 查询病例详情
    static async getCaseDetail(data: any) {
        const { uid } = data
        if (!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const mdCase = await Case.findOne({ where: { uid } })
        const mdCaseAna = await CaseAna.findOne({ where: { caseid: uid } })
        if (!mdCase) throw ErrorCode.NOT_FOUND_CASE_ERROR

        // 获取分析报告
        if (mdCaseAna) mdCase.dataValues.analizeDetail = mdCaseAna.dataValues
        else mdCase.dataValues.analizeDetail = null

        return mdCase.dataValues
    }

    // 分析病情
    static async analizeCase(caseid: string, userid: string) {
        try {
            const result = await Prompts.getCaseAnalize(await defaultCaseAnalizePrompt(caseid))
            CaseAnaDao.insertOne({...result, userid, caseid})
        } catch (e) {
            CaseAnaDao.insertOne({ status: 2, userid, caseid })
            console.log(e)
        }
    }

    // 病情描述
    static async genCaseIntro(caseid: string): Promise<string> {
        
        const cs = await Case.findOne({ where: { uid: caseid } })
        if (!cs) throw ErrorCode.NOT_FOUND_CASE_ERROR
        const { dataValues } = cs
        const curSit = dataValues.curSituation
        return `
            症状：${dataValues.summary}
            用药史：${dataValues.medical}
            病史：${dataValues.mdHistory}
            当前身体自我感觉情况：${curSit === 0 ? '差' : curSit === 1 ? '一般' : '好'}
        `
    }
}