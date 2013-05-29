require.config({
  paths: {
    jquery: '../components/jquery/jquery',
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

//require(['starField', 'jquery', 'bonsai'], function (app, $, bonsai) {
//require(['breakout', 'jquery', 'bonsai'], function (app, $, bonsai) {
//require(['cube', 'jquery', 'bonsai'], function (app, $, bonsai) {
require(['nodeRunner', 'jquery', 'bonsai'], function (app, $, bonsai) {
  'use strict';
  // use app here
  console.log('Running jQuery %s', $().jquery);
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
