// ==UserScript==
// @name         AutoUnlock
// @namespace    https://github.com/maijz128/AutoUnlock
// @version      0.1
// @description  自动跳转并解锁百度网盘分享
// @author       MaiJZ
// @supportURL   https://github.com/maijz128/AutoUnlock
// @match        http://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        https://maijz128.github.io/AutoUnlock/AutoUnlock/?open=*
// @match        http://pan.baidu.com/share/init?shareid=*
// @match        https://pan.baidu.com/share/init?shareid=*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    setTimeout(function () {
        run();
    }, 500);
})();

function run() {
    var isAutoUnlockSite = location.href.indexOf("AutoUnlock") > -1;
    var isBaiduShareInitSite = location.href.indexOf("pan.baidu.com/share/init") > -1;

    if (isAutoUnlockSite) {
        updateData();
    }

    if (isBaiduShareInitSite) {
        unlock();
    }
}

function updateData() {
    if (AutoUnlock) {

        var autoUnlock = {
            updateTime: Date.now(),
            url: AutoUnlock.url,
            password: AutoUnlock.password
        };
        console.info(autoUnlock);


        // init tab
        GM_getTab(function (o) {
            var this_tab_data = o;
            this_tab_data[TAB_ID] = true;
            this_tab_data.AutoUnlock = autoUnlock;
            GM_saveTab(this_tab_data);
        });

        // 更新数据后跳转到网盘
        setTimeout(function () {
            location.href = "http://" + AutoUnlock.url;
        }, 500);
    }

}

function unlock() {
    var autoUnlock = null;
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

    GM_getTab(function (o) {
        tab = o;
        if (tab[TAB_ID]) {
            autoUnlock = tab.AutoUnlock;
            console.info(autoUnlock);
        }

        if (autoUnlock) {
            const nowTime = Date.now();
            const updateTime = parseInt(autoUnlock.updateTime) || 0;
            const notOvertime = (nowTime - updateTime) < 30 * 1000;

            if (notOvertime) {
                _unlock(autoUnlock.password);

                // 使用之后设置为超时，令其不再可用
                // setPref(KEY_UpdateTime, 0);
                autoUnlock.updateTime = 0;
                tab.AutoUnlock = null;
                GM_saveTab(tab);
            }
        }

    });

}

function _unlock(passowrd) {
    if (passowrd) {
        var input = document.getElementById(PAN_BAIDU_COM.InputID);
        var submitBtn = document.getElementById(PAN_BAIDU_COM.SubmitBtnID);

        if (input && submitBtn) {
            input.value = passowrd;
            submitBtn.click();
        } else {
            setTimeout(function () {
                _unlock(passowrd);
            }, 100);
        }
    }
}


const TAB_ID = "Tab_AutoUnlock";

const PAN_BAIDU_COM = {
    SubmitBtnID: "submitBtn",
    InputID: "accessCode"
};


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