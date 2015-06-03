
// var worker = mkHandler("completion-service.js");
// var worker = util.sharedHandler("local-complete.js");
var worker = util.handler("local-complete.js");

worker.on("msg", function (msg) {
    console.log(msg.msg);
});

worker.emit("loadCodes", "./");

var Pos = CodeMirror.Pos;

var marked = {};

function getHint(cm, cb) {
    var cur = cm.getCursor();
    var line = cm.getLine(cur.line);
    var token = line.substr(0, cur.ch);
  // console.log("Completing: " + token);
    var ws = token.match(/^[ ]*/).join("").length;
    if (token.length - ws > 0) worker.emit("complete", token, function (lst) {
        if (lst && lst.length > 0 && lst[0]) {
            /*
            if (marked) {
                
            }
            var completion = lst[0].substr(cur.ch-ws);
            cm.replaceRange(completion, cur, cur);
            marked = cm.markText(cur, Pos(cur.line, cur.ch+completion.length), {className: "markedText"});
            marked.start = cur;
            marked.end = Pos(cur.line, cur.ch+completion.length);
            */
            if (cur.ch == line.length && false) {
            // console.log("Clearing " + cm.getSelection());
              cm.replaceSelection("", "around");
            // console.log("Adding " + lst[0].substr(cur.ch-ws));
              cm.setSelection(Pos(cur.line, cur.ch));
              cm.replaceSelection(lst[0].substr(cur.ch-ws), "around");
              cm.addSelection(Pos(cur.line, cur.ch));
            // console.log("?? " + cm.getSelection());
              cm.guessSelection = true;
            }
            // cm.setCursor(cur);
            cb({list:lst, from: Pos(cur.line, ws),to: Pos(cur.line, cur.ch)});
        }
    });
}

var keys = {
      Tab: function (cm, handle) { handle.pick(); },
      Esc: function (cm, handle) { handle.close(); },

};

CodeMirror.serviceHint = function (cm) {
    CodeMirror.showHint(cm, getHint, {async: true, completeSingle: false, customKeys:keys});
};

CodeMirror.commands.smartcomplete = CodeMirror.serviceHint;


