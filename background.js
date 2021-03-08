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
      var activeTabId = activeTab.id; // or do whatever you need
      console.log("Current Tab Details", activeTab, activeTabId);
      var constraints = {
        audio: true,
        video: true,
      };
      chrome.tabCapture.capture(constraints, async function (stream) {
        if (stream) {
          preview.srcObject = stream;
          preview.captureStream =
            preview.captureStream || preview.mozCaptureStream;
          await new Promise((resolve) => (preview.onplaying = resolve));
          log("Hello");
        }
      });
    }
  );
}
