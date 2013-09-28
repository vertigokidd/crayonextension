var myPath;
var color = 'blue';
var strokeCap = 'round';
var width = 5;
var opacity = 1;
var canvas = document.getElementById('myCanvas');
// canvas.beginPath();
myProject = project;

function onMouseDown(event) {
  myPath = new Path();
  myPath.strokeColor = color;
  myPath.strokeWidth = width;
  myPath.strokeCap = strokeCap;
  myPath.opacity = opacity;

}

function onMouseDrag(event) {
  myPath.add(event.point);
  myPath.smooth();
}

$('.marker').on('mouseup', function(){
  color = $('#color').val();
});

$('.marker').on('mouseleave', function(){
  color = $('#color').val();
});

$('#width').change(function() {
  var newWidth = $(this).val();
  width = parseInt(newWidth);
  $('#current_width').html(width);
});

$('#opacity').change(function() {
  var newOpacity = $(this).val();
  opacity = parseFloat(newOpacity)/100;
  $('#current_opacity').html(newOpacity + "%");
});

$('#gyc-undo-button').click(function() {
  myPath.remove();
});

var windowUrl = window.location.href;

// Make get request for latest drawing on initial page load
$.get('http://localhost:3000/retrieve', {'url': windowUrl}, function(response) {
  console.log(response);
  if (response !== "website not found") {
    project.importJSON(response.json_string);
    maxIndex = response.max_index;
    minIndex = 1;
    currentPosition = maxIndex;
  }
});

$('#gyc-save-button').click(function(){
  //console.log("HELLO");
  var data = {
    url: windowUrl,
    json_string: myProject.exportJSON()
  };

  console.log(data);

  $.post('http://localhost:3000/save', data,function(response){
    console.log(response);

  });

});


$('#gyc-previous-button').click(function(){
  currentPosition -= 1;
  $.get('http://localhost:3000/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
    console.log(response);
    // canvas.width = canvas.width;
    canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
    myProject.activeLayer.removeChildren();
    myProject.importJSON(response);
  });
});

var farbtasticWheel = chrome.extension.getURL("wheel.png");
var farbtasticMask = chrome.extension.getURL("mask.png");
var farbtasticMarker = chrome.extension.getURL("marker.png");

$('.farbtastic .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
$('.farbtastic .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
$('.farbtastic .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");
