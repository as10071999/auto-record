var isRecording = false;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  if (request.startRecording && !isRecording) {
    sendResponse({ error: "Started Recording" });
    isRecording = true;
    captureTabUsingTabCapture();
  } else if (request.startRecording && isRecording) {
    sendResponse({ error: "Already Started Recording" });
  }
});

async function captureTabUsingTabCapture() {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      console.log(activeTab);
      var activeTabId = activeTab.id; // or do whatever you need
      console.log("Current Tab Details", activeTab, activeTabId);
      var constraints = {
        audio: true,
        video: true,
      };
      chrome.tabCapture.capture(constraints, function (stream) {
        if (stream) {
          let recorder = new MediaRecorder(stream);
          let data = [];
          recorder.ondataavailable = (event) => data.push(event.data);
          recorder.start();
          let stopped = new Promise((resolve, reject) => {
            recorder.onstop = resolve;
            recorder.onerror = (event) => reject(event.name);
          });
          let recorded = new Promise((resolve) =>
            chrome.runtime.onMessage.addListener(function (
              request,
              sender,
              sendResponse
            ) {
              console.log(
                sender.tab
                  ? "from a content script:" + sender.tab.url
                  : "from the extension"
              );

              if (request.stopRecording && isRecording) {
                sendResponse({ error: "Already Started Recording" });
                resolve("Stop Button Pressed");
              }
            })
          ).then((Msg) => {
            console.log(Msg);
            return recorder.state == "recording" && recorder.stop();
          });
          return Promise.all([stopped, recorded]).then((data) => {
            chrome.tabs.create({
              url: "preview.html",
            });
            //prefixes of implementation that we want to test
            window.indexedDB =
              window.indexedDB ||
              window.mozIndexedDB ||
              window.webkitIndexedDB ||
              window.msIndexedDB;

            //prefixes of window.IDB objects
            window.IDBTransaction =
              window.IDBTransaction ||
              window.webkitIDBTransaction ||
              window.msIDBTransaction;
            window.IDBKeyRange =
              window.IDBKeyRange ||
              window.webkitIDBKeyRange ||
              window.msIDBKeyRange;
            if (!window.indexedDB) {
              console.log(
                "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
              );
            }
            var db = null;
            var request = window.indexedDB.open("AutoRecordDB ", 1); //First Version
            request.onerror = function (event) {
              // Do something with request.errorCode!
              console.log("Error While making DB");
            };
            request.onsuccess = function (event) {
              db = event.target.result;
              // Do something with request.result!
              console.log("Database Created Successfully");
            };

            request.onupgradeneeded = function (event) {
              console.log("OnUpgrade is called");
              db = event.target.result;
              console.log("DB", db);
              /*
                record = {
                  key:'',
                  data:''
                }
              */

              var recordings = db.createObjectStore("recordings", {
                keyPath: "id",
                autoIncrement: true,
              });
              const record = {
                data: "Hello",
              };
              recordings.add(record);
            };
          });
        }
      });
    }
  );
}
