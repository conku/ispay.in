"use strict";

(function () {
    var demo = function (options) {
        //依赖 jquery
        //     this.options = $.extend({
        //       "x" : "1",
        //       "y" : "2",
        //       "z" : "3"
        //     },options);
        //原生js
        this.options = options;
        this.init();
    };
    demo.prototype.init = function () {
        console.log(
            "x是" + this.options.x + " y是" + this.options.y + " z是" + this.options.z
        );
    };
    demo.prototype.add = function () {
        if (this.options.x != null && this.options.y != null) {
            return Number(this.options.x) + Number(this.options.y);
        } else {
            return "传入格式不规范";
        }
    };
    demo.prototype.addall = function () {
        var res = 0;
        console.log(this.options);
        if (this.options.length > 0) {
            for (var i = 0; i < this.options.length; i++) {
                res = res + this.options[i];
            }
        } else {
            res = "传入数据不是数组";
        }
        return res;
    };
    window.demo = demo;
})();