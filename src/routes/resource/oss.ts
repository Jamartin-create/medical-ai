import { NextFunction, Request, Response } from 'express'
import { Controller, Get } from 'mduash/lib/decorators'
import { SuccessRes } from 'mduash'
import { getSTS } from '../../plugin/alioss'

const prefix = '/oss/v1'

@Controller(`${prefix}/sts`)
export class CaseInfo {

    @Get('/')
    async getSts(_: Request, res: Response, next: NextFunction) {
        try {
            const sts = await getSTS()
            res.send(SuccessRes({
                AccessKeyId: sts.AccessKeyId,
                AccessKeySecret: sts.AccessKeySecret,
                SecurityToken: sts.SecurityToken,
                Expiration: sts.Expiration
            }));
        } catch (e) {
            console.log(e);
            next(e)
        }
    }
}