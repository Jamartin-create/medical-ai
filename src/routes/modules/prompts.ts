/** @description 生成提示词脚本 */

import { Response } from "express"
import { MessageT, getAnswer } from "../../utils/aiModel"
import { ChatDao } from "./chat/service"
import UserService from "./user/service"
import { ErrorCode } from "../../utils/exceptions"

// 提示词组成
type PromptT = {
    character: string, // 人设
    summary: string, // 描述
    preface?: string, // 前言
    cordon?: string // 警戒线
}

// 生成针对特定病人的身体情况而定的医生人设 prompts
export const defaultPrompts = async (uid: string): Promise<PromptT> => {

    const info = await UserService.getUserHealth(uid)
    if (!info) throw ErrorCode.NOT_FOUND_USER_ERROR
    
    return {
        character: "门诊医生",
        summary: `
            您需要回答前来看病的病人的问题，他的问题可能是资讯自己可能患的疾病，也有可能是询问一些已确诊的疾病的治疗方案。
            如果是第一种：您需要根据病人对病情的描述判断病人可能患上的疾病。
            如果是第二种：您需要想出创造性的治疗方法来治疗疾病，并且您应该能够推荐常规药物、草药和其他天然替代品，在提供建议时，您还需要考虑患者的年龄、生活方式和病史。
            如果是其他情况：你就自由发挥。
        `,
        preface: `本次来咨询的病人信息如下: ${info}。在接下来的对话中它将向你咨询一些关于他身体健康的情况。`,
        cordon: `
            如果在后续的对话中我询问了不属于医学范畴的问题，请回答：该问题不在我的帮助范围内哦～，不要回答其他东西。
            如果你准备好了请回答：我是你的健康小助手，有什么需要帮助的～
        `
    }
}

/** @description 立人设，对话用 */
function getChatCharacter(prompts: PromptT): MessageT[] {
    const messages: MessageT[] = []
    const prompt = `
        我想让你扮演${prompts.character}的角色，
        ${prompts.summary}。
        ${prompts.preface}。
        ${prompts.cordon || ''}
    `
    messages.push({ role: 'user', content: prompt, ignore: true })
    return messages
}

// 对话总结
type RecordReviewT = {
    tags: string[]; // 关键词
    content: string; // 大 Json
}

export const defaultReviewGenPrompt = async (recordid: string): Promise<PromptT> => {

    const record = await ChatDao.selectOne({
        wrp: { uid: recordid },
        options: { attributes: { include: ['chatDetail'] } }
    })

    if (!record) throw ErrorCode.NOT_FOUND_CHAT_ERROR;
    
    // a. 患者是来看病的：医生针对患者的描述判断患者所患疾病，
    // b. 患者是来复查的：
    return {
        character: '助理医生',
        summary: `
            作为助理医生，你的工作是记录医生与患者的对话，并针对这段对话进行分析，分析的结果分两部分：
            1. 关键词：本次对话产生的关键信息，并将其简化成单词，记录下来。
            2. 对话复盘：帮助医生与患者总结刚刚的对话。
        `,
        preface: `
            本次的对话内容为: ${record.dataValues.chatDetail}；以上为本次医生和患者的对话详情，请开始分析。
            请注意！输出只需要输出一个 json 即可，包含两个字段: tags 和 content
            tags 即为关键词; content 则是分析的结果（请输出代码块）
        `
    }
}

/** @description 对话结果分析，对话结束用 */
async function getChatRecordReview(prompts: PromptT, res: Response): Promise<RecordReviewT> {
    const response: string = await getAnswer(res, getChatCharacter(prompts))
    
    console.log('分析结果', response)
    const { tags, content } = JSON.parse(response.slice(response.indexOf('{'), response.indexOf('}') + 1))

    return {
        tags: tags.join(','),
        content
    }

}

/** @description 计划总览生成 */

/** @description 每日计划生成 */

/** @description 计划复盘生成 */

/** @description 病情分析 */

/** @description 预设 Prompt */
export default {
    getChatCharacter,
    getChatRecordReview
}