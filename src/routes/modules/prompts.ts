/** @description 生成提示词脚本 */

import { Response } from "express"
import { MessageT, getAnswer, getAnswerWithStream } from "../../utils/aiModel"
import { ChatDao } from "./chat/service"
import UserService from "./user/service"
import { ErrorCode } from "../../utils/exceptions"
import PlanService, { PlanDao } from "./plan/service"
import CaseService from "./case/service"

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

// 提示词组成
type PromptT = {
    character: string, // 人设
    summary: string, // 描述
    preface?: string, // 前言
    cordon?: string // 警戒线
}

// 对话总结
type RecordReviewT = {
    tags: string[]; // 关键词
    content: string; // 大 Json
}

// 计划总览
type OverviewT = {
    title: string;
    content: string;
}

// 计划复盘
type PlanReviewT = {
    content: any;
    tags: string;
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

// 分析对话结果提示词
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
            请注意！你是在和患者面对面交谈，不要以第三人称视角描述；且输出只需要输出一个 json 代码块即可，包含两个字段: tags 和 content
            tags 即为关键词; content 则是分析的结果（请输出代码块）
        `
    }
}

// 对计划完成情况进行复盘
export const deafultPlanReviewGenPrompt = async (planid: string): Promise<PromptT> => {
    const planReview = await PlanService.genPlanReviewPrompts(planid)
    return {
        character: '康复医疗师',
        summary: `
            作为康复医疗师，你的工作是：
            先针对患者自己的目标加上你之前为其制定的计划大纲以及其每日打卡状态判断患者的计划是否成功完成
            再根据患者自我描述分析一下患者的身体状态
            最后再做一个简单的复盘，以及患者后续需要注意的事情
            此外，你还需要提取本次康复过程的一些关键词（这里可以是从对话中截取，也可以通过分析生成复合条件的关键词）
        `,
        preface: `
            以下是本次患者的目标及打卡记录：${planReview}。请开始分析
            请注意！你是在和患者面对面交谈，不要以第三人称视角描述；且输出时只需要输出一个 json 代码块即可， 包含三个字段：status, healthInfo, content
                1. status: 布尔值 - 表示是否完成，完成则输出 true，反之输出 false
                2. healthInfo: 患者的身体状态，告诉患者其目前身体状态是好还是不好，并说明原因
                3. content: 最终的复盘以及患者的后续注意事项
                4. tags: 对话复盘过程中生成的一些关键词
        `,
        cordon: `
            如果你打卡记录为空或者你无法通过现有的打卡记录进行分析，请依然返回 json 代码块，只是 status 的值为 false，content 的值为：无法根据打卡记录进行复盘。其他字段值为 null
        `
    }
}

// TODO: 每日打卡分析以及相关资讯

// 病情分析
export const defaultCaseAnalizePrompt = async (caseid: string): Promise<PromptT> => {
    const caseInfo = await CaseService.genCaseIntro(caseid)

    return {
        character: '国内顶尖的急诊科门诊医师主任',
        summary: `
            作为一名国内顶尖的急诊科门诊医师主任，你需要快速的对患者的病例进行分析
            1. 如果可以明确判断出患者所患疾病，则给患者提供一些修养建议
            2. 如果不能明确判断，则告诉患者可能的疾病，以及其可能的病因，同事还需要告知患者去进一步筛查的相关流程
        `,
        preface: `
            以下是本次患者提供的描述信息：${caseInfo}。请开始分析
            请注意！你是在和患者面对面交谈，不要以第三人称视角描述；且输出时只需要输出一个 json 代码块即可，包含三个字段：type, advice, diseases, reasons
                1. type: 如果可以明确判断患者所患疾病则值为 0，否则为 1
                2. advice: 如果 type 为 0，则该值为给患者的一些建议，返回一个字符串数组；如果 type 为 1 则该值为 null
                3. diseases: 如果 type 为 1，则该值为患者可能患的疾病，返回一个字符串数组；如果 type 为 0 则该值为 null
                4. reasons：无论 type 为 1 还是 0，该值均为一个字符串数组，对应之前分析出来的疾病，生成对应的病因
        `
    }
}

/** @description 对话结果分析，对话结束用 */
async function getChatRecordReview(prompts: PromptT, res: Response): Promise<RecordReviewT> {
    const response: string = await getAnswer(res, getChatCharacter(prompts))
    
    const { tags, content } = JSON.parse(response.slice(response.indexOf('{'), response.lastIndexOf('}') + 1))

    return { tags: tags.join(','), content }

}

/** @description 计划总览生成 */
async function getChatPlanOverview(planid: string, res?: Response): Promise<OverviewT> {


    // TODO：获取用户的病史加入分析过程
    async function getInfo() {
        const plan = await PlanDao.selectOne({ wrp: { uid: planid } })
            
        if (!plan) throw ErrorCode.NOT_FOUND_PLAN_ERROR

        const planValue = plan.dataValues

        const target = planValue.target
        const cycle = planValue.cycle

        // 明确是康复计划还是养生计划
        let type = planValue.type === 1 ? '养生' : '康复'

        return `此次${type}目标：${target}，期望${type}疗程（周期）：${cycle}`
    }


    const prompts = getChatCharacter({
        character: '康复医疗师',
        summary: `
            作为康复医疗师，你的工作是针对患者的目标，患者会告诉你其想要治疗的周期，以及其想要达到的效果
            你需要根据它的描述为其制定比较符合其期望的计划。
        `,
        preface: `
            以下是本次患者提出的规划期望：${await getInfo()}。请开始分析
            请注意！你是在和患者面对面交谈，不要以第三人称视角描述；且输出时只需要输出一个 json 代码块即可，包含两个字段：title, content
                1. title 为本次计划的主题
                2. content 也是一个 json, 包含三个字段: summary, cycle, detail
                    a. summary: 针对生成计划的一个描述，如果生成的 周期 和患者期望的 周期 不一样需要解释一下原因
                    b. cycle: 疗程（周期）
                    c. detail: 一个数组, 包含大致的治疗阶段（第一个疗程、第二个疗程、第三个疗程……）,数组数据结构为：
                        a. tm: 阶段定义
                        b. plan: 阶段疗程内容（这个疗程要做的事情），值为字符串
        `
    })

    const response = !res ? await getAnswerWithStream(prompts) : await getAnswer(res, prompts)

    const { title, content } = JSON.parse(response.slice(response.indexOf('{'), response.lastIndexOf('}') + 1))

    return { title, content: JSON.stringify(content) }
}

/** @description 每日计划生成 */

/** @description 计划复盘生成 */
async function getPlanReview(prompts: PromptT): Promise<PlanReviewT> {

    const response = await getAnswerWithStream(getChatCharacter(prompts))

    const { status, healthInfo, content, tags } = JSON.parse(response.slice(response.indexOf('{'), response.lastIndexOf('}') + 1))

    return { tags: tags.join(","), content: JSON.stringify({ status, content, healthInfo }) }
}

/** @description 病情分析 */
async function getCaseAnalize(prompts: PromptT): Promise<any> {
    const response = await getAnswerWithStream(getChatCharacter(prompts))

    const { diseases, type, reasons, advice } =  JSON.parse(response.slice(response.indexOf('{'), response.lastIndexOf('}') + 1))

    return {
        type,
        diseases: JSON.stringify(diseases),
        reasons: JSON.stringify(reasons),
        active: JSON.stringify(advice)
    }
}

/** @description 预设 Prompt */
export default {
    getChatCharacter,
    getChatRecordReview,
    getChatPlanOverview,
    getPlanReview,
    getCaseAnalize
}