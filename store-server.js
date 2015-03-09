/*
define("call-server", ["require","exports","module"],
function (require, exports, module) {

    var site = document.location.host;

	function call_server(obj, handler, cont) {
		var http_request = new XMLHttpRequest();
    	var str = encodeURIComponent(JSON.stringify(obj));
		var url = "http://" + site + "/files?command=" + str;
		http_request.open("GET", url, true );
		http_request.onload = function () {
            // console.log("Here");
			if (http_request.status == 200) {
				 cont(JSON.parse(http_request.responseText));
			}
		};
        http_request.overrideMimeType("application/json");
    	http_request.send(null);
	}
});

define("store-server", ["require","exports","module"],
function (require, exports, module) {
*/
    var site = document.location.host;

	function call_server(obj, cont) {
		var req = new XMLHttpRequest();
    	// var str = encodeURIComponent(JSON.stringify(obj));
		// var url = "http://" + site + "/files?command=" + str;
    	// var str = encodeURIComponent(JSON.stringify(obj));
		var url = "/files"; // + "?command=" + str;
		req.open("POST", url, true );
        req.setRequestHeader("Content-Type", "application/json");
        // var form = new FormData();
        // form.append("command", JSON.stringify(obj));
		// http_request.open("GET", url, true );
		req.onload = function () {
			if (req.status == 200) {
                 // console.log(req.responseText);
				 cont(JSON.parse(req.responseText));
                 
			}
		};
        req.overrideMimeType("application/json");
		req.send(JSON.stringify(obj));
	}
	
	function Directory(obj) {
		this.type = "directory";
		this.list = obj.list;
		this.path = obj.path;
	}
	
	function File(obj) {
		this.type = "file";
		this.text = obj.text;
		this.path = obj.path;
	}
	
	File.prototype.save = function (str, cont) {
		this.text = str;
		call_server({type:"store", text:str, path:this.path}, cont);
	}

	Directory.prototype.getFile = function (name, cont) {
        if (name[0] == "/") name = name.substring(1);
		return readFile(this.path + "/" + name, cont);
	}

	Directory.prototype.newDirectory = function (name, cont) {
		if (this.list.indexOf(name) < 0) this.list.push(name);
		var path = this.path + "/" + name;
		call_server({type:"newdir", path:path}, cont);
	};

	Directory.prototype.remove = function (name, cont) {
		var idx = this.list.indexOf(name);
		if (idx >= 0) this.list.splice(idx, 1);
		var path = this.path + "/" + name;
		call_server({type:"remove", path:path}, cont);
	};

	Directory.prototype.setFile = function (name, str, cont) {
		if (this.list.indexOf(name) < 0) this.list.push(name);
		var path = this.path + "/" + name;
		call_server({type:"store", text:str, path:path}, cont);
	};
	
	function readFile(path, cont) {
		if (!cont) {
			cont = path;
			path = "";
		}
		call_server({type:"read", path:path}, function (obj) {
				if (obj.type == "directory") cont(new Directory(obj));
				else if (obj.type == "file") cont(new File(obj));
				else if (obj.type == "error") cont(obj);
				else cont({type:"error", message:"Bad message from server when reading " + path});
		});
	}
	
	exports.readFile = readFile;




