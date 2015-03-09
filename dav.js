
var store = {};

function getFile(fname, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", fname, true);
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        if (ajax.readyState == 4 && ajax.responseText) cont(ajax.responseText, x);
    };
    ajax.send();
}

function makeDir(fname, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("MKCOL", fname, true);
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        console.log(x);
        // if (x.srcElement.responseText) cont(x.srcElement.responseText, x);
    };
    ajax.send();
}

function putFile(fname, str, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("PUT", fname, true);
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        // console.log(x);
        if (ajax.readyState == 4) cont(x);
    };
    ajax.send(str);
}
function postFile(fname, str, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("POST", fname, true);
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        console.log(x);
        // if (x.srcElement.responseText) cont(x.srcElement.responseText, x);
    };
    ajax.send(str);
}

var prop_command = '<?xml version="1.0" encoding="utf-8" ?>\n<D:propfind xmlns:D="DAV:"><D:allprop/></D:propfind>';

function listDir(fname, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("PROPFIND", fname, true);
    ajax.setRequestHeader("Depth", "1");
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        if (ajax.readyState == 4 && ajax.responseXML) {
            var doc = ajax.responseXML;
            var lst = doc.querySelectorAll("href");
            var res = [];
            for (var i = 0; i < lst.length; i++) {
                res.push(lst[i].textContent);
            }
            cont(res, x);
        }
    };
    ajax.send();
}

function parseText(txt) {
    var parser = sax.parser(true, {lowercase:true});
    var dom = undefined;
    var activeNode = dom;
    var lst = [];
    parser.onerror = function (e) { };
    parser.onend = function () {};
    parser.ontext = function (t) {
        if (activeNode != undefined && activeNode.name == "D:href")
            lst.push(t);
    };
    parser.onopentag = function (node) {
        var nd = {name:node.name, parent:activeNode};
        activeNode = nd;
    };
    parser.onclosetag = function (node) {
        activeNode = activeNode.parent;
    };
    parser.write(txt).close();
    return lst;
}

function listAllFiles(fname, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("PROPFIND", fname, true);
    ajax.setRequestHeader("Depth", "Infinity");
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        if (ajax.readyState == 4 && ajax.responseXML) {
            var doc = ajax.responseXML;
            var lst = doc.querySelectorAll("href");
            var res = [];
            for (var i = 0; i < lst.length; i++) {
                res.push(lst[i].textContent);
            }
            cont(res, x);
        }
        else if (ajax.readyState == 4) {
            // Need to find from response text
            cont(parseText(ajax.responseText), x);
        }
    };
    ajax.send();
}



