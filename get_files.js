
var files = (function (exports) {

exports.files = [];
exports.all_files = [];

var good_file = /\.(cc|js|css|html)$/;

function readFile(fname, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", fname, true);
    // ajax.setRequestHeader("Authorization", "Basic " + btoa("sami:k3wlsmkl"));
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        if (ajax.readyState == 4 && ajax.responseText) cont(null, ajax.responseText);
    };
    ajax.send();
}

exports.load = function (fn, cont, progress) {
    readFile(fn, function (err, str) {
        str.toString().split("\n").forEach(function (el) { if (el) exports.files.push(el); });
        // Load all files to memory
        var n = 0;
        exports.files.forEach(function (el) {
            readFile("/code/" + el, function (err, str) {
                n++;
                if (progress) progress(n);
                exports.files[el] = str;
                if (n == exports.files.length) {
                    if (cont) cont();
                    else console.log("Loaded");
                }
            });
        });
    });
};

exports.loadDir = function (fn, cont, progress) {
    listAllFiles(fn, function (lst) {
        var n = 0;
        exports.all_files = lst;
        exports.files = [];
        lst.forEach(function (el) {
            if (el.match(good_file)) exports.files.push(el);
        });
        exports.files.forEach(function (el) {
            readFile(el, function (err, str) {
                n++;
                if (progress) progress(n);
                exports.files[el] = str;
                if (n == exports.files.length) {
                    if (cont) cont();
                    else console.log("Loaded");
                }
            });
        });
    });
};

exports.loadList = function (lst, cont, progress) {
    var files = [];
    lst.forEach(function (el) {
        if (el.match(good_file)) {
            files.push(el);
            exports.files.push(el);
        }
    });
    // Load all files to memory
    var n = 0;
    files.forEach(function (el) {
        fs.readFile(el, function (err, str) {
            n++;
            if (err) str = "";
            if (progress) progress(n);
            exports.files[el] = str;
            if (n == files.length) {
                if (cont) cont(files);
                else console.log("Loaded");
            }
        });
    });
};
return exports;
})({});

