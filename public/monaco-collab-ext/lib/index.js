"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _RemoteCursorManager = require("./RemoteCursorManager");

Object.keys(_RemoteCursorManager).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _RemoteCursorManager[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _RemoteCursorManager[key];
    }
  });
});

var _RemoteSelectionManager = require("./RemoteSelectionManager");

Object.keys(_RemoteSelectionManager).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _RemoteSelectionManager[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _RemoteSelectionManager[key];
    }
  });
});

var _EditorContentManager = require("./EditorContentManager");

Object.keys(_EditorContentManager).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _EditorContentManager[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _EditorContentManager[key];
    }
  });
});