(function (window, videojs) {
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
    var CountdownOverlay, CancelButton;
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

    settings = (videojs.mergeOptions ? videojs.mergeOptions(defaults, options) : videojs.util.mergeOptions(defaults, options));

    // Translations
    videojs.addLanguage('de', {
      'Starts in {{seconds}} seconds...': 'Beginnt in {{seconds}} Sekunden…',
      '“{{title}}” is starting in {{seconds}} seconds...': '„{{title}}“ fängt in {{seconds}} Sekunden an…'
    });

    CancelButton = videojs.CancelButton = videojs.Button.extend({
      init: function () {
        videojs.Button.call(this, player, {
          el: videojs.Button.prototype.createEl.call(this, 'div', {
            className: 'cancel-button vjs-control',
            role: 'button',
            'aria-live': 'polite',
            innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">' + player.localize('Cancel') + '</span></div>'
          })
        });
      },
      onClick: function () {
        cleanup();
        isDone = true;
      }
    })

    CountdownOverlay = videojs.CountdownOverlay = videojs.Component.extend({
      init: function (player, options) {
        var countdownText;
        if (player.mediainfo && player.mediainfo.name && player.mediainfo.name !== '') {
          countdownText = player.localize('“{{title}}” is starting in {{seconds}} seconds...').replace('{{title}}', player.mediainfo.name).replace('{{seconds}}', '<span class="vjs-overlay-seconds"> </span>');
        }
        else {
          countdownText = player.localize('Starts in {{seconds}} seconds...').replace('{{seconds}}', '<span class="vjs-overlay-seconds"> </span>');
        }
        videojs.Component.call(this, player, {
          el: videojs.Component.prototype.createEl.call(this, 'div', {
            className: 'vjs-countdown',
            innerHTML: '<p>' + countdownText + '</p>'
          })
        });
        this.addChild('CancelButton');
      }
    });

    player.countdownOverlay = player.addChild('countdownOverlay', settings);

    /*setup = function() {
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
    };*/

    checkIsVisible = function (el) {
      if (isElementInViewport(el) && !isDone && !isCounting) {
        if (settings.time === 0) {
          if (settings.mute) {
            player.muted(true);
          }
          player.play();
        } else {
          startTimer();
        }
      }
      if (!isElementInViewport(el) && isCounting) {
        window.console.log('clean up');
        cleanup();
      }
    };

    startTimer = function () {
      var secondsdisplay = player.countdownOverlay.el().querySelector('.vjs-overlay-seconds');
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

    cleanup = function () {
      isCounting = false;
      player.removeClass('vjs-counting');
      window.clearInterval(timer);
    };

    // Add event listeners
    // TODO: If mobile attach to touchstart or something?

    player.one('loadstart', function () {
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

      /*countdownOverlay.querySelector('.cancel').addEventListener('click', function(){
        cleanup();
        isDone = true;
      });*/

      // Cancel if playback starts
      player.on('play', function () {
        isDone = true;
        if(isCounting) {
          cleanup();
        }
      });
    });


    // http://stackoverflow.com/a/7557433/740233
    isElementInViewport = function (el) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    };

    checkIsVisible(player.el());
  };



  // register the plugin
  videojs.plugin('countdown', countdown);
})(window, window.videojs);
