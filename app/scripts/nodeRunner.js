/*global define */
define(['bonsai'], function (bonsai) {
  document.getElementById('movie').style.background = '#000';
  document.getElementById('movie').style.height = '350px';
  document.getElementById('movie').style.width = '500px';

  var runnerContext = function (runnerUrl) {
    this.socket = io.connect(runnerUrl);
  };

  var user = null;
  // some boilerplate to connext via socket.io
  var proto = runnerContext.prototype = bonsai.tools.mixin({
    init: function () {
      var self = this;
      this.socket.on('user', function(i) {
        user = i;
      });
      this.socket.on('message', function(msg) {
        self.emit('message', msg[0]);
      });
    },
    notify: function (message) {
      if (message.data) message.data.user = user;
      else message.user = user;
      this.socket.emit('message', message);
    },
    notifyRunner: function (message) {
      if (message.data && message.data.event) message.data.event.user = user;
      else message.user = user;
      this.socket.emit('message', message);
    },
    run: function (code) {
      this.notifyRunner({
        command: 'runScript',
        code: code
      });
    }
  }, bonsai.EventEmitter);

  // get it a MessageChannel

  proto.notifyRunnerAsync = proto.notifyRunner;
  return {
    runnerContext: runnerContext,
    runnerUrl: '//' + location.hostname + ':4000',
    start: start
  }

  function start(stage, d) {
    var event = { type: 'connect' };
    stage.post('userevent', { event: event });

    if (window.ua.getDevice().type) {
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (event) {
          tilt(event.beta, event.gamma);
        }, true);
      }
      else if (window.DeviceMotionEvent) window.addEventListener('devicemotion', function (event) { tilt(event.acceleration.x * 2, event.acceleration.y * 2); }, true);
    }

    function tilt(x, y) {
      var event = {
        type: 'tilt',
        x: -x,
        y: y,
        user: user
      }

      stage.post('userevent', { event: event });
    }

    var r = stage.renderer.svg.root;
    r.setAttribute('width', '100%')
    r.setAttribute('height', '100%')
  }

});
