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
    minIndex = 1;
    currentPosition = maxIndex;
    $("#gyc-next-button").prop('disabled', true);
  }
});

// Initializes pop-up save form //
$('#gyc-save-confirm').dialog({
  autoOpen: false,
  height: 100,
  width: 250,
  modal: true,
  buttons: {
    "Confirm Save": function(){
      make_post();

      $(this).dialog('close');
      },
    Cancel: function(){
      $(this).dialog('close');
      }
    }
});

//Opens the dialog save form //
$('#gyc-save-button').click(function(){
  $('#gyc-save-confirm').dialog("open");
});

// THis is the post that saves the drwaing //
var make_post = function(){
  var tags = $('#drawingTags').val();
  console.log(tags);
  var data = {
    url: windowUrl,
    json_string: myProject.exportJSON(),
    tags: tags
  };

  console.log(data);

  $.post(serverURL + '/save', data,function(response){
    if (response=== 'Success'){
      confirmation_popup();
      $('#drawingTags').val('')
      maxIndex += 1;
      currentPosition = maxIndex;
      $("#gyc-next-button").prop('disabled', true);
    }
    else {
    }
  });
}

var confirmation_popup = function(){
  $(body).prepend("<div id='gyc-confirmation-popup'>SAVED!</div>");
  $('#gyc-confirmation-popup').slideDown('slow');
  setTimeout(function(){
    $('#gyc-confirmation-popup').fadeOut('slow',function(){
      $('#gyc-confirmation-popup').remove();
    });
    
  }, 3000)
}


$('#gyc-previous-button').click(function(){
  currentPosition -= 1;
  $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
    $("#gyc-next-button").prop('disabled', false);
    canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
    myProject.activeLayer.removeChildren();
    myProject.importJSON(response);
    if (currentPosition == 0) {
      $("#gyc-previous-button").prop('disabled', true);
    }
  });
});

$('#gyc-next-button').click(function(){
  currentPosition += 1;
  $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
    $("#gyc-previous-button").prop('disabled', false);
    canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
    myProject.activeLayer.removeChildren();
    myProject.importJSON(response);
    if (currentPosition == maxIndex) {
      $("#gyc-next-button").prop('disabled', true);
    }
  });
});

var farbtasticWheel = chrome.extension.getURL("wheel.png");
var farbtasticMask = chrome.extension.getURL("mask.png");
var farbtasticMarker = chrome.extension.getURL("marker.png");

$('.farbtastic .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
$('.farbtastic .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
$('.farbtastic .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");
