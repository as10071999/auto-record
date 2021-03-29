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
    alert("Database Created Successfully");
    const tx = db.transaction("recordings", "readonly");
    const recordings = tx.objectStore("recordings");
    var request = recordings.get(1);
    request.onsuccess = function (event) {
      console.log("Retrieved Data", event.target.result);
    };
  };
};
