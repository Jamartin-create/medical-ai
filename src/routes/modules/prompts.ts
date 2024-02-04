/** @description 生成提示词脚本 */

import { MessageT } from "../../utils/aiModel"
import UserService from "./user/service"


type PromptT = {
    character: string, // 人设
    summary: string, // 描述
    preface?: string, // 前言
    cordon?: string // 警戒线
}

export const defaultPrompts = async (uid: string): Promise<PromptT> => {

    const info = await UserService.getUserHealth(uid)
    
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

/** @description 立人设 */
function getChatCharacter(prompts: PromptT): MessageT[] {
    const messages: MessageT[] = []
    const prompt = `
        我想让你扮演${prompts.character}的角色，
        ${prompts.summary}。
        ${prompts.preface}。
        ${prompts.cordon}
    `
    messages.push({ role: 'user', content: prompt, ignore: true })
    return messages
}

/** @description 对话结果分析 */

/** @description 计划总览生成 */

/** @description 每日计划生成 */

/** @description 计划复盘生成 */

/** @description 病情分析 */

/** @description 预设 Prompt */
export default {
    getChatCharacter
}