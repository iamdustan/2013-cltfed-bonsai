/*global define*/
define([], function () {

  document.getElementById('movie').style.background = '#252525';
  document.getElementById('movie').style.height = '500px';
  document.getElementById('movie').style.width = '500px';

  function movie() {
    var physics;
    var COLOR = color('#b0da42');
    var path = [
      0, 0,
      100, 0,
      100, 100,
      0, 100,
      0, 0,
    ];

    var g = new Group();
    var p = new Path(path).addTo(g).attr({
      strokeColor: '#b0da42',
      filters: new filter.DropShadow(0, 0, 4, COLOR),
      strokeWidth: 2
    });

    stage.on('tick', function(stage, frame) {
      updatePath(path, frame);
      p.path(path);
    });

    function updatePath(path, frame) {
      var step = frame % 60;

    }


    g.addTo(stage).attr({ x: 100, y: 100 });
    setTimeout(function() {
      //start();
    }, 1000);

    function frame(stage, frame) {
      physics.tick(frame);
    }

    function start() {
      physics = new PhysicsEngine();
      physics.applyTo(g);
      stage.on('tick', frame);
    }

    function PhysicsEngine() {
      this._items = [];
      this.gravity = 1.05;
    }

    PhysicsEngine.prototype = {
      applyTo: function(element) {
        this._items.push(new Item(element));
      },

      tick: function() {
        var physics = this;
        this._items.forEach(function(item) {
          physics.applyForces(item);
          item.setPos(
            item.x + Math.cos(item.bearing) * item.velocity,
            item.y + Math.sin(item.bearing) * item.velocity
          );
        });
      },

      applyForces: function(item) {
        if (item.velocity === 0) item.velocity = 0.0000000002;
        item.velocity *= this.gravity;
      }
    };

    function Item(element) {
      this.element = element;
      this.x = element.attr('x');
      this.y = element.attr('x');
      this.bearing = 90 * Math.PI / 180;
      this.velocity = 0
    }

    Item.prototype = {
      setPos: function(x, y) {
        this.x = x;
        this.y = y;
        this.element.attr({ x: x, y: y });
      }
    }
  }

  return movie;

});
