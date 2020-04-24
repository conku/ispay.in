# ispay.in（就付）

INPAY.IN（就付）数字货币收款支付系统
支持微信、支付宝个码 资金直接到达本人账号
支持 支付宝 微信 QQ 云闪付
无需备案
无需签约
无需挂机监控 APP
无需插件
无需第三方支付 SDK
无需营业执照身份证
只需收款码
搞定支付流程 现已支持移动端支付

---

### 订单提交

调用地址：https://pay.ispay.in/gateway

调用地址：https://payment.ispay.in/v2/gateway

请求方式：POST

| 名称       | 类型    | 是否必须 | 描述                                                       |
| ---------- | :------ | :------- | :--------------------------------------------------------- |
| userid     | int     | 是       | 商户 ID                                                    |
| subject    | string  | 否       | 订单标题                                                   |
| order_sn   | string  | 是       | 订单号（唯一）列：20191118123424                           |
| order_type | string  | 是       | 订单类型 支付宝：P909，微信：P902，云闪付：P904            |
| amount     | float64 | 是       | 订单的金额,必须 300.00 保留 2 位小数点                     |
| notify_url | string  | 是       | 订单成功回调地址                                           |
| return_url | string  | 是       | 订单成功返回地址                                           |



### 订单号查询

请求方式：GET

调用地址：https://payment.ispay.in/order/{商户ID}/{订单号}/{md5}

请求方式：GET

返回类型：JSON

签名说明：md5({商户 ID}{订单号}{商户签名})

返回成功

```

{
    "success": true,
    "errorCode": 0,
    "errorMsg": nil,
    "order":{
         "sn":             "20191118123424",               //订单编号
         "state":         5,                          //订单状态
         "qrcode":        "",                         //二维码地址
         "imgtext":       "",                         //二维码原始图片base64
         "notifyurl":     "http://.../notifyurl/id",   //回调地址
         "returnurl":     "http://.../return/id",     //返回地址
         "returning":     true,                       //是否回调
         "amount":        2000.00,                     //订单的价格
         "ip":            "127.0.0.1",                   //订单编号
         "paytype":       "P901",                     //支付的类型
         "create_time":   "2019-10-15 17:04:00",       //订单时间
    }
}

```

---

### 回调通知接口 

订单回调通知地址： notify_url

请求方式：POST

签名说明：

| 名称       | 类型    | 是否必须 | 描述                                                       |
| ---------- | :------ | :------- | :--------------------------------------------------------- |
| order_no   | string  | 是       | 订单号（唯一）列：20191118123424                     |
| amount     | string  | 否       | 价格                                                |
| state      | int     | 是       | 订单状态 9 为支付成功                           |
| callbacks  | string  | 是       | 时间搓                                       |
| sign       | string  | 是       | 签名                                   |


返回 TXT 成功

```

success

```

```

fail

```

---

### 签名说明

第一步，设所有发送或者接收到的数据为集合M，将集合M内非空参数值的参数按照参数名ASCII码从小到大排序（字典序），使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串stringA

特别注意以下重要规则：
1、参数名ASCII码从小到大排序（字典序）
2、参数名区分大小写
3、如果参数的值为空也参与签名

第二步，在stringA最后拼接上
$stringSignTemp = $stringA ."&key=192006250b4c09247ec02edce69f6a2d"; // 拼接商户密钥
$sign = md5($stringSignTemp); // md5加密

