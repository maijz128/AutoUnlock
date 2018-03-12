/**
 * Auther: MaiJZ
 * Date: 2018/3/12
 * Github: https://github.com/maijz128
 * 
 * 功能：
 *      处理传递过来的内容（?open=）格式化成链接并打开。
 *      
 *     
 */

/*  pan.baidu.com

 // [2018]新的长链接：https://pan.baidu.com/s/1Hyv_AGjYAxQodHS6yNhHfQ 密码: x6yx

 // 链接: https://pan.baidu.com/s/1miHVd8k 密码: hg9j
 // 编码后  >>  %E9%93%BE%E6%8E%A5%3A%20https%3A%2F%2Fpan.baidu.com%2Fs%2F1miHVd8k%20%E5%AF%86%E7%A0%81%3A%20hg9j

 // 链接: https://pan.baidu.com/s/1jI7PL7g 密码: p7w2
 //  %E9%93%BE%E6%8E%A5%3A%20https%3A%2F%2Fpan.baidu.com%2Fs%2F1jI7PL7g%20%E5%AF%86%E7%A0%81%3A%20p7w2
 // 填写密码URL：https://pan.baidu.com/share/init?shareid=766152910&uk=2601301299

 // URL:https://pan.baidu.com/share/init?surl=1miHVd8k&password=hg9j
 */
/*  mega.nz

 链接和密匙：https://mega.nz/#F!U3YHETJb!ssb0H0GIi4Qk-JGCox5W0Q

 */

const SITE_WAIT_TIME = 500;

const g = {};

function LinkData(openContent) {
    this.openContent = openContent;
    this.url = null;
    this.password = null;
    this.targetLink = null;
}

const Util = {
    hrefContains: function (str) {
        return location.href.indexOf(str) > 1;
    },
    getQueryValue: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null)
            return (r[2]);
        else
            return null;
    },
    removeHttpAndHttps: function (content) {
        var result = content;
        result = result.replace("http://", "");
        result = result.replace("https://", "");
        return result;
    }
};


function main() {
    // const openContent = location.search.replace("?open=", "");
    var openContent = Util.getQueryValue("open");
    openContent = decodeURIComponent(openContent);

    var linkData = BaiduPan(openContent);
    refreshUI(linkData);

    jumpToLink(linkData);

    g.linkData = linkData;  

    // AutoUnlock.Interpreter = new Interpreter(openContent);
    // AutoUnlock.url = AutoUnlock.Interpreter.getURL();
    // AutoUnlock.password = AutoUnlock.Interpreter.getPassword();
}

function refreshUI(linkData) {
    // const elConsole = document.getElementById("console");
    const elOpenContent = document.querySelector("#console #openContent");
    const elURL = document.querySelector("#console #url");
    const elPassword = document.querySelector("#console #password");

    elOpenContent.innerText = "OpenContent: " + linkData.openContent;
    elPassword.innerText = "Password: " + linkData.password;

    {
        var url = linkData.url;
        if (url === null) {
            url = "javascript:void(0);";
        } else if (url.indexOf("http") !== 0) {
            url = "http://" + url;
        }

        var elA = document.createElement("a");
        elA.setAttribute("href", url);
        elA.innerText = url;

        elURL.innerText = "URL: ";
        elURL.appendChild(elA);
    }
}

function jumpToLink(linkData) {
    var isJump = Util.getQueryValue("jump");
    if (isJump === "false") return;

    console.log(linkData.targetLink);
    setTimeout(function () {
        window.location.href = linkData.targetLink;
    }, SITE_WAIT_TIME);

}


function BaiduPan(openContent) {

    function matching(content) {
        var linkData = new LinkData(content);

        const URL_HEADER = "pan.baidu.com/s/";
        const pUrl = new RegExp("1[a-z0-9A-Z_]{3,25}");
        const pPassword = new RegExp("[a-z0-9A-Z]{4}");


        var content_format = Util.removeHttpAndHttps(content);
        content_format = content_format.replace(URL_HEADER, "");

        const wordList = content_format.split(/\s/g);

        for (var key in wordList) {
            var word = wordList[key];

            if (linkData.url === null) {
                var rURl = pUrl.exec(word);
                if (rURl) {
                    const url = rURl[0];
                    linkData.url = URL_HEADER + url;
                    word = word.replace(url, "");
                }
            }

            if (linkData.password === null) {
                var rPassword = pPassword.exec(word);
                if (rPassword) {
                    linkData.password = rPassword[0];
                    word = word.replace(linkData.password, "");
                }
            }
        }

        return linkData;
    }

    function buildTargetLink(url, password) {
        const baiduLink_format = formatLinkToInit(url);
        const targetURL = baiduLink_format + "&password=" + password;
        return targetURL;
    }

    // 把链接转换为验证链接
    function formatLinkToInit(link) {
        // link : https://pan.baidu.com/s/1kUM8Lt9
        // return : https://pan.baidu.com/share/init?surl=kUM8Lt9
        const tokenList = link.split("/");
        var key = tokenList[tokenList.length - 1];
        // 去掉前面一位字符, 字符为：1
        key = key.substring(1);
        return "https://pan.baidu.com/share/init?surl=" + key;
    }

    this.linkData = matching(openContent) || new LinkData(openContent);
    this.linkData.targetLink = buildTargetLink(this.linkData.url, this.linkData.password);
    return this.linkData;
}

