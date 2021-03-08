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
          });
        }
      });
    }
  );
}
