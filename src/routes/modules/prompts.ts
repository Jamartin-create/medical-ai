/** @description 生成提示词脚本（🌟🌟🌟🌟🌟） */

import { Response } from 'express'
import { MessageT, getAnswer, getAnswerWithStream } from '../../utils/aiModel' // 引入核心文件
import UserService from './user/service'
import { ErrorCode } from '../../utils/exceptions'
import { PlanDao, PlanOverviewDao, PlanRecordDao } from './plan/service'
import { CaseDao } from './case/service'
import { Op } from 'sequelize'

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
    character: string // 人设
    summary: string // 描述
    preface?: string // 前言
    cordon?: string // 警戒线
}

// 生成针对特定病人的身体情况而定的医生人设 prompts
export const defaultPrompts = async (uid: string): Promise<PromptT> => {
    // 获取用户信息（chat 时就可以提到）
    const info = await UserService.getUserHealth(uid)
    if (!info) throw ErrorCode.NOT_FOUND_USER_ERROR

    // 返回提示词
    return {
        character: '门诊医生',
        summary: `
            您需要回答前来看病的病人的问题，他的问题可能是资讯自己可能患的疾病，也有可能是询问一些已确诊的疾病的治疗方案。
            如果是第一种：您需要根据病人对病情的描述判断病人可能患上的疾病。
            如果是第二种：您需要想出创造性的治疗方法来治疗疾病，并且您应该能够推荐常规药物、草药和其他天然替代品，在提供建议时，您还需要考虑患者的年龄、生活方式和病史。
            如果是其他情况：你就自由发挥。
        `,
        preface: `本次来咨询的病人信息如下: ${info}。在接下来的对话中它将向你咨询一些关于他身体健康的情况。`,
        cordon: `
            如果在后续的对话中我询问了不属于医学范畴的问题，请回避一下。
            如果你准备好了请回答：我是你的健康小助手，有什么需要帮助的～
        `
    }
}

/** @description 计划总览生成 */
async function getChatPlanOverview(
    planid: string,
    res?: Response
): Promise<string> {
    // 获取有用信息
    async function getInfo() {
        // 获取计划
        const plan = await PlanDao.selectOne({ wrp: { uid: planid } })
        if (!plan) throw ErrorCode.NOT_FOUND_PLAN_ERROR
        const planValue = plan.dataValues

        // 获取用户目标和期望治疗周期
        const target = planValue.target
        const cycle = planValue.cycle

        // 明确是康复计划还是养生计划
        let type = planValue.type === 1 ? '养生' : '康复'

        return `此次${type}目标：${target}，期望${type}疗程（周期）：${cycle}`
    }

    // 获取提示词
    const prompts = getChatCharacter({
        character: '康复医疗师',
        summary: `
            作为康复医疗师，你的工作是针对患者的目标，患者会告诉你其想要治疗的周期，以及其想要达到的效果
            你需要根据它的描述为其制定比较符合其期望的计划。
        `,
        preface: `
            以下是本次患者提出的规划期望：${await getInfo()}。
            请注意！你是在和患者面对面交谈，不要以第三人称视角描述，报告需要有包含以下几点：
            1. 针对生成计划的一个描述
            2. 大致治疗周期（如果你预估的周期和患者期望的周期不一样需要解释一下原因，如果和患者描述一样，就不用解释直接输出周数即可）
            3. 计划内容（阶段治疗目标和治疗内容，以及我具体需要实施的一些计划，例如饮食、睡眠、用药等）
            请直接生成计划，计划格式就是描述、周期、计划内容三个字段，不要有其他回答。（要 Markdown 语法）
        `
    })

    // 开始分析（问 ChatGPT/文心一言）
    const response = !res
        ? await getAnswerWithStream(prompts)
        : await getAnswer(res, prompts)

    return response
}

