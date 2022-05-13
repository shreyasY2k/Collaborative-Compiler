"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteSelection = void 0;

var monaco = _interopRequireWildcard(require("monaco-editor"));

var _Validation = require("./Validation");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RemoteSelection = /*#__PURE__*/function () {
  /**
   * Constructs a new remote selection.
   *
   * @internal
   */
  function RemoteSelection(codeEditor, id, classId, color, label, onDisposed) {
    _classCallCheck(this, RemoteSelection);

    this._editor = codeEditor;
    this._id = id;
    var uniqueClassId = "monaco-remote-selection-".concat(classId);
    this._className = "monaco-remote-selection ".concat(uniqueClassId);
    this._styleElement = RemoteSelection._addDynamicStyleElement(uniqueClassId, color);
    this._label = label;
    this._decorations = [];
    this._onDisposed = onDisposed;
  }
  /**
   * Gets the userland id of this selection.
   */


  _createClass(RemoteSelection, [{
    key: "getId",
    value: function getId() {
      return this._id;
    }
    /**
     * Gets the start position of the selection.
     *
     * @returns
     *   The start position of the selection.
     */

  }, {
    key: "getStartPosition",
    value: function getStartPosition() {
      return _objectSpread({}, this._startPosition);
    }
    /**
     * Gets the start position of the selection.
     *
     * @returns
     *   The start position of the selection.
     */

  }, {
    key: "getEndPosition",
    value: function getEndPosition() {
      return _objectSpread({}, this._endPosition);
    }
    /**
     * Sets the selection using zero-based text indices.
     *
     * @param start
     *   The start offset to set the selection to.
     * @param end
     *   The end offset to set the selection to.
     */

  }, {
    key: "setOffsets",
    value: function setOffsets(start, end) {
      var startPosition = this._editor.getModel().getPositionAt(start);

      var endPosition = this._editor.getModel().getPositionAt(end);

      this.setPositions(startPosition, endPosition);
    }
    /**
     * Sets the selection using Monaco's line-number / column coordinate system.
     *
     * @param start
     *   The start position to set the selection to.
     * @param end
     *   The end position to set the selection to.
     */

  }, {
    key: "setPositions",
    value: function setPositions(start, end) {
      // this._decorations = this._editor.deltaDecorations(this._decorations, []);
      var ordered = RemoteSelection._swapIfNeeded(start, end);

      this._startPosition = ordered.start;
      this._endPosition = ordered.end;

      this._render();
    }
    /**
     * Makes the selection visible if it is hidden.
     */

  }, {
    key: "show",
    value: function show() {
      this._render();
    }
    /**
     * Makes the selection hidden if it is visible.
     */

  }, {
    key: "hide",
    value: function hide() {
      this._decorations = this._editor.deltaDecorations(this._decorations, []);
    }
    /**
     * Determines if the selection has been permanently removed from the editor.
     *
     * @returns
     *   True if the selection has been disposed, false otherwise.
     */

  }, {
    key: "isDisposed",
    value: function isDisposed() {
      return this._disposed;
    }
    /**
     * Permanently removes the selection from the editor.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      if (!this._disposed) {
        this._styleElement.parentElement.removeChild(this._styleElement);

        this.hide();
        this._disposed = true;

        this._onDisposed();
      }
    }
    /**
     * A helper method that actually renders the selection as a decoration within
     * the Monaco Editor.
     *
     * @private
     * @internal
     */

  }, {
    key: "_render",
    value: function _render() {
      this._decorations = this._editor.deltaDecorations(this._decorations, [{
        range: new monaco.Range(this._startPosition.lineNumber, this._startPosition.column, this._endPosition.lineNumber, this._endPosition.column),
        options: {
          className: this._className,
          hoverMessage: this._label != null ? {
            value: this._label
          } : null
        }
      }]);
    }
  }], [{
    key: "_addDynamicStyleElement",
    value:
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
    function _addDynamicStyleElement(className, color) {
      _Validation.Validation.assertString(className, "className");

      _Validation.Validation.assertString(color, "color");

      var css = ".".concat(className, " {\n         background-color: ").concat(color, ";\n       }").trim();
      var styleElement = document.createElement("style");
      styleElement.innerText = css;
      document.head.appendChild(styleElement);
      return styleElement;
    }
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

  }, {
    key: "_swapIfNeeded",
    value: function _swapIfNeeded(start, end) {
      if (start.lineNumber < end.lineNumber || start.lineNumber === end.lineNumber && start.column <= end.column) {
        return {
          start: start,
          end: end
        };
      } else {
        return {
          start: end,
          end: start
        };
      }
    }
    /**
     * The userland id of the selection.
     * @internal
     */

  }]);

  return RemoteSelection;
}();

exports.RemoteSelection = RemoteSelection;