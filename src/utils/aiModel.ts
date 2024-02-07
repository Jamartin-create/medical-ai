/** @description 用于连接 AI 模型 */
import axios, { AxiosResponse } from "axios";
import { Response } from "express";
import { ErrorCode } from "./exceptions";

const eventStreamDataTrans = (es: string) => { 
    const eventIdx = es.indexOf('event: ')
    const dataIdx = es.indexOf('data: ')
    return {
        event: es.slice(eventIdx + 7, dataIdx),
        data: es.slice(es.indexOf('{'), es.lastIndexOf('}') + 1)
    }
}

const API = 'http://localhost:3461'

export type MessageT = {
    role: string;
    content: string;
    ignore?: boolean
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
        chunkRequest.on('data', (chunk: Buffer) => {
            let chunkRes: string = chunk.toString()
            console.log(chunkRes)
            const data = eventStreamDataTrans(chunkRes)
            if(!data.data) return
            // 利用字符串处理方法提取JSON数据部分
            const dataJson: any = JSON.parse(data.data);
            ret += dataJson.result
            res.write(`event: message\ndata: ${data.data}\n\n`)
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
export async function getAnswerWithStream(messages: MessageT[]): Promise<AxiosResponse> {
    return await axios.post(`${API}/ai/v1/chat/createWithNoStream`, { messages })
}