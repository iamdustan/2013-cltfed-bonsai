/*global define */
define([], function () {

  var keys = { 37: 'left', 39: 'right', 65: 'a', 83: 's' };

  function dontdoit(e) {
    if (keys[e.keyCode]) {
      e.preventDefault();
      return false;
    }
  }

  if (window.ua.getDevice().type) {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function (event) {
        tilt(event.beta, event.gamma);
      }, true);
    }
    else if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', function (event) {
        tilt(event.acceleration.x * 2, event.acceleration.y * 2);
      }, true);
    }
  }
  var started = false;

  window.onload = function() {
    var i = 0;
    function delay() {
      console.log('delayed', i++);
      if (typeof window.stage === 'undefined') {
        return setTimeout(delay, 100);
      }
      if (i < 5) return setTimeout(startup, 500);
      return startup();
    }
    delay();
  };


  setTimeout(function () {
    if (!started) startup();
  }, 1000)

  function startup() {
    if (started) return false;
    started = true;
    //stage.sendMessage('start', { width: screen.width - 20, height: screen.height - 200 });
    var d = getDimensions();
    setTimeout(function () {
      document.getElementById('movie').style.background = '#000';
      document.getElementById('movie').style.height = d.height + 'px';
      document.getElementById('movie').style.width = d.width + 'px';
    }, 100);
    stage.sendMessage('start', { width: d.width, height: d.height });
  }

  function tilt(x, y) {
    // discard y for now
    if (typeof window.stage === 'undefined') return;

    stage.sendMessage('tilt', { x: -x, y: y});
  }

  document.addEventListener('keydown', dontdoit);
  document.addEventListener('keyup', dontdoit);

  function movie() {

    var Breakout;
    Breakout = (function() {
      /**
       * Setup default settings
       */
      var defaults = {
        width: 500,
        height: 350,
        ballSpeed: 7,
        paddleSpeed: 7,
        ball: {
          width: 20,
          height: 20,
          attr: {
            fillColor: 'rgb(255,255,255)'
          }
        },
        paddle: {
          width: 80,
          height: 20,
          left: 'left',
          right: 'right',
          attr: {
            fillColor: '#FF9500',
            fillGradient: gradient.linear(0, ['rgba(0,0,0,.2)', 'rgba(0,0,0,0)'])
          }
        },
        pieces: bonsai.tools.map(new Array(10), function(piece) {
          return {
            hp: 2,
            width: 80,
            height: 20,
            attr: {
              fillColor: '#FF9500',
              fillGradient: gradient.linear(0, ['rgba(0,0,0,.2)', 'rgba(0,0,0,0)'])
            }
          }
        }),
        pieceColor: [
          {
            fillColor: '#0049ff',
            fillGradient: gradient.linear(0, ['rgba(0,0,0,.2)', 'rgba(0,0,0,0)'])
          },
          {
            fillColor: '#FF9500',
            fillGradient: gradient.linear(0, ['rgba(0,0,0,.2)', 'rgba(0,0,0,0)'])
          }
        ]
      };

      /**
       * Constructor for Breakout, i.e. a new game of Breakout
       */
      function Breakout(options) {
        this.config = bonsai.tools.mixin({}, defaults, options);

        this.height = this.config.height;
        var width = this.width = this.config.width;

        this.config.pieces.forEach(function(piece) { piece.width = width / 5 - 12 });
        this.config.ballSpeed = this.config.paddleSpeed = Math.floor(this.height / 80);
        this.config.paddle.width = width / 6;

        this.pieces = this.config.pieces;

        this.paddleSpeed = this.config.paddleSpeed;
        this.ballSpeed = this.config.ballSpeed;

        this.newGame();
      }

      /**
       * keyIsDown method, used in Paddle instances to determine
       * whether a key is down at any time
       */
      Breakout.keyIsDown = (function() {
        var keys = {
          37: 'left',
          39: 'right',
          65: 'a',
          83: 's'
        };

        var down = {};

        stage.on('keydown', function(e) {
          var key = e.keyCode;
          down[keys[key]] = true;
        });

        stage.on('keyup', function(e) {
          var key = e.keyCode;
          down[keys[key]] = false;
        });

        return function(key) {
          return !!down[key];
        };

      })();

      /**
       * Paddle constructor, prepares Paddle instances, nothing special
       */
      function Paddle(breakout, config, position) {
        this.config = config;
        this.width = config.width;
        this.height = config.height;
        this.bs = new Rect(0, 0, this.width, this.height, 5).attr(config.attr).addTo(stage);
        this.x = position.x;
        this.y = position.y;
        this.breakout = breakout;
      }

      /**
       * Piece constructor, prepares Piece instances, nothing special
       */
      function Piece(breakout, config, position) {
        this.config = config;
        this.width = config.width;
        this.height = config.height;
        this.bs = new Rect(0, 0, this.width, this.height, 5).attr(config.attr).addTo(stage);
        this.x = position.x;
        this.y = position.y;
        this.breakout = breakout;
        this.hp = config.hp;
      }

      /**
       * Ball constructor, prepares Ball instances,
       * determines initial deltaX and deltaY fields
       * dependent on specified ballSpeed. E.g. if we want
       * a speed of 5, then we must make sure that:
       * Math.abs(deltaX) + Math.abs(deltaY) === 5
       */
      function Ball(breakout, config, position) {
        this.config = config;
        this.width = config.width;
        this.height = config.height;

        this.bs = new Rect(0, 0, this.width, this.height, this.width/2).attr(config.attr);

        this.deltaY = Math.floor(Math.random() * breakout.ballSpeed) + 1;
        this.deltaX = breakout.ballSpeed - this.deltaY;

        // Half the time, we want to reverse deltaY
        // (making the ball begin in a random direction)
        if (Math.random() > 0.5) {
          this.deltaY = -this.deltaY;
        }

        // Half the time, we want to reverse deltaX
        // (making the ball begin in a random direction)
        if (Math.random() > 0.5) {
          this.deltaX = -this.deltaX;
        }

        this.x = position.x;
        this.y = position.y;
        this.breakout = breakout;
        this.isInitiated = false;

        this.setLocation(this.x, this.y);
        this.bs.addTo(stage);
      }

      /**
       * The setLocation method is the same for the Ball and
       * Paddle classes, for now, we're just drawing rectangles!
       */
      Paddle.prototype.setLocation = Ball.prototype.setLocation = Piece.prototype.setLocation = function(x, y) {
        this.bs.attr({
          x: x - this.width / 2,
          y: y - this.height / 2
        });
      };

      tools.mixin( Breakout.prototype, {

        /**
         * A new game, initialises a paddle, a board, and
         * calls newRound
         */
        newGame: function() {
          var game = this;
          this.pieces = bonsai.tools.map(this.pieces, function(piece, i) {
            var y = i < 5 ? 20 : 46
            return new Piece(game, piece, {
              x: (piece.width + 6) * (i % 5) + (piece.width / 2),
              y: y
            });
          });

          var userPaddle = this.paddle = new Paddle(this, this.config.paddle, {
            x: this.width /  2,
            y: this.height - this.config.ball.height - this.config.paddle.height/2
          });

          stage.on('pointermove', function(e) {
            if (e.target !== stage) return;
            if (e.stageX - (userPaddle.width / 2) < 0 ||
                e.stageX + (userPaddle.width / 2) > game.width) return false;
            userPaddle.x = e.stageX;
          });

          var tilt = 0;
          stage.on('message:tilt', function(e) {
            if (Math.abs(e.x) < 3) return false;
            tilt = Math.floor(e.x);

            if (userPaddle.x + tilt - (userPaddle.width / 2) < 0 ||
                userPaddle.x + tilt + (userPaddle.width / 2) > game.width) return false;
            userPaddle.x += tilt;
          });

          this.newRound();
        },

        /**
         * newRound initalises a new Ball!
         */
        newRound: function() {
          if (this.ball) {

            //playSprite(6);

            var oldBall = this.ball;
            oldBall.bs.animate('.5s', {
              opacity: 0
            }, {
              onEnd: function() {
                oldBall.bs.remove(); // clear old ball
              }
            });
          }

          this.ball = new Ball(this, this.config.ball, {
            x: this.width /  2,
            y: this.height / 2
          });

          var ball = this.ball;
          ball.bs.attr({ opacity: 0 }).animate('.5s', {
            opacity: 1
          }, {
            onEnd: function() {
              setTimeout(function() {
                ball.start();
              }, 1000);
            }
          });
        },

        /**
         * Starting a new game involves initialising an
         * interval which will run every 20 milliseconds
         */
        start: function() {
          var breakout = this;

          stage.on('tick', function() {
            breakout.draw();
          });

          // Return this for chainability
          return this;
        },

        /**
         * draw, called every few milliseconds to draw each
         * object to the canvas
         */
        draw: function() {
          this.pieces.forEach(function(piece) { piece.draw(); });
          this.paddle.draw();
          this.ball.draw();
        }

      });

      var commonParts = {

        /**
         * Prepares a new frame, by taking into account the current
         * position of the paddle and the ball. setLocation is called
         * at the end to actually draw to the canvas!
         */
        draw: function() {

          var config = this.config,
            breakout = this.breakout,
            ball = breakout.ball,
            ballSpeed = breakout.ballSpeed,

            xFromPaddleCenter,
            newDeltaX,
            newDeltaY;

          if (this.isAuto) {

            this.calculateAI();

          } else {

            if ( Breakout.keyIsDown(config.left) && !this.isAtLeftWall() ) {
              this.x -= breakout.paddleSpeed;
            }

            if ( Breakout.keyIsDown(config.right) && !this.isAtRightWall() ) {
              this.x += breakout.paddleSpeed;
            }

          }

          if ( this.intersectsBall() ) {

            if (this instanceof Piece) {
              var piece = this;
              if (this.hp > 0) {
                this.bs.animate('100ms', defaults.pieceColor[this.hp - 1]);
              }
              else {
                this.bs.animate('100ms', { opacity: 0 }, {
                  onEnd: function () {
                    piece.bs.remove();
                    var i = piece.breakout.pieces.indexOf(piece)
                    piece.breakout.pieces.splice(i, 1);
                    piece = undefined;
                  }
                });
              }

            }

            //playSprite(0);

            xFromPaddleCenter = (ball.x - this.x) / (this.width / 2);
            xFromPaddleCenter = xFromPaddleCenter > 0 ? Math.min(1, xFromPaddleCenter) : Math.max(-1, xFromPaddleCenter);

            if ( Math.abs(xFromPaddleCenter) > 0.5 ) {
              ballSpeed += ballSpeed * Math.abs(xFromPaddleCenter);
            }

            newDeltaX = Math.min( ballSpeed - 2, xFromPaddleCenter * (ballSpeed - 2) );
            newDeltaY = ballSpeed - Math.abs(newDeltaX);

            ball.deltaY = (this instanceof Piece) ? Math.abs(newDeltaY) : -Math.abs(newDeltaY);
            ball.deltaX = newDeltaX;

          }

          this.setLocation( this.x , this.y );

        },

        /**
         * If the paddle is currently touching the right wall
         */
        isAtRightWall: function() {
          return this.x + this.width/2 >= this.breakout.width;
        },

        /**
         * If the paddle is currently touching the left wall
         */
        isAtLeftWall: function() {
          return this.x - this.width/2 <= 0;
        },
        /**
         * If the paddle is currently touching the top wall
         */
        isAtTopWall: function() {
          return this.y - this.height/2 <= 0;
        }

      };

      tools.mixin(Paddle.prototype, commonParts);
      tools.mixin(Paddle.prototype, {
        /**
         * intersectsBall, determines whether a ball is currently
         * touching the paddle
         */
        intersectsBall: function() {
          var bX = this.breakout.ball.x,
              bY = this.breakout.ball.y,
              bW = this.breakout.ball.width,
              bH = this.breakout.ball.height;


          var value = bX + bW/2 >= this.x - this.width/2 &&
                      bX - bW/2 <= this.x + this.width/2 &&
                      bY + bH/2 >= this.y - this.height/2 &&
                      bY - bH/2 < this.y - this.height/2;
          //console.log('Paddle#intersectsBall', value);
          return value;
        }
      });

      tools.mixin(Piece.prototype, commonParts);
      tools.mixin(Piece.prototype, {
        /**
         * intersectsBall, determines whether a ball is currently
         * touching the paddle
         */
        intersectsBall: function() {
          var bX = this.breakout.ball.x,
            bY = this.breakout.ball.y,
            bW = this.breakout.ball.width,
            bH = this.breakout.ball.height;

          var value = bX + bW/2 >= this.x - this.width/2 &&
                      bX - bW/2 <= this.x + this.width/2 &&
                      bY - bH/2 <= this.y + this.height/2 &&
                      bY + bH/2 > this.y + this.height/2;

          if (value) this.hp--;

          //console.log('Piece#intersectsBall', value);
          return value;
        }
      });

      tools.mixin( Ball.prototype, {

        start: function() {
          this.isInitiated = true;
        },

        /**
         * If the ball is currently touching a wall
         */
        isAtWall: function() {
          return this.x + this.width/2 >= this.breakout.width || this.x - this.width/2 <= 0;
        },

        /**
         * If the ball is currently at the top
         */
        isAtTop: function() {
          return this.y + this.height/2 <= 0;
        },

        /**
         * If the paddle is currently at the bottom
         */
        isAtBottom: function() {
          return this.y - this.height/2 >= this.breakout.height;
        },

        /**
         * Simply continues the progression of the ball, by
         * setting the location to the prepared x/y values
         */
        persist: function() {
          this.setLocation(
            this.x,
            this.y
          );
        },

        /**
         * Prepares the ball to be drawn to the canvas,
         * to bounce the ball off the walls, the deltaX
         * field is simply inverted (+5 becomes -5).
         */
        draw: function() {

          if (!this.isInitiated) {
            return;
          }

          if ( this.isAtWall() ) {
            //playSprite(4);
            this.deltaX = -this.deltaX;
          }

          if ( this.isAtBottom() || this.isAtTop() ) {
            this.breakout.newRound();
            return;
          }

          this.isMoving = true;
          this.x = this.x + this.deltaX;
          this.y = this.y + this.deltaY;

          this.persist();

        }

      });

      return Breakout;

    })();

    // popup
    var popup = new Group().addTo(stage).attr({ x: 140, y: 120});
    new Rect(0, 0, 200, 100, 10)
      .fill(gradient.linear(0, ['red', 'yellow']))
      .stroke('green', 2)
      .addTo(popup);
    new Text('Go!').attr({
      textFillColor: 'white', fontFamily: 'Arial', fontSize: 60, x: 50, y: 30
    }).addTo(popup);

    popup.destroy();
    stage.on('message:start', function(options) {
      game = new Breakout(options).start();
    });
  }


  return movie;

});

function getDimensions() {
  var width = 0, height = 0;
  if (typeof window.innerWidth === 'number') {
    height = window.innerHeight;
    width = window.innerWidth;
  }
  else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
    height = document.documentElement.clientHeight;
    width = document.documentElement.clientWidth;
  }
  else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
    height = document.body.clientHeight;
    width = document.body.clientWidth;
  }
  return { width: width, height: height };
}

