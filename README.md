# ispay.in（就付）
INPAY.IN（就付）数字货币收款支付系统
支持微信、支付宝个码 资金直接到达本人账号 
支持 支付宝 微信 QQ 云闪付 
无需备案 
无需签约 
无需挂机监控APP 
无需插件 
无需第三方支付SDK 
无需营业执照身份证 
只需收款码 
搞定支付流程 现已支持移动端支付 
演示：https://w.ispay.in/

#### 接入指南
调用地址：https://pay.ispay.in/gateway 

请求方式：POST

返回类型：JSON

名称|类型|是否必须|描述
--|:--|:--|:--
userid|int|是|商户ID
subject|string|否|订单标题
order_no|string|是|订单号（唯一）列：20191118123424
order_type|string|是|订单类型 支付宝：901，微信：902
amount|float64|是|订单的金额
ip|string|是|下单获取的IP地址
notify_url|string|是|订单通知地址
return_url|string|是|订单成功回调地址
ip|string|是|下单获取的IP地址
order_time|string|是|订单新建的时间
sign|string|是|下单获取的IP地址md5(md5(order_no+order_time)+商户签名)

