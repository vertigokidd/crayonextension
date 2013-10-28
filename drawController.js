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
  this.undoCounter = 0;
  this.drawingStatus = 'off';
  this.canvasStatus = false;
  this.currentTags = null;
}

function GraffitiView(graffitiModel) {
  this.model = graffitiModel;
  this.badge = false;
}
// VIEW METHODS ###############################################################

// listens for a mouseup on the entire document then checks to see if the current project is different than the originally loaded project

GraffitiView.prototype.toggleSearchButton = function() {
  if (graffiti.drawingStatus === 'on') {
    graffitiView.toggleDraw();
  }
  $('.gyc-drawing-tools').hide();
  $('#gyc-save-confirm').hide();  
  $('.gyc-search-tools').show();
  
  if ($('#gyc-toolbar-toggle').hasClass('ui-state-active') === false) {
    $('#gyc-toolbar-toggle').click();
  }
  graffitiView.toggleDropdownArrow();
}

GraffitiView.prototype.toggleSaveButton = function(){
  if(this.model.checkUndoCounter() && this.model.checkDrawingFreshness()){
    $('.gyc-random-class').prop('disabled', true);
    $('.gyc-random-class').hide();
    $('#gyc-drawingTags').prop('placeholder', 'Draw something to save!');
  }
  else{
    $('.gyc-random-class').prop('disabled', false);
    $('.gyc-random-class').show();
    $('#gyc-drawingTags').prop('placeholder', 'Dinosaur, Space_Robot, Steve...');
  }
};

// Creates a request for latest drawing on initial page load
GraffitiView.prototype.setupPage = function(windowUrl) {
  var self = this;
  $.get(self.model.serverUrl + '/retrieve', {'url': windowUrl}, function(response) {
    if (response !== "website not found") {
      self.loadDrawings(response);
      graffiti.currentTags = response.tags_html_string;
      graffitiView.insertTags();
      self.setupTimeline(response.max_index);
    }
    else {
      self.setupTimeline(null);
    } 
    self.model.currentTags = response.tags_html_string
    $('.gyc-random-class').prop('disabled', true);
    $('.gyc-random-class').hide();
    $('#gyc-drawingTags').prop('placeholder', 'Draw something to save!');
    $("#gyc-undo-button").css('color', 'gray');
    $("#gyc-clean-slate-button").css('color', 'gray');
  }).fail(function(){self.showConfirmationPopup("body","Error: server conection problem");
      $('#gyc-timeline').hide();
      $('#gyc-next-button').hide();
      $('#gyc-previous-button').hide();
    });
};

GraffitiView.prototype.setupTimeline = function(maxIndex) {
  var self = this;
  self.model.maxIndex = maxIndex;
  self.model.currentPosition = maxIndex;
  if (maxIndex === null) {
    $('#gyc-timeline').hide();
    $('#gyc-next-button').hide();
    $('#gyc-previous-button').hide();
  }
  else {
    $("#gyc-timeline").prop('max', self.model.maxIndex);
    $('#gyc-timeline').val(self.model.maxIndex);
  }
};

GraffitiView.prototype.loadDrawings = function(response) {
  this.model.latestDrawing = response.json_string;
  this.model.project.activeLayer.remove();
  this.model.project.importJSON(response.json_string);
};

GraffitiView.prototype.insertTags = function(response) {
  $('#gyc-tag-holder').html(graffiti.currentTags);
};

GraffitiView.prototype.toggleDraw = function() {
  if ($('#gyc-toolbar-toggle').hasClass('ui-state-active') === false && graffiti.drawingStatus === 'off') {
    $('#gyc-toolbar-toggle').click();
  }
  if (graffiti.drawingStatus === 'on') {
    graffiti.drawingStatus = 'off';
    $('#gyc-draw-button').css("color", "");
    $("#gyc-undo-button").css('color', 'gray');
    $("#gyc-clean-slate-button").css('color', 'gray');
  }
  else {
    $('.gyc-drawing-tools').show();
    $('.gyc-search-tools').hide();
    $('#gyc-save-confirm').hide();
    if (graffiti.canvasStatus === false) {
      graffiti.toggleCanvas();
    }
    graffiti.drawingStatus = 'on';
    $('#gyc-draw-button').css("color", graffiti.color);
    $("#gyc-undo-button").css('color', '');
    $("#gyc-clean-slate-button").css('color', '');
  }
};

