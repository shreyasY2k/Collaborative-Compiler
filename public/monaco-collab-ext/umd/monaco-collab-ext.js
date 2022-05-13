/**!
© 2019 Convergence Labs, Inc.
@version 0.3.2
@license MIT
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("monaco-editor"));
	else if(typeof define === 'function' && define.amd)
		define("MonacoCollabExt", ["vs/editor/editor.main"], factory);
	else if(typeof exports === 'object')
		exports["MonacoCollabExt"] = factory(require("monaco-editor"));
	else
		root["MonacoCollabExt"] = factory(root["monaco"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
exports.__esModule = true;
/**
 * A helper class to aid in input validation.
 *
 * @internal
 */
var Validation = /** @class */ (function () {
    function Validation() {
    }
    Validation.assertString = function (val, name) {
        if (typeof val !== "string") {
            throw new Error(name + " must be a string but was: " + val);
        }
    };
    Validation.assertNumber = function (val, name) {
        if (typeof val !== "number") {
            throw new Error(name + " must be a number but was: " + val);
        }
    };
    Validation.assertDefined = function (val, name) {
        if (val === undefined || val === null) {
            throw new Error(name + " must be a defined but was: " + val);
        }
    };
    Validation.assertFunction = function (val, name) {
        if (typeof val !== "function") {
            throw new Error(name + " must be a function but was: " + typeof val);
        }
    };
    Validation.assertPosition = function (val, name) {
        Validation.assertDefined(val, name);
        if (typeof val.lineNumber !== "number" || typeof val.column !== "number") {
            throw new Error(name + " must be an Object like {lineNumber: number, column: number}: " + JSON.stringify(val));
        }
    };
    return Validation;
}());
exports.Validation = Validation;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var monaco = __webpack_require__(1);
var Validation_1 = __webpack_require__(0);
/**
 * The EditorContentManager facilitates listening to local content changes and
 * the playback of remote content changes into the editor.
 */
