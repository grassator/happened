# happened

[![NPM version](https://badge.fury.io/js/happened.svg)](https://npmjs.org/package/happened)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]


`happened` is a tiny PubSub library (~700 bytes minified and gzipped). It's designed to have a minimal viable set of features, making it an ideal choice for using in your own library or size-sensitive client code.

## Examples

`happened` does not try include any unnecessary functionality in the core, but that doesn't mean that it's hard to use in all the common cases.

### Basic usage

Calling `happened.create()` without any parameters will  construct a new instance, that can be used as an event bus:

```js
var happened = require('happened');
var topSecretMessages = happened.create();
topSecretMessages.on('mission', function (type) {
    console.log('completed mission ' + type);
});
topSecretMessages.trigger('mission', 'impossible'); // "completed mission impossible"
```

This can also work as global event bus — just wrap it in a requirable module:

```js
// my-global-bus.js
var happened = require('happened');
module.exports = happened.create();

// my-other-file.js
var globalBus = require('./my-global-bus');
globalBus.on('disco', function () {
    console.log('dance');
});
globalBus.trigger('disco'); // "dance"
```

### Mixin for Objects

It's a very common need to have PubSub methods directly exposed on some object, or all objects of a given class. This is usually solved by providing a mixin (e.g. Backbone.Events), which has a downside of a need to define a property on an object, that can conflict with your own properties, or even cause compiler deoptimization if it's injected dynamically by `on` method.

All the methods on `happened` instance can be called in any context, so that means that they can be simply copied in the constructor of your class:

```js
var happened = require('happened');

function Artist() {
    var events = happened.create();
    // you can choose which methods to copy from happened
    this.on = events.on;
    this.once = events.once;
    this.off = events.off;
    this.trigger = events.trigger;
    
    // additionally if you want to provide support to subscribe
    // to all events it's a good idea to copy corresponding constant
    this.ALL_EVENTS = events.ALL_EVENTS;
}

var superMetalBand = new Artist();
superMetalBand.on('concert', function () {
    console.log('scream');
});
superMetalBand.trigger('concert'); // "scream"
```

Since this is quite verbose `happened` provides a helper method for this common case:

```js
function Artist() {
    happened.addTo(this);
}
```

### Public Channels

The basic implementation of public channels is to return the same instance of `happened`, given the same string, representing the name of the channel, which is exactly what more general [memoization](http://en.wikipedia.org/wiki/Memoization) function does, which is available for example in [lodash](https://lodash.com/docs#memoize):

```js
var happened = require('happened');
var _ = require('lodash');
var channel = _.memoize(happened.create);

var radioOne = channel('radio1');
radio1.on('morning-broadcast', function () {
    console.log('wake up');
});

// in another place
channel('radio1').trigger('morning-broadcast'); // "wake up"
```

If you want to keep dependencies minimal it's also easy to write it yourself:

```js
var channel = (function () {
    var cache = {};
    return function (name) {
        return cache.hasOwnProperty(name) ? cache[name] : (cache[name] = happened.create());
    };
})();
```

> At this point you are probably wondering why this is not included in the library itself. The are a couple of reasons for this. Firstly this is not an essential functionality that would be required by every use case. But more importantly, since `happened.create()` can accept `options` argument specifying a custom scheduler (and may be some other options later on) it, there is no way to unambiguously what would be the result of theoretical `happened.channel('one', options) === happened.channel('one', options2)`.

## More Good Stuff

* Zero dependencies
* Minimal interface (`on`, `once`, `off`, `trigger`), with utility methods exposed only on a global object. 
* UMD package
* Support for custom schedulers.
* Support for legacy browsers like IE6-8 and Android 2.3
* Node.js support
* all `happened` instances are [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) (immutable) if supported by environment

## Requirements

`happened` by default uses asynchronous event dispatching. If you want events to be dispatched faster, you can use `scheduler` option in `happened.create` call to specify other schedulers, such as [setImmediate](https://github.com/YuzuJS/setImmediate) for macro-task behavior or `process.nextTick` for micro-tasks.

Default async (setTimeout) mode is supported for all mainstream browsers and Node.js, but may not work in some esoteric environments, like [Qt QML](http://doc.qt.io/qt-5/qtqml-javascript-hostenvironment.html). In this case it falls back to synchronous scheduler.

If you want to always create instance of `happened` with sync scheduler, you can create a simple proxy function:

```js
function createSyncEvents() {
    return happened.create({ scheduler: happened.SYNC });
}
```

## API

This section contains reference for all public methods and properties of `happened`, to see example usage please refer to [examples section](#usage-patterns) instead.

Type signatures for methods are presented using [flow](http://flowtype.org/docs/functions.html) syntax.

### Top-Level Library Methods and Properties

#### `happened.create()`

Constructs a new [instance](#instance-methods) of `happened`.

```js
happened.create(options : Object?) => HappenedInstance
```

Right now the only supported field in `options` is `scheduler`:

```
var nextTickBus = happened.create({ scheduler: process.nextTick.bind(process) });
```

#### `happened.addTo()`

This is convenience method to create a new instance of `happened` and copy it's methods `on`, `once`, `off`, `trigger` and a constant `ALL_EVENTS` to a given `target`:

```js
happened.addTo(target : Object, source : HappenedInstance?) => HappenedInstance
```

Calling this function without a `source` will create a new instance of `happened`, but you can also provide one in case you want to share event bus between several object or you want to use an instance with custom scheduler:

```
var foo = {};
happened.addTo(foo, happened.create({ scheduler: happened.SYNC }));
```

### Instance Methods

#### `on`

This method is used to subscribe for a certain event:

```js
happenedInstance.on(
    name     : string,
    callback : (...params) => void,
    thisArg  : Object?
) => void
```

The `callback` will receive all the parameters except for the name of the event from `trigger` as it's arguments. `thisArg` is optional context for callback.

Special case here is subscribing to all events, happening on the instance. To do this you need to provide `ALL_EVENTS` constant property available on all instances.

```js
happenedInstance.on(
    happened.ALL_EVENTS,
    callback : (name : string, params : Array<any>) => void,
    thisArg  : Object?
) => void
```

> NOTE: `callback` for all events has a different signature to a regular one, due to a need to pass event name.

#### `once`

Same as [`on`](#on), but causes the `callback` to only fire once before being `off`ed.

```js
happenedInstance.once(
    name     : string,
    callback : (...params) => void,
    thisArg  : Object?
) => void
```

#### `off`

Removes a specific `callback` for an event with a given `name`.

```js
happenedInstance.off(
    name     : string?,
    callback : Function?
) => void
```

If called without `callback`, removes all callbacks for given `name`.

If called without any arguments, remove all callbacks for all events.

#### `trigger`

Triggers callbacks for the given event `name`, additional `...params` to `trigger` will be passed along to the event callbacks.

```js
happenedInstance.trigger(
    name      : string,
    ...params : any
) => void
```

## Contributing

### Setting Up Development Environment

To start do a fork of this repo, clone it locally and type in your terminal:

```bash
npm install
gulp tdd
```

This will continuously run tests for nice dev experience. To run tests just once or in CI environment you can use:

```bash
gulp test
```

To build for production run:

```bash
gulp build
```

## License

© 2015 Dmitriy Kubyshkin. Licensed under the MIT style license.

[project-url]: https://github.com/grassator/happened
[git-tag-image]: http://img.shields.io/github/tag/grassator/happened.svg
[travis-url]: https://travis-ci.org/grassator/happened
[travis-image]: https://travis-ci.org/grassator/happened.svg?branch=master
[daviddm-url]: https://david-dm.org/grassator/happened.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/grassator/happened
