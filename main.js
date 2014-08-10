/*global define, brackets*/
define(function (require, exports, module) {
	'use strict';
	
	var LanguageManager = brackets.getModule("language/LanguageManager"),
		CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");
	
	CodeMirror.resolveMode("text/x-brackets-html").scriptTypes.push(
		{ "matches": /x-shader\/x-fragment/i, "mode": "x-shader/x-fragment" },
		{ "matches": /x-shader\/x-vertex/i, "mode": "x-shader/x-vertex" }
	);
	
	LanguageManager.defineLanguage("clike", {
		"name": "clike",
		"mode": "clike",
		"blockComment": ["/*", "*/"],
		"lineComment": ["//"]
	});
});