var EditorContentManager = /** @class */ (function () {
    /**
     * Constructs a new EditorContentManager using the supplied options.
     *
     * @param options
     *   The options that configure the EditorContentManager.
     */
    function EditorContentManager(options) {
        var _this = this;
        /**
         * A helper method to process local changes from Monaco.
         *
         * @param e
         *   The event to process.
         * @private
         * @internal
         */
        this._onContentChanged = function (e) {
            if (!_this._suppress) {
                e.changes.forEach(function (change) { return _this._processChange(change); });
            }
        };
        this._options = __assign(__assign({}, EditorContentManager._DEFAULTS), options);
        Validation_1.Validation.assertDefined(this._options, "options");
        Validation_1.Validation.assertDefined(this._options.editor, "options.editor");
        Validation_1.Validation.assertFunction(this._options.onInsert, "options.onInsert");
        Validation_1.Validation.assertFunction(this._options.onReplace, "options.onReplace");
        Validation_1.Validation.assertFunction(this._options.onDelete, "options.onDelete");
        this._disposer = this._options.editor.onDidChangeModelContent(this._onContentChanged);
    }
    /**
     * Inserts text into the editor.
     *
     * @param index
     *   The index to insert text at.
     * @param text
     *   The text to insert.
     */
    EditorContentManager.prototype.insert = function (index, text) {
        this._suppress = true;
        var _a = this._options, ed = _a.editor, remoteSourceId = _a.remoteSourceId;
        var position = ed.getModel().getPositionAt(index);
        ed.executeEdits(remoteSourceId, [{
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: text,
                forceMoveMarkers: true
            }]);
        this._suppress = false;
    };
    /**
     * Replaces text in the editor.
     *
     * @param index
     *   The start index of the range to replace.
     * @param length
     *   The length of the  range to replace.
     * @param text
     *   The text to insert.
     */
    EditorContentManager.prototype.replace = function (index, length, text) {
        this._suppress = true;
        var _a = this._options, ed = _a.editor, remoteSourceId = _a.remoteSourceId;
        var start = ed.getModel().getPositionAt(index);
        var end = ed.getModel().getPositionAt(index + length);
        ed.executeEdits(remoteSourceId, [{
                range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                text: text,
                forceMoveMarkers: true
            }]);
        this._suppress = false;
    };
    /**
     * Deletes text in the editor.
     *
     * @param index
     *   The start index of the range to remove.
     * @param length
     *   The length of the  range to remove.
     */
    EditorContentManager.prototype["delete"] = function (index, length) {
        this._suppress = true;
        var _a = this._options, ed = _a.editor, remoteSourceId = _a.remoteSourceId;
        var start = ed.getModel().getPositionAt(index);
        var end = ed.getModel().getPositionAt(index + length);
        ed.executeEdits(remoteSourceId, [{
                range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                text: "",
                forceMoveMarkers: true
            }]);
        this._suppress = false;
    };
    /**
     * Disposes of the content manager, freeing any resources.
     */
    EditorContentManager.prototype.dispose = function () {
        this._disposer.dispose();
    };
    /**
     * A helper method to process a single content change.
     *
     * @param change
     *   The change to process.
     * @private
     * @internal
     */
    EditorContentManager.prototype._processChange = function (change) {
        Validation_1.Validation.assertDefined(change, "change");
        var rangeOffset = change.rangeOffset, rangeLength = change.rangeLength, text = change.text;
        if (text.length > 0 && rangeLength === 0) {
            this._options.onInsert(rangeOffset, text);
        }
        else if (text.length > 0 && rangeLength > 0) {
            this._options.onReplace(rangeOffset, rangeLength, text);
        }
        else if (text.length === 0 && rangeLength > 0) {
            this._options.onDelete(rangeOffset, rangeLength);
        }
        else {
            throw new Error("Unexpected change: " + JSON.stringify(change));
        }
    };
    /**
     * Option defaults.
     *
     * @internal
     */
    EditorContentManager._DEFAULTS = {
        onInsert: function () {
            // no-op
        },
        onReplace: function () {
            // no-op
        },
        onDelete: function () {
            // no-op
        },
        remoteSourceId: "remote"
    };
    return EditorContentManager;
}());
exports.EditorContentManager = EditorContentManager;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
__export(__webpack_require__(4));
__export(__webpack_require__(7));
__export(__webpack_require__(2));


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var RemoteCursor_1 = __webpack_require__(5);
var RemoteCursorWidget_1 = __webpack_require__(6);
var Validation_1 = __webpack_require__(0);
/**
 * The RemoteCursorManager class is responsible for creating and managing a
 * set of indicators that show where remote users's cursors are located when
 * using Monaco in a collaborative editing context.  The RemoteCursorManager
 * leverages Monaco's Content Widget concept.
 */
