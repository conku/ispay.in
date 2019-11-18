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
演示：https://w.ispay.in/

#### 接入指南

# 调用地址：https://pay.ispay.in/gateway

###### 订单提交

调用地址：https://pay.ispay.in/gateway

请求方式：POST

返回类型：JSON

| 名称       | 类型    | 是否必须 | 描述                                                      |
| ---------- | :------ | :------- | :-------------------------------------------------------- |
| userid     | int     | 是       | 商户 ID                                                   |
| subject    | string  | 否       | 订单标题                                                  |
| order_no   | string  | 是       | 订单号（唯一）列：20191118123424                          |
| order_type | string  | 是       | 订单类型 支付宝：901，微信：902                           |
| amount     | float64 | 是       | 订单的金额                                                |
| notify_url | string  | 是       | 订单通知地址                                              |
| return_url | string  | 是       | 订单成功回调地址                                          |
| ip         | string  | 是       | 下单获取的 IP 地址                                        |
| order_time | string  | 是       | 订单新建的时间                                            |
| sign       | string  | 是       | 下单获取的 IP 地址 md5(md5(order_no+order_time)+商户签名) |

返回成功

```

{"success": true, "errorCode": 0, "errorMsg": nil,"order_id": "{订单 ID}"}

```

返回失败

```

{"success": false, "errorCode": 1004, "errorMsg": "订单创建失败!"}

```

###### 调用出码

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

返回失败

```

{"success": false, "errorCode": 0, "errorMsg": "订单不存在"}

```