// Listens to a click on the dropdown bar and toggles the arrow up and down.

GraffitiView.prototype.toggleDropdownArrow = function(){
  var toolbar = $('#gyc-toolbar-toggle');
  toolbar.focus('false');
  if (toolbar.hasClass('ui-state-active')) {
    $('#gyc-toggle-toolbar-arrow').removeClass('icon-chevron-sign-down').addClass('icon-chevron-sign-up');
    setTimeout(function(){toolbar.css('border-radius', '');},1000);
  }
  else {
    $('#gyc-toggle-toolbar-arrow').removeClass('icon-chevron-sign-up').addClass('icon-chevron-sign-down');
    toolbar.css("border-radius", '0px');
  }
};


GraffitiView.prototype.refreshBadge = function(){
  $('#gyc-badge').toggle(this.badge);
}

// MODEL METHODS ##############################################################

Graffiti.prototype.decrementUndoCounter = function() {
  this.undoCounter -= 1;
};

Graffiti.prototype.incrementUndoCounter = function() {
  this.undoCounter += 1;
};

Graffiti.prototype.checkUndoCounter = function() {
  return this.undoCounter === 0;
};

Graffiti.prototype.checkDrawingFreshness = function() {
  var currentDrawing = this.project.layers[this.project.layers.length - 1].exportJSON();
  return this.latestDrawing == currentDrawing;
};

//#############################################################################



// Listens for a click on the paint button and hides or displays the canvas

Graffiti.prototype.toggleCanvas = function(){
  if (graffiti.canvasStatus === true) {
    $('#gyc-paint-button').removeClass("icon-eye-open").addClass("icon-eye-close").css("color", "");
    if (graffiti.drawingStatus === 'on') {
      graffitiView.toggleDraw();
    }
    graffiti.canvasStatus = false;
    graffitiView.badge = false;
    graffitiView.refreshBadge();
    $('#gyc-canvas').toggle(graffiti.canvasStatus);   
  }
  else {
    $('#gyc-paint-button').removeClass("icon-eye-close").addClass("icon-eye-open").css("color", "#F44C63");
    graffiti.canvasStatus = true;
    graffitiView.badge = true;
    graffitiView.refreshBadge();
    $('#gyc-canvas').toggle(graffiti.canvasStatus);   
  }
};

// Listens for mouse events on the color picker image to change
// the stroke color by updating the color variable
Graffiti.prototype.updateColor = function(){
  if (validHex($('#gyc-color').val())) {
    graffiti.color = $('#gyc-color').val();
    if (graffiti.drawingStatus === 'on') {
      $('#gyc-draw-button').css("color", graffiti.color);
    }
  }
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
    if (graffiti.drawingStatus === 'on') {
      if (self.project.layers[0].children.length >= 1) {
        self.project.layers[0].children[self.project.layers[0].children.length -1].visible = false;
        self.project.layers[0].children[self.project.layers[0].children.length -1].remove();
        self.project.view.draw();
      }
    }
  });
};

// Listens for a click on the clean slate button and clears the entire canvas

Graffiti.prototype.cleanSlate = function() {
  var self = this;
  $('#gyc-clean-slate-button').click(function() {
    if (graffiti.drawingStatus === 'on') {
      self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
      self.project.activeLayer.remove();
      var newlayer = new Layer();

  }});
};

// Listens for a click on the save button and opens the dialog save form
Graffiti.prototype.openSaveForm = function(){
  // if ($('#gyc-save-button').hasClass('gyc-button-active')) {
    if (graffiti.drawingStatus === 'on') {
      graffitiView.toggleDraw();
    }
    $('.gyc-search-tools').hide();
    $('.gyc-drawing-tools').hide();
    $('#gyc-save-confirm').show();
    $('.save-indicator').hide();
    // $('#gyc-drawingTags').hide()
    if ($('#gyc-toolbar-toggle').hasClass('ui-state-active') === false) {
      $('#gyc-toolbar-toggle').click();
    }
  // }
};

