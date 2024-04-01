/** @description 用于连接远程 AI 模型服务（🌟🌟🌟🌟🌟） */
import axios from 'axios'
import { Response } from 'express'
import { ErrorCode } from './exceptions'
import config from '../config'

const { aiServer } = config

// EventSource 事件流解析（可以理解为从 ChatGPT/文心一言那里拿到的回答“碎片”，这里专门用来处理这些碎片）
const eventStreamDataTrans = (es: string) => {
    const eventIdx = es.indexOf('event: ')
    const dataIdx = es.indexOf('data: ')
    return {
        event: es.slice(eventIdx + 7, dataIdx),
        data: es.slice(es.indexOf('{'), es.lastIndexOf('}') + 1)
    }
}

const API = aiServer.api // 获取远程 AI 服务的地址

// 消息的类型
export type MessageT = {
    role: string // 角色：只包含 user 和 assistance（用户和AI）
    content: string // 消息内容，只能是文本，但格式不限，可以是 JSON 也可以是 MarkDown
    ignore?: boolean // 是否忽略（并非 ChatGPT 等服务需要，而是本项目为了不将所有回答都返回给前端，用此字段做筛选）
}

/**
 * @description 这里的流程大致是：
 * 1. 前端向后端发送问题（这一步不在这个文件里）
 * 2. 后端转发前端的问题给 AI 服务
 * 3. AI 服务返回回答给后端
 * 4. 后端处理一下回答再把处理后的回答返回给前端
 */

// 流式请求
export async function getAnswer(
    res: Response,
    messages: MessageT[]
): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            // 设置返回的“请求头”为事件流（这样就可以实现 ChatGPT 那种一点一点展示回答的效果了）
            res.set({
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            })
            res.status(200) // 直接将状态设为 200，与传统 HTTP 请求不一样的是，这里还没有返回数据，返回两百只是单纯为了把状态固定，然后方便我们后续进行长连接之后传输数据

            const response = await axios.post(
                `${API}/ai/v1/chat/create/`,
                { messages, accessToken: config.aiServer.accessToken }, // accessToken：要在配置中心配置
                { responseType: 'stream' } // 设置远程 AI 服务接口返回的响应体的类型是 stream （即流式数据）
            )
            const chunkRequest = response.data // chunkRequest - 用于监听 Ai 服务返回数据的实例

            let ret: string = ''
            // 监听 Ai 服务返回的数据，chunk：数据流（二进制数据）
            chunkRequest.on('data', (chunk: Buffer) => {
                let chunkRes: string = chunk.toString() // 将二进制数据转换为真实数据
                const data = eventStreamDataTrans(chunkRes) // 对数据进行整理
                if (!data.data) return
                // 利用字符串处理方法提取JSON数据部分
                const dataJson: any = JSON.parse(data.data)
                ret += dataJson.result
                res.write(`event: message\ndata: ${data.data}\n\n`) // 拿到一点数据就向前端返回一点
            })
            chunkRequest.on('end', () => {
                resolve(ret)
                res.end()
            })
            chunkRequest.on('error', () => {
                res.write(`event: error\ndata: 生成失败`)
                res.end()
                throw ErrorCode.EXCUTE_ERROR
            })
        } catch (e) {
            reject(e)
        }
    })
}

// 普通请求（getAnswerWithoutStream）—— 也就是等待 AI 生成所有结果之后再返回给后端，后端再返回给前端（给用户的感觉就是一直等等等等等……）
export async function getAnswerWithStream(messages: MessageT[]): Promise<any> {
    const data = await axios.post(`${API}/ai/v1/chat/createWithNoStream`, {
        messages,
        accessToken: config.aiServer.accessToken
    })
    if (!data) throw ErrorCode.NETWORK_ERROR
    if (!data.data) throw ErrorCode.NETWORK_ERROR
    if (!data.data.data) throw ErrorCode.AI_GEN_ERROR
    if (!data.data.data.result) throw ErrorCode.AI_GEN_ERROR
    return data.data.data.result
}
