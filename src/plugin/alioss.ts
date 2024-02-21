import OSS, { STS } from "ali-oss";

// 获取签名信息
export async function getSTS(): Promise<OSS.Credentials> {
    const sts = new STS({
        // 填写步骤1创建的RAM用户AccessKey。
        accessKeyId: 'LTAI5tHeLzNnEdLaz2ahR484',
        accessKeySecret: 'VezrN7sKgKqlYzVYoRN7wUeScPOn7o'
    });

    // roleArn填写步骤2获取的角色ARN，例如acs:ram::175708322470****:role/ramtest。
    // policy填写自定义权限策略，用于进一步限制STS临时访问凭证的权限。如果不指定Policy，则返回的STS临时访问凭证默认拥有指定角色的所有权限。
    // 临时访问凭证最后获得的权限是步骤4设置的角色权限和该Policy设置权限的交集。
    // expiration用于设置临时访问凭证有效时间单位为秒，最小值为900，最大值以当前角色设定的最大会话时间为准。本示例指定有效时间为3000秒。
    // sessionName用于自定义角色会话名称，用来区分不同的令牌，例如填写为sessiontest。

    const result = await sts.assumeRole('acs:ram::1178733171755919:role/ramossmedical', ``, 3000, 'sessiontest')
    return result.credentials
}