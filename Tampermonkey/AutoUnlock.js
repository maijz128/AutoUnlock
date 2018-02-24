// ==UserScript==
// @name         AutoUnlock
// @namespace    https://greasyfork.org/scripts/31324-autounlock
// @version      0.3.0
// @description  自动跳转并解锁百度网盘、Mega分享
// @author       MaiJZ
// @homepageURL  https://github.com/maijz128/AutoUnlock
// @supportURL   https://github.com/maijz128/AutoUnlock
// @match        http://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        https://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        http://pan.baidu.com/share/init?*
// @match        https://pan.baidu.com/share/init?*
// @match        http://localhost:8094/AutoUnlock/?open=*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        unsafeWindow
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

const TAB_ID = "Tab_AutoUnlock";

const PAN_BAIDU_COM = {
    SubmitBtnID: "submitBtn",
    InputID: "accessCode"
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
        } else {
            unlock_baidu();
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

    // init tab
    GM_getTab(function (o) {
        var this_tab_data = o;
        this_tab_data[TAB_ID] = true;
        this_tab_data.AutoUnlock = autoUnlock;
        GM_saveTab(this_tab_data);

        jumpSite(url);
    });

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

function unlock_baidu() {
    var autoUnlock = null;

    GM_getTab(function (o) {
        var tab = o;
        if (tab[TAB_ID]) {
            autoUnlock = tab.AutoUnlock;
            console.group("AutoUnlock:");
            console.info(autoUnlock);
            console.groupEnd();
        }

        if (autoUnlock) {
            const nowTime = Date.now();
            const updateTime = parseInt(autoUnlock.updateTime) || 0;
            const notOvertime = (nowTime - updateTime) < DATA_OVER_TIME;

            if (notOvertime) {
                _unlock_baidu(autoUnlock.password);
            } else {
                console.error("数据已超时！");
            }
        }
    });

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



function setPref(name, value) { //  cross-browser GM_setValue
    var a = '', b = '';
    try {
        a = typeof GM_setValue.toString;
        b = GM_setValue.toString()
    } catch (e) {
    }
    if (typeof GM_setValue === 'function' &&
        (a === 'undefined' || b.indexOf('not supported') === -1)) {
        GM_setValue(name, value); // Greasemonkey, Tampermonkey, Firefox extension
    } else {
        var ls = null;
        try {
            ls = window.localStorage || null
        } catch (e) {
        }
        if (ls) {
            return ls.setItem(name, value); // Chrome script, Opera extensions
        }
    }
}

function getPref(name) { // cross-browser GM_getValue
    var a = '', b = '';
    try {
        a = typeof GM_getValue.toString;
        b = GM_getValue.toString()
    } catch (e) {
    }
    if (typeof GM_getValue === 'function' &&
        (a === 'undefined' || b.indexOf('not supported') === -1)) {
        return GM_getValue(name, null); // Greasemonkey, Tampermonkey, Firefox extension
    } else {
        var ls = null;
        try {
            ls = window.localStorage || null
        } catch (e) {
        }
        if (ls) {
            return ls.getItem(name); // Chrome script, Opera extensions
        }
    }
}