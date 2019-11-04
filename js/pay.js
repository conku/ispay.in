$(document).ready(function(){

    if ($.cookie('tradeno')==null && $.cookie('num')<=1){
        var date = new Date();
        date.setTime(date.getTime()+300*1000);
        $.cookie('tradeno', getParm('tradeno'), {expires: date,path: '/'});
        $.cookie('qrurls', getParm('qrurls'), {expires: date,path: '/' });
        $.cookie('amount', getParm('amount'), {expires: date,path: '/'});
        $.cookie('qramount', getParm('qramount'), {expires: date,path: '/'});
        $.cookie('tradetype', getParm('tradetype'), {expires: date,path: '/'});
        $.cookie('num',2, {expires: 1, path: '/'});
    }

//    console.log(getParm('qrurls'));
//    console.log(decodeURIComponent(getParm('qrurls')));

    $("#qrcodeimg").attr("src",decodeURIComponent(getParm('qrurls')));
    $("#trade_no").html("<h4>"+getParm('tradeno')+"</h4>");
    
    var money1 = getParm('amount');
    var money2 = getParm('qramount');
    var userid = getParm('userid');
    
    if (Number(money1)!=Number(money2)){
        var money3 = Number(money1)- Number(money2);
        $("#money1").html("￥"+Number(money2).toFixed(2));
        $("#money2").html("(减免￥"+Number(money3).toFixed(2)+")");
    }else{
        $("#money1").html("￥"+Number(money1).toFixed(2));
    }
  // 判断移动设备
    function isMobile() {
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            return 1;
        }
        return 0;
    }

    function isWeixin() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return 1;
        }
        return 0;
    }

    // 判断是否安卓QQ浏览器
    function isQQAndroid() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/QQ/i) == 'qq'&&ua.match(/Android/i) == 'android') {
            return 1;
        }
        return 0;
    }

    function getParm(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]); return null;
    }

    if(isMobile()&&!isWeixin()&&!isQQAndroid()){
        // 手机端且不是微信浏览器且不是安卓QQ时支持一键打开支付宝
        $("#qrother").hide();
        $("#qrmobile").show();
        $("#startApp").show();
    }else{
        $("#qrother").show();
        $("#qrmobile").hide();
        $("#startApp").hide();
    }

    // 倒计时
    var count = 300;
    function countDown() {
        if (count == 0) {
            
            return;
        } else {
            count--;
        }
        setTimeout(function () {
            countDown();
        }, 1000);
    }

    function countTime() {
        var time = $.cookie('time');
        if (time <= 0) {
            $(".timeout").show();
            $("#time-box").hide();
            count=10000;
            return;
        } else {
            time--;
            showTime(time);
            $.cookie('time', time, {path: '/'});
        }
        setTimeout(function () {
            countTime();
        }, 1000);
    }

    function showTime(v) {
        if(v==null||v==""){ return "";
        }
        var m=0,s=0;
        if(v>=60){
            m=Math.floor(v/60);
            s=v%60;
        }else{
            s=v;
        }

        if (m >= 0 && m <= 9) {
            m = "0" + m;
        }
        if (s >= 0 && s <= 9) {
            s = "0" + s;
        }
        $("#time-box").html("请于 "+ m + " 分 " + s + " 秒 内支付");
    }

    function judgeState() {
        $.ajax({
            url:"/pay/query/"+ getParm('tradeno'),
            type: 'GET',
            success:function (data) {
                    if(data.success){
                        $('#myModal').modal('show');
                        $('#myModal .modal-body').text("恭喜您已成功支付 "+Number(data.qramount).toFixed(2)+" 元，请查收通知邮件，若长时间未收到请检查垃圾邮件或进行反馈！");
                        $.cookie('time',0, {path: '/'});
                        $.cookie('num',null, {expires: -1, path: '/'});
                    }else{

                        if (data.unix>0){
                            showTime(data.unix);
                            $.cookie('time', data.unix, {path: '/'});

                            setTimeout(function () {
                                judgeState();
                            }, 5000);
                        }else{
                            $('#myModal').modal('show');
                            $('#myModal .modal-body').text("该订单未完成支付,已经过期！");
                            $('#myModal').on('hide.bs.modal', function (e) {
                                window.location.href = "/u/"+userid;
                            });
                        }
                    }
            }
        });
    }

    countDown();
    countTime();
    judgeState();
});