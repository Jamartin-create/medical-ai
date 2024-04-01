import { guid } from 'mduash'

// 为某个表添加数据的时候填充 uid（就不用在业务代码里手动填充了）
export function beforeCreateOne(data: any) {
    return {
        ...data,
        uid: guid()
    }
}

// 数据库编辑数据的时候限制其不能更改某些字段的数据（比如创建时间/更新时间）
export function beforeUpdateOne(data: any) {
    delete data.updateAt
    delete data.createAt
    return data
}
