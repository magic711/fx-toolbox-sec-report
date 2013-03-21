/* vim:set ts=2 sw=2 sts=2 et tw=80:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let EXPORTED_SYMBOLS = ["SecurityRecorder"];

/**
 *   start: function(targetDoc, data){},
 *   stop: function(targetDoc, data){},
 *   isRecording: function(targetDoc, data){}
 */

let SecurityRecorder = function(doc){
  this._clickCounter = this._clickCounter.bind(this);
};

SecurityRecorder.prototype = {
  start: function(doc, data) {
    this._recording = true;

    this._doc = doc;
    this._win = doc.defaultView;
    this._data = data;

    this._data.title = doc.title;
    this._data.url = doc.location;
    this._data.clickCount = 0;
    this._win.addEventListener("click", this._clickCounter, true);
  },

  stop: function(doc, data) {
    this._win.removeEventListener("click", this._clickCounter, true);

    this._data = this._doc = this._win = null;
    this._recording = false;
  },

  isRecording: function(doc, data) {
    return this._recording;
  },

  /* internal methods: */

  _clickCounter: function() {
    this._data.clickCount++;
  },
};
