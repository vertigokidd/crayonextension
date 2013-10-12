// This initializes the listeners for clicks on the browser action and for the
// receipt of a message from the content script on runtime

initializeClickListener();
initializeMessageListener();

// This sets a variable toolbarStatus that is used to determine whether the toolbar should
// be visible on initial page load.  The function toggleToolbar() toggles the status between
// 'on' and 'off' and is called each time the browser action is clicked.

var toolbarStatus = 'on';

function toggleToolbarStatus() {
  if (toolbarStatus === 'on') {
    toolbarStatus = 'off';
  }
  else {
    toolbarStatus = 'on';
  }
}

// This listens for a click on the browser action (chrome icon) and sends a message to the
// content script instructing it to toggle the toolbar between hide() and show()

function initializeClickListener() {
  chrome.browserAction.onClicked.addListener(function(tab) {
    toggleToolbarStatus();
    chrome.tabs.query({}, function(tabs) {
      var message = {task: 'toggle'};
      for (var i=0; i<tabs.length; ++i) {
          chrome.tabs.sendMessage(tabs[i].id, message);
      }
      // chrome.tabs.sendMessage(tab.id, {task: "toggle", toolbar: ''}, function(response) {
      //   var msg = response ? 'success' : 'FAIL';
      //   console.log(msg);
      // });
    });
  });
}

// This initializes a listener that waits for a request from the content script for the current
// status of the toolbar and responds with that status.

datastatus='javier'

function initializeMessageListener(){
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(request);
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.task == "get status") {
        sendResponse({onOff: toolbarStatus, dataS: datastatus});
      }
    }
  );
}