var RemoteCursorManager = /** @class */ (function () {
    /**
     * Creates a new RemoteCursorManager with the supplied options.
     *
     * @param options
     *   The options that will configure the RemoteCursorManager behavior.
     */
    function RemoteCursorManager(options) {
        if (typeof options !== "object") {
            throw new Error("'options' is a required parameter and must be an object.");
        }
        // Override the defaults.
        options = __assign(__assign({}, RemoteCursorManager.DEFAULT_OPTIONS), options);
        if (options.editor === undefined || options.editor === null) {
            throw new Error("options.editor must be defined but was: " + options.editor);
        }
        this._options = options;
        this._cursorWidgets = new Map();
        this._nextWidgetId = 0;
    }
    /**
     * Adds a new remote cursor to the editor.
     *
     * @param id
     *   A unique id that will be used to reference this cursor.
     * @param color
     *   The css color that the cursor and tooltip should be rendered in.
     * @param label
     *   An optional label for the tooltip. If tooltips are enabled.
     *
     * @returns
     *   The remote cursor widget that will be added to the editor.
     */
    RemoteCursorManager.prototype.addCursor = function (id, color, label) {
        var _this = this;
        Validation_1.Validation.assertString(id, "id");
        Validation_1.Validation.assertString(color, "color");
        if (this._options.tooltips && typeof "label" !== "string") {
            throw new Error("'label' is required when tooltips are enabled.");
        }
        var widgetId = "" + this._nextWidgetId++;
        var tooltipDurationMs = this._options.tooltipDuration * 1000;
        var cursorWidget = new RemoteCursorWidget_1.RemoteCursorWidget(this._options.editor, widgetId, color, label, this._options.tooltips, tooltipDurationMs, function () { return _this.removeCursor(id); });
        this._cursorWidgets.set(id, cursorWidget);
        return new RemoteCursor_1.RemoteCursor(cursorWidget);
    };
    /**
     * Removes the remote cursor from the editor.
     *
     * @param id
     *   The unique id of the cursor to remove.
     */
    RemoteCursorManager.prototype.removeCursor = function (id) {
        Validation_1.Validation.assertString(id, "id");
        var remoteCursorWidget = this._getCursor(id);
        if (!remoteCursorWidget.isDisposed()) {
            remoteCursorWidget.dispose();
        }
        this._cursorWidgets["delete"](id);
    };
    /**
     * Updates the location of the specified remote cursor using a Monaco
     * IPosition object..
     *
     * @param id
     *   The unique id of the cursor to remove.
     * @param position
     *   The location of the cursor to set.
     */
    RemoteCursorManager.prototype.setCursorPosition = function (id, position) {
        Validation_1.Validation.assertString(id, "id");
        var remoteCursorWidget = this._getCursor(id);
        remoteCursorWidget.setPosition(position);
    };
    /**
     * Updates the location of the specified remote cursor based on a zero-based
     * text offset.
     *
     * @param id
     *   The unique id of the cursor to remove.
     * @param offset
     *   The location of the cursor to set.
     */
    RemoteCursorManager.prototype.setCursorOffset = function (id, offset) {
        Validation_1.Validation.assertString(id, "id");
        var remoteCursorWidget = this._getCursor(id);
        remoteCursorWidget.setOffset(offset);
    };
    /**
     * Shows the specified cursor. Note the cursor may be scrolled out of view.
     *
     * @param id
     *   The unique id of the cursor to show.
     */
    RemoteCursorManager.prototype.showCursor = function (id) {
        Validation_1.Validation.assertString(id, "id");
        var remoteCursorWidget = this._getCursor(id);
        remoteCursorWidget.show();
    };
    /**
     * Hides the specified cursor.
     *
     * @param id
     *   The unique id of the cursor to show.
     */
    RemoteCursorManager.prototype.hideCursor = function (id) {
        Validation_1.Validation.assertString(id, "id");
        var remoteCursorWidget = this._getCursor(id);
        remoteCursorWidget.hide();
    };
    /**
     * A helper method that gets a cursor by id, or throws an exception.
     * @internal
     */
    RemoteCursorManager.prototype._getCursor = function (id) {
        if (!this._cursorWidgets.has(id)) {
            throw new Error("No such cursor: " + id);
        }
        return this._cursorWidgets.get(id);
    };
    /**
     * The default values for optional parameters.
     * @internal
     */
    RemoteCursorManager.DEFAULT_OPTIONS = { tooltips: true, tooltipDuration: 1 };
    return RemoteCursorManager;
}());
exports.RemoteCursorManager = RemoteCursorManager;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
exports.__esModule = true;
/**
 * The RemoteCursor class represents a remote cursor in the MonacoEditor. This
 * class allows you to control the location and visibility of the cursor.
 */
