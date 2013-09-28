var myPath;
var color = 'blue';
var strokeCap = 'round';
var width = 5;
var opacity = 1;
myProject = project

function onMouseDown(event) {
  myPath = new Path();
  myPath.strokeColor = color;
  myPath.strokeWidth = width;
  myPath.strokeCap = strokeCap;
  myPath.opacity = opacity;

};

function onMouseDrag(event) {
  myPath.add(event.point);
  myPath.smooth();
};

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

$('#gyc-save-button').click(function(){
  //console.log("HELLO");
  var tags = $('#drawingTags').val();
  console.log(tags);
  var data = {
    url: windowUrl,
    json_string: myProject.exportJSON(),
    tags: tags
  };

  console.log(data);

  $.post('http://localhost:3000/save', data,function(response){
  });

});

var farbtasticWheel = chrome.extension.getURL("wheel.png");
var farbtasticMask = chrome.extension.getURL("mask.png");
var farbtasticMarker = chrome.extension.getURL("marker.png");

$('.farbtastic .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
$('.farbtastic .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
$('.farbtastic .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");



var windowUrl = window.location.href;

$.get('http://localhost:3000/retrieve', {'url': windowUrl}, function(response) {
  project.importJSON(response);
});



