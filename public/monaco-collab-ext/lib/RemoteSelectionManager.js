"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteSelectionManager = void 0;

var _RemoteSelection = require("./RemoteSelection");

var _Validation = require("./Validation");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * The RemoteSelectionManager renders remote users selections into the Monaco
 * editor using the editor's built-in decorators mechanism.
 */
var RemoteSelectionManager = /*#__PURE__*/function () {
  /**
   * A internal unique identifier for each selection.
   *
   * @internal
   */

  /**
   * Tracks the current remote selections.
   *
   * @internal
   */

  /**
   * The options configuring this instance.
   *
   * @internal
   */

  /**
   * Creates a new RemoteSelectionManager with the specified options.
   *
   * @param options
   *   Ths options that configure the RemoteSelectionManager.
   */
  function RemoteSelectionManager(options) {
    _classCallCheck(this, RemoteSelectionManager);

    _Validation.Validation.assertDefined(options, "options");

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


  _createClass(RemoteSelectionManager, [{
    key: "addSelection",
    value: function addSelection(id, color, label) {
      var _this = this;

      var onDisposed = function onDisposed() {
        _this.removeSelection(id);
      };

      var selection = new _RemoteSelection.RemoteSelection(this._options.editor, id, this._nextClassId++, color, label, onDisposed);

      this._remoteSelections.set(id, selection);

      return selection;
    }
    /**
     * Removes an existing remote selection from the editor.
     *
     * @param id
     *   The unique id of the selection.
     */

  }, {
    key: "removeSelection",
    value: function removeSelection(id) {
      var remoteSelection = this._getSelection(id);

      if (!remoteSelection.isDisposed()) {
        remoteSelection.dispose();
      }
    }
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

  }, {
    key: "setSelectionOffsets",
    value: function setSelectionOffsets(id, start, end) {
      var remoteSelection = this._getSelection(id);

      remoteSelection.setOffsets(start, end);
    }
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

  }, {
    key: "setSelectionPositions",
    value: function setSelectionPositions(id, start, end) {
      var remoteSelection = this._getSelection(id);

      remoteSelection.setPositions(start, end);
    }
    /**
     * Shows the specified selection, if it is currently hidden.
     *
     * @param id
     *   The unique id of the selection.
     */

  }, {
    key: "showSelection",
    value: function showSelection(id) {
      var remoteSelection = this._getSelection(id);

      remoteSelection.show();
    }
    /**
     * Hides the specified selection, if it is currently shown.
     *
     * @param id
     *   The unique id of the selection.
     */

  }, {
    key: "hideSelection",
    value: function hideSelection(id) {
      var remoteSelection = this._getSelection(id);

      remoteSelection.hide();
    }
    /**
     * A helper method that gets a cursor by id, or throws an exception.
     * @internal
     */

  }, {
    key: "_getSelection",
    value: function _getSelection(id) {
      if (!this._remoteSelections.has(id)) {
        throw new Error("No such selection: " + id);
      }

      return this._remoteSelections.get(id);
    }
  }]);

  return RemoteSelectionManager;
}();

exports.RemoteSelectionManager = RemoteSelectionManager;