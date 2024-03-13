import { NextFunction, Request, Response } from 'express'
import { MError, ErrorRes, generatorMError } from 'mduash'
import Log from '../plugin/log'

// 错误码
export const ErrorCode = {
    TEST_ERROR: generatorMError(10001, '测试异常'),
    AUTH_TOKEN_ERROR: generatorMError(20001, '无权限：Token 失效'),
    AUTH_PWD_ERROR: generatorMError(20002, '密码错误'),
    PARAMS_MISS_ERROR: generatorMError(30001, '参数缺失'),
    PARAMS_MISS_PAGE_ERROR: generatorMError(30002, '分页参数缺失'),
    PARAMS_NOT_CORRECT_ERROR: generatorMError(30003, '参数错误'),
    NOT_FOUND_CASE_ERROR: generatorMError(31001, '未找到病例'),
    NOT_FOUND_CHAT_ERROR: generatorMError(31002, '未找到对话'),
    NOT_FOUND_PLAN_ERROR: generatorMError(31003, '未找到计划'),
    NOT_FOUND_USER_ERROR: generatorMError(31004, '未找到用户'),
    NOT_FOUND_PLAN_RECORD_ERROR: generatorMError(30005, '未找到打卡记录'),
    NOT_FOUND_PLAN_OVERVIEW_ERROR: generatorMError(30005, '未找到计划大纲'),
    AI_GEN_ERROR: generatorMError(40001, '助手分析失败'),
    AI_GEN_RECORD_REVIEW_ERROR: generatorMError(40002, '生成对话总结失败'),
    NETWORK_ERROR: generatorMError(90001, '网络错误'),
    CONFIG_OSS_MISS_ERROR: generatorMError(90002, 'oss 配置文件缺失'),
    EXCUTE_ERROR: generatorMError(99999, '执行异常')
}

/**
 * @description 异常捕获，链式调用结尾
 */
export function catchException(
    err: MError,
    _: Request,
    res: Response,
    next: NextFunction
) {
    if (err) {
        if (err.name === 'UnauthorizedError') {
            res.send(ErrorRes(ErrorCode.AUTH_TOKEN_ERROR))
            return
        }
        Log.error(err.msg || err.message)
        let e = err instanceof MError ? err : ErrorCode.EXCUTE_ERROR
        res.send(ErrorRes(e))
    }
    next(err)
}
