
console = {log: function () {} };

importScripts("sax.js");
importScripts("dav.js");
importScripts("get_files.js");
importScripts("multiset.js");
importScripts("utils.js");
importScripts("fast-complete.js");

exports = {};

var MultiSet = multiset.MultiSet;

var token = /[^\n]+/g;
var delimiter = /[^A-Za-z0-9]/g;

function preprocess(str) {
    str = str.replace(/\r/g,'').replace(/\u00a0/g, ' ').replace(/\t/g, "    ").replace(/[ ]*\n/g, '\n');
    // Remove extra spaces and indentation
    str = str.replace(/^[ ]+/g, '');
    str = str.replace(/\n[ ]+/g, '\n');
    str = str.replace(/[ ]+/g, ' ');
    return str;
}

function addString(str) {
    var lst = preprocess(str).match(token);
    lst.forEach(function (str) {
        complete.augmentedAdd(str, delimiter);
    });
}

function loadCodes(fn) {
    report({msg:"Loading files..."});
    files.loadDir(fn, function () {
        report({msg: "Loaded files"});
        // files.files.forEach(function (fn) { addString(files.files[fn]); });
        report({msg: "Added files"});
    }, function (i) { report({msg:"Loading " + Math.floor(i * 100 / files.files.length) + "%"}); });
};

exports.report = function (str) {
    console.log(str);
}

function report(str) {
    exports.report(str);
}

exports.complete = function (str) {
    var res = complete.augmentedLetterComplete(preprocess(str), delimiter);
    var acc = [];
    var f_str = null;
    if (res.current) acc.push(res.current.str);
    res.list.forEach(function (c) { if (c.string != acc[0]) acc.push(c.string); });
    return acc;
};

var docs = {};
var parents = {};

function findParents(id) {
    var par = parents[id];
    if (par) return findParents(par).concat([par]);
    else return [];
}

function searchFile(fn, str, term, res) {
    if (!str) return;
    var lst = str.split("\n");
    var parents = findParents(fn);
    for (var i = 0; i < lst.length; i++) {
        var el = lst[i];
        if (el.match(term)) {
            var obj = {filename:fn, type:"line", line:i+1, data:el, rank: 0, parents: parents};
            if (el.match(/function/)) obj.rank++;
            obj.rank += 1 / el.length;
            res.push(obj); 
        }
    }
}

function handleSearch(obj) {
    var term = util.validRegex(obj);
    var res = [];
    files.files.forEach(function (str,i) {
        searchFile(files.files[i], files.files[files.files[i]], term, res);
    });
    // Sort by rank
    res.sort(function (a,b) {return b.rank-a.rank;});
    return res.slice(0,100);
}

function searchNames(obj) {
    var term = util.validRegex(obj);
    var res = [];
    files.all_files.forEach(function (str,i) {
        if (str.match(term)) {
            res.push({type:"name", filename:str, rank:0});
        }
        // searchFile(files.files[i], files.files[files.files[i]], term, res);
    });
    // Sort by rank
    res.sort(function (a,b) {return b.rank-a.rank;});
    return res.slice(0,100);
}

var handle = {
    search: handleSearch,
    searchNames: searchNames,
    complete: exports.complete,
    loadCodes: loadCodes,
};

var loaded_dirs = {};

function handler(msg, post) {
    var obj = JSON.parse(msg.data);
    if (obj.channel == "loaded") {
        complete.addString(obj.msg.file);
        docs[obj.msg.filename] = obj.msg.file;
    }
    else if (obj.channel == "save") {
        var os = docs[obj.msg.filename];
        // if (!os) complete.addString(obj.msg.file); else complete.changeString(os, obj.msg.file);
        complete.addString(obj.msg.file);
        docs[obj.msg.filename] = obj.msg.file;
    }
  else {
    var res = handle[obj.channel](obj.msg);
    if (res) post(JSON.stringify({msg:res, id:obj.id}));
  }
}

onmessage = function (msg) {
    handler(msg, postMessage);
};

// When ran as shared worker
onconnect = function (ev) {
    var port = ev.ports[0];
    port.onmessage = function (msg) {
        handler(msg, function (x) { port.postMessage(x); });
    };
};

