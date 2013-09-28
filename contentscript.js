// var s = document.createElement('script');
// s.src = chrome.extension.getURL('gycscript.js');
// s.type = "text/paperscript";
// $(s).attr("canvas", "myCanvas");
// (document.body||document.documentElement).appendChild(s);
// s.onload = function() {
//     s.parentNode.removeChild(s);
// };


$('body').append('<div class="getyourcrayon-menubar"><button type="gyc-button" id="gyc-paint-button" class="gyc-btn gyc-btn-default">Paint</button><button type="gyc-button" id="gyc-undo-button" class="gyc-btn gyc-btn-default">Undo</button><button type="gyc-button" id="gyc-save-button" class="gyc-btn gyc-btn-default">Save</button><label>Width: <span id="current_width">5</span><br><input id="width" type="range" name="points" min="1" max="40" value="5"></label><br><label>Opacity: <span id="current_opacity">100%</span><br><input id="opacity" type="range" name="points" min="1" max="100" value="100"></label><form><input type="text" id="color" name="color" value="#123456" /></form><div id="colorpicker"></div><input type="text" id="drawingTags" placeholder="tags" value=" "></input></div>');



var pscriptUrl = chrome.extension.getURL("drawController.js");

$('body').append('<script type="text/paperscript" src="'+ pscriptUrl + '" canvas="myCanvas"></script><canvas id="myCanvas" style="display:none;" resize></canvas>');


$('.getyourcrayon-menubar').draggable();

$('#gyc-paint-button').click(function(){
  $('#myCanvas').toggle();
});

// var data = {
//   url: document.url,
//   json_string: "sheeeeeeit"
// }

var windowUrl = window.location.href;




$('#colorpicker').farbtastic('#color');


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello") {
      response.farewell == "goodbye"
    }
      // $('body').append('<canvas id="myCanvas"></canvas>');
      // var myPath;

      // function onMouseDown(event) {
      //   myPath = new Path();
      //   myPath.strokeColor = 'black';
      //   myPath.strokeWidth = 10;

      // }

      // function onMouseDrag(event) {
      //   myPath.smooth();
      //   myPath.add(event.point);

      // }

      // function onMouseUp(event) {
      //   var myCircle = new Path.Circle({
      //     center: event.point,
      //     radius: 1
      //   });
      //   myCircle.strokeColor = 'black';
      //   myCircle.fillColor = 'white';
      // }
      // sendResponse({farewell: "goodbye"});
  });


//SEND A MESSAGE

