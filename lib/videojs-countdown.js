(function (window, videojs) {
  'use strict';

  var defaults = {
        time: 5,
        mute: false
      };

  /**
   * Initialize the plugin.
   * @param options (optional) {object} configuration for the plugin
   */
  var countdown = function (options) {
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
      stop;

    var userAgent = navigator.userAgent;
    if(userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) || userAgent.match(/Android/i)) {
      return;
    }

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
        stop();
        cleanup();
      }
    })

    CountdownOverlay = videojs.CountdownOverlay = videojs.Component.extend({
      init: function (player, options) {
        videojs.Component.call(this, player, {
          el: videojs.Component.prototype.createEl.call(this, 'div', {
            className: 'vjs-countdown',
            innerHTML: '<p class="message"/>'
          })
        });
        if (player.mediainfo && player.mediainfo.name) {
          this.videoName(player.mediainfo.name);
        } else {
          this.videoName();
          var that = this;
          player.one('loadstart', function () {
            if (player.mediainfo && player.mediainfo.name) {
              that.videoName(player.mediainfo.name);
            }
          });
        }
        this.addChild('CancelButton');
      },

      videoName: function (name) {
        var message = this.el().querySelector('.message');
        if (name && name !== '') {
          message.innerHTML = player.localize('{{title}}” is starting in {{seconds}} seconds...').replace('{{title}}', name).replace('{{seconds}}', '<span class="vjs-overlay-seconds"> </span>');
        } else {
          message.innerHTML = player.localize('Starts in {{seconds}} seconds...').replace('{{seconds}}', '<span class="vjs-overlay-seconds"> </span>');
        }
      }
    });
    
    player.countdownOverlay = player.addChild('countdownOverlay', settings);

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
        stop();
      }
    };

    startTimer = function () {
      var secondsdisplay = player.countdownOverlay.el().querySelector('.vjs-overlay-seconds');
      var count = settings.time;
      secondsdisplay.innerHTML = count;
      player.addClass('vjs-counting');
      isCounting = true;
      timer = window.setInterval(function() {
        var secondsdisplay = player.countdownOverlay.el().querySelector('.vjs-overlay-seconds');
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

    stop = function () {
      isCounting = false;
      player.removeClass('vjs-counting');
      window.clearInterval(timer);
    }

    cleanup = function () {
      isDone = true;
      if (window.removeEventListener) {
        window.removeEventListener('DOMContentLoaded', handler, false);
        window.removeEventListener('load', handler, false);
        window.removeEventListener('scroll', handler, false);
        window.removeEventListener('resize', handler, false);
      } else if (window.detachEvent)  {
        window.detachEvent('onDOMContentLoaded', handler);
        window.detachEvent('onload', handler);
        window.detachEvent('onscroll', handler);
        window.detachEvent('onresize', handler);
      }
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

      // Cancel if playback starts
      player.on('play', function () {
        if(isCounting) {
          stop();
        }
        cleanup();
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

//    player.ready(function () {
    player.on('loadstart', function () {
      checkIsVisible(player.el());
    });
  };

  videojs.plugin('countdown', countdown);
})(window, window.videojs);
