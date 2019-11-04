package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"rowei/ispay/common/config"
	"rowei/ispay/common/models/trades"
	"rowei/ispay/common/utils"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	sessions "github.com/kataras/go-sessions"
)

type businessModel struct {
	Name string
}

var (
	sess = sessions.New(sessions.Config{
		// Cookie string, the session's client cookie name, for example: "mysessionid"
		// Defaults to "gosessionid"
		Cookie: "paysessionid",
		// it's time.Duration, from the time cookie is created, how long it can be alive?
		// 0 means no expire.
		// -1 means expire when browser closes
		// or set a value, like 2 hours:
		Expires: time.Minute * 5,
		// if you want to invalid cookies on different subdomains
		// of the same host, then enable it
		DisableSubdomainPersistence: false,
		// want to be crazy safe? Take a look at the "securecookie" example folder.
	})
)

func ux16(str string) {

	//l1 := len([]rune(str))

	//var i int = 99

}

func main() {
	r := gin.Default()

	if !config.Config.DB.Debug {
		gin.SetMode(gin.ReleaseMode)
	}

	r.LoadHTMLGlob("templates/*")
	r.Static("/js", "./js")
	r.Static("/qrcode", "./qrcode")
	r.Static("/css", "./css")
	r.Static("/img", "./img")

	// router.GET("/payindex/:userid", func(c *gin.Context) {
	// 	encoded := c.Param("userid")
	// 	c.HTML(http.StatusOK, "pay.html", gin.H{
	// 		"userid": encoded,
	// 	})
	// })

	r.GET("/u/:userid", func(c *gin.Context) {
		encoded := c.Param("userid")

		// decoded, err := base64.URLEncoding.DecodeString(encoded)
		// decodestr := string(decoded)

		// if err != nil {
		// 	c.String(200, "format", decodestr)
		// }

		c.HTML(http.StatusOK, "index.html", gin.H{
			"userid": encoded,
		})
	})

	r.GET("/pos/:id", func(c *gin.Context) {
		sid := c.Param("id")
		var erweima string
		flag, trade := trades.QueryTradeno(sid)
		if flag {
			erweima = trade.Url
		}
		s := sess.Start(c.Writer, c.Request)
		s.Set(sid, "true")
		// decoded, err := base64.URLEncoding.DecodeString(encoded)
		// decodestr := string(decoded)

		// if err != nil {
		// 	c.String(200, "format", decodestr)
		// }

		c.HTML(http.StatusOK, "pos.html", gin.H{
			"erweima": erweima,
		})
	})

	r.GET("/902", func(c *gin.Context) {
		//page := c.Param("page")
		//set session values.
		// s := sess.Start(c.Writer, c.Request)
		// s.Set("name", "iris")

		fmt.Println(utils.GetRemoteIP(c.Request))
		c.HTML(http.StatusOK, "902.html", gin.H{})
	})

	r.GET("/loading", func(c *gin.Context) {
		c.HTML(http.StatusOK, "loading.html", gin.H{})
	})

	// router.GET("/pay/bestpay", func(c *gin.Context) {
	// 	c.HTML(http.StatusOK, "bestpay.html", gin.H{})
	// })

	r.GET("/pay/query/:trade_no", func(c *gin.Context) {
		trade_no := c.Param("trade_no")

		flag, trade := trades.QueryTradeno(trade_no)

		if flag {
			if trade.GetState() == "Shipped" {
				c.JSON(200, gin.H{
					"success":  true,
					"qramount": trade.QrcodeAmount,
					"errorMsg": nil,
				})
			} else {
				a := trade.CreatedAt.Unix()
				b := time.Now().Unix()
				unix := 300 - (b - a)
				c.JSON(200, gin.H{
					"success":  false,
					"status":   trade.GetState(),
					"unix":     unix,
					"errorMsg": nil,
				})
			}

		} else {
			c.JSON(200, gin.H{
				"success":  false,
				"errorMsg": "该订单不存在",
				"trade_no": trade_no,
			})
		}

	})

	r.POST("/pay/qrcode", gateway)
	// code, _ := qrcode.Encode("http://www.google.com", qrcode.Medium, 256)
	// ddd := base64.StdEncoding.EncodeToString(code)
	// fmt.Println(ddd)

	r.Run(fmt.Sprintf(":%d", config.Config.Port))
}

type refjson struct {
	Success   bool   `json:"success"`
	ErrorCode int    `json:"errorCode"`
	ErrorMsg  string `json:"errorMsg"`
	Orderid   uint   `json:"order_id"`
}

func gateway(c *gin.Context) {

	userid := c.PostForm("userid")
	order_type := c.PostForm("order_type")
	subject := c.PostForm("subject")
	return_url := c.PostForm("return_url")
	ip := c.ClientIP()

	//userided, err := base64.URLEncoding.DecodeString(userid)
	var sign string

	s := strings.Split(config.Config.Signs, ",")
	for i := 0; i < len(s); i++ {
		if userid == s[i] {
			sign = s[i+1]
		}
	}

	amount, err := strconv.ParseInt(c.PostForm("amount"), 10, 64)
	if err != nil {
		c.JSON(200, gin.H{
			"success":  false,
			"errorMsg": "充值的金额错误!",
		})
		return
	}

	order_no := time.Now().Format("20060102150405")

	urls := config.Config.Domain + "gateway"

	var r http.Request
	r.ParseForm()

	r.Form.Add("order_no", order_no)
	r.Form.Add("userid", userid)
	r.Form.Add("subject", subject)
	r.Form.Add("order_type", order_type)
	r.Form.Add("amount", utils.FormatPrice(amount))
	r.Form.Add("return_url", return_url)
	r.Form.Add("ip", ip)
	r.Form.Add("sign", utils.MD5(utils.MD5(order_no+utils.FormatPrice(amount))+sign))

	bodystr := strings.TrimSpace(r.Form.Encode())
	body2, err := utils.GetPost(urls, bodystr)

	if err != nil {
		c.JSON(200, gin.H{
			"success":   false,
			"errorCode": 1010,
			"errorMsg":  fmt.Sprint("Error:", err.Error()),
		})
		return
	}

	var ref refjson

	//fmt.Println(body2)
	if err := json.Unmarshal(body2, &ref); err == nil {

		if ref.ErrorCode != 0 {
			c.JSON(200, gin.H{
				"success":   false,
				"errorCode": ref.ErrorCode,
				"errorMsg":  ref.ErrorMsg,
			})
		} else {

			// decodeurl := url.QueryEscape(ref.Qrurls)

			c.JSON(200, gin.H{
				"success":   true,
				"errorCode": ref.ErrorCode,
				"errorMsg":  ref.ErrorMsg,
				"order_id":  ref.Orderid,
			})
		}
	} else {
		c.JSON(200, gin.H{
			"success":   false,
			"errorCode": "0000",
			"errorMsg":  "解析Json数据失败:" + err.Error(),
		})
	}

}
