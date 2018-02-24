// ==UserScript==
// @name         AutoUnlock
// @namespace    https://greasyfork.org/scripts/31324-autounlock
// @version      0.4.0
// @description  自动跳转并解锁百度网盘、Mega分享
// @author       MaiJZ
// @homepageURL  https://github.com/maijz128/AutoUnlock
// @supportURL   https://github.com/maijz128/AutoUnlock
// @match        http://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        https://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        http://pan.baidu.com/share/init?*
// @match        https://pan.baidu.com/share/init?*
// @match        http://localhost:8094/AutoUnlock/?open=*
// @grant        none
// ==/UserScript==

const SITE_WAIT_TIME = 500;
const DATA_OVER_TIME = 10 * 1000;


const Util = {
    hrefContains: function (str) {
        return location.href.indexOf(str) > 1;
    },
    GetQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null)
            return (r[2]);
        else
            return null;
    }
};


(function () {
    'use strict';
    run();
})();

function run() {
    var isAutoUnlockSite = Util.hrefContains("AutoUnlock");
    var isBaiduShareInitSite = Util.hrefContains("pan.baidu.com/share/init");

    if (isAutoUnlockSite) {
        var inter = setInterval(function () {
            if (AutoUnlock.done) {
                clearInterval(inter);
                handle(AutoUnlock);
            }
        }, 50);
    } else if (isBaiduShareInitSite) {
        if (Util.hrefContains("password=")) {
            unlock_baidu2();
        }
    }
}

function handle(autoUnlock) {
    const url = autoUnlock.url;
    const password = autoUnlock.password;
    const isMega = url.indexOf("mega.nz") > -1;
    const isBaiduPan = url.indexOf("pan.baidu.com") > -1;


    if (isBaiduPan) {
        handleBaidu(url, password);
    } else if (isMega) {
        handleMega(url, password);
    }
}

function handleBaidu(url, password) {
    var autoUnlock = {
        updateTime: Date.now(),
        url: url,
        password: password
    };
    console.group("AutoUnlockSite >> pan.baiu.com:");
    console.info(autoUnlock);
    console.groupEnd();

    const baiduLink_format = formatBaiduLink(url);
    const targetURL = baiduLink_format + "&password=" + password;
    console.log(targetURL);
    window.location.href = targetURL;

}

function formatBaiduLink(link) {
    // link : https://pan.baidu.com/s/1kUM8Lt9
    // return : https://pan.baidu.com/share/init?surl=kUM8Lt9
    const tokenList = link.split("/");
    var key = tokenList[tokenList.length - 1];
    // 去掉前面一位字符
    key = key.substring(1);
    return "https://pan.baidu.com/share/init?surl=" + key;
}

function handleMega(url, password) {
    var targetURL = url + password;
    jumpSite(targetURL);
}

// 更新数据后跳转到网盘
function jumpSite(url) {
    var targetURL = url;
    if (targetURL.indexOf("http") !== 0) {
        targetURL = "http://" + targetURL;
    }
    setTimeout(function () {
        if (targetURL) {
            location.href = targetURL;
        }
    }, SITE_WAIT_TIME);
}

function unlock_baidu2() {
    const value = Util.GetQueryString("password");
    if (value !== null) {
        var password = decodeURIComponent(value);
        console.log("password=" + password);
        _unlock_baidu(password);
    }
}


function _unlock_baidu(password, count) {
    const MAX_TIME = 10 * 1000;
    const INTERVAL = 50;
    const MAX_COUNT = MAX_TIME / INTERVAL;
    count = count || 1;

    console.log("password: " + password + " count: " + count);
    if (count < MAX_COUNT && password) {

        var inputs = document.querySelectorAll("input");
        var input = inputs[0];
        var submitBtn = document.querySelector("a[title='提取文件']");
        if (input && submitBtn) {
            input.value = password;
            submitBtn.click();
        }

        setTimeout(function () {
            _unlock_baidu(password, count + 1);
        }, INTERVAL);
    }
}
