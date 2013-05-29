/*global define */
define([], function () {
  //'use strict';

  function movie() {
    var NUM_PARTICLES = 200;

    // background
    new Rect(0, 0, 800, 800)
      .addTo(stage)
      .animate('1s', {
        'fillColor': 'hsl(270,50%,20%)'
      })

    var particles = []

    function renderLoop(stage, frame) {
      var p = new Particle()
      var drag = 1.05
      var fov = 250
      var scale = 1.05

      particles.push(p)

      while (particles.length > NUM_PARTICLES) {
        p = particles.shift()
        p.element.destroy()
      }

      for (var i = 0; i < particles.length; i++) {
        p = particles[i]

        if (p.size > 1000) {
          p.zVel += 1 - p.zVel;
        }
        p.size *= p.zVel;
        p.xVel *= drag

        p.yVel *= drag;
        p.x += p.xVel
        p.y += p.yVel

        p.element.attr({
          scale: p.size,
          x: p.x,
          y: p.y,
          rotation: p.element.attr('rotation') + 0.04
        })
      }
    }

    var elements = [
      //'Circle',
      function() {
        return new Circle(this.x, this.y, this.size);
      },
      //'Star',
      function() {
        return new Star(this.x, this.y, this.size, 5, 3);
      },
      //'Megastar'
      function() {
        return new Star(this.x, this.y, this.size, 8, 3);
      }
    ];

    function Particle() {
      this.x = random(-800, 800)
      this.y = random(-800, 800)
      this.z = 0
      this.size = 2
      this.xVel = random(-15, 15)
      this.yVel = random(-15, 15)
      this.zVel = random(1, 1.125)

      this.color = 'white';//'hsl('+random(180,220)+180', 100%, 50%)';
      var i = Math.floor(random(0, 2));
      this.element = elements[i].call(this)
        .attr('fillColor', this.color)
        .addTo(stage)
    }

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    stage.on('tick', renderLoop)

  }

  return movie;
});
