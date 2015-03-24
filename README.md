# Video.js Countdown

Begins playback after a short countdown once the player is in view.

## Getting Started

### Brightcove Player

* Host the js and css on your server, or use rawgit.
* In the [player studio](https://studio.brightcove.com/products/videocloud/playesr) add the URLS to the player config.
* Add `countdown` as the plugin name, and if you want to alter the countdown, use `{"time":8}` as the plugin option.

### video.js

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="video.js"></script>
<link rel="stylesheet" href="videojs-countdown.min.css">
<script src="videojs-countdown.js"></script>
<script>
  videojs(document.querySelector('video')).countdown();
</script>
```

There's also a [working example](demo/demo.html) of the plugin you can check out if you're having trouble.

## Documentation
### Plugin Options

You may pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### time
Type: `int`
Default: 5

Number of seconds to count down.

## Release History

 - 0.1.0: Initial release
