let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");

window.onload = function () {
  //   alert("Page is loaded");
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
    window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if (!window.indexedDB) {
    console.log(
      "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
    );
  }
  var db = null;
  var request = window.indexedDB.open("AutoRecordDB ", 1); //First Version
  request.onerror = function (event) {
    alert("Error While making DB");
  };
  request.onsuccess = function (event) {
    db = event.target.result;
    // alert("Database Created Successfully");
    const tx = db.transaction("recordings", "readonly");
    const recordings = tx.objectStore("recordings");
    var id = localStorage.getItem("RecordID");
    if (id) {
      var request = recordings.get(id);
      console.log("Temp ID Retrived", id);
      request.onsuccess = function (event) {
        console.log("Retrieved Data", event.target.result.data);
        const file = event.target.result.data;
        recording.src = URL.createObjectURL(file);

        console.log("URL", URL.createObjectURL(file));
        downloadButton.href = recording.src;
        downloadButton.download = "RecordedVideo.webm";

        console.log(
          "Successfully recorded " +
            file.size +
            " bytes of " +
            file.type +
            " media."
        );
      };
      request.onerror = function (event) {
        alert("Error While Retireving Data From DB");
      };
    }
  };
};
