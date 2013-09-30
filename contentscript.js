// Calls all initialize methods
injectScripts();
injectToolbar();
initializeMessageListener();
initializeAccordion();
initializeDraggable();
initializeColorPicker();


// This is injecting all the html we need to create the toolbar and the form to save to the website

function injectToolbar() {
  $('body').append('<div class="getyourcrayon-menubar">' +
                     '<div id="gyc-toolbar-header">' +
                       '<input type="range" id="gyc-timeline" min="0" max="10"></input>' +
                       '<div id="gyc-tag-holder">' +
                       '</div>' +
                     '</div>' +
                     '<div id="gyc-toolbar">' +
                       '<div id="gyc-toolbar-toggle">' +
                         '<p id="gyc-toggle-toolbar-arrow">&#9660</p>' +
                       '</div>' +
                       '<div id="gyc-toolbar-tools">' +
                         '<button type="gyc-button" id="gyc-paint-button" class="gyc-btn gyc-btn-default">Paint</button>' +
                         '<button type="gyc-button" id="gyc-undo-button" class="gyc-btn gyc-btn-default">Undo</button>' +
                         '<button type="gyc-button" id="gyc-save-button" class="gyc-btn gyc-btn-default">Save</button>' +
                         '<label>Width: <span id="gyc-current_width">5</span><br><input id="width" type="range" name="points" min="1" max="40" value="5"></label><br>' +
                         '<label>Opacity: <span id="gyc-current_opacity">100%</span><br><input id="opacity" type="range" name="points" min="1" max="100" value="100"></label>' +
                         '<form>' +
                           '<input type="text" id="gyc-color" name="color" value="#123456" />' +
                         '</form>' +
                         '<div id="gyc-colorpicker"></div>' +
                       '</div>' +
                     '</div>' +
                   '</div>' +
                   '<div id="gyc-save-confirm" title="Confirm save">' +
                     '<form>' +
                       '<label>Tags:<input type="text" id="drawingTags" placeholder="tag, tag2 ..."></input></label>'  +
                     '</form>' +
                   '</div>'
                   );
}



// This injects the drawController.js script onto the page.  Note - the script must be of
// type 'text/paperscript' attached to a specific canvas id for paper.js to function properly

function injectScripts() {
  var pscriptUrl = chrome.extension.getURL("drawController.js");
  $('body').append('<script type="text/paperscript" src="'+ pscriptUrl + '" canvas="gyc-canvas"></script><canvas id="gyc-canvas" style="display:none;" resize></canvas>');
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



