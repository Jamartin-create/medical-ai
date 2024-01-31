import { guid } from 'mduash'
import { Test } from '../../../common/Entity'
import { transactionAction } from '../../../plugin/sequelize'
import { Transaction } from 'sequelize'

// 新增
export async function saveTest(name: string, age: number) {
  await transactionAction(async (tran: Transaction) => {
    await Test.create(
      {
        id: guid(),
        name,
        age
      },
      { transaction: tran }
    )
  })
}

// 其他……