/** @description 每日计划生成 */
async function getDailyRecordAnalize(
    recordid: string,
    res?: Response
): Promise<string> {
    // 拼接有用信息
    function getRecordInfo(record: any) {
        return `三餐：${record.diet}；睡眠：${record.sleep}；用药：${record.medical}；其他：${record.other}`
    }

    // 获取本次打卡记录
    const record = await PlanRecordDao.selectOne({ wrp: { uid: recordid } })
    if (!record) throw ErrorCode.NOT_FOUND_PLAN_RECORD_ERROR // 没查到就报错
    // 获取计划大纲（AI 分析会用到）
    const overview = await PlanOverviewDao.selectOne({
        wrp: { planid: record.dataValues.planid }
    })
    if (!overview) throw ErrorCode.NOT_FOUND_PLAN_OVERVIEW_ERROR // 没查到就报错

    // 获取本计划的历史打卡记录
    const records = await PlanRecordDao.selectList({
        wrp: {
            [Op.and]: [
                { planid: record.dataValues.planid },
                {
                    uid: {
                        [Op.ne]: recordid
                    }
                }
            ]
        }
    })

    // 有用信息拼接
    const hisRecords = records
        .map(item => {
            return `
            日期：${item.dataValues.createdAt}；打卡记录：${getRecordInfo(item.dataValues)}
        `
        })
        .join('\n')

    // 生成提示词
    const prompts = getChatCharacter({
        character: '康复医疗师',
        summary: `
            在此次之前你给我制定了一系列的计划，我正按照你制定的计划进行每日打卡
            你需要根据我的历史打卡，和本次打卡内容，再结合你给我制定的计划，对我的打卡做出评价
            评价内容可以随意发挥，并在结尾讲一些鼓励的话语
            
        `,
        preface: `
            这些是我本次打卡记录：${getRecordInfo(record.dataValues)}。
            这些是我历史打卡记录列表：${hisRecords}。
            这些是你之前为我制定的计划大纲：${overview.dataValues.content}。
            请开始分析
        `
    })

    // 开始分析（根据需要，选择是否是流式返回）
    const result = !res
        ? await getAnswerWithStream(prompts)
        : await getAnswer(res, prompts)

    return result
}

/** @description 病情分析 */
async function getCaseAnalize(caseid: string, res?: Response): Promise<string> {
    // 获取有用信息
    async function getInfo() {
        // 获取健康档案
        const cs = await CaseDao.selectOne({ wrp: { uid: caseid } })
        if (!cs) throw ErrorCode.NOT_FOUND_CASE_ERROR // 没查到就报错
        const { dataValues } = cs
        const curSit = dataValues.curSituation
        return `
            症状描述：
                ${dataValues.summary}
            用药史：${dataValues.medical}
            病史：${dataValues.mdHistory}
            当前身体自我感觉情况：${curSit === 0 ? '差' : curSit === 1 ? '一般' : '好'}
        `
    }

    // 生成提示词
    const prompts = getChatCharacter({
        character: '医疗AI知识库',
        summary: `
            我将告诉你一些关于我的基本情况和现在的一些症状，你需要对我的健康状况进行分析，
            如果能大致判断出患者所患疾病，则告知我其可能患有的疾病，同时给我一些诊疗建议，建议包括但不限于用药、作息、饮食……
            如果不能判断出我所患疾病，则告知我应该进行哪些检查，进一步筛查所患疾病
        `,
        preface: `
            以下是我的一些基本情况：${await getInfo()}。
            请直接输出分析结果，不要有其他输出。
        `
    })

    // 开始分析
    const response = !res
        ? await getAnswerWithStream(prompts)
        : await getAnswer(res, prompts)
    return response
}

// 根据某段文本生成标题
export async function getTitle(
    content: string,
    type: string,
    count: number = 10
): Promise<any> {
    const title = await getAnswerWithStream([
        {
            role: 'user',
            content: `
                请帮我针对以下内容生成一个${count}个字以内的${type}标题，${content}；
                请注意，只生成标题的内容，不是键值对，也不要有其他输出
            `
        }
    ])
    // 把多余的部分去掉
    return title.replace('标题：', '')
}

// 根据某段文本提取关键词
export async function getKeywords(content: string): Promise<string> {
    const keywords = await getAnswerWithStream([
        {
            role: 'user',
            content: `
                请帮我在如下内容中提取出一个与疾病相关的关键字：${content}。
                请注意，只生成关键词的内容，不是键值对，也不要有其他输出
            `
        }
    ])

    return keywords.replace('关键词：', '')
}

export default {
    getChatCharacter,
    getChatPlanOverview,
    getCaseAnalize,
    getDailyRecordAnalize
}
