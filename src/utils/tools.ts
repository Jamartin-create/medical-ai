import crypto from 'crypto'

/**
 * @param {String} pwd 要加密的明文
 * @returns
 */
export function md5Pwd(pwd: string) {
    return crypto.createHash('md5').update(pwd).digest('hex')
  }