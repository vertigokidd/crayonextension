var myPath;
var color = 'blue';
var strokeCap = 'round';
var width = 5;
var opacity = 1;
var canvas = document.getElementById('myCanvas');
var serverURL = 'http://localhost:3000';
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

$('#toolbar-toggle').on('click', function() {
  if ($(this).hasClass('ui-state-active')) {
    $('#toggle-toolbar-arrow').html('&#9650');
  }
  else {
    $('#toggle-toolbar-arrow').html('&#9660');
  }
});

$('#gyc-undo-button').click(function() {
  myPath.remove();
});

var windowUrl = window.location.href;

// Make get request for latest drawing on initial page load
$.get(serverURL + '/retrieve', {'url': windowUrl}, function(response) {
  console.log(response);
  if (response !== "website not found") {
    project.importJSON(response.json_string);
    $('.getyourcrayon-menubar').append(response.tags_html_string);
    maxIndex = response.max_index;
    currentPosition = maxIndex;
    $("#timeline").prop('max', maxIndex);
    $('#timeline').val(maxIndex);
    $("#gyc-next-button").prop('disabled', true);
  }
  else {
    maxIndex = 0;
    currentPosition = maxIndex;
    $('#timeline').hide();
    $("#gyc-next-button").prop('disabled', true);
  }
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

  $.post(serverURL + '/save', data,function(response){
    console.log(response);
    maxIndex += 1;
    currentPosition = maxIndex;
    $("#timeline").prop('max', maxIndex);
    $('#timeline').val(maxIndex);
    $("#gyc-next-button").prop('disabled', true);
    });
  });


function timelineUpdate() {
  $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
    canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
    myProject.activeLayer.removeChildren();
    myProject.importJSON(response);
  });
}

$('#timeline').change(function() {
  currentPosition = $(this).val();
  timelineUpdate();
});

// $('#gyc-previous-button').click(function(){
//   currentPosition -= 1;
//   $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
//     $("#gyc-next-button").prop('disabled', false);
//     canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
//     myProject.activeLayer.removeChildren();
//     myProject.importJSON(response);
//     if (currentPosition == 0) {
//       $("#gyc-previous-button").prop('disabled', true);
//     }
//   });
// });

// $('#gyc-next-button').click(function(){
//   currentPosition += 1;
//   $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
//     $("#gyc-previous-button").prop('disabled', false);
//     canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
//     myProject.activeLayer.removeChildren();
//     myProject.importJSON(response);
//     if (currentPosition == maxIndex) {
//       $("#gyc-next-button").prop('disabled', true);
//     }
//   });
// });


var farbtasticWheel = chrome.extension.getURL("wheel.png");
var farbtasticMask = chrome.extension.getURL("mask.png");
var farbtasticMarker = chrome.extension.getURL("marker.png");

$('.farbtastic .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
$('.farbtastic .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
$('.farbtastic .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");
