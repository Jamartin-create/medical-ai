import { Sequelize } from 'sequelize'
import type { ModelAttributes, InitOptions, Transaction } from 'sequelize'
import config from '../config'
import Log from './log'

const { mysql } = config

// 创建数据库链接实例
export const sequelize: Sequelize = new Sequelize(mysql)

// 建立连接
export async function connect() {
  try {
    await sequelize.authenticate()
    Log.success('MySQL connect Success !')
  } catch (e: any) {
    Log.error('Unable to connect MySQL! reason:' + e.toString())
  }
}

/**
 * @description 模型工厂
 * @param {string} tableName 表明
 * @param {ModelAttributes} columns 字段配置
 * @param {InitOptions} options 其他配置
 * @returns {import("sequelize").ModelCtor<Model<any, any>>}
 */
export function initModel(
  tableName: string,
  columns: ModelAttributes,
  options?: InitOptions
) {
  const model = sequelize.define(tableName, columns, {
    timestamps: false,
    tableName,
    ...options
  })
  // 新增的数据自动填充 createAt 和 updateAt
  model.beforeCreate((model: any) => {
    model.createAt = new Date()
    model.updateAt = new Date()
  })
  // 更新数据时自动填充 updateAt
  model.beforeUpdate((model: any) => {
    model.updateAt = new Date()
  })
  return model
}

/**
 * @description 开启事务，执行 DML 操作
 * @param {Function} callback 回调函数
 */
export async function transactionAction(
  callback: (tran: Transaction) => any | void
) {
  const tran = await sequelize.transaction() // 开启事务
  try {
    const res = await callback(tran) // 将事务实例通过回调的方式回传
    await tran.commit() // 数据操作没问题，提交事务
    return res
  } catch (e) {
    tran.rollback() // 异常捕获，回滚事务
    Log.error(`sequelize: ${e}`) // 打印日志
    throw e
  }
}
