function circle(opt_options) {
  // this.set('center', {120,20});
  this.set('strokeColor' , '#000000');
  this.set('radius' , 30);

  this.set('zIndex', 1e3);

  this.setValues(opt_options);
}

circle.prototype = new google.maps.OverlayView;

window['circle'] = circle;

circle.prototype.drawCanvas_ = function() {
  var canvas = this.canvas_;
  if (!canvas) return;

  var style = canvas.style;
  style.zIndex = /** @type number */(this.get('zIndex'));

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = this.get('strokeColor');
  ctx.fillStyle = this.get('fontColor');
  ctx.font = this.get('fontSize') + 'px ' + this.get('fontFamily');

  var strokeWeight = Number(this.get('strokeWeight'));

  var text = this.get('text');
  if (text) {
    if (strokeWeight) {
      ctx.lineWidth = strokeWeight;
      ctx.strokeText(text, strokeWeight, strokeWeight);
    }

    ctx.fillText(text, strokeWeight, strokeWeight);

    var textMeasure = ctx.measureText(text);
    var textWidth = textMeasure.width + strokeWeight;
    style.marginLeft = this.getMarginLeft_(textWidth) + 'px';
    // Bring actual text top in line with desired latitude.
    // Cheaper than calculating height of text.
    style.marginTop = '-0.4em';
  }
};

circle.prototype.onAdd = function() {
  var canvas = this.canvas_ = document.createElement('canvas');
  var style = canvas.style;
  style.position = 'absolute';

  var ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.textBaseline = 'top';

  this.drawCanvas_();
  var panes = this.getPanes();
  if (panes) {
    panes.overlayImage.appendChild(canvas);
  }
};
MapLabel.prototype['onAdd'] = MapLabel.prototype.onAdd;