var RemoteCursor = /** @class */ (function () {
    /**
     * Creates a new RemoteCursor.
     *
     * @param delegate
     *   The underlying Monaco Editor widget.
     * @internal
     * @hidden
     */
    function RemoteCursor(delegate) {
        this._delegate = delegate;
    }
    /**
     * Gets the unique id of this cursor.
     *
     * @returns
     *   The unique id of this cursor.
     */
    RemoteCursor.prototype.getId = function () {
        return this._delegate.getId();
    };
    /**
     * Gets the position of the cursor.
     *
     * @returns
     *   The position of the cursor.
     */
    RemoteCursor.prototype.getPosition = function () {
        return this._delegate.getPosition().position;
    };
    /**
     * Sets the location of the cursor based on a Monaco Editor IPosition.
     *
     * @param position
     *   The line / column position of the cursor.
     */
    RemoteCursor.prototype.setPosition = function (position) {
        this._delegate.setPosition(position);
    };
    /**
     * Sets the location of the cursor using a zero-based text offset.
     *
     * @param offset
     *   The offset of the cursor.
     */
    RemoteCursor.prototype.setOffset = function (offset) {
        this._delegate.setOffset(offset);
    };
    /**
     * Shows the cursor if it is hidden.
     */
    RemoteCursor.prototype.show = function () {
        this._delegate.show();
    };
    /**
     * Hides the cursor if it is shown.
     */
    RemoteCursor.prototype.hide = function () {
        this._delegate.hide();
    };
    /**
     * Determines if the cursor has already been disposed. A cursor is disposed
     * when it has been permanently removed from the editor.
     *
     * @returns
     *   True if the cursor has been disposed, false otherwise.
     */
    RemoteCursor.prototype.isDisposed = function () {
        return this._delegate.isDisposed();
    };
    /**
     * Disposes of this cursor, removing it from the editor.
     */
    RemoteCursor.prototype.dispose = function () {
        this._delegate.dispose();
    };
    return RemoteCursor;
}());
exports.RemoteCursor = RemoteCursor;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var monaco_editor_1 = __webpack_require__(1);
var EditorContentManager_1 = __webpack_require__(2);
var Validation_1 = __webpack_require__(0);
function getConfiguration(editorInstance) {
    // Support for Monaco < 0.19.0
    if (typeof editorInstance.getConfiguration === "function") {
        return editorInstance.getConfiguration();
    }
    return {
        lineHeight: editorInstance.getOption(monaco_editor_1.editor.EditorOption.lineHeight)
    };
}
/**
 * This class implements a Monaco Content Widget to render a remote user's
 * cursor, and an optional tooltip.
 *
 * @internal
 */
