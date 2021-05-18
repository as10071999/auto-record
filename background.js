var isRecording = false;
var recorder = null;
var link = null;
var endingTime = 0;
var waitingTime = 0;
setInterval(function () {
  console.log("Working");
}, 1000);
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.startRecording && !isRecording) {
    sendResponse({ error: "Started Recording" });
    console.log("Started Recording");
    isRecording = true;
    console.log("Meet Link in background:", request.link);
    var startTime = new Date(request.startTime);
    var endTime = new Date(request.endTime);
    waitingTime = startTime.getTime() - Date.now();
    endingTime = endTime.getTime() - Date.now();
    console.log("Time Left in secs", waitingTime);
    console.log("Ending Time  in secs", endingTime);
    link = request.link;
    if (link) captureTabUsingTabCapture();
  } else if (request.startRecording && isRecording) {
    sendResponse({ error: "Already Started Recording" });
    console.log("Already Started Recording");
  } else if (request.stopRecording && isRecording) {
    sendResponse({ error: "Stopping Recording" });
    console.log("Stopped Recording Called");
    stopRecording();
  }
});
async function stopRecording() {
  if (recorder) {
    console.log("Recorder State Inside StopFn:", recorder.state);
    if (recorder.state == "recording") recorder.stop();
    isRecording = false;
    console.log("Recorder State Inside StopFn:", recorder.state);
  }
}
async function captureTabUsingTabCapture() {
  console.log("Stated Capture Function");
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      // console.log(activeTab);
      var activeTabId = activeTab.id; // or do whatever you need
      setTimeout(function () {
        console.log("Current Tab Details", activeTab, activeTabId);
        var constraints = {
          audio: true,
          video: true,
          audioConstraints: {
            mandatory: {
              echoCancellation: true,
            },
          },
          videoConstraints: {
            mandatory: {
              chromeMediaSource: "tab",
              maxWidth: 3840,
              maxHeight: 2160,
            },
          },
        };
        var context = new AudioContext();

        chrome.browserAction.setBadgeText({ tabId: activeTabId, text: "Stop" });
        chrome.browserAction.setBadgeBackgroundColor({
          tabId: activeTabId,
          color: "red",
        });

        chrome.tabCapture.capture(constraints, function (stream) {
          if (stream) {
            var nstream = context.createMediaStreamSource(stream);
            nstream.connect(context.destination);
            chrome.tabs.update(activeTabId, { url: link });
            startRecording(stream).then((data) => {
              chrome.browserAction.setBadgeText({ text: "Start" });
              chrome.browserAction.setBadgeBackgroundColor({ color: "green" });

              console.log("Data Recieved", data);
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
                var file = new Blob(data, { type: "video/webm" });
                const record = {
                  id: 1,
                  data: file,
                };
                var requestForClear = db
                  .transaction(["recordings"], "readwrite")
                  .objectStore("recordings")
                  .clear();
                requestForClear.onsuccess = function (event) {
                  console.log("Cleared");
                  var request = db
                    .transaction(["recordings"], "readwrite")
                    .objectStore("recordings")
                    .add(record);
                  request.onsuccess = function (event) {
                    console.log("Recording has been added to your database.");
                  };
                  request.onerror = function (event) {
                    console.log("Unable to add data Recording");
                  };
                };

                requestForClear.onerror = function (event) {
                  console.log("No able to clear ObjectStore");
                };
              };

              request.onupgradeneeded = async function (event) {
                console.log("OnUpgrade is called");
                db = event.target.result;
                console.log("DB", db);

                await db.createObjectStore("recordings", {
                  keyPath: "id",
                });
              };
            });
          }
        });
      }, waitingTime);
      console.log("Hello");
      setTimeout(function () {
        stopRecording();
      }, endingTime);
    }
  );
}
function startRecording(stream) {
  let data = [];
  console.log("Recorder Initilized");
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    console.log("OnDataAvailable Called");
    data.push(event.data);
  };
  recorder.start();
  console.log("Recording Started");
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = function (e) {
      resolve("Resolvoing Stopped Promise");
    };
    recorder.onerror = (event) => reject(event.name);
  });
  return stopped.then((values) => {
    console.log(values);
    stop(stream);
    return data;
  });
}

function stop(stream) {
  stream.getTracks().forEach((track) => track.stop());
}
function getFileName(fileExtension) {
  var d = new Date();
  var year = d.getUTCFullYear() + "";
  var month = d.getUTCMonth() + "";
  var date = d.getUTCDate() + "";

  if (month.length === 1) {
    month = "0" + month;
  }

  if (date.length === 1) {
    date = "0" + date;
  }
  return year + month + date + getRandomString() + "." + fileExtension;
}

function getRandomString() {
  if (
    window.crypto &&
    window.crypto.getRandomValues &&
    navigator.userAgent.indexOf("Safari") === -1
  ) {
    var a = window.crypto.getRandomValues(new Uint32Array(3)),
      token = "";
    for (var i = 0, l = a.length; i < l; i++) {
      token += a[i].toString(36);
    }
    return token;
  } else {
    return (Math.random() * new Date().getTime())
      .toString(36)
      .replace(/\./g, "");
  }
}
