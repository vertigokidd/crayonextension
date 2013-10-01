var myPath;
var color = 'blue';
var strokeCap = 'round';
var width = 5;
var opacity = 1;
var canvas = document.getElementById('gyc-canvas');
var serverURL = 'http://localhost:3000';
var windowUrl = window.location.href;
var latestDrawing;
myProject = project;


// This loads the color picker images
var farbtasticWheel = chrome.extension.getURL("wheel.png");
var farbtasticMask = chrome.extension.getURL("mask.png");
var farbtasticMarker = chrome.extension.getURL("marker.png");

$('.farbtastic-gyc .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
$('.farbtastic-gyc .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
$('.farbtastic-gyc .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");


// Load the button images on toolbar //

var gycOn = chrome.extension.getURL("gyc-on.png");
var gycOff = chrome.extension.getURL("gyc-off.png");

$('#gyc-paint-button').css("background", "url('" + gycOff + "') no-repeat");

// This is the Painting Functionality, method names are required by paper.js
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

// This are all the Painting Functionality Listeners
// initializeMsgListener();
loadDrawings(windowUrl);
toggleDropdownArrow();
toggleCanvas();
updateColor();
updateWidth();
updateOpacity();
undo();
cleanSlate();
openSaveForm();
initializePopupForm();
updateTimeline();
toggleSaveButton();
initializePrevious();
initializeNext();


// Creates a request for latest drawing on initial page load
function loadDrawings(windowUrl){
  $.get(serverURL + '/retrieve', {'url': windowUrl}, function(response) {
    if (response !== "website not found") {
      latestDrawing = response.json_string;
      project.activeLayer.remove();
      project.importJSON(response.json_string);
      $('#gyc-tag-holder').html(response.tags_html_string);
      maxIndex = response.max_index;
      currentPosition = maxIndex;
      $("#gyc-timeline").prop('max', maxIndex);
      $('#gyc-timeline').val(maxIndex);
    }
    else {
      maxIndex = null;
      currentPosition = maxIndex;
      $('#gyc-timeline').hide();
    }
    $("#gyc-next-button").css('visibility', 'hidden');
    $('#gyc-save-button').prop('disabled', true);
  }).fail(function(){showConfirmationPopup("Error: server conection problem");
       $('#gyc-timeline').hide();
     });
}

// listens for a mouseup on the entire document then checks to see if the current project is different than the originally loaded project

function toggleSaveButton(){
  var undoCounter = 0;


  $('#gyc-canvas').on('mouseup', function(){
    undoCounter += 1;
    var currentDrawing = myProject.layers[myProject.layers.length - 1].exportJSON();
    if(latestDrawing != currentDrawing){
      $('#gyc-save-button').prop('disabled', false);
    }
    else{
      $('#gyc-save-button').prop('disabled', true);
    }
  });


  $('#gyc-undo-button').on('click', function() {
    undoCounter -= 1;
    if (undoCounter === 0) {
      $('#gyc-save-button').prop('disabled', true);
    }
    else {
      $('#gyc-save-button').prop('disabled', false);
    }
  });
}

// Listens to a click on the dropdown bar and toggles the arrow up and down.
function toggleDropdownArrow(){
  $('#gyc-toolbar-toggle').on('click', function() {
    if ($(this).hasClass('ui-state-active')) {
      $('#gyc-toggle-toolbar-arrow').html('&#9650');
    }
    else {
      $('#gyc-toggle-toolbar-arrow').html('&#9660');
    }
  });
}

// Listens for a click on the paint button and hides or displays the canvas
// TESTED
function toggleCanvas(){
  $('#gyc-paint-button').click(function(){
    $('#gyc-canvas').toggle();
    if ($('#gyc-canvas').css("display") === 'none') {
      $('#gyc-paint-button').css("background", "url('" + gycOff + "') no-repeat");
    }
    else {
      $('#gyc-paint-button').css("background", "url('" + gycOn + "') no-repeat");
    }

  });
}

// Listens for mouse events on the color picker image to change
// the stroke color by updating the color variable
function updateColor(){
  $('.marker').on('mouseup', function(){
    color = $('#gyc-color').val();
  });

  $('.marker').on('mouseleave', function(){
    color = $('#gyc-color').val();
  });

  $('#gyc-color').on('keyup', function() {
    if (validHex($('#gyc-color').val())) {
      color = $('#gyc-color').val();
    }
  });
}

// Listens for a change on the width slider to change
// the stroke width by updating the width variable
function updateWidth(){
  $('#width').change(function() {
    var newWidth = $(this).val();
    width = parseInt(newWidth);
    $('#gyc-current_width').html(width);
  });
}

// Listens for a change on the opacity slider to change
// the stroke opacity by updating the opacity variable
function updateOpacity(){
  $('#opacity').change(function() {
    var newOpacity = $(this).val();
    opacity = parseFloat(newOpacity)/100;
    $('#gyc-current_opacity').html(newOpacity + "%");
  });
}

// Listens for a click on the undo button and removes the last stroke
function undo(){
  $('#gyc-undo-button').click(function(event) {
    if (myProject.layers[0].children.length >= 1) {
      myProject.layers[0].children[myProject.layers[0].children.length -1].visible = false;
      myProject.layers[0].children[myProject.layers[0].children.length -1].remove();
      myProject.view.draw();
    }
  });
}

// Listens for a click on the clean slate button and clears the entire canvas

function cleanSlate() {
  $('#gyc-clean-slate-button').click(function() {
    canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
    myProject.activeLayer.remove();
    var newlayer = new Layer();
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
    dialogClass: 'gyc-save-popup',
    modal: true,
    open: function() {
      $("#gyc-drawingTags").keypress(function(e) {
        if (e.keyCode == $.ui.keyCode.ENTER) {
          $('.gyc-save-confirm-button').trigger("click");
        }
      });
    },
    buttons: {
      "Confirm Save": {class: 'gyc-save-confirm-button', text: 'Confirm Save', click: function(){
        saveDrawingPost();
        $(this).dialog('close');
        }},
      Cancel: {class: 'gyc-save-cancel-button', text: 'Cancel', click: function(){
        $(this).dialog('close');
        }
      }}
  });
}

// Makes a post that saves the drawing and is triggered
// by the PopupForm Confirm-Save button
function saveDrawingPost(){
  var tags = $('#gyc-drawingTags').val();
  var data = {
    url: windowUrl,
    json_string: myProject.layers[myProject.layers.length - 1].exportJSON(),
    tags: tags
  };

  $.post(serverURL + '/save', data,function(response){
    if (response.tags_html_string){
      $('#gyc-tag-holder').html(response.tags_html_string);
      showConfirmationPopup("SAVED!");
      $('#gyc-drawingTags').val('');
      if(maxIndex === null){
        maxIndex = 0;
        $("#gyc-timeline").prop('max', maxIndex);
        $('#gyc-timeline').val(maxIndex);
      }
      else{
        maxIndex += 1;
      }
      currentPosition = maxIndex;
      $("#gyc-timeline").prop('max', maxIndex);
      $('#gyc-timeline').val(maxIndex);
      $("#gyc-next-button").css('visibility', 'hidden');
      $("#gyc-save-button").prop('disabled', true);
      latestDrawing = myProject.layers[myProject.layers.length - 1].exportJSON();
      if(maxIndex >= 1){
        $('#gyc-timeline').show();
      }
    }
  }).fail(function(){
    showConfirmationPopup("ERROR WHEN SAVING");
    $('#gyc-timeline').hide();
     });
}

// displays a save confirmation message when post is succesfull
// this is called from the post
function showConfirmationPopup(message){
  $('body').prepend("<div id='gyc-confirmation-popup'>"+message+"</div>");
  $('#gyc-confirmation-popup').slideDown('slow');
  setTimeout(function(){
    $('#gyc-confirmation-popup').fadeOut('slow',function(){
      $('#gyc-confirmation-popup').remove();
    });
  }, 3000);
}

// Listens for a change on the timeline slider
// updates the current position and updates the time line
function updateTimeline(){
  $('#gyc-timeline').change(function() {
    currentPosition = $(this).val();
    timelineUpdate();
    if (currentPosition == maxIndex) {
      $("#gyc-next-button").css('visibility', 'hidden');
    }
    else {
      $("#gyc-next-button").css('visibility', 'visible');
    }
    if (currentPosition == 0) {
      $("#gyc-previous-button").css('visibility', 'hidden');
    }
    else {
      $("#gyc-previous-button").css('visibility', 'visible');
    }

    if(currentPosition != maxIndex){
      $("#gyc-save-button").prop('disabled', false);
    }
    else{
      $("#gyc-save-button").prop('disabled', true);
    }
  });
}

// triggers a get requests that rettrives drwaings
// clears the canvas and imports the response to the canvas
function timelineUpdate() {
  $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
    canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
    myProject.activeLayer.remove();
    var newlayer = new Layer();
    project.activeLayer.remove();
    myProject.importJSON(response);
    myProject.view.draw();
  }).fail(function(){showConfirmationPopup("ERROR: When Retrieving drawings");});
}

// This method validates the authenticity of a hex color string

function validHex(hexString) {
  return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i).test(hexString);
}

