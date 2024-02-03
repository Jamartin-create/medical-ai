/** @description 用于连接 AI 模型 */
import axios from "axios";
import { Response } from "express";
import { ErrorCode } from "./exceptions";

const API = 'http://localhost:3461'

export type MessageT = {
    role: string;
    content: string;
}

// 获取 token

// 流式请求
export async function getAnswer(res: Response, messages: MessageT[]): Promise<string> {
    return new Promise(async (resolve) => {
        //  设置返回的请求头为事件流
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
        })
        res.status(200)
        const response = await axios.post(`${API}/ai/v1/chat/create/`, { messages }, { responseType: 'stream' })
        const chunkRequest = response.data
        let ret: string = ''
        let temp: string = ''
        chunkRequest.on('data', (chunk: Buffer) => {
            let chunkRes: string = chunk.toString()
            // 判断数据是否被截断
            if (chunkRes.indexOf('data: ') !== chunkRes.lastIndexOf('data: ')) {
                console.log('数据被截断了')
                temp = chunkRes.slice(chunkRes.lastIndexOf('data: '))
                chunkRes = chunkRes.slice(chunkRes.indexOf('data: '), chunkRes.lastIndexOf('data: '))
            } else if (chunkRes.indexOf('data: ') === -1) {
                console.log('补充数据')
                temp += chunkRes
                chunkRes = `${temp.replace(/^\s*[\r\n]/gm, '')}
                `
                temp = ''
            }
            console.log(chunkRes)
            // 利用字符串处理方法提取JSON数据部分
            const dataJson: any = JSON.parse(chunkRes.substring(chunkRes.indexOf('{'), chunkRes.lastIndexOf('}') + 1));
            ret += dataJson.result
            res.write(chunkRes)
        })
        chunkRequest.on('end', () => {
            resolve(ret)
            res.end()
        })
        chunkRequest.on('error', () => {
            res.end()
            throw ErrorCode.EXCUTE_ERROR
        })
    })
}

// 普通请求
export async function getAnswerWithStream(messages: MessageT[]) {
    return await axios.post(`${API}/ai/v1/chat/createWithNoStream`, { messages })
}