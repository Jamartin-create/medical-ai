import crypto from 'crypto'
import { ErrorCode } from './exceptions'

/**
 * @param {String} pwd 要加密的明文
 * @returns
 */
export function md5Pwd(pwd: string) {
  return crypto.createHash('md5').update(pwd).digest('hex')
}

/**
 * @description 判断参数是否为空
 */
export function ie(value: any) {
  if(value === null || value === undefined) return true
  const type = typeof value

  switch (type) {
    case 'string':
      return value.trim() === ''; // 判断字符串是否为空
    case 'number':
      return false; // 数字不为空
    case 'object':
      if (Array.isArray(value)) {
        return value.length === 0; // 判断数组是否为空
      } else {
        return Object.keys(value).length === 0; // 判断对象是否为空
      }
    default:
      return false; // 其他类型不为空
  }
}

/**
 * @description 获取分页参数
 */
export function getPageParams(params: any) {
  const { pageIndex, pageSize } = params
  if (ie(pageIndex) || ie(pageSize)) throw ErrorCode.PARAMS_MISS_PAGE_ERROR
  const limit = parseInt(pageSize)
  const offset = parseInt(pageIndex) 

  // 获取分页返回值
  function getPageResult(list: any[], total: number) {
    const pageCount = Math.ceil(total / limit)
    const hasNext = offset + 1 < pageCount
    const hasPrevious = offset > 0
    return { list, total, pageCount, hasNext, hasPrevious }
  }

  return {
    order: { limit, offset: offset * limit },
    limit,
    offset,
    getPageResult
  }
}