import UserModel from '../../../database/models/mdauser'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { DataTypes } from 'sequelize'
import { ErrorCode } from '../../../utils/exceptions'
import { md5Pwd } from '../../../utils/tools'
import jwt from '../../../plugin/jwt'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'
import { CaseDao } from '../case/service'

const User = UserModel(sequelize, DataTypes)

export type UserHealthInfo = {
    gender: number;
    age: number;
    medical: any[];
    mdHistory: any[];
    toString: () => string;
}



User.addHook('beforeCreate', (userModel, options) => {
    console.log(userModel, options)
    userModel.dataValues.status = 0
    // 性别赋值为未知
    if (userModel.dataValues.gender == undefined) {
        userModel.dataValues.gender = -1
    }
})


export const UserDAO = {
    // 插入一条数据
    async insertOne(data: any) {
        return await transactionAction(async function (tran) {
            const user = await User.create(
                beforeCreateOne(data),
                { transaction: tran }
            )
            return user
        })
    },
    // 更新一条数据
    async updateOne(data: any) {
        return await transactionAction(async function (tran) {
            const user = await User.update(
                beforeUpdateOne(data),
                { where: { uid: data.uid }, transaction: tran }
            )
            return user
        })
    },
    // 获取一条数据
    async selectOne(data: any, jsonAttr?: string[]) {
        const ret = await User.findOne({ where: data.wrp, ...data.options })
        if(!jsonAttr) return ret
        Object.keys(ret.dataValues).forEach(key => {
            if(!jsonAttr.includes(key)) return 
            ret.dataValues[key] = JSON.parse(ret.dataValues[key])
        })
        return ret
    },
}

export default class UserService {

    // 注册
    static async registry(data: any) {
        // TODO: 邮箱注册
        const { username, password } = data
        if (!username || !password) throw ErrorCode.PARAMS_MISS_ERROR
        data.password = md5Pwd(password)
        await UserDAO.insertOne(data)
    }

    // 登录
    static async login(data: any) {
        // TODO: 邮箱登录
        const { username, password, staystatus } = data
        if (!username || !password) throw ErrorCode.PARAMS_MISS_ERROR
        const user = await User.findOne({ where: { username } })
        if (!user) throw ErrorCode.NOT_FOUND_USER_ERROR
        if (user.dataValues.password != md5Pwd(password)) throw ErrorCode.AUTH_PWD_ERROR
        const options: any = {}
        // 选择了保持登录状态则延长至一个月
        if (staystatus) options.expiresIn = '720h'
        return jwt.sign({ uid: user.dataValues.uid }, options)
    }

    // 获取用户信息
    static async getInfo(uid: string) {
        const user = await UserDAO.selectOne({ 
            wrp: { uid }, 
            options: {attributes: { exclude: ['password'] }}
        }, ['allergy', 'medicalHis'])
        if (!user) throw ErrorCode.NOT_FOUND_USER_ERROR;
        return user
    }

    // 编辑信息
    static async editInfo(data: any) {
        Object.keys(data).forEach(key => {
            if(['allergy', 'medicalHis'].includes(key)) data[key] = JSON.stringify(data[key]) 
            if (['password', 'username', 'email', 'status'].includes(key))delete data[key]
        })
        await UserDAO.updateOne(data)
    }

    // 更新密码
    static async changePwd(data: any) {
        const { uid, oldPwd, newPwd } = data
        if (!oldPwd || !newPwd) throw ErrorCode.AUTH_PWD_ERROR
        const user = await User.findOne({ where: { uid } })
        if (!user) throw ErrorCode.NOT_FOUND_USER_ERROR
        if (user.dataValues.password !== md5Pwd(oldPwd)) throw ErrorCode.AUTH_PWD_ERROR
        await UserDAO.updateOne({ uid, password: newPwd })
        return
    }

    // 获取用户健康情况
    static async getUserHealth(uid: string): Promise<UserHealthInfo> {
        const user = await User.findOne({ where: { uid } })
        const cases = await CaseDao.selectList({
            wrp: { userid: uid },
            options: {  attributes: { include: ['medical', 'mdHistory', 'curSituation'] } }
        })
        if (!user) throw ErrorCode.NOT_FOUND_USER_ERROR

        // 收集用户信息
        const userInfo: UserHealthInfo = {
            gender: user.dataValues.gender,
            age: user.dataValues.age,
            medical: [],
            mdHistory: [],
            toString: function () {
                const { gender, age, medical, mdHistory } = this
                return `${gender === 1 ? '男' : '女'},${age}岁;用药史:${medical.join(',')};病史:${mdHistory.join(',')}`
            }
        }

        // 填充案例
        if (cases) {
            cases.forEach((item) => {
                const userDetail = item.dataValues
                userDetail.medical && userInfo.medical.push(userDetail.medical)
                userDetail.mdHistory && userInfo.mdHistory.push(userDetail.mdHistory)
            })
        }

        return userInfo

    }
}