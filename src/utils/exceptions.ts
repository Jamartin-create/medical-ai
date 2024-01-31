import { NextFunction, Request, Response } from 'express'
import { MError, ErrorRes, generatorMError } from 'mduash'
import Log from '../plugin/log'

// 错误码
export const ErrorCode = {
  TEST_ERROR: generatorMError(10001, '测试异常'),
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
    Log.error(err.msg || err.message)
    let e = err instanceof MError ? err : ErrorCode.EXCUTE_ERROR
    res.send(ErrorRes(e))
  }
  next(err)
}
