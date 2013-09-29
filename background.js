// This listens for a click on the browser action (chrome icon) and sends a message to the
// content script instructing it to toggle the toolbar between hide() and show()

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {task: "toggle"}, function(response) {
    var msg = response ? 'success' : 'FAIL';
    console.log(msg);
  });
});

