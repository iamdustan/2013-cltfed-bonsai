/*global define */
define(['bonsai'], function (bonsai) {
  document.getElementById('movie').style.background = '#000';
  document.getElementById('movie').style.height = '350px';
  document.getElementById('movie').style.width = '500px';

  var runnerContext = function (runnerUrl) {
    this.socket = io.connect(runnerUrl);
  };

  // some boilerplate to connext via socket.io
  var proto = runnerContext.prototype = bonsai.tools.mixin({
    init: function () {
      var self = this;
      this.socket.on('message', function(msg) {
        if (msg[0].command !== 'render') debugger;
        self.emit('message', msg[0]);
      });
    },
    notify: function (message) {
      this.socket.emit('message', message);
    },
    notifyRunner: function (message) {
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
    runnerUrl: 'http://localhost:4000',
    start: start
  }

  function start(stage) {
    console.log(stage);
    stage.on('pointerup', function() {
      console.log('pointerup');
    });
    stage.on('keydown', function() {
      debugger;
    });
  }

});
