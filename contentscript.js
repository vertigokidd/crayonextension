// var s = document.createElement('script');
// s.src = chrome.extension.getURL('gycscript.js');
// s.type = "text/paperscript";
// $(s).attr("canvas", "myCanvas");
// (document.body||document.documentElement).appendChild(s);
// s.onload = function() {
//     s.parentNode.removeChild(s);
// };



$('body').append('<div class="getyourcrayon-menubar"><div id="toolbar-header"></div><div id="toolbar"><div id="toolbar-toggle"><p id="toggle-toolbar-arrow">&#9660</p></div><div id="toolbar-tools"><button type="gyc-button" id="gyc-paint-button" class="gyc-btn gyc-btn-default">Paint</button><button type="gyc-button" id="gyc-undo-button" class="gyc-btn gyc-btn-default">Undo</button><button type="gyc-button" id="gyc-save-button" class="gyc-btn gyc-btn-default">Save</button><label>Width: <span id="current_width">5</span><br><input id="width" type="range" name="points" min="1" max="40" value="5"></label><br><label>Opacity: <span id="current_opacity">100%</span><br><input id="opacity" type="range" name="points" min="1" max="100" value="100"></label><form><input type="text" id="color" name="color" value="#123456" /></form><div id="colorpicker"></div><input type="range" id="timeline" min="0" max="10"></input><input type="text" id="drawingTags" placeholder="tags" value=" "></div></div></div>');

$('#toolbar').accordion({
    header: "#toolbar-toggle",
    collapsible: true,
    heightStyle: 'content',
    active: false
});

var pscriptUrl = chrome.extension.getURL("drawController.js");

$('body').append('<script type="text/paperscript" src="'+ pscriptUrl + '" canvas="myCanvas"></script><canvas id="myCanvas" style="display:none;" resize></canvas>');



$('#gyc-paint-button').click(function(){
  $('#myCanvas').toggle();
});

// var data = {
//   url: document.url,
//   json_string: "sheeeeeeit"
// }

var windowUrl = window.location.href;




$('#colorpicker').farbtastic('#color');

$('.getyourcrayon-menubar').draggable({
  handle: '#toolbar-header'
});

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello") {
      sendResponse({farewell: "goodbye"});
      $('.getyourcrayon-menubar').toggle();
    }
  });

