/*global define, brackets*/
define(function (require, exports, module) {
	'use strict';
	
	var LanguageManager = brackets.getModule("language/LanguageManager"),
		CodeHintManager = brackets.getModule("editor/CodeHintManager"),
		AppInit = brackets.getModule("utils/AppInit"),
		TokenUtils = brackets.getModule("utils/TokenUtils"),
		CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
		glslWords = JSON.parse(require("text!glsl.json"));
	
	CodeMirror.resolveMode("text/x-brackets-html").scriptTypes.push(
		{ "matches": /x-shader\/x-fragment/i, 'mode': "x-shader/x-fragment" },
		{ "matches": /x-shader\/x-vertex/i, 'mode': "x-shader/x-vertex" }
	);
	
	LanguageManager.defineLanguage('clike', {
		name: 'clike',
		mode: 'clike',
		blockComment: ['/*', '*/'],
		lineComment: ['//']
	});

	function add(list, words, token) {
		for(var i = 0, n = words.length; i < n; i++) {
			if(words[i].name.indexOf(token) >= 0) {
				list.push($('<span>').text(words[i].name));
			}
		}
	}
	
	function GLSLHints() {
		this.input = [];
	}
	
	GLSLHints.prototype.hasHints = function(editor, implicitChar) {
		if(!implicitChar || /[\w#_]/.test(implicitChar)) {
			var cursor = editor.getCursorPos(),
				token = editor._codeMirror.getTokenAt(cursor);
			
			if (token.type !== 'comment') {
				this.editor = editor;
				this.token = token;
				this.isFragment = token.state.localMode.helperType === 'x-shader/x-fragment';
				this.pre = implicitChar === '#' || token.string[0] === '#';
				return true;
			}
		}
		return false;
	};
	
	GLSLHints.prototype.getHints = function(implicitChar) {
		var hintList = [],
			cursor = this.editor.getCursorPos(),
			token = this.editor._codeMirror.getTokenAt(cursor);
		
		if(implicitChar === null && cursor.ch <= this.token.start) {
			return null;
		}
		
		if(' /()[],;.'.indexOf(implicitChar) >= 0) {
			return null;
		}
		
		var str = token.string.slice(0, cursor.ch - token.start);
		
		if(this.pre) {
			add(hintList, glslWords.pres, str);
		} else {
			add(hintList, glslWords.types, str);
			add(hintList, glslWords.vars, str);
			add(hintList, glslWords.funcs, str);
		}
		
		return {
			hints: hintList,
			match: null,
			selectInitial: true,
			handleWideResults: false
		};
	};
	
	GLSLHints.prototype.insertHint = function(hint) {
		var cursor = this.editor.getCursorPos(),
			start = {line: cursor.line, ch: this.token.start},
			end = cursor;
		this.editor.document.replaceRange(hint.text(), start, end);
		return false;
	};
	
	AppInit.appReady(function() {
		var glslHints = new GLSLHints();
		CodeHintManager.registerHintProvider(glslHints, ['clike'], 0);
	});
});

