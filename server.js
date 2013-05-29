var bonsai = require('bonsai');
var fs = require('fs');

//var bonsaiCode = fs.readFileSync(__dirname + '/app/scripts/pong.js');
var bonsaiCode = fs.readFileSync(__dirname + '/app/scripts/pong/main.js');
var socketRenderer = function (socket) {
  this.socket = socket;
};

var socket = require('socket.io').listen(4000);
socket.set('log level', 0);
var movies = [];

var connections = 0;

socket.sockets.on('connection', function (socket) {
  var movie;
  console.log(connections % 2)
  if (connections % 2 === 0) {
    movie = bonsai.run(null, {
      code: bonsaiCode,
      plugins: []
    });
    movies.push(movie);
  }
  else {
    movie = movies[movies.length - 1];
    console.log('else')
  }
  socket.emit('user', connections % 2);

  movies.push(movie);

  movie.runnerContext.on('message', function () {
    socket.emit('message', arguments);
  });

  movie.on('message', function (msg) {
    movie.runnerContext.notifyRunner(msg);
  });

  socket.on('message', function (msg) {
    movie.runnerContext.notifyRunner(msg);
  });

  socket.on('disconnect', function () {
    //movie.destroy();
  });

  connections++;
});

