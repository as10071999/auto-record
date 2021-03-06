function handleStartRecording() {
  chrome.runtime.sendMessage(
    { startRecording: true, stopRecording: false },
    function (response) {
      console.log(response.error);
      setError(response.error);
      // if (response.error != "none") {
      //   window.close();
      // }
    }
  );
}
function handleEndRecording() {
  chrome.runtime.sendMessage(
    { startRecording: false, stopRecording: true },
    function (response) {
      console.log(response.error);
      setError(response.error);
    }
  );
}
