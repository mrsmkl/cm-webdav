
// var call = require("./call").post;

exports.readFile = function (str, cont) {
    if (typeof $ == "object") $.get(str, function (obj) { cont(null, obj); }, "text");
    else cont(null, gettext(str));
    /*
    call("files", {path: str, type: "read_absolute"}, function (obj) {
        if (obj.type == "error") cont(obj);
        else cont(null, obj.text);
    });*/
};

