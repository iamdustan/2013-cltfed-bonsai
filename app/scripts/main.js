require.config({
  paths: {
    bonsai: './vendor/bonsai',
    //bonsai: './vendor/bonsai.node'
  },
  shim: {
    bonsai: {
      deps: [],
      exports: 'bonsai'
    }
  }
});

//require(['demos/starField', 'bonsai'], function (app, bonsai) {
//require(['demos/breakout', 'bonsai'], function (app, bonsai) {
// NOTE: halfbaked. doesn't work. require(['demos/cube', 'bonsai'], function (app, bonsai) {
require(['nodeRunner', 'bonsai'], function (app, bonsai) {
  'use strict';
  // use app here
  console.log('Running Bonsai %s', bonsai.version);
  var stage;

  if (typeof app === 'function') {
    stage = bonsai
      .setup({ runnerContext: bonsai.IframeRunnerContext })
      .run('movie', {
        code: app,
        framerate: 50
      });
  }
  else {
    stage = bonsai
      .setup(app)
      .run(document.getElementById('movie'), {
        width: 500,
        height: 500,
        framerate: 100
      });

    app.start(stage);
  }

  window.stage = stage;
  return stage;
});
