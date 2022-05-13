"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteCursor = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the Monaco Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

/**
 * The RemoteCursor class represents a remote cursor in the MonacoEditor. This
 * class allows you to control the location and visibility of the cursor.
 */
var RemoteCursor = /*#__PURE__*/function () {
  /**
   * @internal
   */

  /**
   * Creates a new RemoteCursor.
   *
   * @param delegate
   *   The underlying Monaco Editor widget.
   * @internal
   * @hidden
   */
  function RemoteCursor(delegate) {
    _classCallCheck(this, RemoteCursor);

    this._delegate = delegate;
  }
  /**
   * Gets the unique id of this cursor.
   *
   * @returns
   *   The unique id of this cursor.
   */


  _createClass(RemoteCursor, [{
    key: "getId",
    value: function getId() {
      return this._delegate.getId();
    }
    /**
     * Gets the position of the cursor.
     *
     * @returns
     *   The position of the cursor.
     */

  }, {
    key: "getPosition",
    value: function getPosition() {
      return this._delegate.getPosition().position;
    }
    /**
     * Sets the location of the cursor based on a Monaco Editor IPosition.
     *
     * @param position
     *   The line / column position of the cursor.
     */

  }, {
    key: "setPosition",
    value: function setPosition(position) {
      this._delegate.setPosition(position);
    }
    /**
     * Sets the location of the cursor using a zero-based text offset.
     *
     * @param offset
     *   The offset of the cursor.
     */

  }, {
    key: "setOffset",
    value: function setOffset(offset) {
      this._delegate.setOffset(offset);
    }
    /**
     * Shows the cursor if it is hidden.
     */

  }, {
    key: "show",
    value: function show() {
      this._delegate.show();
    }
    /**
     * Hides the cursor if it is shown.
     */

  }, {
    key: "hide",
    value: function hide() {
      this._delegate.hide();
    }
    /**
     * Determines if the cursor has already been disposed. A cursor is disposed
     * when it has been permanently removed from the editor.
     *
     * @returns
     *   True if the cursor has been disposed, false otherwise.
     */

  }, {
    key: "isDisposed",
    value: function isDisposed() {
      return this._delegate.isDisposed();
    }
    /**
     * Disposes of this cursor, removing it from the editor.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      this._delegate.dispose();
    }
  }]);

  return RemoteCursor;
}();

exports.RemoteCursor = RemoteCursor;