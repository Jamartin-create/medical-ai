import UserModel from '../../../database/models/mdauser'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { DataTypes } from 'sequelize'
import { ErrorCode } from '../../../utils/exceptions'
import { md5Pwd } from '../../../utils/tools'
import jwt from '../../../plugin/jwt'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'

const User = UserModel(sequelize, DataTypes)

User.addHook('beforeCreate', (userModel, options) => {
    console.log(userModel, options)
    userModel.dataValues.status = 0
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
    }
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
        if(!username || !password) throw ErrorCode.PARAMS_MISS_ERROR
        const user = await User.findOne({ where: { username } })
        if (!user) throw ErrorCode.NOT_FOUND_USER_ERROR
        if (user.dataValues.password != md5Pwd(password)) throw ErrorCode.AUTH_PWD_ERROR
        const options: any = {}
        // 选择了保持登录状态则延长至一个月
        if (staystatus) options.expiresIn = '720h'
        return jwt.sign({uid: user.dataValues.uid}, options)
    }

    // 获取用户信息
    static async getInfo(uid: string) {
        const user = await User.findOne({ where: { uid }, attributes: {exclude: ['password']} })
        if (!user) throw ErrorCode.NOT_FOUND_USER_ERROR;
        return user
    }

    // 编辑信息
    static async editInfo(data: any) {
        Object.keys(data).forEach(key => {
            if(['password', 'username', 'email', 'status'].includes(key)) delete data[key]
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
}