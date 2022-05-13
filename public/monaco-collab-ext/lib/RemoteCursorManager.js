"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteCursorManager = void 0;

var _RemoteCursor = require("./RemoteCursor");

var _RemoteCursorWidget = require("./RemoteCursorWidget");

var _Validation = require("./Validation");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * The RemoteCursorManager class is responsible for creating and managing a
 * set of indicators that show where remote users's cursors are located when
 * using Monaco in a collaborative editing context.  The RemoteCursorManager
 * leverages Monaco's Content Widget concept.
 */
var RemoteCursorManager = /*#__PURE__*/function () {
  /**
   * The default values for optional parameters.
   * @internal
   */

  /**
   * A counter that generates unique ids for the cursor widgets.
   * @internal
   */

  /**
   * Tracks the current cursor widgets by the userland id.
   * @internal
   */

  /**
   * The options (and defaults) used to configure this instance.
   * @internal
   */

  /**
   * Creates a new RemoteCursorManager with the supplied options.
   *
   * @param options
   *   The options that will configure the RemoteCursorManager behavior.
   */
  function RemoteCursorManager(options) {
    _classCallCheck(this, RemoteCursorManager);

    if (_typeof(options) !== "object") {
      throw new Error("'options' is a required parameter and must be an object.");
    } // Override the defaults.


    options = _objectSpread(_objectSpread({}, RemoteCursorManager.DEFAULT_OPTIONS), options);

    if (options.editor === undefined || options.editor === null) {
      throw new Error("options.editor must be defined but was: ".concat(options.editor));
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


  _createClass(RemoteCursorManager, [{
    key: "addCursor",
    value: function addCursor(id, color, label) {
      var _this = this;

      _Validation.Validation.assertString(id, "id");

      _Validation.Validation.assertString(color, "color");

      if (this._options.tooltips && typeof "label" !== "string") {
        throw new Error("'label' is required when tooltips are enabled.");
      }

      var widgetId = "" + this._nextWidgetId++;
      var tooltipDurationMs = this._options.tooltipDuration * 1000;
      var cursorWidget = new _RemoteCursorWidget.RemoteCursorWidget(this._options.editor, widgetId, color, label, this._options.tooltips, tooltipDurationMs, function () {
        return _this.removeCursor(id);
      });

      this._cursorWidgets.set(id, cursorWidget);

      return new _RemoteCursor.RemoteCursor(cursorWidget);
    }
    /**
     * Removes the remote cursor from the editor.
     *
     * @param id
     *   The unique id of the cursor to remove.
     */

  }, {
    key: "removeCursor",
    value: function removeCursor(id) {
      _Validation.Validation.assertString(id, "id");

      var remoteCursorWidget = this._getCursor(id);

      if (!remoteCursorWidget.isDisposed()) {
        remoteCursorWidget.dispose();
      }

      this._cursorWidgets.delete(id);
    }
    /**
     * Updates the location of the specified remote cursor using a Monaco
     * IPosition object..
     *
     * @param id
     *   The unique id of the cursor to remove.
     * @param position
     *   The location of the cursor to set.
     */

  }, {
    key: "setCursorPosition",
    value: function setCursorPosition(id, position) {
      _Validation.Validation.assertString(id, "id");

      var remoteCursorWidget = this._getCursor(id);

      remoteCursorWidget.setPosition(position);
    }
    /**
     * Updates the location of the specified remote cursor based on a zero-based
     * text offset.
     *
     * @param id
     *   The unique id of the cursor to remove.
     * @param offset
     *   The location of the cursor to set.
     */

  }, {
    key: "setCursorOffset",
    value: function setCursorOffset(id, offset) {
      _Validation.Validation.assertString(id, "id");

      var remoteCursorWidget = this._getCursor(id);

      remoteCursorWidget.setOffset(offset);
    }
    /**
     * Shows the specified cursor. Note the cursor may be scrolled out of view.
     *
     * @param id
     *   The unique id of the cursor to show.
     */

  }, {
    key: "showCursor",
    value: function showCursor(id) {
      _Validation.Validation.assertString(id, "id");

      var remoteCursorWidget = this._getCursor(id);

      remoteCursorWidget.show();
    }
    /**
     * Hides the specified cursor.
     *
     * @param id
     *   The unique id of the cursor to show.
     */

  }, {
    key: "hideCursor",
    value: function hideCursor(id) {
      _Validation.Validation.assertString(id, "id");

      var remoteCursorWidget = this._getCursor(id);

      remoteCursorWidget.hide();
    }
    /**
     * A helper method that gets a cursor by id, or throws an exception.
     * @internal
     */

  }, {
    key: "_getCursor",
    value: function _getCursor(id) {
      if (!this._cursorWidgets.has(id)) {
        throw new Error("No such cursor: " + id);
      }

      return this._cursorWidgets.get(id);
    }
  }]);

  return RemoteCursorManager;
}();

exports.RemoteCursorManager = RemoteCursorManager;
RemoteCursorManager.DEFAULT_OPTIONS = {
  tooltips: true,
  tooltipDuration: 1
};