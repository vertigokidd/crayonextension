// Calls all initialize methods
injectScripts();
injectToolbar();
injectFonts();
getToolbarStatus();
initializeMessageListener();
initializeAccordion();
initializeDraggable();
initializeColorPicker();


// This is injecting all the html we need to create the toolbar and the form to save to the website

function injectToolbar() {
  $('body').append('<div class="getyourcrayon-menubar">' +
                     '<div id="gyc-toolbar-header">' +
                       '<i id="gyc-previous-button" class="icon-chevron-left"></i><input type="range" id="gyc-timeline" min="0" max="10"></input><i id="gyc-next-button" class="icon-chevron-right"></i>' +
                     '</div>' +
                     '<div id="gyc-toolbar-buttons">' +
                       '<i id="gyc-paint-button" class="icon-eye-close gyc-button"></i>' +
                       '<i id="gyc-undo-button" class="icon-undo gyc-button"></i>' +
                       '<i id="gyc-clean-slate-button" class="icon-remove-circle gyc-button"></i>' +
                       '<i id="gyc-save-button" class="icon-cloud-upload gyc-button"></i>' +
                       // '<button id="gyc-undo-button" class="gyc-btn gyc-btn-default"></button>' +
                       // '<button id="gyc-clean-slate-button" class="gyc-btn gyc-btn-default"></button>' +
                       // '<button id="gyc-save-button" class="gyc-btn gyc-btn-default"></button>' +
                     '</div>' +
                     '<div id="gyc-toolbar">' +
                       '<div id="gyc-toolbar-toggle">' +
                         '<i id="gyc-toggle-toolbar-arrow" class="icon-chevron-sign-down"></i>' +
                       '</div>' +
                       '<div id="gyc-toolbar-tools">' +
                         '<label class="gyc-toolbar-value">Width: <span id="gyc-current_width">5</span><br><input id="gyc-width" type="range" name="points" min="1" max="40" value="5"></label><br>' +
                         '<label class="gyc-toolbar-value">Opacity: <span id="gyc-current_opacity">100%</span><br><input id="gyc-opacity" type="range" name="points" min="1" max="100" value="100"></label>' +
                         '<form>' +
                           '<input type="text" id="gyc-color" name="color" value="#123456" />' +
                         '</form>' +
                         '<div id="gyc-colorpicker"></div>' +
                         '<div id="gyc-tag-holder">' +
                         '</div>' +
                       '</div>' +
                     '</div>' +
                   '</div>' +
                   '<div id="gyc-save-confirm" title="Confirm save">' +
                       '<label>Tags:<input type="text" id="gyc-drawingTags" placeholder="tag, tag2 ..."></input></label>'  +
                   '</div>' +
                   '<div id="gyc-twitter" title="Save succesfull">' +
                      '<p>Tweet your drawing</p>' +
                      '<div id="gyc-twitter-bttn"></div>' +
                   '</div>'
                   );
}

// This injects the drawController.js script onto the page.  Note - the script must be of
// type 'text/paperscript' attached to a specific canvas id for paper.js to function properly

function injectScripts() {
  var pscriptUrl = chrome.extension.getURL("drawController.js");
  $('body').append('<script type="text/paperscript" src="'+ pscriptUrl + '" canvas="gyc-canvas"></script><canvas id="gyc-canvas" style="display:none;" resize></canvas>');
}

// Inject font awesome //

function injectFonts() {
  $('body').append('<link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet">');
}

// This listens for messages from the background script (background.js) and toggles the toolbar
// on and off if the correct message is received.

function initializeMessageListener(){
  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(request);
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.task == "toggle") {
        sendResponse({status: "toggled"});
        $('.getyourcrayon-menubar').toggle();
      }
    });
}

// This sends a message at runtime asking the background.js for the status of the toolbar.
// If it receives a status of 'off', the toolbar is not displayed on page load

function getToolbarStatus() {
  chrome.runtime.sendMessage({task: "get status"}, function(response) {
    if (response.onOff === "off") {
      $('.getyourcrayon-menubar').hide();
    }
  });
}

// This initializes the toolbar to have the accordion functionality once it is loaded and
// makes the entire toolbar draggable with the header specified as the handle for dragging

function initializeAccordion() {
  $('#gyc-toolbar').accordion({
      header: "#gyc-toolbar-toggle",
      collapsible: true,
      heightStyle: 'content',
      active: false
  });
}

function initializeDraggable() {
  $('.getyourcrayon-menubar').draggable({
    handle: '#gyc-toolbar-header'
  });
}


// This initializes the color picker on the toolbar through farbtastic.js

function initializeColorPicker(){
  $('#gyc-colorpicker').farbtastic('#gyc-color');
}




