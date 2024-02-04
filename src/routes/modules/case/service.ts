import { DataTypes } from 'sequelize'
import CaseModel from '../../../database/models/mdacase'
import CaseAnaModel from '../../../database/models/mdacaseana'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { ErrorCode } from '../../../utils/exceptions'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'

const Case = CaseModel(sequelize, DataTypes)
const CaseAna = CaseAnaModel(sequelize, DataTypes)

Case.addHook('beforeCreate', (caseModel, _) => {
    caseModel.dataValues.status = 0 // 默认该病还没好 0=病ing，1=痊愈
})

export const CaseDao = {
    // 插入一条数据
    async insertOne(data: any) {
        return await transactionAction(async function (tran) {
            const mdCase = await Case.create(
                beforeCreateOne(data),
                { transaction: tran }
            )
            return mdCase
        })
    },
    // 编辑一条数据
    async updateOne(data: any) {
        return await transactionAction(async function (tran) {
            await Case.update(
                beforeUpdateOne(data),
                { where: { uid: data.uid }, transaction: tran }
            )
        })
    },
    // 获取一条数据
    async selectOne(data: any) {
        return await Case.findOne({ where: data.wrp, ...data.options })
    },
    // 获取多条数据
    async selectList(data: any) {
        return await Case.findAll({ where: data.wrp, ...data.options })
    }
}

export const CaseAnaDao = {
    // 插入一条分析结果
    async insertOne(data: any) {
        return await transactionAction(async function (tran) {
            const mdCaseAna = await CaseAna.create(
                beforeCreateOne(data),
                { transaction: tran }
            )
            return mdCaseAna
        })
    }
}

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
        // TODO：分页查询
        const { auth } = data
        return await Case.findAll({ where: { userid: auth.uid } })
    }

    // 查询病例详情
    static async getCaseDetail(data: any) {
        const { uid } = data
        if (!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const mdCase = await Case.findOne({ where: { uid: uid } })
        const mdCaseAna = await CaseAna.findOne({ where: { uid } })
        if (!mdCase) throw ErrorCode.NOT_FOUND_CASE_ERROR
        if (mdCaseAna) mdCase.dataValues.analizeDetail = mdCaseAna.dataValues
        return mdCase.dataValues
    }

    // 分析病情
    static async analizeCase(caseid: string, userid: string) {
        // TODO：接入 AI
        console.log('准备分析', caseid, userid)
    }
}