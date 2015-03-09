
// var site = document.location.host;

function call_server(sname, obj, cont) {
    var str = encodeURIComponent(JSON.stringify(obj));
	var url = "/" + sname + "?command=" + str;
    /*
    $.get(url, function (x) { if (cont) cont(x); }, "json");
    */
    var http_request = new XMLHttpRequest();
	http_request.open("GET", url, true );
	http_request.onreadystatechange = function () {
		if (http_request.readyState == 4 && http_request.status == 200) {
			 if (cont) cont(JSON.parse(http_request.responseText));
		}
	};
    http_request.overrideMimeType("application/json");
	http_request.send(null);
}

exports.call = call_server;

function post_server(sname, obj, cont) {
	var url = "/" + sname;
    var req = new XMLHttpRequest();
	req.open("POST", url, true );
    req.setRequestHeader("Content-Type", "application/json");
	req.onload = function () {
		if (req.status == 200) {
			 cont(JSON.parse(req.responseText));
		}
	};
    req.overrideMimeType("application/json");
	req.send(JSON.stringify(obj));
}

exports.post = post_server;

exports.socket = function () {
    var conn = io.connect();
    return conn;
};

exports.autoreload = function () {
    var conn = exports.socket();
    conn.emit("register", {path:document.location.pathname});
    conn.on("reload", function (obj) { if (obj.path == document.location.pathname) document.location.reload(); });
};

exports.system = function (name, args, cont) {
    call_server("command", {name:name, args:args}, cont);
};


