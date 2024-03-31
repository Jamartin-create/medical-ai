import { DataTypes } from 'sequelize'
import ChatModel from '../../../database/models/mdaqarecord'
import ChatAnaModel from '../../../database/models/mdaqareview'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'
import { ErrorCode } from '../../../utils/exceptions'
import { MessageT, getAnswer } from '../../../utils/aiModel'
import { Response } from 'express'
import Prompts, { defaultPrompts, getTitle } from '../prompts'

const Chat = ChatModel(sequelize, DataTypes)
const ChatAna = ChatAnaModel(sequelize, DataTypes)

Chat.addHook('beforeCreate', (chatModel, options) => {
    console.log('beforeCreate: ', chatModel, options)
    chatModel.dataValues.status = 0
})

export const ChatDao = {
    async insertOne(data: any) {
        return await transactionAction(async tran => {
            return await Chat.create(beforeCreateOne(data), {
                transaction: tran
            })
        })
    },
    async updateOne(data: any) {
        return await transactionAction(async tran => {
            await Chat.update(beforeUpdateOne(data), {
                where: { uid: data.uid },
                transaction: tran
            })
        })
    },
    // 获取一条数据
    async selectOne(data: any) {
        return await Chat.findOne({ where: data.wrp, ...data.options })
    },
    // 获取多条数据
    async selectList(data: any) {
        return await Chat.findAll({ where: data.wrp, ...data.options })
    }
}

export const ChatAnaDao = {
    async insert(data: any) {
        return await transactionAction(async tran => {
            return await ChatAna.create(beforeCreateOne(data), {
                transaction: tran
            })
        })
    }
}

export default class ChatService {
    // 创建对话
    static async createChat(data: any) {
        const { auth } = data

        // 创建一个聊天，先将角色预设好
        const chatDetails: MessageT[] = Prompts.getChatCharacter(
            await defaultPrompts(auth.uid)
        )
        // 帮助 大语言模型 立人设
        // const aiAnswer = await getAnswer(res, chatDetails)
        chatDetails.push({
            role: 'assistant',
            content: '我是你的健康小助手，有什么需要帮助的～'
        })

        const ret = await ChatDao.insertOne({
            userid: auth.uid,
            chatDetail: JSON.stringify(chatDetails),
            chatcount: 1,
            startAt: new Date().getTime()
        })

        const details: MessageT[] = JSON.parse(ret.chatDetail)

        ret.chatDetail = JSON.stringify(details.filter(item => !item.ignore))
        return ret
    }

    // 续写对话
    static async keeponChat(data: any, res: Response) {
        const { uid, content } = data
        if (!uid || !content) throw ErrorCode.PARAMS_MISS_ERROR
        const chatRecord = await Chat.findOne({ where: { uid } })
        if (!chatRecord) throw ErrorCode.NOT_FOUND_CHAT_ERROR
        const oldDetail = chatRecord.dataValues.chatDetail

        // 获取旧记录
        const detail: MessageT[] = oldDetail ? JSON.parse(oldDetail) : []

        // 拼接用户消息
        detail.push({ role: 'user', content })

        try {
            // 获取 ai 的回答并拼接在记录中
            const result = await getAnswer(res, detail)
            detail.push({ role: 'assistant', content: result })

            const updateInfo: any = {
                uid,
                chatDetail: JSON.stringify(detail),
                chatcount: (chatRecord.dataValues.cahtcount || 0) + 1
            }

            if (!chatRecord.dataValues.title) {
                const title = await getTitle(
                    JSON.stringify(detail),
                    '对话记录',
                    6
                )
                updateInfo.title = title
            }

            // 如果是新对话被续写，那么新对话的状态也随之改变
            if (chatRecord.dataValues.status === 0) updateInfo.status = 1

            await ChatDao.updateOne(updateInfo)
        } catch (e) {
            throw ErrorCode.AI_GEN_ERROR
        }
    }

    // 结束对话
    static async leaveChat(data: any) {
        const { uid } = data
        if (!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const chatRecord = await Chat.findOne({ where: { uid } })
        if (!chatRecord) throw ErrorCode.NOT_FOUND_CHAT_ERROR
        await ChatDao.updateOne({ uid, endAt: new Date().getTime() })
    }

    // 对话记录获取
    static async getChatRecords(data: any) {
        // TODO：分页
        const { auth } = data
        return await Chat.findAll({
            where: { userid: auth.uid, status: 1 },
            order: [['createdAt', 'DESC']]
        })
    }

    // 对话记录详情获取
    static async getChatRecordDetail(data: any) {
        const { uid } = data
        if (!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const chatAna = await ChatAna.findOne({ where: { recordid: uid } })
        const chat = await Chat.findOne({ where: { uid } })
        if (!chat) throw ErrorCode.NOT_FOUND_CHAT_ERROR
        if (chat.dataValues.chatDetail) {
            const detailList: MessageT[] = JSON.parse(
                chat.dataValues.chatDetail
            )
            chat.dataValues.chatDetail = detailList.filter(item => !item.ignore)
        }
        if (chatAna) chat.dataValues.chatAna = chatAna.dataValues
        return chat.dataValues
    }

    // 获取历史的新对话（避免重复创建无意义的对话）
    static async checkChatIsNew(data: any) {
        const { auth } = data
        const chat = await Chat.findAll({
            where: { userid: auth.uid },
            order: [['createdAt', 'DESC']],
            limit: 1
        })

        // 没产生过对话
        if (!chat.length) return null

        const ret = chat[0].dataValues

        const details: MessageT[] = JSON.parse(ret.chatDetail)

        // 上一段对话已经有
        if (details.length > 2) return null

        ret.chatDetail = JSON.stringify(details.filter(item => !item.ignore))

        return ret
    }
}
