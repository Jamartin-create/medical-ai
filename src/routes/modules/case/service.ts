import { DataTypes } from 'sequelize'
import CaseModel from '../../../database/models/mdacase'
import CaseAnaModel from '../../../database/models/mdacaseana'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { ErrorCode } from '../../../utils/exceptions'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'
import Prompts, { getKeywords } from '../prompts'
import { getPageParams } from '../../../utils/tools'
import { Response } from 'express'

const Case = CaseModel(sequelize, DataTypes)
const CaseAna = CaseAnaModel(sequelize, DataTypes)

// TODO: 查询时将病史、用药史用 JSON.parse 解析一下
Case.addHook('beforeCreate', (caseModel, _) => {
    caseModel.dataValues.status = 0 // 默认该病还没好 0=病ing，1=痊愈
})

CaseAna.addHook('beforeCreate', (caseAnaModel, _) => {
    if (caseAnaModel.dataValues.status == undefined)
        caseAnaModel.dataValues.status = 0
})

type BaseModelT = typeof Case | typeof CaseAna

// 数据库操作
function BaseDao(model: BaseModelT) {
    return {
        // 插入一条数据
        async insertOne(data: any) {
            return await transactionAction(async function (tran) {
                return await model.create(beforeCreateOne(data), {
                    transaction: tran
                })
            })
        },
        // 更新一条数据
        async updateOne(data: any, wrapper: any = {}) {
            return await transactionAction(async function (tran) {
                return await model.update(beforeUpdateOne(data), {
                    where: { uid: data.uid, ...wrapper },
                    transaction: tran
                })
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
        // 取出前端传来的参数
        const { curSituation, summary, medical, mdHistory, auth } = data
        // 判断必传参数是否传了，没传就报错
        if (curSituation == null || !summary) throw ErrorCode.PARAMS_MISS_ERROR

        const title = await getKeywords(summary) // 根据用户的描述生成关键词

        // 插入一条病例数据
        return await CaseDao.insertOne({
            curSituation,
            summary,
            title,
            medical: JSON.stringify(medical),
            mdHistory: JSON.stringify(mdHistory),
            userid: auth.uid
        })
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
        const { auth } = data
        // 获取分页参数
        const { order, getPageResult } = getPageParams(data)

        const list = await Case.findAll({
            where: { userid: auth.uid },
            ...order,
            order: [['createdAt', 'DESC']]
        })

        const total = await Case.count({ where: { userid: auth.uid } })

        return getPageResult(list, total)
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
    static async analizeCase(data: any, res: Response) {
        const { caseid, auth } = data
        try {
            const result = await Prompts.getCaseAnalize(caseid, res)
            CaseAnaDao.insertOne({
                content: result,
                userid: auth.uid,
                caseid
            })
        } catch (e) {
            CaseAnaDao.insertOne({ status: 2, userid: auth.uid, caseid })
            console.log(e)
        }
    }
}
