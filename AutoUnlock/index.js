/**
 * Auther: MaiJZ
 * Date: 2017/7/10
 * Github: https://github.com/maijz128
 */

/*  pan.baidu.com
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

const AutoUnlock = {
    url: null,
    password: null,
    done: false
};

function main() {
    AutoUnlock.search = location.search;
    AutoUnlock.openContent = AutoUnlock.search.replace("?open=", "");
    AutoUnlock.openContent = decodeURIComponent(AutoUnlock.openContent);

    AutoUnlock.Interpreter = new Interpreter(AutoUnlock.openContent);
    AutoUnlock.url = AutoUnlock.Interpreter.getURL();
    AutoUnlock.password = AutoUnlock.Interpreter.getPassword();

    AutoUnlock.done = true;

    refreshUI();
}

function refreshUI() {
    // const elConsole = document.getElementById("console");
    const elOpenContent = document.querySelector("#console #openContent");
    const elURL = document.querySelector("#console #url");
    const elPassword = document.querySelector("#console #password");

    elOpenContent.innerText = "OpenContent: " + AutoUnlock.openContent;
    elPassword.innerText = "Password: " + AutoUnlock.password;

    {
        var url = AutoUnlock.url;
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

function Interpreter(openContent) {
    const self = this;
    self._openContent = openContent;
    self._url = null;
    self._password = null;

    var baidu = new PanBaiduCom();
    var mega = new MegaNZ();
    if (baidu.matching(openContent)) {
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
Interpreter.prototype.getURL = function () {
    return this._url;
};
Interpreter.prototype.getPassword = function () {
    return this._password;
};


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

window.onload = function () {
    main();
};

