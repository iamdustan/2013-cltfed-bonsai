require.config({
  paths: {
    jquery: '../components/jquery/jquery',
    bonsai: './vendor/bonsai'
  },
  shim: {
    bonsai: {
      deps: [],
      exports: 'bonsai'
    }
  }
});

require(['app', 'jquery', 'bonsai'], function (app, $, bonsai) {
    'use strict';
    // use app here
    console.log('Running jQuery %s', $().jquery);
    console.log('Running Bonsai %s', bonsai.version);

    bonsai.run('movie', {
      code: app
    });

});
