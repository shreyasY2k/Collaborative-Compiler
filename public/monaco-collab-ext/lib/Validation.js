"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Validation = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
 * A helper class to aid in input validation.
 *
 * @internal
 */
var Validation = /*#__PURE__*/function () {
  function Validation() {
    _classCallCheck(this, Validation);
  }

  _createClass(Validation, null, [{
    key: "assertString",
    value: function assertString(val, name) {
      if (typeof val !== "string") {
        throw new Error("".concat(name, " must be a string but was: ").concat(val));
      }
    }
  }, {
    key: "assertNumber",
    value: function assertNumber(val, name) {
      if (typeof val !== "number") {
        throw new Error("".concat(name, " must be a number but was: ").concat(val));
      }
    }
  }, {
    key: "assertDefined",
    value: function assertDefined(val, name) {
      if (val === undefined || val === null) {
        throw new Error("".concat(name, " must be a defined but was: ").concat(val));
      }
    }
  }, {
    key: "assertFunction",
    value: function assertFunction(val, name) {
      if (typeof val !== "function") {
        throw new Error("".concat(name, " must be a function but was: ").concat(_typeof(val)));
      }
    }
  }, {
    key: "assertPosition",
    value: function assertPosition(val, name) {
      Validation.assertDefined(val, name);

      if (typeof val.lineNumber !== "number" || typeof val.column !== "number") {
        throw new Error("".concat(name, " must be an Object like {lineNumber: number, column: number}: ").concat(JSON.stringify(val)));
      }
    }
  }]);

  return Validation;
}();

exports.Validation = Validation;