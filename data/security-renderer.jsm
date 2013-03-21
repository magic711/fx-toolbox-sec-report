/* vim:set ts=2 sw=2 sts=2 et tw=80:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let EXPORTED_SYMBOLS = ["SecurityRenderer"];

/**
 *  buildReport: function(newTabDoc, data){},
 *  updateReport: function(newTabDoc, data){}
 */

let SecurityRenderer = {
    buildReport: function(tabdoc, data) {
      tabdoc.querySelector("#securityShortDesc > p").textContent = data.title + "Clicks (" + data.url + ")";
      tabdoc.querySelector("#securityLongDesc").innerHTML = "<p>Click counter: " + data.clickCount + "</p>";
    },

    updateReport: function(tabdoc, data) {
      tabdoc.querySelector("#securityLongDesc").innerHTML = "<p>Click counter: " + data.clickCount + "</p>";
    },
};

