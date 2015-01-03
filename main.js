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
	
	var mode = CodeMirror.resolveMode('x-shader/x-fragment');
	delete mode.builtin['smootstep'];
	delete mode.keywords['sampler2DShadowconst'];
	mode.builtin['smoothstep'] = true;
	mode.atoms['gl_PointCoord'] = true;
	mode.keywords['precision'] = true;
	mode.keywords['highp'] = true;
	mode.keywords['mediump'] = true;
	mode.keywords['lowp'] = true;
	mode.keywords['const'] = true;
	
	function GLSLMode(helperType) {
		this.helperType = helperType;
	}
	
	GLSLMode.prototype = mode;
	
	var vertexMode = new GLSLMode('x-shader/x-vertex'),
		fragmentMode = new GLSLMode('x-shader/x-fragment');
	
	CodeMirror.defineMIME(vertexMode.helperType, vertexMode);
	CodeMirror.defineMIME(fragmentMode.helperType, fragmentMode);
	
	LanguageManager.defineLanguage('clike', {
		name: 'clike',
		mode: 'clike',
		blockComment: ['/*', '*/'],
		lineComment: ['//']
	});

	function add(list, words, token) {
		for(var i = 0, n = words.length; i < n; i++) {
			if(words[i].name.indexOf(token) >= 0) {
				var $hint = $('<span>');
				$hint.addClass('brackets-js-hints');
				$hint.data(words[i].name);
				list.push($hint.html(words[i].name.replace(token, '<span style="font-weight: 500;">' + token + '</span>')));
			}
		}
	}
	
	function GLSLHints() {
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
			if(this.isFragment) {
				add(hintList, glslWords.fragVars, str);
			} else {
				add(hintList, glslWords.vertVars, str);
			}
			add(hintList, glslWords.types, str);
			add(hintList, glslWords.const, str);
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

