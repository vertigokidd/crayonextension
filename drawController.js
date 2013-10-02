function Graffiti() {
  this.path = null;
  this.color = 'blue';
  this.strokeCap = 'round';
  this.width = 5;
  this.opacity = 1;
  this.canvas = document.getElementById('gyc-canvas');
  this.serverUrl = 'http://localhost:3000';
  this.windowUrl = window.location.href;
  this.latestDrawing = null;
  this.project = project;
  this.maxIndex = null;
  this.currentPosition = null;
}

var graffiti = new Graffiti();


// This loads the color picker images
var farbtasticWheel = chrome.extension.getURL("wheel.png");
var farbtasticMask = chrome.extension.getURL("mask.png");
var farbtasticMarker = chrome.extension.getURL("marker.png");

$('.farbtastic-gyc .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
$('.farbtastic-gyc .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
$('.farbtastic-gyc .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");


// This is the Painting Functionality, method names are required by paper.js

function onMouseDown(event) {
  graffiti.path = new Path();
  graffiti.path.strokeColor = graffiti.color;
  graffiti.path.strokeWidth = graffiti.width;
  graffiti.path.strokeCap = graffiti.strokeCap;
  graffiti.path.opacity = graffiti.opacity;
}

function onMouseDrag(event) {
  graffiti.path.add(event.point);
  graffiti.path.smooth();
}


// Creates a request for latest drawing on initial page load
Graffiti.prototype.loadDrawings = function(windowUrl) {
  var self = this;
  $.get(self.serverUrl + '/retrieve', {'url': windowUrl}, function(response) {
    if (response !== "website not found") {
      self.latestDrawing = response.json_string;
      self.project.activeLayer.remove();
      self.project.importJSON(response.json_string);
      $('#gyc-tag-holder').html(response.tags_html_string);
      self.maxIndex = response.max_index;
      self.currentPosition = self.maxIndex;
      $("#gyc-timeline").prop('max', self.maxIndex);
      $('#gyc-timeline').val(self.maxIndex);
    }
    else {
      self.maxIndex = null;
      self.currentPosition = self.maxIndex;
      $('#gyc-timeline').hide();
    }
    $("#gyc-next-button").css('visibility', 'hidden');
    $('#gyc-save-button').prop('disabled', true);
  }).fail(function(){self.showConfirmationPopup("body","Error: server conection problem");
       $('#gyc-timeline').hide();
     });
};

// listens for a mouseup on the entire document then checks to see if the current project is different than the originally loaded project

Graffiti.prototype.toggleSaveButton = function(){
  var undoCounter = 0;
  var self = this;

  $('#gyc-canvas').on('mouseup', function(){
    undoCounter += 1;
    var currentDrawing = self.project.layers[self.project.layers.length - 1].exportJSON();
    if(self.latestDrawing != currentDrawing){
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
};

// Listens to a click on the dropdown bar and toggles the arrow up and down.
Graffiti.prototype.toggleDropdownArrow = function(){
  $('#gyc-toolbar-toggle').on('click', function() {
    $(this).focus('false');
    if ($(this).hasClass('ui-state-active')) {
      $('#gyc-toggle-toolbar-arrow').removeClass('icon-chevron-sign-down').addClass('icon-chevron-sign-up').css('border-radius', '0px');
      $('#gyc-toolbar-toggle').css('border-radius', '0px');
    }
    else {
      $('#gyc-toggle-toolbar-arrow').removeClass('icon-chevron-sign-up').addClass('icon-chevron-sign-down');
    }
  });
};

// Listens for a click on the paint button and hides or displays the canvas
// TESTED
Graffiti.prototype.toggleCanvas = function(){
  $('#gyc-paint-button').click(function(){
    $('#gyc-canvas').toggle();
    if ($('#gyc-canvas').css("display") === 'none') {
      $('#gyc-paint-button').removeClass("icon-eye-open").addClass("icon-eye-close");
    }
    else {
      $('#gyc-paint-button').removeClass("icon-eye-close").addClass("icon-eye-open");
    }

  });
};

// Listens for mouse events on the color picker image to change
// the stroke color by updating the color variable
Graffiti.prototype.updateColor = function(){
  var self = this;
  $('.marker').on('mouseup', function(){
    self.color = $('#gyc-color').val();
  });

  $('.marker').on('mouseleave', function(){
    self.color = $('#gyc-color').val();
  });

  $('#gyc-color').on('keyup', function() {
    if (validHex($('#gyc-color').val())) {
      self.color = $('#gyc-color').val();
    }
  });
};

// Listens for a change on the width slider to change
// the stroke width by updating the width variable
Graffiti.prototype.updateWidth = function(){
  var self = this;
  $('#gyc-width').change(function() {
    var newWidth = $(this).val();
    self.width = parseInt(newWidth);
    $('#gyc-current_width').html(self.width);
  });
};

// Listens for a change on the opacity slider to change
// the stroke opacity by updating the opacity variable
Graffiti.prototype.updateOpacity = function(){
  var self = this;
  $('#gyc-opacity').change(function() {
    var newOpacity = $(this).val();
    self.opacity = parseFloat(newOpacity)/100;
    $('#gyc-current_opacity').html(newOpacity + "%");
  });
};

// Listens for a click on the undo button and removes the last stroke
Graffiti.prototype.undo = function(){
  var self = this;
  $('#gyc-undo-button').click(function(event) {
    if (self.project.layers[0].children.length >= 1) {
      self.project.layers[0].children[self.project.layers[0].children.length -1].visible = false;
      self.project.layers[0].children[self.project.layers[0].children.length -1].remove();
      self.project.view.draw();
    }
  });
};

// Listens for a click on the clean slate button and clears the entire canvas

Graffiti.prototype.cleanSlate = function() {
  var self = this;
  $('#gyc-clean-slate-button').click(function() {
    self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
    self.project.activeLayer.remove();
    var newlayer = new Layer();
  });
};

// Listens for a click on the save button and opens the dialog save form
Graffiti.prototype.openSaveForm = function(){
  $('#gyc-save-button').click(function(){
    $('#gyc-save-confirm').dialog("open");
  });
};

// Initializes pop-up Save form and listens
Graffiti.prototype.initializePopupForm = function(){
  var self = this;
  $('#gyc-save-confirm').dialog({
    autoOpen: false,
    height: 100,
    width: 250,
    dialogClass: 'gyc-popup',
    modal: false,
    open: function() {
      $("#gyc-drawingTags").keypress(function(e) {
        if (e.keyCode == $.ui.keyCode.ENTER) {
          $('.gyc-save-confirm-button').trigger("click");
        }
      });
    },
    buttons: {
      "Confirm Save": {class: 'gyc-save-confirm-button', text: 'Confirm Save', click: function(){
        self.saveDrawingPost();
        $('#gyc-twitter').dialog("open");
        $(this).dialog('close');
        }},
      Cancel: {class: 'gyc-save-cancel-button', text: 'Cancel', click: function(){
        $(this).dialog('close');
        }
      }}
  });
};


// Initializes Twitter pop-up and listens
// This is called on the save form confirmation button
Graffiti.prototype.initializeTwitterPopup = function(){
  $('#gyc-twitter').dialog({
    autoOpen: false,
    height: 100,
    width: 250,
    dialogClass: 'gyc-popup',
    modal: false,
    close: function() { console.log("CLOSE");$('#gyc-twitter-bttn').html(""); }
  });
};

// Makes a post that saves the drawing and is triggered
// by the PopupForm Confirm-Save button
Graffiti.prototype.saveDrawingPost = function(){
  var self = this;
  var tags = $('#gyc-drawingTags').val();
  var data = {
    url: self.windowUrl,
    json_string: self.project.layers[self.project.layers.length - 1].exportJSON(),
    tags: tags
  };


  $.post(self.serverURL + '/save', data,function(response){
    if (response.tags_html_string){
      var twitter_html = '<a href="https://twitter.com/share" data-url="/" class="twitter-share-button" data-hashtags="GetYourCrayon" data-text="I created this amazing drawing see it on => '+response.unique_url+'" data-lang="en" data-size="large" data-count="none">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>'
      $('#gyc-twitter-bttn').html(twitter_html);
      $('#gyc-tag-holder').html(response.tags_html_string);
      $('#gyc-drawingTags').val('');
      if(self.maxIndex === null){
        self.maxIndex = 0;
        $("#gyc-timeline").prop('max', self.maxIndex);
        $('#gyc-timeline').val(self.maxIndex);
      }
      else{
        self.maxIndex += 1;
      }
      self.currentPosition = self.maxIndex;
      $("#gyc-timeline").prop('max', self.maxIndex);
      $('#gyc-timeline').val(self.maxIndex);
      $("#gyc-next-button").css('visibility', 'hidden');
      $("#gyc-save-button").prop('disabled', true);
      self.latestDrawing = self.project.layers[self.project.layers.length - 1].exportJSON();
      if(self.maxIndex >= 1){
        $('#gyc-timeline').show();
      }
    }
  }).fail(function(){
    self.showConfirmationPopup("body","ERROR WHEN SAVING");
    $('#gyc-timeline').hide();
     });
};

// displays a save confirmation message when post is succesfull
// this is called from the post
Graffiti.prototype.showConfirmationPopup = function(element,message){
  $(element).prepend("<div id='gyc-confirmation-popup'>"+message+"</div>");
  $('#gyc-confirmation-popup').slideDown('slow');
  setTimeout(function(){
    $('#gyc-confirmation-popup').fadeOut('slow',function(){
      $('#gyc-confirmation-popup').remove();
    });
  }, 3000);
};

// Listens for a change on the timeline slider
// updates the current position and updates the time line
Graffiti.prototype.updateTimeline = function(){
  var self = this;
  $('#gyc-timeline').change(function() {
    self.currentPosition = $(this).val();
    self.timelineUpdate();
    if (self.currentPosition == self.maxIndex) {
      $("#gyc-next-button").css('visibility', 'hidden');
    }
    else {
      $("#gyc-next-button").css('visibility', 'visible');
    }
    if (self.currentPosition == 0) {
      $("#gyc-previous-button").css('visibility', 'hidden');
    }
    else {
      $("#gyc-previous-button").css('visibility', 'visible');
    }

    if(self.currentPosition != self.maxIndex){
      $("#gyc-save-button").prop('disabled', false);
    }
    else{
      $("#gyc-save-button").prop('disabled', true);
    }
  });
};

// triggers a get requests that rettrives drwaings
// clears the canvas and imports the response to the canvas
Graffiti.prototype.timelineUpdate = function() {
  var self = this;
  $.get( self.serverURL + '/retrieve',{'url': self.windowUrl, 'id': self.currentPosition},function(response){
    self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
    self.project.activeLayer.remove();
    var newlayer = new Layer();
    self.project.activeLayer.remove();
    self.project.importJSON(response);
    self.project.view.draw();
  }).fail(function(){self.showConfirmationPopup("ERROR: When Retrieving drawings");});
};

// This method validates the authenticity of a hex color string

function validHex(hexString) {
  return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i).test(hexString);
}

// These two methods initialize the next and previous buttons for the timeline

Graffiti.prototype.initializePrevious = function() {
  var self = this;
  $('#gyc-previous-button').click(function(event){
    event.preventDefault();
    self.currentPosition -= 1;
    $('#gyc-timeline').val(self.currentPosition);
    $.get( self.serverURL + '/retrieve',{'url': self.windowUrl, 'id': self.currentPosition},function(response){
      $("#gyc-next-button").css('visibility', 'visible');
      self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
      self.project.activeLayer.removeChildren();
      self.project.importJSON(response);
      if (self.currentPosition == 0) {
        $("#gyc-previous-button").css('visibility', 'hidden');
      }
      self.project.view.draw();
    });
  });
};

Graffiti.prototype.initializeNext = function() {
  var self = this;
  $('#gyc-next-button').click(function(event){
    event.preventDefault();
    self.currentPosition += 1;
    $('#gyc-timeline').val(self.currentPosition);
    $.get( self.serverURL + '/retrieve',{'url': self.windowUrl, 'id': self.currentPosition},function(response){
      $("#gyc-previous-button").css('visibility', 'visible');
      self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
      self.project.activeLayer.removeChildren();
      self.project.importJSON(response);
      if (self.currentPosition == self.maxIndex) {
        $("#gyc-next-button").css('visibility', 'hidden');
      }
      self.project.view.draw();
    });
  });
};


// This are all the Painting Functionality Listeners
graffiti.loadDrawings(graffiti.windowUrl);
graffiti.toggleDropdownArrow();
graffiti.toggleCanvas();
graffiti.updateColor();
graffiti.updateWidth();
graffiti.updateOpacity();
graffiti.undo();
graffiti.cleanSlate();
graffiti.openSaveForm();
graffiti.initializePopupForm();
graffiti.initializeTwitterPopup();
graffiti.updateTimeline();
graffiti.toggleSaveButton();
graffiti.initializePrevious();
graffiti.initializeNext();
