document.addEventListener("DOMContentLoaded", (event) => {
  var startButton = document.getElementById("start");
  var endButton = document.getElementById("end");
  endButton.disabled = true;
  console.log("disabled end button");
  startButton.addEventListener("click", handleStartRecording);
  endButton.addEventListener("click", handleEndRecording);

  function handleStartRecording() {
    var meetLink = document.getElementById("meet_link").value;
    var time = document.getElementById("time").value;
    document.getElementById("meet_link").disabled = true;
    document.getElementById("time").disabled = true;
    startButton.disabled = true;
    endButton.disabled = false;
    chrome.runtime.sendMessage(
      {
        startRecording: true,
        stopRecording: false,
        link: meetLink,
        time: time,
      },
      function (response) {
        console.log(response.error);
        // if (response.error != "none") {
        //   window.close();
        // }
      }
    );
  }
  function handleEndRecording() {
    document.getElementById("meet_link").value = "";
    document.getElementById("meet_link").disabled = false;
    document.getElementById("time").value = "";
    document.getElementById("time").disabled = false;
    startButton.disabled = false;
    endButton.disabled = true;
    chrome.runtime.sendMessage(
      { startRecording: false, stopRecording: true, link: null },
      function (response) {
        console.log(response.error);
      }
    );
  }
});