var RemoteCursorWidget = /** @class */ (function () {
    function RemoteCursorWidget(codeEditor, widgetId, color, label, tooltipEnabled, tooltipDuration, onDisposed) {
        var _this = this;
        this._onInsert = function (index, text) {
            if (_this._position === null) {
                return;
            }
            var offset = _this._offset;
            if (index <= offset) {
                var newOffset = offset + text.length;
                var position = _this._editor.getModel().getPositionAt(newOffset);
                _this._updatePosition(position);
            }
        };
        this._onReplace = function (index, length, text) {
            if (_this._position === null) {
                return;
            }
            var offset = _this._offset;
            if (index <= offset) {
                var newOffset = (offset - Math.min(offset - index, length)) + text.length;
                var position = _this._editor.getModel().getPositionAt(newOffset);
                _this._updatePosition(position);
            }
        };
        this._onDelete = function (index, length) {
            if (_this._position === null) {
                return;
            }
            var offset = _this._offset;
            if (index <= offset) {
                var newOffset = offset - Math.min(offset - index, length);
                var position = _this._editor.getModel().getPositionAt(newOffset);
                _this._updatePosition(position);
            }
        };
        this._editor = codeEditor;
        this._tooltipDuration = tooltipDuration;
        this._id = "monaco-remote-cursor-" + widgetId;
        this._onDisposed = onDisposed;
        // Create the main node for the cursor element.
        var lineHeight = getConfiguration(this._editor).lineHeight;
        this._domNode = document.createElement("div");
        this._domNode.className = "monaco-remote-cursor";
        this._domNode.style.background = color;
        this._domNode.style.height = lineHeight + "px";
        // Create the tooltip element if the tooltip is enabled.
        if (tooltipEnabled) {
            this._tooltipNode = document.createElement("div");
            this._tooltipNode.className = "monaco-remote-cursor-tooltip";
            this._tooltipNode.style.background = color;
            this._tooltipNode.innerHTML = label;
            this._domNode.appendChild(this._tooltipNode);
            // we only need to listen to scroll positions to update the
            // tooltip location on scrolling.
            this._scrollListener = this._editor.onDidScrollChange(function () {
                _this._updateTooltipPosition();
            });
        }
        else {
            this._tooltipNode = null;
            this._scrollListener = null;
        }
        this._contentManager = new EditorContentManager_1.EditorContentManager({
            editor: this._editor,
            onInsert: this._onInsert,
            onReplace: this._onReplace,
            onDelete: this._onDelete
        });
        this._hideTimer = null;
        this._editor.addContentWidget(this);
        this._offset = -1;
        this._disposed = false;
    }
    RemoteCursorWidget.prototype.hide = function () {
        this._domNode.style.display = "none";
    };
    RemoteCursorWidget.prototype.show = function () {
        this._domNode.style.display = "inherit";
    };
    RemoteCursorWidget.prototype.setOffset = function (offset) {
        Validation_1.Validation.assertNumber(offset, "offset");
        var position = this._editor.getModel().getPositionAt(offset);
        this.setPosition(position);
    };
    RemoteCursorWidget.prototype.setPosition = function (position) {
        var _this = this;
        Validation_1.Validation.assertPosition(position, "position");
        this._updatePosition(position);
        if (this._tooltipNode !== null) {
            setTimeout(function () { return _this._showTooltip(); }, 0);
        }
    };
    RemoteCursorWidget.prototype.isDisposed = function () {
        return this._disposed;
    };
    RemoteCursorWidget.prototype.dispose = function () {
        if (this._disposed) {
            return;
        }
        this._editor.removeContentWidget(this);
        if (this._scrollListener !== null) {
            this._scrollListener.dispose();
        }
        this._contentManager.dispose();
        this._disposed = true;
        this._onDisposed();
    };
    RemoteCursorWidget.prototype.getId = function () {
        return this._id;
    };
    RemoteCursorWidget.prototype.getDomNode = function () {
        return this._domNode;
    };
    RemoteCursorWidget.prototype.getPosition = function () {
        return this._position;
    };
    RemoteCursorWidget.prototype._updatePosition = function (position) {
        this._position = {
            position: __assign({}, position),
            preference: [monaco_editor_1.editor.ContentWidgetPositionPreference.EXACT]
        };
        this._offset = this._editor.getModel().getOffsetAt(position);
        this._editor.layoutContentWidget(this);
    };
    RemoteCursorWidget.prototype._showTooltip = function () {
        var _this = this;
        this._updateTooltipPosition();
        if (this._hideTimer !== null) {
            clearTimeout(this._hideTimer);
        }
        else {
            this._setTooltipVisible(true);
        }
        this._hideTimer = setTimeout(function () {
            _this._setTooltipVisible(false);
            _this._hideTimer = null;
        }, this._tooltipDuration);
    };
    RemoteCursorWidget.prototype._updateTooltipPosition = function () {
        var distanceFromTop = this._domNode.offsetTop - this._editor.getScrollTop();
        if (distanceFromTop - this._tooltipNode.offsetHeight < 5) {
            this._tooltipNode.style.top = this._tooltipNode.offsetHeight + 2 + "px";
        }
        else {
            this._tooltipNode.style.top = "-" + this._tooltipNode.offsetHeight + "px";
        }
        this._tooltipNode.style.left = "0";
    };
    RemoteCursorWidget.prototype._setTooltipVisible = function (visible) {
        if (visible) {
            this._tooltipNode.style.opacity = "1.0";
        }
        else {
            this._tooltipNode.style.opacity = "0";
        }
    };
    return RemoteCursorWidget;
}());
exports.RemoteCursorWidget = RemoteCursorWidget;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
exports.__esModule = true;
var RemoteSelection_1 = __webpack_require__(8);
var Validation_1 = __webpack_require__(0);
/**
 * The RemoteSelectionManager renders remote users selections into the Monaco
 * editor using the editor's built-in decorators mechanism.
 */
