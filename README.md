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

#### 接入指南

# 演示：https://w.ispay.in/

---

### 订单提交

调用地址：https://pay.ispay.in/gateway

请求方式：POST

返回类型：JSON

| 名称       | 类型    | 是否必须 | 描述                                                       |
| ---------- | :------ | :------- | :--------------------------------------------------------- |
| userid     | int     | 是       | 商户 ID                                                    |
| subject    | string  | 否       | 订单标题                                                   |
| order_no   | string  | 是       | 订单号（唯一）列：20191118123424                           |
| order_type | string  | 是       | 订单类型 支付宝：P901，微信：P902，云闪付：P904            |
| amount     | float64 | 是       | 订单的金额,必须 300.00 保留 2 位小数点                     |
| notify_url | string  | 是       | 订单通知地址                                               |
| return_url | string  | 是       | 订单成功回调地址                                           |
| ip         | string  | 是       | 下单获取的 IP 地址                                         |
| order_time | string  | 否       | 订单新建的时间                                             |
| sign       | string  | 是       | md5(userid+order_no+order_type+amount+return_url+商户密钥) |

返回成功

```

{"success": true, "errorCode": 0, "errorMsg": nil,"order_id": "{订单 ID}"}

```

返回失败

```

{"success": false, "errorCode": 1004, "errorMsg": "订单创建失败!"}

```

---

### 方法一，直接跳转出码页面 html

下单成功后

地址说明： https://pay.ispay.in/transfer/{订单ID}

请求方式：GET，跳转

---

### 方法二，跟踪订单状态 （建议第一种方式）

调用地址：https://pay.ispay.in/query/{订单ID}

请求方式：GET

返回类型：JSON

返回成功

```

{"success": true, "errorCode": 0, "errorMsg": nil,"state":"{订单状态}"}

```

| 订单状态 | 类型 | 状态 | 描述           |
| -------- | :--- | :--- | :------------- |
| state    | int  | 1    | 已接单、未出码 |
| state    | int  | 2    | 已接单、未出码 |
| state    | int  | 5    | 已接单、已出码 |
| state    | int  | 8    | 已付款、待确认 |
| state    | int  | 9    | 已确认完成支付 |

```

{
    "success": true,
    "errorCode": 0,
    "errorMsg": nil,
     "state":   5,       //订单状态
    "order":{
         "qrcode": "https://qr.alipay.com/xxxxxx",                           //二维码地址
         "imgtext": imgtext,                                                 //二维码原始图片base64
         "alipayuid": "",                                                    //阿里USERID
         "amount": 500,                                                      //订单的价格
         "sn":     "424843497502158848",                                     //订单编号
         "timeout": 900，                                                    //订单时间
    }
}

```

返回失败

```

{"success": false, "errorCode": 0, "errorMsg": "订单不存在"}

```

---

### 订单状态为 5，返回订单信息、金额、二维码

请求方式：GET

调用地址：https://pay.ispay.in/qrcode/{订单ID}

请求方式：GET

返回类型：JSON

返回成功

```

{
    "success": true,
    "errorCode": 0,
    "errorMsg": nil,
    "order":{
         "state":   5,                  //订单状态
         "qrcode":  pays.Urls,          //二维码地址
         "imgtext": imgtext,            //二维码原始图片base64
         "amount":  order.Amount,       //订单的价格
         "sn":      order.OrderSN,      //订单编号
         "timeout": order.OrderTimeout, //订单时间
    }
}

```

---

### 订单号查询

请求方式：GET

调用地址：https://pay.ispay.in/order/:{商户ID}/{订单号}/{md5}

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
         "returnURL":     "http://.../return/id",     //是否回调
         "returning":     true,                       //是否回调
         "amount":        2000.00,                     //订单的价格
         "ip":            "127.0.0.1",                   //订单编号
         "paytype":       "P901",                     //支付的类型
         "create_time":   "2019-10-15 17:04:00",       //订单时间
    }
}

```

---

### 回调接口 {return_url}

订单回调地址：return_url

调用地址：{return_url}?order_no={order_no}&amount={amount}&state={state}&sign={sign}

请求方式：GET

签名说明：sign = md5({商户 ID}{订单号}{商户密钥})

返回成功
