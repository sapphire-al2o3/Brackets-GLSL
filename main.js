define(function (require, exports, module) {
	'use strict';
	
	CodeMirror.defineMIME("text/x-brackets-html", {
		"name": "htmlmixed",
		"scriptTypes": [
			{ "matches": /x-shader\/x-fragment/i, "mode": "x-shader/x-fragment" },
			{ "matches": /x-shader\/x-vertex/i, "mode": "x-shader/x-vertex" }
		]
	});
	
});