var RemoteSelectionManager = /** @class */ (function () {
    /**
     * Creates a new RemoteSelectionManager with the specified options.
     *
     * @param options
     *   Ths options that configure the RemoteSelectionManager.
     */
    function RemoteSelectionManager(options) {
        Validation_1.Validation.assertDefined(options, "options");
        this._remoteSelections = new Map();
        this._options = options;
        this._nextClassId = 0;
    }
    /**
     * Adds a new remote selection with a unique id and the specified color.
     *
     * @param id
     *   The unique id of the selection.
     * @param color
     *   The color to render the selection with.
     */
    RemoteSelectionManager.prototype.addSelection = function (id, color, label) {
        var _this = this;
        var onDisposed = function () {
            _this.removeSelection(id);
        };
        var selection = new RemoteSelection_1.RemoteSelection(this._options.editor, id, this._nextClassId++, color, label, onDisposed);
        this._remoteSelections.set(id, selection);
        return selection;
    };
    /**
     * Removes an existing remote selection from the editor.
     *
     * @param id
     *   The unique id of the selection.
     */
    RemoteSelectionManager.prototype.removeSelection = function (id) {
        var remoteSelection = this._getSelection(id);
        if (!remoteSelection.isDisposed()) {
            remoteSelection.dispose();
        }
    };
    /**
     * Sets the selection using zero-based text offset locations.
     *
     * @param id
     *   The unique id of the selection.
     * @param start
     *   The starting offset of the selection.
     * @param end
     *   The ending offset of the selection.
     */
    RemoteSelectionManager.prototype.setSelectionOffsets = function (id, start, end) {
        var remoteSelection = this._getSelection(id);
        remoteSelection.setOffsets(start, end);
    };
    /**
     * Sets the selection using the Monaco Editor's IPosition (line numbers and columns)
     * location concept.
     *
     * @param id
     *   The unique id of the selection.
     * @param start
     *   The starting position of the selection.
     * @param end
     *   The ending position of the selection.
     */
    RemoteSelectionManager.prototype.setSelectionPositions = function (id, start, end) {
        var remoteSelection = this._getSelection(id);
        remoteSelection.setPositions(start, end);
    };
    /**
     * Shows the specified selection, if it is currently hidden.
     *
     * @param id
     *   The unique id of the selection.
     */
    RemoteSelectionManager.prototype.showSelection = function (id) {
        var remoteSelection = this._getSelection(id);
        remoteSelection.show();
    };
    /**
     * Hides the specified selection, if it is currently shown.
     *
     * @param id
     *   The unique id of the selection.
     */
    RemoteSelectionManager.prototype.hideSelection = function (id) {
        var remoteSelection = this._getSelection(id);
        remoteSelection.hide();
    };
    /**
     * A helper method that gets a cursor by id, or throws an exception.
     * @internal
     */
    RemoteSelectionManager.prototype._getSelection = function (id) {
        if (!this._remoteSelections.has(id)) {
            throw new Error("No such selection: " + id);
        }
        return this._remoteSelections.get(id);
    };
    return RemoteSelectionManager;
}());
exports.RemoteSelectionManager = RemoteSelectionManager;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var monaco = __webpack_require__(1);
var Validation_1 = __webpack_require__(0);
var RemoteSelection = /** @class */ (function () {
    /**
     * Constructs a new remote selection.
     *
     * @internal
     */
    function RemoteSelection(codeEditor, id, classId, color, label, onDisposed) {
        this._editor = codeEditor;
        this._id = id;
        var uniqueClassId = "monaco-remote-selection-" + classId;
        this._className = "monaco-remote-selection " + uniqueClassId;
        this._styleElement = RemoteSelection._addDynamicStyleElement(uniqueClassId, color);
        this._label = label;
        this._decorations = [];
        this._onDisposed = onDisposed;
    }
    /**
     * A helper method to add a style tag to the head of the document that will
     * style the color of the selection. The Monaco Editor only allows setting
     * the class name of decorations, so we can not set a style property directly.
     * This method will create, add, and return the style tag for this element.
     *
     * @param className
     *   The className to use as the css selector.
     * @param color
     *   The color to set for the selection.
     * @returns
     *   The style element that was added to the document head.
     *
     * @private
     * @internal
     */
    RemoteSelection._addDynamicStyleElement = function (className, color) {
        Validation_1.Validation.assertString(className, "className");
        Validation_1.Validation.assertString(color, "color");
        var css = ("." + className + " {\n         background-color: " + color + ";\n       }").trim();
        var styleElement = document.createElement("style");
        styleElement.innerText = css;
        document.head.appendChild(styleElement);
        return styleElement;
    };
    /**
     * A helper method to ensure the start position is before the end position.
     *
     * @param start
     *   The current start position.
     * @param end
     *   The current end position.
     * @return
     *   An object containing the correctly ordered start and end positions.
     *
     * @private
     * @internal
     */
    RemoteSelection._swapIfNeeded = function (start, end) {
        if (start.lineNumber < end.lineNumber || (start.lineNumber === end.lineNumber && start.column <= end.column)) {
            return { start: start, end: end };
        }
        else {
            return { start: end, end: start };
        }
    };
    /**
     * Gets the userland id of this selection.
     */
    RemoteSelection.prototype.getId = function () {
        return this._id;
    };
    /**
     * Gets the start position of the selection.
     *
     * @returns
     *   The start position of the selection.
     */
    RemoteSelection.prototype.getStartPosition = function () {
        return __assign({}, this._startPosition);
    };
    /**
     * Gets the start position of the selection.
     *
     * @returns
     *   The start position of the selection.
     */
    RemoteSelection.prototype.getEndPosition = function () {
        return __assign({}, this._endPosition);
    };
    /**
     * Sets the selection using zero-based text indices.
     *
     * @param start
     *   The start offset to set the selection to.
     * @param end
     *   The end offset to set the selection to.
     */
    RemoteSelection.prototype.setOffsets = function (start, end) {
        var startPosition = this._editor.getModel().getPositionAt(start);
        var endPosition = this._editor.getModel().getPositionAt(end);
        this.setPositions(startPosition, endPosition);
    };
    /**
     * Sets the selection using Monaco's line-number / column coordinate system.
     *
     * @param start
     *   The start position to set the selection to.
     * @param end
     *   The end position to set the selection to.
     */
    RemoteSelection.prototype.setPositions = function (start, end) {
        // this._decorations = this._editor.deltaDecorations(this._decorations, []);
        var ordered = RemoteSelection._swapIfNeeded(start, end);
        this._startPosition = ordered.start;
        this._endPosition = ordered.end;
        this._render();
    };
    /**
     * Makes the selection visible if it is hidden.
     */
    RemoteSelection.prototype.show = function () {
        this._render();
    };
    /**
     * Makes the selection hidden if it is visible.
     */
    RemoteSelection.prototype.hide = function () {
        this._decorations = this._editor.deltaDecorations(this._decorations, []);
    };
    /**
     * Determines if the selection has been permanently removed from the editor.
     *
     * @returns
     *   True if the selection has been disposed, false otherwise.
     */
    RemoteSelection.prototype.isDisposed = function () {
        return this._disposed;
    };
    /**
     * Permanently removes the selection from the editor.
     */
    RemoteSelection.prototype.dispose = function () {
        if (!this._disposed) {
            this._styleElement.parentElement.removeChild(this._styleElement);
            this.hide();
            this._disposed = true;
            this._onDisposed();
        }
    };
    /**
     * A helper method that actually renders the selection as a decoration within
     * the Monaco Editor.
     *
     * @private
     * @internal
     */
    RemoteSelection.prototype._render = function () {
        this._decorations = this._editor.deltaDecorations(this._decorations, [
            {
                range: new monaco.Range(this._startPosition.lineNumber, this._startPosition.column, this._endPosition.lineNumber, this._endPosition.column),
                options: {
                    className: this._className,
                    hoverMessage: this._label != null ? {
                        value: this._label
                    } : null
                }
            }
        ]);
    };
    return RemoteSelection;
}());
exports.RemoteSelection = RemoteSelection;


/***/ })
/******/ ]);
});