// Initializes pop-up Save form and listens
Graffiti.prototype.initializePopupForm = function(){
  var self = this;
  $('#gyc-save-confirm').dialog({
    autoOpen: false,
    height: 130,
    width: 250,
    dialogClass: 'gyc-popup',
    modal: false,
    open: function() {
      $('.gyc-popup .ui-dialog-titlebar .ui-dialog-titlebar-close').html('<i id="gyc-pop-x" class="icon-remove gyc-button"></i>')
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
    height: 130,
    width: 250,
    dialogClass: 'gyc-popup',
    modal: false,
    close: function() { console.log("CLOSE");$('#gyc-twitter-bttn').html(""); }
  });
};

// Makes a post that saves the drawing and is triggered
// by the PopupForm Confirm-Save button
Graffiti.prototype.saveDrawingPost = function(){
  var self = graffiti;
  var tags = $('#gyc-drawingTags').val();
  var data = {
    url: self.windowUrl,
    json_string: self.project.layers[self.project.layers.length - 1].exportJSON(),
    tags: tags
  };

  $('#gyc-drawingTags').hide();
  $('.save-indicator').show();
  $('.gyc-random-class').text('Saving...');
  $.post(self.serverUrl + '/save', data,function(response){
    if (response.tags_html_string){
      var twitter_html = '<a href="https://twitter.com/share" data-url="/" class="twitter-share-button" data-hashtags="GetYourCrayon" data-text="I created this amazing drawing see it on => '+response.unique_url+'" data-lang="en" data-size="large" data-count="none">Tweet</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';
      // $('#gyc-twitter-bttn').html(twitter_html);
      self.currentTags = response.tags_html_string;
      graffitiView.insertTags();
      $('#gyc-drawingTags').val('');
      if(self.maxIndex === null){
        self.maxIndex = 0;
        // $("#gyc-timeline").prop('max', self.maxIndex);
        // $('#gyc-timeline').val(self.maxIndex);
      }
      else{
        self.maxIndex += 1;
      }
    }
    self.currentPosition = self.maxIndex;
    $("#gyc-timeline").prop('max', self.maxIndex);
    $('#gyc-timeline').val(self.maxIndex);
    self.latestDrawing = self.project.layers[self.project.layers.length - 1].exportJSON();
    self.undoCounter = 0;
    if(self.maxIndex >= 1){
      $('#gyc-timeline').show();
    }
    setTimeout(function() {
        $('.save-indicator').hide();
        $('#gyc-drawingTags').show();
        $('.gyc-random-class').text('Save Drawing');
        graffitiView.showConfirmationPopup('#gyc-save-confirm', 'Saved!');
        graffitiView.toggleSaveButton();
    }, 500);

  }).fail(function(){
    graffitiView.showConfirmationPopup("body","ERROR WHEN SAVING");
    $('#gyc-timeline').hide();
    $('#gyc-next-button').hide();
    $('#gyc-previous-button').hide();
     });
};

// displays a save confirmation message when post is succesfull
// this is called from the post
GraffitiView.prototype.showConfirmationPopup = function(element,message){
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
  var self = graffiti;
  $('#gyc-timeline').mouseup(function() {
    self.currentPosition = parseInt($(this).val());
    console.log(self.currentPosition);
    self.timelineUpdate();
  });
};

// triggers a get requests that rettrives drwaings
// clears the canvas and imports the response to the canvas
Graffiti.prototype.timelineUpdate = function() {
  var self = graffiti;
  $.get( self.serverUrl + '/retrieve',{'url': self.windowUrl, 'id': self.currentPosition},function(response){
    self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
    self.project.activeLayer.remove();
    var newlayer = new Layer();
    self.project.activeLayer.remove();
    self.project.importJSON(response);
    self.project.view.draw();
  }).fail(function(){graffitiView.showConfirmationPopup("ERROR: When Retrieving drawings");});
};

// This method validates the authenticity of a hex color string

function validHex(hexString) {
  return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i).test(hexString);
}

// These two methods initialize the next and previous buttons for the timeline

Graffiti.prototype.initializePrevious = function() {
  var self = this;
    $('#gyc-previous-button').click(function(){
      if (self.currentPosition !== 0) {
        if (self.currentPosition > 0) {
          self.currentPosition -= 1;
        }
        console.log(graffiti.currentPosition);
        if (graffiti.currentPosition >= 0) {
          $('#gyc-timeline').val(self.currentPosition);
          $.get( self.serverUrl + '/retrieve',{'url': self.windowUrl, 'id': self.currentPosition},function(response){
            console.log('made request');
            self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
            self.project.activeLayer.remove();
            var newlayer = new Layer();
            self.project.activeLayer.remove();
            self.project.importJSON(response);
            self.project.view.draw();
          });
        }
      }
    });
};

