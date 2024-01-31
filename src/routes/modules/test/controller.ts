import { Request, Response } from 'express'
import { Get, Controller, Post } from 'mduash/lib/decorators'

@Controller('/test')
export default class Test {
  @Get('/v1/nihao')
  getTest(req: Request, res: Response) {
    res.send(req.query)
  }
  @Post('/v1/buhao')
  postTest(req: Request, res: Response) {
    res.send(req.body)
  }
}
