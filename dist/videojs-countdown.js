/*! videojs-countdown - v0.0.0 - 2015-09-18
* Copyright (c) 2015 Ben Clifford; Licensed Apache-2.0 */
(function(window, videojs) {
  'use strict';

  var defaults = {
        time: 5,
        mute: false
      },
      countdown;

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  countdown = function(options) {
    var settings;
    var player = this;
    var countdownOverlay;
    var countdownText;
    var isCounting = false;
    var isDone = false;
    var timer,
    isElementInViewport,
      checkIsVisible,
      handler,
      startTimer,
      cleanup,
      setup;

    var userAgent = navigator.userAgent;

    if (videojs.VERSION.split('.')[0] >= 5) {
      settings = videojs.mergeOptions(defaults, options);
    } else {
      settings = videojs.util.mergeOptions(defaults, options);
    }

    // Translations
    videojs.addLanguage('de',{
      'Starts in {{seconds}} seconds...':'Beginnt in {{seconds}} Sekunden…',
      '“{{title}}” is starting in {{seconds}} seconds...':'„{{title}}“ fängt in {{seconds}} Sekunden an…'
    });

    setup = function() {
      countdownOverlay = document.createElement('div');
      countdownOverlay.className = 'vjs-countdown';
      if (player.mediainfo && player.mediainfo.name && player.mediainfo.name !== '') {
        countdownText = player.localize('“{{title}}” is starting in {{seconds}} seconds...').replace('{{title}}',player.mediainfo.name).replace('{{seconds}}','<span class="vjs-overlay-seconds"> </span>');
      }
      else {
        countdownText = player.localize('Starts in {{seconds}} seconds...').replace('{{seconds}}','<span class="vjs-overlay-seconds"> </span>');
      }
      countdownOverlay.innerHTML= '<p>' + countdownText + ' <a class="cancel">&#x2716;</a></p>';
      player.el().appendChild(countdownOverlay);
      checkIsVisible(player.el());
    };

    checkIsVisible = function(el) {
      if (settings.time === 0) {
        if (settings.mute) {
          player.muted(true);
        }
        player.play();
      } else {
        startTimer();
      }
      if (!isElementInViewport(el) && isCounting) {
        window.console.log('clean up');
        cleanup();
      }
    };

    startTimer = function() {
      var secondsdisplay = countdownOverlay.querySelector('.vjs-overlay-seconds');
      var count = settings.time;
      secondsdisplay.innerHTML = count;
      player.addClass('vjs-counting');
      isCounting = true;
      timer = window.setInterval(function() {
        count = count - 1;
        secondsdisplay.innerText = count;
        if (count === 0) {
          if (settings.mute) {
            player.muted(true);
          }
          player.play();
        }
      }, 1000);
    };

    cleanup = function() {
      isCounting = false;
      player.removeClass('vjs-counting');
      window.clearInterval(timer);
    };

    // Add event listeners
    // TODO: If mobile attach to touchstart or something?

    player.one('loadstart', function() {
      setup();
      handler = function() {
        return checkIsVisible(player.el());
      };
      if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', handler, false);
        window.addEventListener('load', handler, false);
        window.addEventListener('scroll', handler, false);
        window.addEventListener('resize', handler, false);
      } else if (window.attachEvent)  {
        window.attachEvent('onDOMContentLoaded', handler);
        window.attachEvent('onload', handler);
        window.attachEvent('onscroll', handler);
        window.attachEvent('onresize', handler);
      }

      countdownOverlay.querySelector('.cancel').addEventListener('click', function(){
        cleanup();
        isDone = true;
      });

      // Cancel if playback starts
      player.on('play', function(){
        isDone = true;
        if(isCounting) {
          cleanup();
        }
      });
    });

    // http://stackoverflow.com/a/7557433/740233
    isElementInViewport = function(el) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    };
  };



  // register the plugin
  videojs.plugin('countdown', countdown);
})(window, window.videojs);
