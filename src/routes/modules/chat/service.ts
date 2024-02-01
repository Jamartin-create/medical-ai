import { DataTypes } from 'sequelize'
import ChatModel from '../../../database/models/mdaqarecord'
import ChatAnaModel from '../../../database/models/mdaqareview'
import { sequelize, transactionAction } from '../../../plugin/sequelize'
import { beforeCreateOne, beforeUpdateOne } from '../../../utils/database'
import { ErrorCode } from '../../../utils/exceptions'

const Chat = ChatModel(sequelize, DataTypes)
const ChatAna = ChatAnaModel(sequelize, DataTypes)

export const ChatDao = {
    async insertOne(data: any) {
        return await transactionAction(async (tran) => {
            return await Chat.create(
                beforeCreateOne(data),
                { transaction: tran }
            )
        })
    },
    async updateOne(data: any) {
        return await transactionAction(async (tran) => {
            await Chat.update(
                beforeUpdateOne(data),
                { where: { uid: data.uid }, transaction: tran }
            )
        })
    }
}

export const ChatAnaDao = {
    async insert(data: any) {
        return await transactionAction(async (tran) => {
            return await ChatAna.create(
                beforeCreateOne(data),
                { transaction: tran }
            )
        })
    }
}

export default class ChatService {
    // 创建对话
    static async createChat(data: any) {
        const { auth } = data
        await ChatDao.insertOne({ userid: auth.uid, startAt: new Date().getTime() })
        // TODO：同样在 AI 应用中也创建一个聊天
    }

    // 续写对话
    static async keeponChat(data: any) {
        const { uid, content } = data
        if(!uid || !content) throw ErrorCode.PARAMS_MISS_ERROR
        const chatRecord = await Chat.findOne({ where: { uid } })
        if (!chatRecord) throw ErrorCode.NOT_FOUND_CHAT_ERROR
        const updData = {
            uid,
            chatDetail: chatRecord.dataValues.chateDetail + content,
            chatcount: chatRecord.dataValues.cahtcount + 1
        }
        await ChatDao.updateOne(updData)

        // TODO：接通 Ai 应用续写聊天
    }

    // 结束对话
    static async leaveChat(data: any) {
        const { uid } = data
        if(!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const chatRecord = await Chat.findOne({ where: { uid } })
        if (!chatRecord) throw ErrorCode.NOT_FOUND_CHAT_ERROR
        await ChatDao.updateOne({ uid, endAt: new Date().getTime() })

        // TODO：对话结束，开始进行 Ai 分析
        ChatAnaDao.insert({ tags: '测试', content: '111', recordid: uid })
    }

    // 对话记录获取
    static async getChatRecords(data: any) {
        // TODO：分页
        const { auth } = data
        return await Chat.findAll({ where: { userid: auth.uid } })
    }

    // 对话记录详情获取
    static async getChatRecordDetail(data: any) {
        const { uid } = data
        if(!uid) throw ErrorCode.PARAMS_MISS_ERROR
        const chatAna = await ChatAna.findOne({ where: { recordid: uid } })
        const chat = await Chat.findOne({ where: { uid } })
        if (!chat) throw ErrorCode.NOT_FOUND_CHAT_ERROR
        if (chatAna) chat.dataValues.chatAna = chatAna.dataValues
        return chat.dataValues
    }
}