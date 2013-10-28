// This initializes the listeners for clicks on the browser action and for the
// receipt of a message from the content script on runtime
// var tabsArray = [];
// currentTab = 0;

// chrome.tabs.onCreated.addListener(function(tab) {
//   tabsArray.push([tab.id, 0]);
//   console.log(tabsArray);
// });

initializeClickListener();
initializeMessageListener();

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});

// This sets a variable toolbarStatus that is used to determine whether the toolbar should
// be visible on initial page load.  The function toggleToolbar() toggles the status between
// 'on' and 'off' and is called each time the browser action is clicked.

var toolbarStatus = 'off';

function toggleToolbarStatus() {
  toolbarStatus = toolbarStatus === 'on' ? 'off' : 'on';
  // if (toolbarStatus === 'on') {
  //   toolbarStatus = 'off';
  // }
  // else {
  //   toolbarStatus = 'on';
  // }
}

// This listens for a click on the browser action (chrome icon) and sends a message to the
// content script instructing it to toggle the toolbar between hide() and show()

function initializeClickListener(){
  chrome.browserAction.onClicked.addListener(function(tab) {
    toggleToolbarStatus();
    console.log(toolbarStatus);
    chrome.tabs.query({}, function(tabs) {
      var message = {task: 'toggle'};
      for (var i=0; i<tabs.length; ++i) {
          chrome.tabs.sendMessage(tabs[i].id, message);
      }
    });
  });
}
      // for (var i=0;i<tabsArray.length;i++) { 
      //   if (tabsArray[i][0] === tab.id){
      //     tabsArray[i][1] = tabsArray[i][1] === 0 ? 1 : 0;
      //   }
      // }
      // chrome.tabs.sendMessage(tab.id, {task: "toggle", toolbar: toolbarStatus}, function(response) {
      //   var msg = response ? 'success' : 'FAIL';
      //   console.log(msg);
      // });


// This initializes a listener that waits for a request from the content script for the current
// status of the toolbar and responds with that status.
// function getCurretTab() {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     currentTab = tabs[0].id;
//   });
// }

function initializeMessageListener(){
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(request);
      if (request.task == "get status") {
          // getCurretTab();
          // console.log(currentTab);
          // for (var i=0;i<tabsArray.length;i++) { 
          //   if (tabsArray[i][0] === currentTab){
          //     var toolbarStatus = tabsArray[i][1];
          //     console.log(toolbarStatus);
          //   }
          // }
        sendResponse({onOff: toolbarStatus});
      }
    });
}

