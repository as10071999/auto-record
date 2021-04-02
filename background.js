var isRecording = false;
var recorder = null;
let data = [];
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.startRecording && !isRecording) {
    sendResponse({ error: "Started Recording" });
    console.log("Started Recording");
    isRecording = true;
    captureTabUsingTabCapture();
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
  console.log("Recorder State Inside StopFn:", recorder.state);
  if (recorder.state == "recording") recorder.stop();
  isRecording = false;
  console.log("Recorder State Inside StopFn:", recorder.state);
}
async function captureTabUsingTabCapture() {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      // console.log(activeTab);
      var activeTabId = activeTab.id; // or do whatever you need
      console.log("Current Tab Details", activeTab, activeTabId);
      var constraints = {
        audio: true,
        video: true,
      };
      chrome.tabCapture.capture(constraints, function (stream) {
        if (stream) {
          startRecording(stream).then((data) => {
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
              let tempId = getRandomString();
              localStorage.setItem("RecordID", tempId);
              console.log("Set Temp Id", tempId);
              const record = {
                id: tempId,
                data: file,
              };
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
    }
  );
}
function startRecording(stream) {
  console.log("Recorder Initilized");
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    console.log("OnDataAvailable Called");
    data.push(event.data);
  };
  recorder.start(100);
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
