import { guid } from "mduash"

// 编辑之前补充一些字段
export function beforeCreateOne(data: any) {
    return {
        ...data,
        uid: guid()
    }
}

// 去掉部分不可编辑的字段
export function beforeUpdateOne(data: any) {
    delete data.updateAt
    delete data.createAt
    return data
}