Graffiti.prototype.initializeNext = function() {
  var self = this;
    $('#gyc-next-button').click(function(){
      if (self.currentPosition !== self.maxIndex) { 
        if (self.currentPosition < self.maxIndex) {
          self.currentPosition += 1;
        }
        console.log(graffiti.currentPosition);
        if (graffiti.currentPosition <= graffiti.maxIndex) {
          $('#gyc-timeline').val(self.currentPosition);
          $.get( self.serverUrl + '/retrieve',{'url': self.windowUrl, 'id': self.currentPosition},function(response){
            self.canvas.getContext('2d').clearRect(0,0,self.canvas.width, self.canvas.height);
            self.project.activeLayer.remove();
            var newlayer = new Layer();
            self.project.activeLayer.remove();
            self.project.importJSON(response);
            self.project.view.draw();
          });
        }
      }
    });
};

GraffitiView.prototype.setupColorWheel = function() {
  var farbtasticWheel = chrome.extension.getURL("wheel.png");
  var farbtasticMask = chrome.extension.getURL("mask.png");
  var farbtasticMarker = chrome.extension.getURL("marker.png");

  $('.farbtastic-gyc .wheel').css("background", "url('" + farbtasticWheel + "') no-repeat");
  $('.farbtastic-gyc .overlay').css("background", "url('" + farbtasticMask + "') no-repeat");
  $('.farbtastic-gyc .marker').css("background", "url('" + farbtasticMarker + "') no-repeat");
}

function initGraffiti() {

  // This loads the color picker images
  
  graffiti = new Graffiti();
  graffitiView = new GraffitiView(graffiti);

  // This are all the Painting Functionality Listeners
  graffitiView.setupPage(graffiti.windowUrl);
  graffitiView.setupColorWheel();
  // graffiti.toggleDropdownArrow();
  // graffiti.toggleCanvas();
  // graffiti.updateColor();
  graffiti.updateWidth();
  graffiti.updateOpacity();
  graffiti.undo();
  graffiti.cleanSlate();
  // graffiti.openSaveForm();
  // graffiti.initializePopupForm();
  graffiti.initializeTwitterPopup();
  graffiti.updateTimeline();
  // graffiti.toggleSaveButton();
  graffiti.initializePrevious();
  graffiti.initializeNext();
  // initializeMessageListener();
}

initGraffiti();

$('#gyc-undo-button').on('click', function() {
  graffiti.decrementUndoCounter();
  graffitiView.toggleSaveButton();
});

$('#gyc-canvas').on('mouseup', function() {
  if (graffiti.drawingStatus === 'on') {
    graffiti.incrementUndoCounter();
    graffitiView.toggleSaveButton(); 
  }
});

$('.gyc-random-class').click(graffiti.saveDrawingPost);
$('#gyc-save-button').click(graffiti.openSaveForm);

$('#gyc-toolbar-toggle').click(graffitiView.toggleDropdownArrow);

$('#gyc-paint-button').click(graffiti.toggleCanvas);

$('#gyc-search-tags-button').click(graffitiView.toggleSearchButton);

$('.marker').on('mouseup', graffiti.updateColor);
$('.marker').on('mouseleave', graffiti.updateColor);
$('#gyc-color').on('keyup', graffiti.updateColor);

$('#gyc-draw-button').click(graffitiView.toggleDraw);

// This is the Painting Functionality, method names are required by paper.js




  function onMouseDown(event) {
    if (graffiti.drawingStatus === 'on') {
      graffiti.path = new Path();
      graffiti.path.strokeColor = graffiti.color;
      graffiti.path.strokeWidth = graffiti.width;
      graffiti.path.strokeCap = graffiti.strokeCap;
      graffiti.path.opacity = graffiti.opacity;
    }
  }

  function onMouseDrag(event) {
    if (graffiti.drawingStatus === 'on') {
      graffiti.path.add(event.point);
      graffiti.path.smooth();
    }
  }


// Model (Grafitti drawing)
  // has ZERO knowledge of the page. Does NOT use jQuery at *all*
  // track data
  // state changes
  // rules
// View (GrafittiView)
  // has a reference to the MODEL
  // event handling
  // redraws
  // presentation (Title - Artist)
