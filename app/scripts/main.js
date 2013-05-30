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

//require(['demos/circles', 'bonsai'], function (app, bonsai) {
//require(['demos/starField', 'bonsai'], function (app, bonsai) {
//require(['demos/breakout', 'bonsai'], function (app, bonsai) {
require(['nodeRunner', 'bonsai', 'helper'], function (app, bonsai, helpers) {
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
    var d = helpers.getDimensions();
    stage = bonsai
      .setup(app)
      .run(document.getElementById('movie'), {
        width: 500,
        height: 350,
        framerate: 50
      });

    app.start(stage, d);
  }

  window.stage = stage;
  return stage;
});
