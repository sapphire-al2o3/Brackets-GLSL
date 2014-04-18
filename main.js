/*global define, brackets*/
define(function (require, exports, module) {
	'use strict';
	
	var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");
	
	CodeMirror.defineMIME("text/x-brackets-html", {
		"name": "htmlmixed",
		"scriptTypes": [
			{ "matches": /x-shader\/x-fragment/i, "mode": "x-shader/x-fragment" },
			{ "matches": /x-shader\/x-vertex/i, "mode": "x-shader/x-vertex" }
		]
	});
	
});

