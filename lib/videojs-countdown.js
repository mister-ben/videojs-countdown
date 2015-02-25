/*! videojs-countdown - v0.0.0 - 2015-2-25
 * Copyright (c) 2015 Ben Clifford
 * Licensed under the Apache-2.0 license. */
(function(window, videojs) {
  'use strict';

  var defaults = {
        option: true
      },
      countdown;

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  countdown = function(options) {
    var settings = videojs.util.mergeOptions(defaults, options),
        player = this;

    // TODO: write some amazing plugin code
  };

  // register the plugin
  videojs.plugin('countdown', countdown);
})(window, window.videojs);
