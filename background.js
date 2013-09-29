// console.log(chrome.browserAction.onClicked);
// $(document).ready(function() {

  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
      var msg = response ? 'success' : 'FAIL';
      console.log(msg);

    });
  });
// });
