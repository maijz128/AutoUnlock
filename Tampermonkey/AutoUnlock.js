// ==UserScript==
// @name         AutoUnlock
// @namespace    https://greasyfork.org/scripts/31324-autounlock
// @version      0.2.1
// @description  自动跳转并解锁百度网盘、Mega分享
// @author       MaiJZ
// @homepageURL  https://github.com/maijz128/AutoUnlock
// @supportURL   https://github.com/maijz128/AutoUnlock
// @match        http://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        https://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        http://pan.baidu.com/share/init?shareid=*
// @match        https://pan.baidu.com/share/init?shareid=*
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

(function () {
    'use strict';
    run();
})();

function run() {
    var isAutoUnlockSite = location.href.indexOf("AutoUnlock") > -1;
    var isBaiduShareInitSite = location.href.indexOf("pan.baidu.com/share/init") > -1;

    if (isAutoUnlockSite) {
        var inter = setInterval(function () {
            if (AutoUnlock) {
                clearInterval(inter);
                handle(AutoUnlock);
            }
        }, 50);
    } else if (isBaiduShareInitSite) {
        unlock_baidu();
    }
}

function handle(autoUnlock) {
    const isMega = autoUnlock.url.indexOf("mega.nz") > -1;
    const isBaiduPan = autoUnlock.url.indexOf("pan.baidu.com") > -1;

    const url = AutoUnlock.url;
    const password = AutoUnlock.password;

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

function _unlock_baidu(password, count) {
    const MAX_TIME = 10 * 1000;
    const INTERVAL = 50;
    const MAX_COUNT = MAX_TIME / INTERVAL;
    count = count || 1;

    console.log("password: " + password + " count: " + count);
    if (count < MAX_COUNT && password) {

        var input = document.getElementById(PAN_BAIDU_COM.InputID);
        var submitBtn = document.getElementById(PAN_BAIDU_COM.SubmitBtnID);
        if (input && submitBtn) {
            input.value = password;
            submitBtn.click();
        }

        setTimeout(function () {
            _unlock_baidu(password, count + 1);
        }, INTERVAL);
    }
}


const TAB_ID = "Tab_AutoUnlock";

const PAN_BAIDU_COM = {
    SubmitBtnID: "submitBtn",
    InputID: "accessCode"
};


//
// GM_getTabs(function (db) {
//     var all_tabs = db;
//     var tab = null;
//     // for (var i in all_tabs) {
//     //     tab = all_tabs[i];
//     //
//     //     if (tab[TAB_ID]) {
//     //         autoUnlock = tab.AutoUnlock;
//     //         console.info(autoUnlock);
//     //         console.info(tab);
//     //         break;
//     //     }
//     // }
// });

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