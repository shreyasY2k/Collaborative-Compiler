"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditorContentManager = void 0;

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

/**
 * The EditorContentManager facilitates listening to local content changes and
 * the playback of remote content changes into the editor.
 */
var EditorContentManager = /*#__PURE__*/function () {
  /**
   * Option defaults.
   *
   * @internal
   */

  /**
   * The options that configure the EditorContentManager.
   * @internal
   */

  /**
   * A flag denoting if outgoing events should be suppressed.
   * @internal
   */

  /**
   * A callback to dispose of the content change listener.
   * @internal
   */

  /**
   * Constructs a new EditorContentManager using the supplied options.
   *
   * @param options
   *   The options that configure the EditorContentManager.
   */
  function EditorContentManager(options) {
    var _this = this;

    _classCallCheck(this, EditorContentManager);

    this._onContentChanged = function (e) {
      if (!_this._suppress) {
        e.changes.forEach(function (change) {
          return _this._processChange(change);
        });
      }
    };

    this._options = _objectSpread(_objectSpread({}, EditorContentManager._DEFAULTS), options);

    _Validation.Validation.assertDefined(this._options, "options");

    _Validation.Validation.assertDefined(this._options.editor, "options.editor");

    _Validation.Validation.assertFunction(this._options.onInsert, "options.onInsert");

    _Validation.Validation.assertFunction(this._options.onReplace, "options.onReplace");

    _Validation.Validation.assertFunction(this._options.onDelete, "options.onDelete");

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


  _createClass(EditorContentManager, [{
    key: "insert",
    value: function insert(index, text) {
      this._suppress = true;
      var _this$_options = this._options,
          ed = _this$_options.editor,
          remoteSourceId = _this$_options.remoteSourceId;
      var position = ed.getModel().getPositionAt(index);
      ed.executeEdits(remoteSourceId, [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: text,
        forceMoveMarkers: true
      }]);
      this._suppress = false;
    }
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

  }, {
    key: "replace",
    value: function replace(index, length, text) {
      this._suppress = true;
      var _this$_options2 = this._options,
          ed = _this$_options2.editor,
          remoteSourceId = _this$_options2.remoteSourceId;
      var start = ed.getModel().getPositionAt(index);
      var end = ed.getModel().getPositionAt(index + length);
      ed.executeEdits(remoteSourceId, [{
        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        text: text,
        forceMoveMarkers: true
      }]);
      this._suppress = false;
    }
    /**
     * Deletes text in the editor.
     *
     * @param index
     *   The start index of the range to remove.
     * @param length
     *   The length of the  range to remove.
     */

  }, {
    key: "delete",
    value: function _delete(index, length) {
      this._suppress = true;
      var _this$_options3 = this._options,
          ed = _this$_options3.editor,
          remoteSourceId = _this$_options3.remoteSourceId;
      var start = ed.getModel().getPositionAt(index);
      var end = ed.getModel().getPositionAt(index + length);
      ed.executeEdits(remoteSourceId, [{
        range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
        text: "",
        forceMoveMarkers: true
      }]);
      this._suppress = false;
    }
    /**
     * Disposes of the content manager, freeing any resources.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      this._disposer.dispose();
    }
    /**
     * A helper method to process local changes from Monaco.
     *
     * @param e
     *   The event to process.
     * @private
     * @internal
     */

  }, {
    key: "_processChange",
    value:
    /**
     * A helper method to process a single content change.
     *
     * @param change
     *   The change to process.
     * @private
     * @internal
     */
    function _processChange(change) {
      _Validation.Validation.assertDefined(change, "change");

      var rangeOffset = change.rangeOffset,
          rangeLength = change.rangeLength,
          text = change.text;

      if (text.length > 0 && rangeLength === 0) {
        this._options.onInsert(rangeOffset, text);
      } else if (text.length > 0 && rangeLength > 0) {
        this._options.onReplace(rangeOffset, rangeLength, text);
      } else if (text.length === 0 && rangeLength > 0) {
        this._options.onDelete(rangeOffset, rangeLength);
      } else {
        throw new Error("Unexpected change: " + JSON.stringify(change));
      }
    }
  }]);

  return EditorContentManager;
}();

exports.EditorContentManager = EditorContentManager;
EditorContentManager._DEFAULTS = {
  onInsert: function onInsert() {// no-op
  },
  onReplace: function onReplace() {// no-op
  },
  onDelete: function onDelete() {// no-op
  },
  remoteSourceId: "remote"
};