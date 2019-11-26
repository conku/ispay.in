"use strict";
(function () {

    var canvas = function (options) {
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

    canvas.prototype.init = function () {
        console.log("x是" + this.options.x + " y是" + this.options.y + " z是" + this.options.z);
    };

    canvas.prototype.add = function () {
        if (this.options.x != null && this.options.y != null) {
            return Number(this.options.x) + Number(this.options.y);
        } else {
            return "传入格式不规范";
        }
    };

    var canvas_2 = document.querySelector('#percent_canvas');
    var ctx_2 = canvas_2.getContext('2d');

})();