/*
const AutoUnlock = {
    url: null,
    password: null,
    done: false
};

function Interpreter(openContent) {
    const self = this;
    self._openContent = openContent;
    self._url = null;
    self._password = null;

    var baidu = new PanBaiduCom();
    var mega = new MegaNZ();
    if (baidu.matching_LongURL(openContent)) {
        self._url = baidu.url;
        self._password = baidu.password;
    } else if (baidu.matching(openContent)) {
        self._url = baidu.url;
        self._password = baidu.password;
    } else if (mega.matching(openContent)) {
        self._url = mega.url;
        self._password = mega.password;
    } else if (baidu.matching_SimpleURL(openContent)) {
        self._url = baidu.url;
        self._password = baidu.password;
    }
}


function PanBaiduCom() {
    this.url = null;
    this.password = null;
}
PanBaiduCom.prototype.matching = function (openContent) {
    const pUrl = new RegExp("pan.baidu.com/s/[a-z0-9A-Z]{5,10}");
    const pPassword = new RegExp("[a-z0-9A-Z]{4}");

    const content = removeHttpAndHttps(openContent);
    var wordList = content.split(/\s/g);

    for (var key in wordList) {
        var word = wordList[key];

        var rURl = pUrl.exec(word);
        if (rURl) {
            this.url = rURl[0];
            word = word.replace(this.url, "");
        }

        var rPassword = pPassword.exec(word);
        if (rPassword) {
            this.password = rPassword[0];
        }

    }
    return this.url;
};
PanBaiduCom.prototype.matching_SimpleURL = function (openContent) {
    const URL_HEADER = "pan.baidu.com/s/";
    const pUrl = new RegExp("[a-z0-9A-Z]{5,10}");
    const pPassword = new RegExp("[a-z0-9A-Z]{4}");

    const content = removeHttpAndHttps(openContent);
    var wordList = content.split(/\s/g);

    for (var key in wordList) {
        var word = wordList[key];

        if (this.url === null) {
            var rURl = pUrl.exec(word);
            if (rURl) {
                const url = rURl[0];
                word = word.replace(url, "");
                this.url = URL_HEADER + url;
            }
        }

        if (this.password === null) {
            var rPassword = pPassword.exec(word);
            if (rPassword) {
                this.password = rPassword[0];
                word = word.replace(this.password, "");
            }
        }
    }
    return this.url;
};
PanBaiduCom.prototype.matching_LongURL = function (openContent) {
    const URL_HEADER = "pan.baidu.com/s/";
    const pUrl = new RegExp("[a-z0-9A-Z]{4}_[a-z0-9A-Z]{15,20}");
    const pPassword = new RegExp("[a-z0-9A-Z]{4}");

    const content = removeHttpAndHttps(openContent);
    var wordList = content.split(/\s/g);

    for (var key in wordList) {
        var word = wordList[key];

        if (this.url === null) {
            var rURl = pUrl.exec(word);
            if (rURl) {
                const url = rURl[0];
                this.url = URL_HEADER + url;
                word = word.replace(url, "");
            }
        }

        if (this.password === null) {
            var rPassword = pPassword.exec(word);
            if (rPassword) {
                this.password = rPassword[0];
                word = word.replace(this.password, "");
            }
        }
    }
    return this.url;
};


function MegaNZ() {
    this.url = null;
    this.password = null;
}
MegaNZ.prototype.matching = function (openContent) {
    const pUrl = new RegExp("mega.nz/#[!\-\_a-z0-9A-Z]*");
    const pPassword = new RegExp("![\-\_a-z0-9A-Z]*");

    const content = removeHttpAndHttps(openContent);
    var wordList = content.split(/\s/g);

    for (var key in wordList) {
        var word = wordList[key];

        var rURl = pUrl.exec(word);
        if (rURl) {
            this.url = rURl[0];
            word = word.replace(this.url, "");
        }

        var rPassword = pPassword.exec(word);
        if (rPassword) {
            this.password = rPassword[0];
        }

    }
    return this.url;
};

function removeHttpAndHttps(content) {
    var result = content;
    result = result.replace("http://", "");
    result = result.replace("https://", "");
    return result;
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



function MegaPan() {

    function handleMega(url, password) {
        var targetURL = url + password;
        jumpSite(targetURL);
    }

    const SITE_WAIT_TIME = 500;
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

}

*/

window.onload = function () {
    main();
};


