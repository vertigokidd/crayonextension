var myPath;
var color = 'blue';
var strokeCap = 'round';
var width = 5;
var opacity = 1;
var canvas = document.getElementById('myCanvas');
var serverURL = 'http://localhost:3000';
myProject = project;

// This is the Painting Functionality
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
}



// This are all the Painting Functionality Listeners
toggleCanvas();
updateColor();
updateWidth();
updateOpacity();
undo();


// Listens for a click on the paint button and hides or displays the canvas
function toggleCanvas(){
  $('#gyc-paint-button').click(function(){
    $('#myCanvas').toggle();
  });
}

// Listens for mouse events on the color picker image to change 
// the stroke color by updating the color variable
function updateColor(){
  $('.marker').on('mouseup', function(){
    color = $('#color').val();
  });

  $('.marker').on('mouseleave', function(){
    color = $('#color').val();
  });
}

// Listens for a change on the width slider to change
// the stroke width by updating the width variable
function updateWidth(){
  $('#width').change(function() {
    var newWidth = $(this).val();
    width = parseInt(newWidth);
    $('#current_width').html(width);
  });
}

// Listens for a change on the opacity slider to change
// the stroke opacity by updating the opacity variable
function updateOpacity(){
  $('#opacity').change(function() {
    var newOpacity = $(this).val();
    opacity = parseFloat(newOpacity)/100;
    $('#current_opacity').html(newOpacity + "%");
  });
}

// Listens for a click on the undo button and removes the last stroke
function undo(){
  $('#gyc-undo-button').click(function() {
    myPath.remove();
  });
}













// This chenges the arrow //
$('#toolbar-toggle').on('click', function() {
  if ($(this).hasClass('ui-state-active')) {
    $('#toggle-toolbar-arrow').html('&#9650');
  }
  else {
    $('#toggle-toolbar-arrow').html('&#9660');
  }
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

// This is the post that saves the drwaing //
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
    if (response === 'Success'){
      confirmation_popup();
      $('#drawingTags').val('')
      maxIndex += 1;
      currentPosition = maxIndex;
      $("#timeline").prop('max', maxIndex);
      $('#timeline').val(maxIndex);
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
      // $('#gyc-confirmation-popup').remove();
      // console.log("removed")
    });
    
  }, 3000)
}


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