// These two methods initialize the next and previous buttons for the timeline

function initializePrevious() {
  $('#gyc-previous-button').click(function(event){
    event.preventDefault();
    currentPosition -= 1;
    $('#gyc-timeline').val(currentPosition);
    $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
      $("#gyc-next-button").css('visibility', 'visible');
      canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
      myProject.activeLayer.removeChildren();
      myProject.importJSON(response);
      if (currentPosition == 0) {
        $("#gyc-previous-button").css('visibility', 'hidden');
      }
      myProject.view.draw();
    });
  });
}

function initializeNext() {
  $('#gyc-next-button').click(function(event){
    event.preventDefault();
    currentPosition += 1;
    $('#gyc-timeline').val(currentPosition);
    $.get( serverURL + '/retrieve',{'url': windowUrl, 'id': currentPosition},function(response){
      $("#gyc-previous-button").css('visibility', 'visible');
      canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height);
      myProject.activeLayer.removeChildren();
      myProject.importJSON(response);
      if (currentPosition == maxIndex) {
        $("#gyc-next-button").css('visibility', 'hidden');
      }
      myProject.view.draw();
    });
  });
}

// function initializeMsgListener(){
//   chrome.extension.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       console.log(request);
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//       if (request.task == "toggle") {
//         console.log('receieved message in drawController.js');
//         myProject.view.draw();
//       }
//     });
// }
