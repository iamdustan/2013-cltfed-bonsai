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

//require(['demos/starField', 'bonsai'], function (app, $, bonsai) {
//require(['demos/breakout', 'bonsai'], function (app, $, bonsai) {
//require(['demos/cube', 'bonsai'], function (app, $, bonsai) {
require(['nodeRunner', 'bonsai'], function (app, $, bonsai) {
  'use strict';
  // use app here
  console.log('Running Bonsai %s', bonsai.version);
  var stage;

  if (app.runnerContext) {
    stage = bonsai
      .setup(app)
      .run(document.getElementById('movie'), {
        width: 500,
        height: 500,
        framerate: 100
      });

    app.start(stage);
  }
  else {
    stage = bonsai
      .setup({ runnerContext: bonsai.IframeRunnerContext })
      .run('movie', {
        width: window.outerWidth,
        height: window.outerHeight,
        code: app,
        framerate: 50
      });
  }

  window.stage = stage;
  return stage;
});
