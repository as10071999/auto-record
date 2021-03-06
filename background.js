async function receiveMessage(request, sender) {}

function onStart() {
  console.debug("extension:started");
}

function onInstallation() {
  console.debug("extension::installed");
  onStart();
}

// on install
chrome.runtime.onInstalled.addListener(onInstallation);

// on startup
chrome.runtime.onStartup.addListener(onStart);

// on message receive
chrome.runtime.onMessage.addListener(receiveMessage);

let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");
function log(msg) {
  logElement.innerHTML += msg + "\n";
}
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
    captureTabUsingTabCapture(false);
  } else if (request.startRecording && isRecording) {
    sendResponse({ error: "Already Started Recording" });
  }
});

function captureTabUsingTabCapture(isNoAudio) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (arrayOfTabs) {
      var activeTab = arrayOfTabs[0];
      var activeTabId = activeTab.id; // or do whatever you need
      console.log("Current Tab Details", activeTab, activeTabId);
      var constraints = {
        audio: true,
        video: true,
      };

      // chrome.tabCapture.onStatusChanged.addListener(function(event) { /* event.status */ });

      chrome.tabCapture.capture(constraints, function (stream) {
        startRecording(stream)
          .then((recordedChunks) => {
            let recordedBlob = new Blob(recordedChunks, {
              type: "video/webm",
            });
            recording.src = URL.createObjectURL(recordedBlob);
            downloadButton.href = recording.src;
            downloadButton.download = "RecordedVideo.webm";

            log(
              "Successfully recorded " +
                recordedBlob.size +
                " bytes of " +
                recordedBlob.type +
                " media."
            );
          })
          .catch(log);
      });
    }
  );
}
function startRecording(stream) {
  let recorder = new MediaRecorder(stream);
  let data = [];
  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.start();
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve(); //Promise Resolved when Recorder prompt stop event and onStop event handler is called
    recorder.onerror = (event) => reject(event.name);
  });

  let recorded = new Promise((resolve) => {
    chrome.runtime.onMessage.addListener(function (request) {
      console.log("Recieved Stop Command");
      if (request.stopRecording && isRecording) {
        isRecording = false;
        console.log("Record Promise is Resolved");
        resolve();
      }
    });
  }).then(() => {
    recorder.state == "recording" && recorder.stop();
    stop(preview.srcObject);
  });

  return Promise.all([stopped, recorded]).then(() => {
    console.log(data);
    return data;
  });
}
function stop(stream) {
  stream.getTracks().forEach((track) => track.stop());
}
