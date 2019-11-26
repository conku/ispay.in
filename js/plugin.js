// plugin.js
;
(function (undefined) { //防止出现undefined问题
    "use strict"
    var _global;

    // 工具函数
    // 对象合并
    function extend(o, n, override) {
        for (var key in n) {
            if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
                o[key] = n[key];
            }
        }
        return o;
    }
    // 自定义模板引擎
    function templateEngine(html, data) {
        var re = /<%([^%>]+)?%>/g,
            reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
            code = 'var r=[];\n',
            cursor = 0;
        var match;
        var add = function (line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        }
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code += 'return r.join("");';
        return new Function(code.replace(/[\r\t\n]/g, '')).apply(data);
    }
    // 通过class查找dom
    if (!('getElementsByClass' in HTMLElement)) {
        HTMLElement.prototype.getElementsByClass = function (n) {
            var el = [],
                _el = this.getElementsByTagName('*');
            for (var i = 0; i < _el.length; i++) {
                if (!!_el[i].className && (typeof _el[i].className == 'string') && _el[i].className.indexOf(n) > -1) {
                    el[el.length] = _el[i];
                }
            }
            return el;
        };
        ((typeof HTMLDocument !== 'undefined') ? HTMLDocument : Document).prototype.getElementsByClass = HTMLElement.prototype.getElementsByClass;
    }

    // 插件构造函数 - 返回数组结构
    function MyDialog(opt) {
        debugger;
        this._initial(opt);
    }
    MyDialog.prototype = {
        constructor: this, //这种原型链写法必须要加上constructor
        _initial: function (opt) {
            // 默认参数
            var def = {
                ok: true,
                ok_txt: '确定',
                cancel: false,
                cancel_txt: '取消',
                confirm: function () {},
                close: function () {},
                content: '',
                tmpId: null
            };
            debugger;
            this.def = extend(def, opt, true); //配置参数
            this.tpl = this._parseTpl(this.def.tmpId); //模板字符串
            this.dom = this._parseToDom(this.tpl)[0]; //存放在实例中的节点
            this.hasDom = false; //检查dom树中dialog的节点是否存在
            this.listeners = []; //自定义事件，用于监听插件的用户交互
            this.handlers = {};
        },
        _parseTpl: function (tmpId) { // 将模板转为字符串
            var data = this.def;
            var tplStr = document.getElementById(tmpId).innerHTML.trim();
            return templateEngine(tplStr, data);
        },
        _parseToDom: function (str) { // 将字符串转为dom
            var div = document.createElement('div');
            if (typeof str == 'string') {
                div.innerHTML = str;
            }
            return div.childNodes;
        },
        show: function (callback) {
            var _this = this;
            if (this.hasDom) return;
            debugger;
            //自定义事件监听
            if (this.listeners.indexOf('show') > -1) {
                if (!this.emit({
                        type: 'show',
                        target: this.dom
                    })) return;
            }
            document.body.appendChild(this.dom);
            this.hasDom = true;
            this.dom.getElementsByClass('close')[0].onclick = function () {
                _this.hide();
                if (_this.listeners.indexOf('close') > -1) {
                    _this.emit({
                        type: 'close',
                        target: _this.dom
                    })
                }!!_this.def.close && _this.def.close.call(this, _this.dom);
            };
            this.dom.getElementsByClass('btn-ok')[0].onclick = function () {
                _this.hide();
                if (_this.listeners.indexOf('confirm') > -1) {
                    _this.emit({
                        type: 'confirm',
                        target: _this.dom
                    })
                }!!_this.def.confirm && _this.def.confirm.call(this, _this.dom);
            };
            if (this.def.cancel) {
                this.dom.getElementsByClass('btn-cancel')[0].onclick = function () {
                    _this.hide();
                    if (_this.listeners.indexOf('cancel') > -1) {
                        _this.emit({
                            type: 'cancel',
                            target: _this.dom
                        })
                    }
                };
            }
            callback && callback();
            if (this.listeners.indexOf('shown') > -1) {
                this.emit({
                    type: 'shown',
                    target: this.dom
                })
            }
            return this;
        },
        hide: function (callback) {
            if (this.listeners.indexOf('hide') > -1) {
                if (!this.emit({
                        type: 'hide',
                        target: this.dom
                    })) return;
            }
            document.body.removeChild(this.dom);
            this.hasDom = false;
            callback && callback();
            if (this.listeners.indexOf('hidden') > -1) {
                this.emit({
                    type: 'hidden',
                    target: this.dom
                })
            }
            return this;
        },
        modifyTpl: function (template) {
            if (!!template) {
                if (typeof template == 'string') {
                    this.tpl = template;
                } else if (typeof template == 'function') {
                    this.tpl = template();
                } else {
                    return this;
                }
            }
            this.dom = this._parseToDom(this.tpl)[0];
            return this;
        },
        css: function (styleObj) {
            for (var prop in styleObj) {
                var attr = prop.replace(/[A-Z]/g, function (word) {
                    return '-' + word.toLowerCase();
                });
                this.dom.style[attr] = styleObj[prop];
            }
            return this;
        },
        width: function (val) {
            this.dom.style.width = val + 'px';
            return this;
        },
        height: function (val) {
            this.dom.style.height = val + 'px';
            return this;
        },
        on: function (type, handler) {
            // type: show, shown, hide, hidden, close, confirm
            if (typeof this.handlers[type] === 'undefined') {
                this.handlers[type] = [];
            }
            this.listeners.push(type);
            this.handlers[type].push(handler);
            return this;
        },
        off: function (type, handler) {
            if (this.handlers[type] instanceof Array) {
                var handlers = this.handlers[type];
                for (var i = 0, len = handlers.length; i < len; i++) {
                    if (handlers[i] === handler) {
                        break;
                    }
                }
                this.listeners.splice(i, 1);
                handlers.splice(i, 1);
                return this;
            }
        },
        emit: function (event) {
            debugger;
            if (!event.target) {
                event.target = this;
            }
            debugger;
            if (this.handlers[event.type] instanceof Array) {
                var handlers = this.handlers[event.type];
                for (var i = 0, len = handlers.length; i < len; i++) {
                    handlers[i](event);
                    return true;
                }
            }
            return false;
        }
    }

    // 最后将插件对象暴露给全局对象
    _global = (function () {
        return this || (0, eval)('this');
    }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = MyDialog;
    } else if (typeof define === "function" && define.amd) {
        define(function () {
            return MyDialog;
        });
    } else {
        !('MyDialog' in _global) && (_global.MyDialog = MyDialog);
    }
}());