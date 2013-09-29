var myPath;
var color = 'blue';
var strokeCap = 'round';
var width = 5;
var opacity = 1;
var canvas = document.getElementById('myCanvas');
var serverURL = 'http://localhost:3000';
var windowUrl = window.location.href;
myProject = project;


// This loads the color picker images 
var farbtasticWheel = chrome.extension.getURL("wheel.png");
var farbtasticMask = chrome.extension.getURL("mask.png");
var farbtasticMarker = chrome.extension.getURL("marker.png");

$('.farbtastic .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
$('.farbtastic .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
$('.farbtastic .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");


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
loadDrawings(windowUrl);
toggleDropdownArrow();
toggleCanvas();
updateColor();
updateWidth();
updateOpacity();
undo();
openSaveForm();
initializePopupForm();
updateTimeline();


// Creates a request for latest drawing on initial page load
function loadDrawings(windowUrl){
  $.get(serverURL + '/retrieve', {'url': windowUrl}, function(response) {
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
}

// Listens to a click on the dropdown bar and toggles the arrow up and down. 
function toggleDropdownArrow(){
  $('#toolbar-toggle').on('click', function() {
    if ($(this).hasClass('ui-state-active')) {
      $('#toggle-toolbar-arrow').html('&#9650');
    }
    else {
      $('#toggle-toolbar-arrow').html('&#9660');
    }
  });
}

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

// Listens for a click on the save button and opens the dialog save form
function openSaveForm(){
  $('#gyc-save-button').click(function(){
    $('#gyc-save-confirm').dialog("open");
  });
}

// Initializes pop-up Save form and listens
function initializePopupForm(){
  $('#gyc-save-confirm').dialog({
    autoOpen: false,
    height: 100,
    width: 250,
    modal: true,
    buttons: {
      "Confirm Save": function(){
        saveDrawingPost();
        $(this).dialog('close');
        },
      Cancel: function(){
        $(this).dialog('close');
        }
      }
  });
}

// Makes a post that saves the drwaing and is triggered 
// by the PopupForm Confirm-Save button
function saveDrawingPost(){
  var tags = $('#drawingTags').val();
  var data = {
    url: windowUrl,
    json_string: myProject.layers[myProject.layers.length - 1].exportJSON(),
    tags: tags
  };

  $.post(serverURL + '/save', data,function(response){
    if (response === 'Success'){
      showConfirmationPopup();
      $('#drawingTags').val('')
      maxIndex += 1;
      currentPosition = maxIndex;
      $("#timeline").prop('max', maxIndex);
      $('#timeline').val(maxIndex);
      $("#gyc-next-button").prop('disabled', true);
    }
    else {
      //We need to make a message in case the post fails
    }

  });
}

// displays a save confirmation message when post is succesfull
// this is called from the post
function showConfirmationPopup(){
  $('body').prepend("<div id='gyc-confirmation-popup'>SAVED!</div>");
  $('#gyc-confirmation-popup').slideDown('slow');
  setTimeout(function(){
    $('#gyc-confirmation-popup').fadeOut('slow',function(){
      // $('#gyc-confirmation-popup').remove();
      // console.log("removed")
    });
    
  }, 3000)
}

// Listens for a change on the timeline slider 
// updates the current position and updates the time line
function updateTimeline(){
  $('#timeline').change(function() {
    currentPosition = $(this).val();
    timelineUpdate();
  });
}

// triggers a get requests that rettrives drwaings 
// clears the canvas and imports the response to the canvas
function timelineUpdate() {
  $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
    canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
    myProject.activeLayer.remove();
    var newlayer = new Layer()
    // myProject.activeLayer.removeChildren();
    myProject.importJSON(response);
  });
}


 






















