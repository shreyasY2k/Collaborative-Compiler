"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteCursorWidget = void 0;

var _monacoEditor = require("monaco-editor");

var _EditorContentManager = require("./EditorContentManager");

var _Validation = require("./Validation");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function getConfiguration(editorInstance) {
  // Support for Monaco < 0.19.0
  if (typeof editorInstance.getConfiguration === "function") {
    return editorInstance.getConfiguration();
  }

  return {
    lineHeight: editorInstance.getOption(_monacoEditor.editor.EditorOption.lineHeight)
  };
}
/**
 * This class implements a Monaco Content Widget to render a remote user's
 * cursor, and an optional tooltip.
 *
 * @internal
 */


var RemoteCursorWidget = /*#__PURE__*/function () {
  function RemoteCursorWidget(codeEditor, widgetId, color, label, tooltipEnabled, tooltipDuration, onDisposed) {
    var _this = this;

    _classCallCheck(this, RemoteCursorWidget);

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
        var newOffset = offset - Math.min(offset - index, length) + text.length;

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
    this._id = "monaco-remote-cursor-".concat(widgetId);
    this._onDisposed = onDisposed; // Create the main node for the cursor element.

    var _getConfiguration = getConfiguration(this._editor),
        lineHeight = _getConfiguration.lineHeight;

    this._domNode = document.createElement("div");
    this._domNode.className = "monaco-remote-cursor";
    this._domNode.style.background = color;
    this._domNode.style.height = "".concat(lineHeight, "px"); // Create the tooltip element if the tooltip is enabled.

    if (tooltipEnabled) {
      this._tooltipNode = document.createElement("div");
      this._tooltipNode.className = "monaco-remote-cursor-tooltip";
      this._tooltipNode.style.background = color;
      this._tooltipNode.innerHTML = label;

      this._domNode.appendChild(this._tooltipNode); // we only need to listen to scroll positions to update the
      // tooltip location on scrolling.


      this._scrollListener = this._editor.onDidScrollChange(function () {
        _this._updateTooltipPosition();
      });
    } else {
      this._tooltipNode = null;
      this._scrollListener = null;
    }

    this._contentManager = new _EditorContentManager.EditorContentManager({
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

  _createClass(RemoteCursorWidget, [{
    key: "hide",
    value: function hide() {
      this._domNode.style.display = "none";
    }
  }, {
    key: "show",
    value: function show() {
      this._domNode.style.display = "inherit";
    }
  }, {
    key: "setOffset",
    value: function setOffset(offset) {
      _Validation.Validation.assertNumber(offset, "offset");

      var position = this._editor.getModel().getPositionAt(offset);

      this.setPosition(position);
    }
  }, {
    key: "setPosition",
    value: function setPosition(position) {
      var _this2 = this;

      _Validation.Validation.assertPosition(position, "position");

      this._updatePosition(position);

      if (this._tooltipNode !== null) {
        setTimeout(function () {
          return _this2._showTooltip();
        }, 0);
      }
    }
  }, {
    key: "isDisposed",
    value: function isDisposed() {
      return this._disposed;
    }
  }, {
    key: "dispose",
    value: function dispose() {
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
    }
  }, {
    key: "getId",
    value: function getId() {
      return this._id;
    }
  }, {
    key: "getDomNode",
    value: function getDomNode() {
      return this._domNode;
    }
  }, {
    key: "getPosition",
    value: function getPosition() {
      return this._position;
    }
  }, {
    key: "_updatePosition",
    value: function _updatePosition(position) {
      this._position = {
        position: _objectSpread({}, position),
        preference: [_monacoEditor.editor.ContentWidgetPositionPreference.EXACT]
      };
      this._offset = this._editor.getModel().getOffsetAt(position);

      this._editor.layoutContentWidget(this);
    }
  }, {
    key: "_showTooltip",
    value: function _showTooltip() {
      var _this3 = this;

      this._updateTooltipPosition();

      if (this._hideTimer !== null) {
        clearTimeout(this._hideTimer);
      } else {
        this._setTooltipVisible(true);
      }

      this._hideTimer = setTimeout(function () {
        _this3._setTooltipVisible(false);

        _this3._hideTimer = null;
      }, this._tooltipDuration);
    }
  }, {
    key: "_updateTooltipPosition",
    value: function _updateTooltipPosition() {
      var distanceFromTop = this._domNode.offsetTop - this._editor.getScrollTop();

      if (distanceFromTop - this._tooltipNode.offsetHeight < 5) {
        this._tooltipNode.style.top = "".concat(this._tooltipNode.offsetHeight + 2, "px");
      } else {
        this._tooltipNode.style.top = "-".concat(this._tooltipNode.offsetHeight, "px");
      }

      this._tooltipNode.style.left = "0";
    }
  }, {
    key: "_setTooltipVisible",
    value: function _setTooltipVisible(visible) {
      if (visible) {
        this._tooltipNode.style.opacity = "1.0";
      } else {
        this._tooltipNode.style.opacity = "0";
      }
    }
  }]);

  return RemoteCursorWidget;
}();

exports.RemoteCursorWidget = RemoteCursorWidget;