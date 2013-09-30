describe("drawController", function(){
  // describe("onMouseDown", function() {
  //   it("creates a new path when the canvas is clicked", function() {
  //     $('#myCanvas').show();
  //     console.log($('#myCanvas'));
  //     spyOn($('#myCanvas'), 'onMouseDown');
  //     console.log('hello');
  //     $('#myCanvas').click();
  //     console.log('goodbye');
  //     // expect($('#myCanvas').mousedown).toHaveBeenCalled();
  //     expect($('#myCanvas').onMouseDown).toHaveBeenCalled();
  //   });
  // });
  describe("toggleCanvas", function() {
    it("shows the canvas when toggle button is clicked", function(){
      $('#gyc-toolbar-toggle').trigger('click');
      setTimeout(function() { $('#gyc-paint-button').trigger('click'); }, 100);
      setTimeout(function() {expect($('#myCanvas').css('display')).toBe('block');}, 101);
    });
  });

  describe("updateWidth", function() {
    it("updates the width variable when the width slider changes value", function() {
      $('#width').val(20);
      var newWidth = $('#width').val();
      var width = parseInt(newWidth);
      $('#gyc-current_width').html(width);
      expect($('#gyc-current_width').html()).toBe('20');
    });
  });

  describe("save confirmation", function(){
    it("displays the save confirmation when user clicks save", function(){
      setTimeout(function() {$('#gyc-save-button').trigger('click');}, 100);
      setTimeout(function() {expect($('.ui-front').css('display')).toBe('block');}, 101);
    });

    it("closes the save confirm dialog box if user presses confirm save", function(){
      setTimeout(function() {$('.gyc-save-confirm-button').trigger('click');}, 102);
      expect($('.gyc-save-popup').css('display')).toBe('none');
    });

    it("closes the save confirm dialog box if user presses cancel", function(){
      setTimeout(function() {$('#gyc-save-button').trigger('click');}, 103);
      setTimeout(function() {$('.gyc-save-confirm-button').trigger('click');}, 104);
      expect($('.gyc-save-popup').css('display')).toBe('none');
    });

  });
});



// describe("Player", function() {
//   var player;
//   var song;

//   beforeEach(function() {
//     player = new Player();
//     song = new Song();
//   });

//   it("should be able to play a Song", function() {
//     player.play(song);
//     expect(player.currentlyPlayingSong).toEqual(song);

//     //demonstrates use of custom matcher
//     expect(player).toBePlaying(song);
//   });

//   describe("when song has been paused", function() {
//     beforeEach(function() {
//       player.play(song);
//       player.pause();
//     });

//     it("should indicate that the song is currently paused", function() {
//       expect(player.isPlaying).toBeFalsy();

//       // demonstrates use of 'not' with a custom matcher
//       expect(player).not.toBePlaying(song);
//     });

//     it("should be possible to resume", function() {
//       player.resume();
//       expect(player.isPlaying).toBeTruthy();
//       expect(player.currentlyPlayingSong).toEqual(song);
//     });
//   });

//   // demonstrates use of spies to intercept and test method calls
//   it("tells the current song if the user has made it a favorite", function() {
//     spyOn(song, 'persistFavoriteStatus');

//     player.play(song);
//     player.makeFavorite();

//     expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
//   });

//   //demonstrates use of expected exceptions
//   describe("#resume", function() {
//     it("should throw an exception if song is already playing", function() {
//       player.play(song);

//       expect(function() {
//         player.resume();
//       }).toThrow("song is already playing");
//     });
//   });
// });
