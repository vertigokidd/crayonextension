var myPath;
var color = 'blue';
var strokeCap = 'round';
var width = 10;
var opacity = 1;

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

