var bonsai = require('bonsai');
var fs = require('fs');

//var bonsaiCode = fs.readFileSync(__dirname + '/app/scripts/pong.js');
var bonsaiCode = fs.readFileSync(__dirname + '/app/scripts/pong/main.js');
var socketRenderer = function (socket) {
  this.socket = socket;
};

var socket = require('socket.io').listen(4000);

socket.sockets.on('connection', function (socket) {
  var movie = bonsai.run(null, {
    code: bonsaiCode,
    plugins: []
  });

  movie.runnerContext.on('userevent', function () {
    socket.emit('userevent', arguments);
  });

  movie.on('pointerdown', function () {
    console.log(arguments);
    socket.runnerContext.notifyRunner(arguments);
  });

  movie.on('userevent', function () {
    socket.runnerContext.notifyRunner(arguments);
  });

  movie.runnerContext.on('message', function () {
    socket.emit('message', arguments);
  });

  movie.on('message', function (msg) {
    movie.runnerContext.notifyRunner(msg);
  });

  socket.on('disconnect', function () {
    movie.destroy();
  });
});

