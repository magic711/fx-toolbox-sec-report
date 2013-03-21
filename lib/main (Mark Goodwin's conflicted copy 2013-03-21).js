var data = require("self").data;
const {Cc,Ci,Cu} = require("chrome");

Cu.import("resource:///modules/devtools/gcli.jsm");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});

var reportURL = data.url("security-report.html");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import('resource://gre/modules/Services.jsm');

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js");

Cu.import(data.url('reporter.jsm'));
Cu.import(data.url('security-recorder.jsm'));
Cu.import(data.url('security-renderer.jsm'));

gcli.addCommand({
  name: "security-report-start",
  exec: function(args, context) {
    let browserDoc = context.environment.chromeDocument;
    let gBrowser = browserDoc.defaultView.gBrowser;
    let contentDoc = gBrowser.contentDocument;
    ReportManager.newReport("security", contentDoc,
        new SecurityRecorder(contentDoc),
        SecurityRenderer);
    ReportManager.recordDocument("security", contentDoc);
  },
});

gcli.addCommand({
  name: "security-report-stop",
  exec: function(args, context) {
    let browserDoc = context.environment.chromeDocument;
    let gBrowser = browserDoc.defaultView.gBrowser;
    let contentDoc = gBrowser.contentDocument;
    ReportManager.destroyReport("security", contentDoc);
  },
});

gDevTools.registerTool({
  id: "securityReport",
  ordinal: 100,
  url: reportURL,
  label: "Security",

  isTargetSupported: function(target) {
    return true;
  },
  build: function(iframeWindow, toolbox) {
    let panel = new SecurityReportPanel(iframeWindow, toolbox);

    return panel.open();
  }
});

function SecurityReportPanel(panelWin, toolbox) {
  this._toolbox = toolbox;
  this._target = toolbox.target;

  /*
   * this.newPage = this.newPage.bind(this); this.destroy =
   * this.destroy.bind(this); this.beforeNavigate =
   * this.beforeNavigate.bind(this);
   * 
   * this._target.on("will-navigate", this.beforeNavigate);
   * this._target.on("navigate", this.newPage); this._target.on("close",
   * this.destroy);
   */

  this._panelWin = panelWin;
  this._panelDoc = panelWin.document;
}

SecurityReportPanel.prototype = {
    open: function SecReport_open() {
      let contentWin = this._toolbox.target.window;
      let deferred = Promise.defer();

      this.setPage(contentWin).then(function() {
        var gBrowser = this._target.tab.ownerDocument.defaultView.gBrowser;
        let contentDoc = contentWin.document;
        let url = reportURL;
        
        ReportManager.showReport("security", gBrowser, this._panelDoc, contentDoc);	
        this.isReady = true;
        setTimeout(function(){deferred.resolve(this);},1000);
      }.bind(this));

      return deferred.promise;
    },
    /**
     * Set the page to target.
     */
    setPage: function SecReport_setPage(contentWindow) {
      if (this._panelWin.secReportChrome) {
        this._panelWin.secReportChrome.contentWindow = contentWindow;
        this.selectStyleSheet(null, null, null);
      } else {
        let chromeRoot = this._panelDoc.getElementById("style-editor-chrome");
//      let chrome = new StyleEditorChrome(chromeRoot,
//      contentWindow);
        /*
         * let promise = chrome.open();
         * 
         * this._panelWin.styleEditorChrome = chrome; this.selectStyleSheet(null, null,
         * null);
         */
        let deferred = Promise.defer();
        deferred.resolve(this);
        return deferred.promise;
      }
    },
};