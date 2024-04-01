import { NextFunction, Request, Response } from 'express'
import { Controller, Get } from 'mduash/lib/decorators'
import { SuccessRes } from 'mduash'
import { getSTS } from '../../plugin/alioss' // 引入 oss 配置

const prefix = '/oss/v1' // 对象存储服务接口前缀

@Controller(`${prefix}/sts`)
export class CaseInfo {
    // 返回 oss 配置（用于文件上传的权限校验）
    @Get('/')
    async getSts(_: Request, res: Response, next: NextFunction) {
        try {
            const sts = await getSTS()
            res.send(
                SuccessRes({
                    AccessKeyId: sts.AccessKeyId,
                    AccessKeySecret: sts.AccessKeySecret,
                    SecurityToken: sts.SecurityToken,
                    Expiration: sts.Expiration
                })
            )
        } catch (e) {
            console.log(e)
            next(e)
        }
    }
}
