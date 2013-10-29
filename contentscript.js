// Calls all initialize methods
injectScripts();
injectToolbar();
injectFonts();
getToolbarStatus();
initializeMessageListener();
initializeAccordion();
initializeDraggable();
initializeColorPicker();


var badgeIcon = chrome.extension.getURL("gyc-badgeicon.png");
console.log(badgeIcon);
$('#gyc-badge a').css("background", "url('" + badgeIcon + "') no-repeat");

// This is injecting all the html we need to create the toolbar and the form to save to the website

function injectToolbar() {
  $('body').append('<div id="initial" class="getyourcrayon-menubar" style="display:none;">' +
                     '<div id="gyc-toolbar-header">' +
                       
                     '</div>' +
                     '<div id="gyc-toolbar-buttons">' +
                       '<i id="gyc-paint-button" class="icon-eye-close gyc-button"></i>' +
                       '<i id="gyc-draw-button" class="icon-pencil gyc-button"></i>' +
                       '<i id="gyc-undo-button" class="icon-undo gyc-button"></i>' +
                       '<i id="gyc-clean-slate-button" class="icon-remove-circle gyc-button"></i>' +
                       '<i id="gyc-search-tags-button" class="icon-search gyc-button"></i>' +
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
                         '<div class="gyc-drawing-tools">' +
                           '<label class="gyc-toolbar-value">Width: <span id="gyc-current_width">5</span><br><input id="gyc-width" type="range" name="points" min="1" max="40" value="5"></label><br>' +
                           '<label class="gyc-toolbar-value">Opacity: <span id="gyc-current_opacity">100%</span><br><input id="gyc-opacity" type="range" name="points" min="1" max="100" value="100"></label>' +
                           '<form>' +
                             '<input type="text" id="gyc-color" name="color" value="#123456" />' +
                           '</form>' +
                           '<div id="gyc-colorpicker"></div>' +
                         '</div>' +
                         '<div class="gyc-search-tools" style="display:none;">' +
                           '<div id="gyc-timeline-container">' +
                             '<h4 class="search-header"><i class="icon-time"></i> Drawing Timeline</h4>' + 
                             '<i id="gyc-previous-button" class="icon-chevron-sign-left"></i><input type="range" id="gyc-timeline" min="0" max="0"></input><i id="gyc-next-button" class="icon-chevron-sign-right"></i>' +
                           '</div>' +
                           '<h4 class="search-header"><i class="icon-tags"></i> Search Tags</h4>' +
                           '<form class="gyc-search-tags">' +
                             '<input type="text" id="gyc-search-field" placeholder="Coming Soon!" disabled>' +
                           '</form>' +
                           '<div id="gyc-tag-holder">' +
                           '</div>' +
                         '</div>' +
                         '<div id="gyc-save-confirm" style="display:none;">' +
                           '<label><h3 class="save-header">Tag your drawing:</h3><input type="text" id="gyc-drawingTags" placeholder="Dinosaur, Space_Robot, Steve..."></input></label>'  +
                           '<i class="save-indicator icon-refresh icon-spin icon-large"></i>' +
                           '<button class="gyc-random-class">Save Drawing</button>' +
                         '</div>' +
                       '</div>' +
                     '</div>' +
                   '</div>' +
                   '<div id="gyc-badge" style="display:none;">' +
                   '<a href="http://www.getyourcrayon.com"></a>' +
                   '</div>'
                   // '<div id="gyc-save-confirm" title="Confirm Save" style="display:none;">' +
                   //     '<label>Tag your drawing:<input type="text" id="gyc-drawingTags" placeholder="tag, tag2 ..."></input></label>'  +
                   // '</div>' +
                   // '<div id="gyc-twitter" title="Save Successful">' +
                   //    '<p></p>' +
                   //    '<div id="gyc-twitter-bttn"></div>' +
                   // '</div>'
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
  $('body').append('<link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet"><link href="http://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css">');
}

// This listens for messages from the background script (background.js) and toggles the toolbar
// on and off if the correct message is received.

function initializeMessageListener(){
  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.task == "toggle") {
        sendResponse({status: "toggled"});
        $('.getyourcrayon-menubar').toggle();
        console.log(graffiti.canvasStatus);
        if (graffiti.latestDrawing !== null && graffiti.canvasStatus === false && $('.getyourcrayon-menubar').css('display') === 'block') {
          graffiti.toggleCanvas();
          graffiti.project.view.draw();
        }
        else if (graffiti.canvasStatus === true) {
          graffiti.toggleCanvas();  
        }
      }
    });
}

// This sends a message at runtime asking the background.js for the status of the toolbar.
// If it receives a status of 'off', the toolbar is not displayed on page load

function getToolbarStatus() {
  chrome.runtime.sendMessage({task: "get status"}, function(response) {
    console.log(response.onOff);
    if (response.onOff === 'on') {
      $('.getyourcrayon-menubar').toggle();
      setTimeout(function () {
      if (graffiti.latestDrawing !== null) {
          graffiti.canvasStatus = false;
          graffiti.toggleCanvas();
          graffiti.project.view.draw();
      }
    }, 1000);
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




