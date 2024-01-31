import JWT from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import config from '../config'

const { jwt } = config

// 生成 token
function sign(data: any, options: JWT.SignOptions): string {
  return JWT.sign(data, jwt.salt!, { expiresIn: jwt.expiresIn, ...options })
}

// 校验 token
function verify(token: string): string | boolean | JWT.Jwt | JWT.JwtPayload {
  try {
    return JWT.verify(token, jwt.salt!)
  } catch (e) {
    return false
  }
}

// middle 中间件
const midwareExpressJwt = expressjwt({
  secret: jwt.salt!,
  requestProperty: 'auth',
  algorithms: ['HS256']
}).unless({ path: jwt.passurl })

export default {
  sign,
  verify,
  midwareExpressJwt
}
