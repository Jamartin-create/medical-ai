import chalk from 'chalk'

type T_LogType = 'info' | 'error' | 'success'

type T_LogMethod = {
    [key in T_LogType]: (message: string) => void
}

const LOG_MAP: { [key in T_LogType]: string } = {
    info: chalk.bold.bgBlue.cyan(' INFO '),
    error: chalk.bold.bgRed.red.dim(' ERROR '),
    success: chalk.bold.bgGreen.green.dim(' SUCCESS ')
}

// 打印日志核心方法
function doLog(type: T_LogType, message: string) {
    console.log(getTime() + ' ' + LOG_MAP[type] + ' ' + message)
}

// 获取时间
function getTime(): string {
    const now = new Date()
    const time: number[] = [now.getHours(), now.getMinutes(), now.getSeconds()]
    return time
        .map(item => {
            if (item < 10) return '0' + item
            return item
        })
        .join(':')
}

const Log: T_LogMethod = {
    info: (message: string) => doLog('info', message),
    error: (message: string) => doLog('error', message),
    success: (message: string) => doLog('success', message)
}

export default Log
