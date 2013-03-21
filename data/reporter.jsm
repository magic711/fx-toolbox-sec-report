/* vim:set ts=2 sw=2 sts=2 et tw=80:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

let EXPORTED_SYMBOLS = ["ReportManager"];

let ReportManager = {
    _reports: {},
    hasReport: function SR_hasReport(type, targetDoc) {
      return (type in this._reports && this._reports[type].has(targetDoc));
    },

    /**
     * Register recorder and renderer for document.
     * 
     * recorder = { start: function(targetDoc, data){}, stop:
     * function(targetDoc, data){}, isRecording: function(targetDoc, data){} }
     * 
     * renderer = { buildReport: function(newTabDoc, data){}, updateReport:
     * function(newTabDoc, data){} }
     */
    newReport: function SR_newReport(type, targetDoc, recorder, renderer) {
      if (this.hasReport(type, targetDoc)) {
        dump('report already exists!\n');
        return; // Report already created
      }
      let data = {};
      if (!(type in this._reports)) {
        dump('no reports of this type\n');
        this._reports[type] = new WeakMap();
      }
      this._reports[type].set(targetDoc, {data: data,
        recorder: recorder,
        renderer: renderer});
    },

    destroyReport: function SR_stopReport(type, targetDoc) {
      if (!this.hasReport(type, targetDoc)) {
        return; // Not report to destroy.
      }

      let recorder = this._reports[type].get(targetDoc).recorder;
      if (recorder.isRecording()) {
        let data = this._reports[type].get(targetDoc).data;
        recorder.stop(targetDoc, data);
      }

      this._reports[type].delete(targetDoc);
    },

    recordDocument: function SR_recordDocument(type, targetDoc) {
      if (!this.hasReport(type, targetDoc)) {
        throw "No report registered for document.";
      }
      let recorder = this._reports[type].get(targetDoc).recorder;
      let data = this._reports[type].get(targetDoc).data;
      recorder.start(targetDoc, data);
    },

    stopRecordingDocument: function SR_stopRecordingDocument(type, targetDoc) {
      if (!this.hasReport(type, targetDoc)) {
        throw "No report registered for document.";
      }

      let recorder = this._reports[type].get(targetDoc).recorder;
      if (!recorder.isRecording()) {
        return; // Not recording.
      }

      let data = this._reports[type].get(targetDoc).data;
      recorder.stop(targetDoc, data);
    },

    showReport: function SR_showReport(type, gBrowser, uiDoc, targetDoc) {
      if (!this.hasReport(type, targetDoc)) {
        if(this.reportTypes) {
          this.newReport(type,targetDoc,this.reportTypes[type].recorder,this.reportTypes[type].renderer);
        } else {
          throw "No report registered for document.";
        }
      }
      let renderer =  this._reports[type].get(targetDoc).renderer;
      let data =  this._reports[type].get(targetDoc).data;

      let newTabDoc = uiDoc;
      renderer.buildReport(uiDoc, data);

      let button = newTabDoc.querySelector("#updatebutton");

      if (button) {
        button.onclick = function() {
          let data = this._reports[type].get(targetDoc).data;
          dump(data);
          dump('\n');
          renderer.updateReport(newTabDoc, data);
        }.bind(this);
      }

      let button = newTabDoc.querySelector("#startbutton");

      var isRecording = function() {
        var recording = false;
        for(type in this._reports){
          let obj = this._reports[type].get(targetDoc);
          recording = obj.recorder._recording ? true: recording;
        }
        return recording;
      }.bind(this);
      
      var updateButton = function(button) {
        if(isRecording()){
          button.innerHTML = 'Stop';
        } else {
          button.innerHTML = 'Start';
        }
      }.bind(this);

      if (button) {
        button.onclick = function() {
          if(isRecording()){
            this.stopRecordingDocument(type, targetDoc);
          } else {
            this.recordDocument(type, targetDoc);
          }
          updateButton(button);
        }.bind(this);
        updateButton(button);
      }
    },
};